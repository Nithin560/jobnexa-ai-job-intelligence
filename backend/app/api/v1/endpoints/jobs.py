from typing import Optional, List
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc
from app.db.session import get_db
from app.models.job import Job, JobSkill, SavedJob
from app.models.company import Company
from app.models.skill import Skill
from app.models.candidate import CandidateProfile, CandidateSkill
from app.schemas.job import JobListItemResponse, JobDetailResponse, JobListPaginatedResponse, SkillItem
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.services.match_service import calculate_job_match

router = APIRouter()


@router.get("", response_model=JobListPaginatedResponse)
def list_jobs(
    q: Optional[str] = Query(None, description="Search query by title, company, or keyword"),
    location: Optional[str] = Query("Bengaluru", description="Target city filter"),
    skills: Optional[str] = Query(None, description="Comma-separated list of required skills"),
    work_mode: Optional[str] = Query(None, description="On-site, Hybrid, Remote"),
    company_type: Optional[str] = Query(None, description="Startup, Mid-size, Large, Enterprise"),
    employment_type: Optional[str] = Query(None, description="Full-time, Part-time, Contract, Internship"),
    exp_min: Optional[int] = Query(None, ge=0),
    exp_max: Optional[int] = Query(None, le=30),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("relevance", description="relevance or date"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """List and search Bengaluru job openings with filtering, pagination, and candidate match scores."""
    query = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.job_skills).joinedload(JobSkill.skill)
    ).filter(Job.status != "closed")

    # City Location Filter
    if location and location.lower() != "all":
        query = query.filter(Job.location.ilike(f"%{location}%"))

    # Free text search
    if q:
        search_pattern = f"%{q}%"
        query = query.join(Job.company, isouter=True).filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.description.ilike(search_pattern),
                Company.name.ilike(search_pattern)
            )
        )

    # Work Mode Filter
    if work_mode:
        query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))

    # Employment Type Filter
    if employment_type:
        query = query.filter(Job.employment_type.ilike(f"%{employment_type}%"))

    # Company Type Filter
    if company_type:
        query = query.join(Job.company, isouter=True).filter(Company.company_type.ilike(f"%{company_type}%"))

    # Experience Filter
    if exp_min is not None:
        query = query.filter(Job.experience_max >= exp_min)
    if exp_max is not None:
        query = query.filter(Job.experience_min <= exp_max)

    # Filter by Skills list
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        if skill_list:
            query = query.join(Job.job_skills).join(JobSkill.skill).filter(
                Skill.canonical_name.ilike(f"%{skill_list[0]}%")
            )

    # Count Total Items
    total_items = query.distinct().count()
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1

    # Sorting
    if sort_by == "date":
        query = query.order_by(desc(Job.last_seen_at))
    else:
        query = query.order_by(desc(Job.last_seen_at))

    # Pagination
    jobs = query.distinct().offset((page - 1) * page_size).limit(page_size).all()

    # Load candidate profile if logged in
    candidate_profile = None
    candidate_skills = []
    saved_job_ids = set()

    if current_user:
        candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
        if candidate_profile:
            cand_skills_objs = db.query(CandidateSkill).options(joinedload(CandidateSkill.skill)).filter(CandidateSkill.profile_id == candidate_profile.id).all()
            candidate_skills = [cs.skill.canonical_name for cs in cand_skills_objs if cs.skill]
        
        saved_objs = db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
        saved_job_ids = {s.job_id for s in saved_objs}

    now = datetime.utcnow()
    items = []
    for j in jobs:
        comp_name = j.company.name if j.company else "Direct Employer"
        comp_type = j.company.company_type if j.company else "Mid-size"
        comp_logo = j.company.logo_url if j.company else None
        
        extracted_skills = [js.skill.canonical_name for js in j.job_skills if js.skill]
        match_breakdown = calculate_job_match(j, candidate_profile, candidate_skills)

        exp_label = f"{j.experience_min}-{j.experience_max} years" if j.experience_max > j.experience_min else f"{j.experience_min}+ years"
        is_new = (now - j.first_seen_at).total_seconds() < 86400  # Seen within 24h

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
                is_new=is_new,
                is_saved=(j.id in saved_job_ids),
                match=match_breakdown
            )
        )

    return JobListPaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total_items,
        total_pages=total_pages
    )


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job_detail(
    job_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get complete details, extracted skills, and candidate match breakdown for a specific job."""
    job = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.job_skills).joinedload(JobSkill.skill),
        joinedload(Job.history)
    ).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job listing not found"
        )

    comp_name = job.company.name if job.company else "Direct Employer"
    comp_type = job.company.company_type if job.company else "Mid-size"
    comp_logo = job.company.logo_url if job.company else None
    comp_domain = job.company.canonical_domain if job.company else None
    comp_careers = job.company.careers_url if job.company else None

    # Load candidate profile if logged in
    candidate_profile = None
    candidate_skills = []
    is_saved = False

    if current_user:
        candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
        if candidate_profile:
            cand_skills_objs = db.query(CandidateSkill).options(joinedload(CandidateSkill.skill)).filter(CandidateSkill.profile_id == candidate_profile.id).all()
            candidate_skills = [cs.skill.canonical_name for cs in cand_skills_objs if cs.skill]
        
        saved_obj = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job.id).first()
        is_saved = bool(saved_obj)

    detailed_skills = [
        SkillItem(
            id=js.skill.id,
            canonical_name=js.skill.canonical_name,
            category=js.skill.category,
            confidence=js.confidence,
            required_or_nice=js.required_or_nice
        )
        for js in job.job_skills if js.skill
    ]
    extracted_skill_names = [s.canonical_name for s in detailed_skills]
    match_breakdown = calculate_job_match(job, candidate_profile, candidate_skills)

    exp_label = f"{job.experience_min}-{job.experience_max} years" if job.experience_max > job.experience_min else f"{job.experience_min}+ years"
    is_new = (datetime.utcnow() - job.first_seen_at).total_seconds() < 86400

    return JobDetailResponse(
        id=job.id,
        title=job.title,
        company_name=comp_name,
        company_type=comp_type,
        company_logo=comp_logo,
        company_domain=comp_domain,
        company_careers_url=comp_careers,
        location=job.location,
        work_mode=job.work_mode,
        employment_type=job.employment_type,
        experience_min=job.experience_min,
        experience_max=job.experience_max,
        experience_label=exp_label,
        description=job.description,
        canonical_url=job.canonical_url,
        apply_url=job.apply_url,
        status=job.status,
        posted_at=job.posted_at,
        last_seen_at=job.last_seen_at,
        is_new=is_new,
        is_saved=is_saved,
        skills=extracted_skill_names,
        detailed_skills=detailed_skills,
        history_count=len(job.history),
        match=match_breakdown
    )
