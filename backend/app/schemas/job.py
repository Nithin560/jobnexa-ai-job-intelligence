from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SkillItem(BaseModel):
    id: str
    canonical_name: str
    category: Optional[str] = None
    confidence: float = 1.0
    required_or_nice: str = "required"


class MatchBreakdown(BaseModel):
    score: float = Field(..., example=82.0)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    skills_match_percent: float = 100.0
    experience_match_percent: float = 100.0
    location_match_percent: float = 100.0
    role_match_percent: float = 100.0


class JobListItemResponse(BaseModel):
    id: str
    title: str
    company_name: str
    company_type: str = "Mid-size"
    company_logo: Optional[str] = None
    location: str
    work_mode: str
    employment_type: str
    experience_min: int
    experience_max: int
    experience_label: str
    hiring_role: str = "Software Engineer"
    salary_min_lpa: Optional[float] = 18.0
    salary_max_lpa: Optional[float] = 32.0
    salary_label: str = "₹18 - 32 LPA"
    skills: List[str] = Field(default_factory=list)
    apply_url: str
    source_type: str = "career_portal"  # career_portal or job_portal
    source_name: Optional[str] = None    # e.g. "Razorpay Careers", "Arbeitnow", "Jobicy"
    status: str = "active"
    posted_at: Optional[datetime] = None
    last_seen_at: datetime
    is_new: bool = False
    is_saved: bool = False
    it_role_family: Optional[str] = "Software & Product Engineering"
    confidence_score: int = 95
    match: Optional[MatchBreakdown] = None

    class Config:
        from_attributes = True


class JobDetailResponse(JobListItemResponse):
    description: str
    canonical_url: Optional[str] = None
    company_domain: Optional[str] = None
    company_careers_url: Optional[str] = None
    detailed_skills: List[SkillItem] = Field(default_factory=list)
    history_count: int = 0


class JobListPaginatedResponse(BaseModel):
    items: List[JobListItemResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


class TopSkillInsight(BaseModel):
    name: str
    count: int
    percent: int


class ExperienceInsight(BaseModel):
    name: str
    value: int
    count: int
    color: str


class RecentScanItem(BaseModel):
    time: str
    count: str
    companies_scanned: int
    new_jobs: int


class LatestScanMeta(BaseModel):
    companies_scanned: int
    jobs_found: int
    new_jobs: int
    time: str


class MarketInsightsResponse(BaseModel):
    total_jobs: int
    total_companies: int
    top_skills: List[TopSkillInsight]
    experience_breakdown: List[ExperienceInsight]
    work_modes: Dict[str, int]
    company_tiers: Dict[str, int]
    recent_scans: List[RecentScanItem]
    latest_scan: LatestScanMeta

