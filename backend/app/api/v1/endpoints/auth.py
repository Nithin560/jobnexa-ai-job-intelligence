import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
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
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import send_otp_email, is_smtp_configured
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
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
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email. Please register first."
            )

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

    # Send email (via SMTP or dev logger)
    send_otp_email(clean_email, otp_code, purpose=req.purpose)

    dev_otp_val = otp_code if not is_smtp_configured() else None

    return SendOTPResponse(
        status="success",
        message=f"A 6-digit verification code has been sent to {clean_email}.",
        email=clean_email,
        expires_in_seconds=600,
        dev_otp=dev_otp_val
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
    new_user = User(
        email=clean_email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role if req.role in ["candidate", "admin"] else "candidate",
        is_verified=True,
        created_at=now
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize candidate profile
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
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register first."
        )

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
    db.commit()

    exp_tier = None
    years = None
    if user.role == "candidate":
        profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
        if profile:
            years = profile.years_experience
            exp_tier = "fresher" if profile.years_experience <= 1 else "experienced"

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        experience_tier=exp_tier,
        years_experience=years
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new candidate or admin user account (direct password flow)."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["candidate", "admin"] else "candidate",
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
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
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
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        experience_tier=exp_tier,
        years_experience=years
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get authenticated user information."""
    return current_user
