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
    skills: List[str] = Field(default_factory=list)
    apply_url: str
    status: str = "active"
    posted_at: Optional[datetime] = None
    last_seen_at: datetime
    is_new: bool = False
    is_saved: bool = False
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
