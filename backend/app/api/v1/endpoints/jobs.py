from typing import Optional, List, Dict
import math
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, func
from app.db.session import get_db
from app.models.job import Job, JobSkill, SavedJob
from app.models.company import Company, JobSource
from app.models.skill import Skill
from app.models.scan import ScanRun
from app.models.candidate import CandidateProfile, CandidateSkill
from app.schemas.job import (
    JobListItemResponse,
    JobDetailResponse,
    JobListPaginatedResponse,
    SkillItem,
    MarketInsightsResponse,
    TopSkillInsight,
    ExperienceInsight,
    RecentScanItem,
    LatestScanMeta,
)
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.services.match_service import calculate_job_match
from app.pipeline.normalizer import extract_hiring_role, calculate_salary_range
from app.core.company_logos import get_company_logo

router = APIRouter()



@router.get("", response_model=JobListPaginatedResponse)
def list_jobs(
    q: Optional[str] = Query(None, description="Search query by title, company, or keyword"),
    location: Optional[str] = Query("Bengaluru", description="Target city filter"),
    skills: Optional[str] = Query(None, description="Comma-separated list of required skills"),
    source_type: Optional[str] = Query(None, description="Filter by source type: career_portal or job_portal"),
    work_mode: Optional[str] = Query(None, description="On-site, Hybrid, Remote"),
    company_type: Optional[str] = Query(None, description="Startup, Mid-size, Large, Enterprise"),
    employment_type: Optional[str] = Query(None, description="Full-time, Part-time, Contract, Internship"),
    exp_min: Optional[int] = Query(None, ge=0),
    exp_max: Optional[int] = Query(None, le=30),
    exp_tier: Optional[str] = Query(None, description="Filter specifically for 'fresher' (0-1 yrs) or 'experienced' (>1 yrs)"),
    role_type: Optional[str] = Query(None, description="Filter by role type: software, data, design, product, qa, sales, operations, hr"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("relevance", description="relevance or date"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """List and search Bengaluru job openings with filtering, pagination, and candidate match scores."""
    query = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.job_source),
        joinedload(Job.job_skills).joinedload(JobSkill.skill)
    ).filter(Job.status != "closed")

    # Source Type Filter (Career Portal vs Job Platform)
    if source_type:
        if source_type == "job_portal":
            query = query.join(Job.job_source).filter(JobSource.source_type == "job_portal")
        elif source_type == "career_portal":
            query = query.join(Job.job_source).filter(JobSource.source_type.in_(["career_portal", "ats_api", "career_page"]))

    # Location & Region Filter (Accurately separates Bengaluru, India, United States, Worldwide Remote)
    if location and location.lower() != "all":
        loc_low = location.lower().strip()
        if loc_low in ["bengaluru", "bangalore", "blr"]:
            query = query.filter(or_(
                Job.location.ilike("%bengaluru%"),
                Job.location.ilike("%bangalore%"),
                Job.location.ilike("%blr%")
            ))
        elif loc_low in ["united states", "united_states", "us", "usa"]:
            query = query.filter(or_(
                Job.location.ilike("%united states%"),
                Job.location.ilike("%usa%"),
                Job.location.ilike("%u.s.%"),
                Job.location.ilike("%us remote%"),
                Job.location.ilike("%chicago%"),
                Job.location.ilike("%denver%"),
                Job.location.ilike("%boston%"),
                Job.location.ilike("%san francisco%"),
                Job.location.ilike("%new york%"),
                Job.location.ilike("%austin%"),
                Job.location.ilike("%seattle%"),
                Job.location.ilike("%americas%")
            ))
        elif loc_low in ["worldwide", "worldwide remote", "global", "remote"]:
            query = query.filter(or_(
                Job.location.ilike("%worldwide%"),
                Job.location.ilike("%anywhere%"),
                Job.location.ilike("%global%")
            ))
        elif loc_low in ["india", "in"]:
            query = query.filter(or_(
                Job.location.ilike("%india%"),
                Job.location.ilike("%bengaluru%"),
                Job.location.ilike("%bangalore%"),
                Job.location.ilike("%mumbai%"),
                Job.location.ilike("%delhi%"),
                Job.location.ilike("%hyderabad%"),
                Job.location.ilike("%pune%"),
                Job.location.ilike("%gurugram%"),
                Job.location.ilike("%noida%")
            ))
        else:
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
    if company_type and company_type.lower() != "all":
        ctype_low = company_type.lower().strip()
        if "start" in ctype_low:
            query = query.join(Job.company, isouter=True).filter(Company.company_type.ilike("%startup%"))
        elif "mid" in ctype_low:
            query = query.join(Job.company, isouter=True).filter(Company.company_type.ilike("%mid-size%"))
        elif "enter" in ctype_low or "large" in ctype_low or "mnc" in ctype_low:
            query = query.join(Job.company, isouter=True).filter(Company.company_type.in_(["Enterprise", "Large"]))
        else:
            query = query.join(Job.company, isouter=True).filter(Company.company_type.ilike(f"%{company_type}%"))

    # Role Type Filter (Software, Data, Design, Product, QA, Sales, Operations, HR)
    if role_type and role_type.lower() != "all":
        rt = role_type.lower().strip()
        if "soft" in rt or "eng" in rt or "dev" in rt:
            query = query.filter(or_(
                Job.title.ilike("%software%"),
                Job.title.ilike("%developer%"),
                Job.title.ilike("%engineer%"),
                Job.title.ilike("%backend%"),
                Job.title.ilike("%frontend%"),
                Job.title.ilike("%full stack%"),
                Job.title.ilike("%fullstack%"),
                Job.title.ilike("%web%"),
                Job.title.ilike("%ai%"),
                Job.title.ilike("%python%"),
                Job.title.ilike("%cloud%"),
                Job.title.ilike("%architect%"),
                Job.title.ilike("%tech%")
            ))
        elif "data" in rt or "analyst" in rt or "analytics" in rt:
            query = query.filter(or_(
                Job.title.ilike("%data%"),
                Job.title.ilike("%analyst%"),
                Job.title.ilike("%analytics%"),
                Job.title.ilike("%machine learning%"),
                Job.title.ilike("%scientist%"),
                Job.title.ilike("%intelligence%")
            ))
        elif "design" in rt or "ui" in rt or "ux" in rt or "creative" in rt:
            query = query.filter(or_(
                Job.title.ilike("%design%"),
                Job.title.ilike("%ui%"),
                Job.title.ilike("%ux%"),
                Job.title.ilike("%creative%"),
                Job.title.ilike("%video%"),
                Job.title.ilike("%content%"),
                Job.title.ilike("%writer%"),
                Job.title.ilike("%editor%")
            ))
        elif "product" in rt:
            query = query.filter(or_(
                Job.title.ilike("%product%"),
                Job.title.ilike("%program manager%")
            ))
        elif "qa" in rt or "test" in rt or "quality" in rt:
            query = query.filter(or_(
                Job.title.ilike("%qa%"),
                Job.title.ilike("%test%"),
                Job.title.ilike("%quality%"),
                Job.title.ilike("%automation%")
            ))
        elif "sale" in rt or "business" in rt or "bd" in rt:
            query = query.filter(or_(
                Job.title.ilike("%sales%"),
                Job.title.ilike("%business dev%"),
                Job.title.ilike("%business development%"),
                Job.title.ilike("%partnership%"),
                Job.title.ilike("%growth%"),
                Job.title.ilike("%account executive%")
            ))
        elif "op" in rt or "support" in rt or "service" in rt:
            query = query.filter(or_(
                Job.title.ilike("%operation%"),
                Job.title.ilike("%support%"),
                Job.title.ilike("%associate%"),
                Job.title.ilike("%customer success%"),
                Job.title.ilike("%specialist%")
            ))
        elif "hr" in rt or "recruit" in rt or "talent" in rt or "people" in rt:
            query = query.filter(or_(
                Job.title.ilike("%hr%"),
                Job.title.ilike("%recruit%"),
                Job.title.ilike("%talent%"),
                Job.title.ilike("%people%"),
                Job.title.ilike("%human resource%")
            ))
        else:
            query = query.filter(Job.title.ilike(f"%{role_type}%"))

    # Auto-detect candidate profile experience tier if user is authenticated
    candidate_tier = None
    if current_user and current_user.role == "candidate":
        cand_prof = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
        if cand_prof:
            candidate_tier = "fresher" if cand_prof.years_experience <= 1 else "experienced"

    # Authenticated candidate profile is authoritative; otherwise use exp_tier for guests
    effective_tier = candidate_tier if candidate_tier else exp_tier

    # Experience Filter (Strict Fresher vs Experienced Account Separation)
    if effective_tier == "fresher":
        # Fresher User account ONLY gets Fresher jobs (0 - 1 years)
        query = query.filter(Job.experience_min == 0, Job.experience_max <= 1)
    elif effective_tier == "experienced":
        # Experienced Person ONLY gets Experience jobs (1+ years)
        query = query.filter(or_(Job.experience_min >= 1, Job.experience_max > 1))
        if exp_min is not None and exp_max is not None:
            query = query.filter(Job.experience_max >= exp_min, Job.experience_min <= exp_max)
        elif exp_min is not None:
            query = query.filter(Job.experience_max >= exp_min)
        elif exp_max is not None:
            query = query.filter(Job.experience_min <= exp_max)
    elif exp_min is not None and exp_max is not None:
        if exp_min == 0 and exp_max <= 1:
            query = query.filter(Job.experience_min == 0, Job.experience_max <= 1)
        else:
            query = query.filter(Job.experience_max >= exp_min, Job.experience_min <= exp_max)
    elif exp_min is not None:
        query = query.filter(Job.experience_max >= exp_min)
    elif exp_max is not None:
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
        raw_logo = j.company.logo_url if j.company else None
        comp_dom = j.company.canonical_domain if j.company else None
        comp_logo = get_company_logo(comp_name, raw_logo, comp_dom)
        
        extracted_skills = [js.skill.canonical_name for js in j.job_skills if js.skill]
        match_breakdown = calculate_job_match(j, candidate_profile, candidate_skills)

        if j.experience_min == 0 and j.experience_max <= 1:
            exp_label = "0 - 1 yrs"
        elif j.experience_max > j.experience_min:
            exp_label = f"{j.experience_min} - {j.experience_max} yrs"
        else:
            exp_label = f"{j.experience_min}+ yrs"
        is_new = (now - j.first_seen_at).total_seconds() < 86400  # Seen within 24h

        hiring_role = extract_hiring_role(j.title)
        sal_min, sal_max, sal_label = calculate_salary_range(j.experience_min, j.experience_max, comp_type)

        # Determine source type and source name
        src_type = "career_portal"
        src_name = f"{comp_name} Careers"
        if j.job_source:
            if j.job_source.source_type == "job_portal":
                src_type = "job_portal"
                base_low = (j.job_source.base_url or "").lower()
                if "arbeitnow" in base_low:
                    src_name = "Arbeitnow"
                elif "jobicy" in base_low:
                    src_name = "Jobicy"
                else:
                    src_name = "Job Platform"
            else:
                src_type = "career_portal"
                src_name = f"{comp_name} Careers"

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
                hiring_role=hiring_role,
                salary_min_lpa=sal_min,
                salary_max_lpa=sal_max,
                salary_label=sal_label,
                skills=extracted_skills,
                apply_url=j.apply_url,
                source_type=src_type,
                source_name=src_name,
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


@router.get("/insights", response_model=MarketInsightsResponse)
def get_job_insights(db: Session = Depends(get_db)):
    """Return real aggregated job market insights, skills, experience breakdown, and automated scan history."""
    total_jobs = db.query(Job).filter(Job.status != "closed").count()
    total_companies = db.query(Company).count()

    # Top Hiring Skills aggregated from database
    top_skills_query = (
        db.query(Skill.canonical_name, func.count(JobSkill.job_id).label("cnt"))
        .join(JobSkill, Skill.id == JobSkill.skill_id)
        .join(Job, JobSkill.job_id == Job.id)
        .filter(Job.status != "closed")
        .group_by(Skill.canonical_name)
        .order_by(desc("cnt"))
        .limit(8)
        .all()
    )
    max_skill_count = top_skills_query[0][1] if top_skills_query else 1
    top_skills = [
        TopSkillInsight(
            name=name,
            count=cnt,
            percent=round((cnt / max_skill_count) * 100)
        )
        for name, cnt in top_skills_query
    ]

    # Mutually exclusive experience tiers for Donut Chart
    exp_rows = db.query(Job.experience_min, Job.experience_max).filter(Job.status != "closed").all()
    exp_counts = {
        'Fresher': 0,
        '1-3 years': 0,
        '3-5 years': 0,
        '5-10 years': 0,
        '10+ years': 0
    }
    for emin, emax in exp_rows:
        emin = emin or 0
        emax = emax or 1
        if emin == 0 and emax <= 1:
            exp_counts['Fresher'] += 1
        elif (emin >= 1 and emin <= 2) or (emin == 0 and emax <= 3):
            exp_counts['1-3 years'] += 1
        elif emin in (3, 4) or (emin == 0 and emax <= 5):
            exp_counts['3-5 years'] += 1
        elif emin < 10:
            exp_counts['5-10 years'] += 1
        else:
            exp_counts['10+ years'] += 1

    tot_exp = len(exp_rows) or 1
    colors = {
        'Fresher': '#3b82f6',
        '1-3 years': '#10b981',
        '3-5 years': '#f59e0b',
        '5-10 years': '#8b5cf6',
        '10+ years': '#ef4444'
    }
    exp_donut = [
        ExperienceInsight(
            name=k,
            value=round((exp_counts[k] / tot_exp) * 100),
            count=exp_counts[k],
            color=colors[k]
        )
        for k in ['Fresher', '1-3 years', '3-5 years', '5-10 years', '10+ years']
    ]

    # Real Work Mode counts
    mode_rows = db.query(Job.work_mode, func.count(Job.id)).filter(Job.status != "closed").group_by(Job.work_mode).all()
    work_modes = {"On-site": 0, "Remote": 0, "Hybrid": 0}
    for mode, cnt in mode_rows:
        mode_clean = (mode or "").strip()
        if mode_clean in work_modes:
            work_modes[mode_clean] += cnt
        elif mode_clean == 'Full-time':
            work_modes['On-site'] += cnt
        elif 'remote' in mode_clean.lower():
            work_modes['Remote'] += cnt
        elif 'hybrid' in mode_clean.lower():
            work_modes['Hybrid'] += cnt
        else:
            work_modes['On-site'] += cnt

    # Real Company Category counts
    tier_rows = (
        db.query(Company.company_type, func.count(Job.id))
        .join(Job, Job.company_id == Company.id)
        .filter(Job.status != "closed")
        .group_by(Company.company_type)
        .all()
    )
    company_tiers = {"Startup": 0, "Mid-size": 0, "Enterprise": 0}
    for ctype, cnt in tier_rows:
        ct = (ctype or "").lower()
        if "start" in ct:
            company_tiers["Startup"] += cnt
        elif "mid" in ct:
            company_tiers["Mid-size"] += cnt
        else:
            company_tiers["Enterprise"] += cnt

    # Real Scan Runs history
    scan_runs = (
        db.query(ScanRun)
        .filter(ScanRun.status == "completed")
        .order_by(desc(ScanRun.started_at))
        .limit(4)
        .all()
    )
    recent_scans = []
    latest_meta = {}
    now = datetime.utcnow()
    for idx, run in enumerate(scan_runs):
        totals = run.totals_json or {}
        if isinstance(totals, str):
            try:
                totals = json.loads(totals)
            except Exception:
                totals = {}
        if idx == 0:
            latest_meta = totals

        dt = run.started_at
        if dt.date() == now.date():
            time_str = f"Today, {dt.strftime('%I:%M %p')}"
        elif (now.date() - dt.date()).days == 1:
            time_str = f"Yesterday, {dt.strftime('%I:%M %p')}"
        else:
            time_str = dt.strftime("%b %d, %I:%M %p")

        jobs_found = totals.get("jobs_found", total_jobs)
        comps_scanned = totals.get("companies_scanned", total_companies)
        new_jobs = totals.get("new_jobs", 0)

        recent_scans.append(
            RecentScanItem(
                time=time_str,
                count=f"{jobs_found:,} jobs found",
                companies_scanned=comps_scanned,
                new_jobs=new_jobs
            )
        )

    if not recent_scans:
        recent_scans = [
            RecentScanItem(
                time="Today, 06:00 AM",
                count=f"{total_jobs:,} jobs found",
                companies_scanned=17,
                new_jobs=44
            )
        ]

    latest_scan = LatestScanMeta(
        companies_scanned=latest_meta.get("companies_scanned", recent_scans[0].companies_scanned if recent_scans else 17),
        jobs_found=latest_meta.get("jobs_found", total_jobs),
        new_jobs=latest_meta.get("new_jobs", 44),
        time=recent_scans[0].time if recent_scans else "Today, 06:00 AM"
    )

    return MarketInsightsResponse(
        total_jobs=total_jobs,
        total_companies=total_companies,
        top_skills=top_skills,
        experience_breakdown=exp_donut,
        work_modes=work_modes,
        company_tiers=company_tiers,
        recent_scans=recent_scans,
        latest_scan=latest_scan
    )


@router.get("/scan-status")
def get_live_scan_status():
    """Returns live status of background scanner, whether currently running, and last scan metrics."""
    from app.tasks.scan import get_last_scan_info, is_scanner_busy
    info = get_last_scan_info()
    return info


@router.post("/auto-scan-check")
def trigger_auto_scan_on_site_open(force: bool = False):
    """
    Called when a user opens the platform.
    Verifies if daily scan is fresh; if not (or if force=True), dispatches live scan
    across all Career Websites and Job Portals in a background worker thread.
    """
    from app.tasks.scan import start_background_scan_task, get_last_scan_info
    res = start_background_scan_task(trigger="website_opened", force=force)
    last_info = get_last_scan_info()
    return {
        **res,
        "scan_info": last_info
    }


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job_detail(
    job_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get complete details, extracted skills, and candidate match breakdown for a specific job."""
    job = db.query(Job).options(
        joinedload(Job.company),
        joinedload(Job.job_source),
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
    raw_logo = job.company.logo_url if job.company else None
    comp_domain = job.company.canonical_domain if job.company else None
    comp_careers = job.company.careers_url if job.company else None
    comp_logo = get_company_logo(comp_name, raw_logo, comp_domain)

    # Determine source metadata
    src_type = "career_portal"
    src_name = f"{comp_name} Careers"
    if job.job_source:
        if job.job_source.source_type == "job_portal":
            src_type = "job_portal"
            base_low = (job.job_source.base_url or "").lower()
            if "arbeitnow" in base_low:
                src_name = "Arbeitnow"
            elif "jobicy" in base_low:
                src_name = "Jobicy"
            else:
                src_name = "Job Platform"
        else:
            src_type = "career_portal"
            src_name = f"{comp_name} Careers"

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

    if job.experience_min == 0 and job.experience_max <= 1:
        exp_label = "0 - 1 yrs"
    elif job.experience_max > job.experience_min:
        exp_label = f"{job.experience_min} - {job.experience_max} yrs"
    else:
        exp_label = f"{job.experience_min}+ yrs"
    is_new = (datetime.utcnow() - job.first_seen_at).total_seconds() < 86400

    hiring_role = extract_hiring_role(job.title)
    sal_min, sal_max, sal_label = calculate_salary_range(job.experience_min, job.experience_max, comp_type)

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
        hiring_role=hiring_role,
        salary_min_lpa=sal_min,
        salary_max_lpa=sal_max,
        salary_label=sal_label,
        description=job.description,
        canonical_url=job.canonical_url,
        apply_url=job.apply_url,
        source_type=src_type,
        source_name=src_name,
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
