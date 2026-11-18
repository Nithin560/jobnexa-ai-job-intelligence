import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, EmailOTP
from app.models.candidate import CandidateProfile
from app.models.notification import AdminNotification
from app.schemas.user import (
    UserRegister, 
    UserLogin, 
    TokenResponse, 
    UserResponse,
    SendOTPRequest,
    SendOTPResponse,
    VerifyRegisterRequest,
    VerifyOTPLoginRequest
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import send_otp_email, is_smtp_configured
from app.api.deps import get_current_user

router = APIRouter()

ADMIN_EMAILS = {
    "nithinvandana26@gmail.com",
    "nithinvandana560@gmail.com",
    settings.ADMIN_EMAIL_ID.strip().lower()
}


@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Generate and dispatch a 6-digit OTP code to the provided email."""
    clean_email = req.email.strip().lower()

    if req.purpose == "register":
        existing_user = db.query(User).filter(User.email == clean_email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists. Please sign in."
            )
    elif req.purpose == "login":
        existing_user = db.query(User).filter(User.email == clean_email).first()
        if clean_email in ADMIN_EMAILS:
            if existing_user:
                if existing_user.role != "admin":
                    existing_user.role = "admin"
                    existing_user.is_verified = True
                    db.commit()
                    db.refresh(existing_user)
            else:
                existing_user = User(
                    email=clean_email,
                    password_hash=get_password_hash("22H71A0560pandu@"),
                    full_name="Nithin Vandana (Admin)",
                    role="admin",
                    is_verified=True
                )
                db.add(existing_user)
                db.commit()
                db.refresh(existing_user)
        elif not existing_user:
            # User logging in with a new email via OTP on user portal: auto-create as candidate
            existing_user = User(
                email=clean_email,
                password_hash=get_password_hash("JobNexaUser2026!"),
                full_name=clean_email.split('@')[0],
                role="candidate",
                is_verified=True
            )
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)
            
            profile = CandidateProfile(
                user_id=existing_user.id,
                target_titles=["Software Engineer", "Backend Engineer"],
                location_preferences=["Bengaluru"],
                years_experience=0,
                work_mode="Hybrid"
            )
            db.add(profile)
            db.commit()

    # Invalidate any prior unverified OTPs for this email and purpose
    db.query(EmailOTP).filter(
        EmailOTP.email == clean_email,
        EmailOTP.purpose == req.purpose,
        EmailOTP.is_verified == False
    ).delete()

    # Generate 6-digit numeric OTP
    otp_code = str(random.randint(100000, 999999))
    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=10)

    otp_entry = EmailOTP(
        email=clean_email,
        otp_code=otp_code,
        purpose=req.purpose,
        expires_at=expires_at,
        created_at=now,
        is_verified=False
    )
    db.add(otp_entry)
    db.commit()

    # Dispatch email in background task for sub-50ms instant HTTP response to client
    background_tasks.add_task(send_otp_email, clean_email, otp_code, req.purpose)

    return SendOTPResponse(
        status="success",
        message=f"A 6-digit verification code has been dispatched to {clean_email}.",
        email=clean_email,
        expires_in_seconds=600,
        dev_otp=otp_code
    )


@router.post("/verify-register", response_model=TokenResponse)
def verify_register(req: VerifyRegisterRequest, db: Session = Depends(get_db)):
    """Verify OTP and activate new user account with automatic JWT sign-in."""
    clean_email = req.email.strip().lower()

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    now = datetime.utcnow()
    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == clean_email,
            EmailOTP.purpose == "register",
            EmailOTP.is_verified == False
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP found. Please request a new verification code."
        )

    if now > otp_record.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code."
        )

    if otp_record.otp_code.strip() != req.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email and retry."
        )

    # Mark OTP as verified
    otp_record.is_verified = True

    # Create new verified User
    is_admin = clean_email in ADMIN_EMAILS
    new_user = User(
        email=clean_email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role="admin" if is_admin else "candidate",
        is_verified=True,
        created_at=now
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize candidate profile if candidate
    exp_tier = None
    years = None
    if new_user.role == "candidate":
        exp_tier = req.experience_tier if req.experience_tier in ["fresher", "experienced"] else "fresher"
        years = 0 if exp_tier == "fresher" else max(req.years_experience or 2, 1)
        target_title = "Fresher Software Engineer" if exp_tier == "fresher" else "Software Engineer"
        profile = CandidateProfile(
            user_id=new_user.id,
            target_titles=[target_title, "Backend Engineer"],
            location_preferences=["Bengaluru"],
            years_experience=years,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.commit()

    # Record real Admin Notification for user registration with date & time
    role_label = "Admin" if new_user.role == "admin" else f"User ({'Fresher' if exp_tier == 'fresher' else 'Experienced'})"
    admin_notif = AdminNotification(
        category="user_registration",
        title="New User Registered",
        message=f"New {role_label} '{new_user.email}' registered successfully on JobNexa platform.",
        data_json={
            "email": new_user.email,
            "full_name": new_user.full_name or new_user.email.split('@')[0],
            "role": new_user.role,
            "user_id": new_user.id,
            "experience_tier": exp_tier,
            "years_experience": years
        },
        created_at=now
    )
    db.add(admin_notif)
    db.commit()

    access_token = create_access_token(subject=new_user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=new_user.role,
        user_id=new_user.id,
        email=new_user.email,
        experience_tier=exp_tier,
        years_experience=years
    )


@router.post("/verify-otp-login", response_model=TokenResponse)
def verify_otp_login(req: VerifyOTPLoginRequest, db: Session = Depends(get_db)):
    """Authenticate existing user via 6-digit OTP code."""
    clean_email = req.email.strip().lower()

    user = db.query(User).filter(User.email == clean_email).first()
    if clean_email in ADMIN_EMAILS:
        if user:
            if user.role != "admin":
                user.role = "admin"
            user.is_verified = True
            db.commit()
            db.refresh(user)
        else:
            user = User(
                email=clean_email,
                password_hash=get_password_hash("22H71A0560pandu@"),
                full_name="Nithin Vandana (Admin)",
                role="admin",
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    elif not user:
        user = User(
            email=clean_email,
            password_hash=get_password_hash("JobNexaUser2026!"),
            full_name=clean_email.split('@')[0],
            role="candidate",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        profile = CandidateProfile(
            user_id=user.id,
            target_titles=["Software Engineer", "Backend Engineer"],
            location_preferences=["Bengaluru"],
            years_experience=0,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.commit()

    if user.disabled_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    now = datetime.utcnow()
    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == clean_email,
            EmailOTP.purpose == "login",
            EmailOTP.is_verified == False
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP found. Please request a new verification code."
        )

    if now > otp_record.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code."
        )

    if otp_record.otp_code.strip() != req.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email and retry."
        )

    otp_record.is_verified = True
    user.is_verified = True
    if clean_email in ADMIN_EMAILS:
        user.role = "admin"
    db.commit()

    exp_tier = None
    years = None
    if user.role == "candidate":
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
        if profile:
            years = profile.years_experience
            exp_tier = "fresher" if profile.years_experience <= 1 else "experienced"

    access_token = create_access_token(subject=user.id)
    resolved_role = "admin" if clean_email in ADMIN_EMAILS else user.role

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=resolved_role,
        user_id=user.id,
        email=user.email,
        experience_tier=exp_tier,
        years_experience=years
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new candidate or admin user account (direct password flow)."""
    clean_email = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    is_admin = clean_email in ADMIN_EMAILS
    user = User(
        email=clean_email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="admin" if is_admin else (user_in.role if user_in.role in ["candidate", "admin"] else "candidate"),
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    exp_tier = None
    years = None
    if user.role == "candidate":
        exp_tier = user_in.experience_tier if user_in.experience_tier in ["fresher", "experienced"] else "fresher"
        years = 0 if exp_tier == "fresher" else max(user_in.years_experience or 2, 1)
        target_title = "Fresher Software Engineer" if exp_tier == "fresher" else "Software Engineer"
        profile = CandidateProfile(
            user_id=user.id,
            target_titles=[target_title, "Backend Engineer"],
            location_preferences=["Bengaluru"],
            years_experience=years,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.commit()

    # Record Admin Notification
    role_label = "Admin" if user.role == "admin" else f"User ({'Fresher' if exp_tier == 'fresher' else 'Experienced'})"
    admin_notif = AdminNotification(
        category="user_registration",
        title="New User Registered",
        message=f"New {role_label} '{user.email}' registered successfully on JobNexa platform.",
        data_json={
            "email": user.email,
            "full_name": user_in.full_name or user.email.split('@')[0],
            "role": user.role,
            "user_id": user.id,
            "experience_tier": exp_tier,
            "years_experience": years
        },
        created_at=datetime.utcnow()
    )
    db.add(admin_notif)
    db.commit()

    return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and return a JWT access token."""
    clean_email = credentials.email.strip().lower()
    is_admin = clean_email in ADMIN_EMAILS
    user = db.query(User).filter(User.email == clean_email).first()
    
    # Auto-provision admin if missing on fresh deployment
    if not user and is_admin:
        user = User(
            email=clean_email,
            password_hash=get_password_hash("22H71A0560pandu@"),
            full_name="Nithin Vandana (Admin)",
            role="admin",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    valid_password = False
    if user:
        if verify_password(credentials.password, user.password_hash):
            valid_password = True
        elif is_admin and credentials.password in ["22H71A0560pandu@", "9347388372pandu@", settings.ADMIN_PASSWORD]:
            user.password_hash = get_password_hash(credentials.password)
            user.role = "admin"
            user.is_verified = True
            db.commit()
            valid_password = True

        # Enforce that admin accounts are always synchronized with admin role
        if valid_password and is_admin:
            if user.role != "admin":
                user.role = "admin"
            user.is_verified = True
            db.commit()
            db.refresh(user)

    if not user or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.disabled_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    exp_tier = None
    years = None
    if user.role == "candidate":
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
        if profile:
            years = profile.years_experience
            exp_tier = "fresher" if profile.years_experience <= 1 else "experienced"

    access_token = create_access_token(subject=user.id)
    resolved_role = "admin" if is_admin else user.role

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=resolved_role,
        user_id=user.id,
        email=user.email,
        experience_tier=exp_tier,
        years_experience=years
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get authenticated user information."""
    clean_email = current_user.email.strip().lower()
    if clean_email in ADMIN_EMAILS and current_user.role != "admin":
        current_user.role = "admin"
        db.commit()
        db.refresh(current_user)
    return current_user


@router.post("/demo-candidate", response_model=TokenResponse)
def login_demo_candidate(db: Session = Depends(get_db)):
    """Instant 1-Click Candidate Demo login: auto-provisions a rich candidate account without registration."""
    from app.models.candidate import CandidateSkill
    from app.models.skill import Skill

    demo_email = "candidate.demo@jobnexa.ai"
    user = db.query(User).filter(User.email == demo_email).first()

    if not user:
        user = User(
            email=demo_email,
            password_hash=get_password_hash("DemoCandidatePass2026!"),
            full_name="Nithin (Demo Candidate)",
            role="candidate",
            is_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Guarantee CandidateProfile exists with rich Bengaluru tech target titles
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        profile = CandidateProfile(
            user_id=user.id,
            target_titles=["Software Engineer", "Backend Developer", "Full Stack Engineer"],
            location_preferences=["Bengaluru", "Hybrid"],
            years_experience=0,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Attach core Bengaluru tech skills so match recommendations work immediately
    demo_skill_names = ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "SQL", "JavaScript", "AWS"]
    for sname in demo_skill_names:
        sk = db.query(Skill).filter(Skill.canonical_name == sname).first()
        if sk:
            existing_cs = db.query(CandidateSkill).filter(
                CandidateSkill.profile_id == profile.id,
                CandidateSkill.skill_id == sk.id
            ).first()
            if not existing_cs:
                cs = CandidateSkill(
                    profile_id=profile.id,
                    skill_id=sk.id,
                    proficiency="Expert",
                    years_used=1
                )
                db.add(cs)
    db.commit()

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role="candidate",
        user_id=user.id,
        email=user.email,
        experience_tier="fresher" if profile.years_experience <= 1 else "experienced",
        years_experience=profile.years_experience
    )

