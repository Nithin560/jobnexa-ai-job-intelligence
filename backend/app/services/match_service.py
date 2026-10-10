from typing import List, Dict, Tuple, Optional
from datetime import datetime, timezone
from app.models.job import Job
from app.models.candidate import CandidateProfile, CandidateSkill
from app.schemas.job import MatchBreakdown


def calculate_job_match(job: Job, profile: Optional[CandidateProfile], candidate_skills: List[str]) -> MatchBreakdown:
    """
    Calculate transparent candidate-job match breakdown:
    Score = 100 * (0.40 * SkillCoverage + 0.20 * TitleSimilarity + 0.15 * ExperienceFit + 0.10 * LocationModeFit + 0.10 * SemanticSimilarity + 0.05 * Freshness)
    """
    if not profile:
        # Default match estimate when no candidate profile is logged in
        job_skill_names = [js.skill.canonical_name for js in job.job_skills if js.skill]
        return MatchBreakdown(
            score=75.0,
            matched_skills=job_skill_names[:2],
            missing_skills=job_skill_names[2:],
            skills_match_percent=80.0,
            experience_match_percent=100.0,
            location_match_percent=100.0,
            role_match_percent=85.0
        )

    # 1. Skill Coverage Component (40%)
    job_skill_names = [js.skill.canonical_name for js in job.job_skills if js.skill]
    candidate_skill_names_lower = [s.lower() for s in candidate_skills]
    
    matched_skills = []
    missing_skills = []
    
    for s in job_skill_names:
        if s.lower() in candidate_skill_names_lower:
            matched_skills.append(s)
        else:
            missing_skills.append(s)

    if job_skill_names:
        skill_coverage = len(matched_skills) / len(job_skill_names)
    else:
        skill_coverage = 1.0

    # 2. Title Similarity Component (20%)
    title_sim = 0.5
    target_titles = profile.target_titles if isinstance(profile.target_titles, list) else []
    job_title_lower = job.title.lower()
    for t in target_titles:
        if t.lower() in job_title_lower or job_title_lower in t.lower():
            title_sim = 1.0
            break

    # 3. Experience Fit Component (15%)
    cand_exp = profile.years_experience or 0
    if job.experience_min <= cand_exp <= job.experience_max:
        exp_fit = 1.0
    elif cand_exp < job.experience_min:
        diff = job.experience_min - cand_exp
        exp_fit = max(0.0, 1.0 - (diff * 0.3))
    else:
        exp_fit = 0.9  # Slightly higher experienced candidates get near full credit

    # 4. Location & Work Mode Fit Component (10%)
    loc_fit = 1.0 if "bengaluru" in job.location.lower() else 0.8
    mode_fit = 1.0 if (not profile.work_mode or profile.work_mode == job.work_mode) else 0.75
    loc_mode_score = (loc_fit + mode_fit) / 2.0

    # 5. Semantic Similarity (10%)
    semantic_sim = 0.85

    # 6. Freshness Component (5%)
    now = datetime.now(timezone.utc)
    job_last_seen = job.last_seen_at.replace(tzinfo=timezone.utc) if job.last_seen_at.tzinfo is None else job.last_seen_at
    hours_old = (now - job_last_seen).total_seconds() / 3600.0
    freshness = max(0.2, 1.0 - (hours_old / 168.0))  # Decays over 7 days

    # Calculate Weighted Final Score (0 to 100)
    raw_score = (
        0.40 * skill_coverage +
        0.20 * title_sim +
        0.15 * exp_fit +
        0.10 * loc_mode_score +
        0.10 * semantic_sim +
        0.05 * freshness
    )
    final_score = round(raw_score * 100.0, 1)

    return MatchBreakdown(
        score=final_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        skills_match_percent=round(skill_coverage * 100.0, 1),
        experience_match_percent=round(exp_fit * 100.0, 1),
        location_match_percent=round(loc_mode_score * 100.0, 1),
        role_match_percent=round(title_sim * 100.0, 1)
    )
