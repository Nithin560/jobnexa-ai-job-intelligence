from typing import Protocol, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RawJob(BaseModel):
    source_id: str
    external_id: Optional[str] = None
    title: str
    company: str
    location: str = "Bengaluru, Karnataka"
    description: str
    apply_url: str
    source_url: str
    posted_at: Optional[datetime] = None
    fetched_at: datetime = Field(default_factory=datetime.utcnow)


class SourceHealth(BaseModel):
    is_healthy: bool = True
    status_code: int = 200
    error_message: Optional[str] = None


class JobSourceConnector(Protocol):
    def fetch_jobs(self, source_id: str, base_url: str, since: Optional[datetime] = None) -> List[RawJob]:
        ...
    
    def health_check(self, base_url: str) -> SourceHealth:
        ...
