import re
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timezone
from app.models.job import Job
from app.models.candidate import CandidateProfile, CandidateSkill
from app.schemas.job import MatchBreakdown


def calculate_job_match(job: Job, profile: Optional[CandidateProfile], candidate_skills: List[str]) -> MatchBreakdown:
    """
    Calculate transparent, profile-driven candidate-job match breakdown:
    Score = 100 * (0.40 * SkillCoverage + 0.25 * TitleSimilarity + 0.20 * ExperienceFit + 0.10 * LocationModeFit + 0.05 * Freshness)
    """
    if not profile:
        # Default match estimate when no candidate profile is logged in
        job_skill_names = [js.skill.canonical_name for js in job.job_skills if js.skill]
        return MatchBreakdown(
            score=75.0,
            matched_skills=job_skill_names[:2],
            missing_skills=job_skill_names[2:],
            skills_match_percent=75.0,
            experience_match_percent=80.0,
            location_match_percent=90.0,
            role_match_percent=75.0
        )

    job_t_lower = (job.title or "").lower().strip()
    job_desc_lower = (job.description or "")[:2000].lower()
    job_full_text = f"{job_t_lower} {job_desc_lower}"

    # 1. Title & Role Similarity (25%)
    target_titles = profile.target_titles if isinstance(profile.target_titles, list) else []
    t_score = 0.0

    # Non-IT penalty (marketing, finance, fp&a, sales, recruiter, non-coding design)
    non_it_signals = ["marketing", "finance", "fp&a", "sales", "hr", "recruiter", "talent acquisition", "account manager"]
    if any(re.search(r"\b" + k + r"\b", job_t_lower) for k in non_it_signals):
        t_score = 0.0
    elif target_titles:
        for tt in target_titles:
            tt_low = tt.lower().strip()
            # Exact or substring match
            if tt_low in job_t_lower or job_t_lower in tt_low:
                t_score = max(t_score, 1.0)
            # Backend alignment
            elif "backend" in tt_low and "backend" in job_t_lower:
                t_score = max(t_score, 0.95)
            # Frontend alignment
            elif "frontend" in tt_low and "frontend" in job_t_lower:
                t_score = max(t_score, 0.95)
            # Full stack alignment
            elif ("full stack" in tt_low or "fullstack" in tt_low) and ("full stack" in job_t_lower or "fullstack" in job_t_lower):
                t_score = max(t_score, 0.95)
            # Software Engineer / Developer alignment
            elif any(k in tt_low for k in ["software", "developer", "sde", "engineer"]) and any(k in job_t_lower for k in ["software", "developer", "sde", "engineer"]):
                t_score = max(t_score, 0.85)
            # Word token overlap
            else:
                tt_tokens = set(re.findall(r"\w+", tt_low))
                job_tokens = set(re.findall(r"\w+", job_t_lower))
                common = tt_tokens.intersection(job_tokens)
                if common:
                    t_score = max(t_score, 0.55)
    else:
        # Default technical role credit
        if any(k in job_t_lower for k in ["software", "developer", "engineer", "sde"]):
            t_score = 0.80
        else:
            t_score = 0.50

    # 2. Skill Match & Coverage (40%)
    job_skills = [js.skill.canonical_name for js in job.job_skills if js.skill]
    cand_skills = [s.strip() for s in candidate_skills if s and s.strip()]

    matched_skills = []
    missing_skills = []

    for s in cand_skills:
        s_low = s.lower()
        # Check explicit job skills OR occurrence in job title / JD text
        if any(js.lower() == s_low for js in job_skills) or re.search(r"\b" + re.escape(s_low) + r"\b", job_full_text):
            matched_skills.append(s)

    for js in job_skills:
        if not any(cs.lower() == js.lower() for cs in cand_skills):
            missing_skills.append(js)

    if cand_skills:
        if not matched_skills:
            skill_score = 0.0
        else:
            # Score based on how many of candidate's skills are matched in this job
            # e.g., candidate has 5 skills: matching 4 yields 1.0 (100%); matching 2 yields 0.5 (50%)
            match_ratio = len(matched_skills) / min(len(cand_skills), 4)
            skill_score = min(1.0, match_ratio)
    else:
        skill_score = 0.70

    # 3. Experience Fit (20%)
    cand_exp = profile.years_experience or 0
    if cand_exp <= 1:
        # Fresher candidates: strongly favor 0-1 years / entry-level / intern roles
        if job.experience_min == 0 and job.experience_max <= 1:
            exp_score = 1.0
        elif job.experience_min <= 1 and job.experience_max <= 2:
            exp_score = 0.95
        elif job.experience_min <= 2 and job.experience_max <= 3:
            exp_score = 0.60
        elif job.experience_min >= 3:
            # Heavy penalty for senior jobs presented to fresher
            exp_score = 0.15
        else:
            exp_score = 0.50
    else:
        # Experienced candidates (2+ years)
        if job.experience_min <= cand_exp <= job.experience_max:
            exp_score = 1.0
        elif cand_exp < job.experience_min:
            exp_score = max(0.1, 1.0 - (job.experience_min - cand_exp) * 0.25)
        else:
            exp_score = 0.85

    # 4. Location & Work Mode Fit (10%)
    loc_score = 1.0 if any(k in job.location.lower() for k in ["bengaluru", "bangalore", "blr", "karnataka"]) else 0.8
    pref_mode = profile.work_mode or "Hybrid"
    if not pref_mode or pref_mode == job.work_mode:
        mode_score = 1.0
    elif pref_mode == "Hybrid" and job.work_mode in ["Remote", "On-site"]:
        mode_score = 0.85
    elif pref_mode == "Remote" and job.work_mode == "Hybrid":
        mode_score = 0.60
    else:
        mode_score = 0.50
    loc_mode_score = (loc_score + mode_score) / 2.0

    # 5. Freshness Component (5%)
    now = datetime.now(timezone.utc)
    job_last_seen = job.last_seen_at.replace(tzinfo=timezone.utc) if job.last_seen_at.tzinfo is None else job.last_seen_at
    hours_old = (now - job_last_seen).total_seconds() / 3600.0
    freshness = max(0.2, 1.0 - (hours_old / 168.0))

    # Calculate Weighted Final Score (0 to 100)
    raw_score = (
        0.40 * skill_score +
        0.25 * t_score +
        0.20 * exp_score +
        0.10 * loc_mode_score +
        0.05 * freshness
    )
    final_score = round(raw_score * 100.0, 1)

    return MatchBreakdown(
        score=final_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills[:5],
        skills_match_percent=round(skill_score * 100.0, 1),
        experience_match_percent=round(exp_score * 100.0, 1),
        location_match_percent=round(loc_mode_score * 100.0, 1),
        role_match_percent=round(t_score * 100.0, 1)
    )
