from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.user import User
from app.models.candidate import CandidateProfile, CandidateSkill
from app.models.skill import Skill
from app.models.job import Job, JobSkill, SavedJob
from app.api.deps import get_current_user
from app.schemas.job import JobListItemResponse
from app.services.match_service import calculate_job_match

router = APIRouter()


class ProfileUpdateRequest(BaseModel):
    target_titles: List[str] = Field(default_factory=list)
    location_preferences: List[str] = Field(default_factory=list)
    years_experience: int = Field(default=0, ge=0)
    work_mode: str = Field(default="Hybrid")
    skills: List[str] = Field(default_factory=list)


class CandidateProfileResponse(BaseModel):
    user_id: str
    email: str
    target_titles: List[str]
    location_preferences: List[str]
    years_experience: int
    work_mode: str
    skills: List[str]


@router.get("/profile", response_model=CandidateProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get candidate profile, target preferences, and skills list."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(
            user_id=current_user.id,
            target_titles=["Software Engineer"],
            location_preferences=["Bengaluru"],
            years_experience=0,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    cand_skills_objs = db.query(CandidateSkill).options(joinedload(CandidateSkill.skill)).filter(CandidateSkill.profile_id == profile.id).all()
    skills_list = [cs.skill.canonical_name for cs in cand_skills_objs if cs.skill]

    return CandidateProfileResponse(
        user_id=current_user.id,
        email=current_user.email,
        target_titles=profile.target_titles if isinstance(profile.target_titles, list) else [],
        location_preferences=profile.location_preferences if isinstance(profile.location_preferences, list) else ["Bengaluru"],
        years_experience=profile.years_experience,
        work_mode=profile.work_mode or "Hybrid",
        skills=skills_list
    )


@router.post("/profile", response_model=CandidateProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update candidate target preferences and skills dictionary."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    profile.target_titles = payload.target_titles
    profile.location_preferences = payload.location_preferences
    profile.years_experience = payload.years_experience
    profile.work_mode = payload.work_mode

    # Clear existing candidate skills and attach updated list
    db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile.id).delete()
    
    for sname in payload.skills:
        sk_obj = db.query(Skill).filter(Skill.canonical_name == sname).first()
        if not sk_obj:
            sk_obj = Skill(canonical_name=sname, category="General")
            db.add(sk_obj)
            db.flush()
        
        cs = CandidateSkill(profile_id=profile.id, skill_id=sk_obj.id, proficiency="Intermediate", years_used=profile.years_experience)
        db.add(cs)

    db.commit()
    db.refresh(profile)

    return CandidateProfileResponse(
        user_id=current_user.id,
        email=current_user.email,
        target_titles=profile.target_titles if isinstance(profile.target_titles, list) else [],
        location_preferences=profile.location_preferences if isinstance(profile.location_preferences, list) else ["Bengaluru"],
        years_experience=profile.years_experience,
        work_mode=profile.work_mode or "Hybrid",
        skills=payload.skills
    )


@router.get("/matches", response_model=List[JobListItemResponse])
def get_job_matches(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get candidate job recommendations ranked by match breakdown score."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    cand_skills_objs = db.query(CandidateSkill).options(joinedload(CandidateSkill.skill)).filter(CandidateSkill.profile_id == profile.id).all() if profile else []
    candidate_skills = [cs.skill.canonical_name for cs in cand_skills_objs if cs.skill]

    jobs = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.job_skills).joinedload(JobSkill.skill)
    ).filter(Job.status == "active").all()

    matched_items = []
    saved_objs = db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    saved_job_ids = {s.job_id for s in saved_objs}

    for j in jobs:
        comp_name = j.company.name if j.company else "Direct Employer"
        comp_type = j.company.company_type if j.company else "Mid-size"
        comp_logo = j.company.logo_url if j.company else None
        
        extracted_skills = [js.skill.canonical_name for js in j.job_skills if js.skill]
        match_breakdown = calculate_job_match(j, profile, candidate_skills)

        exp_label = f"{j.experience_min}-{j.experience_max} years" if j.experience_max > j.experience_min else f"{j.experience_min}+ years"

        matched_items.append(
            (
                match_breakdown.score,
                JobListItemResponse(
                    id=j.id,
                    title=j.title,
                    company_name=comp_name,
                    company_type=comp_type,
                    company_logo=comp_logo,
                    location=j.location,
                    work_mode=j.work_mode,
                    employment_type=j.employment_type,
                    experience_min=j.experience_min,
                    experience_max=j.experience_max,
                    experience_label=exp_label,
                    skills=extracted_skills,
                    apply_url=j.apply_url,
                    status=j.status,
                    posted_at=j.posted_at,
                    last_seen_at=j.last_seen_at,
                    is_saved=(j.id in saved_job_ids),
                    match=match_breakdown
                )
            )
        )

    # Sort descending by match score
    matched_items.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in matched_items[:limit]]


@router.get("/saved-jobs", response_model=List[JobListItemResponse])
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List candidate bookmarked jobs."""
    saved_objs = db.query(SavedJob).options(
        joinedload(SavedJob.job).joinedload(Job.company),
        joinedload(SavedJob.job).joinedload(Job.job_skills).joinedload(JobSkill.skill)
    ).filter(SavedJob.user_id == current_user.id).all()

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    cand_skills_objs = db.query(CandidateSkill).options(joinedload(CandidateSkill.skill)).filter(CandidateSkill.profile_id == profile.id).all() if profile else []
    candidate_skills = [cs.skill.canonical_name for cs in cand_skills_objs if cs.skill]

    items = []
    for s_obj in saved_objs:
        j = s_obj.job
        if not j:
            continue
        comp_name = j.company.name if j.company else "Direct Employer"
        comp_type = j.company.company_type if j.company else "Mid-size"
        comp_logo = j.company.logo_url if j.company else None
        
        extracted_skills = [js.skill.canonical_name for js in j.job_skills if js.skill]
        match_breakdown = calculate_job_match(j, profile, candidate_skills)
        exp_label = f"{j.experience_min}-{j.experience_max} years" if j.experience_max > j.experience_min else f"{j.experience_min}+ years"

        items.append(
            JobListItemResponse(
                id=j.id,
                title=j.title,
                company_name=comp_name,
                company_type=comp_type,
                company_logo=comp_logo,
                location=j.location,
                work_mode=j.work_mode,
                employment_type=j.employment_type,
                experience_min=j.experience_min,
                experience_max=j.experience_max,
                experience_label=exp_label,
                skills=extracted_skills,
                apply_url=j.apply_url,
                status=j.status,
                posted_at=j.posted_at,
                last_seen_at=j.last_seen_at,
                is_saved=True,
                match=match_breakdown
            )
        )
    return items


@router.post("/saved-jobs/{job_id}")
def toggle_save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark or remove bookmark for a job listing."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Bookmark removed"}
    else:
        new_saved = SavedJob(user_id=current_user.id, job_id=job_id, application_state="saved")
        db.add(new_saved)
        db.commit()
        return {"saved": True, "message": "Job saved to bookmarks"}
