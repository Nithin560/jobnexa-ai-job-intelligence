from datetime import datetime
import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job import Job


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    canonical_domain: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    careers_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    company_type: Mapped[str] = mapped_column(String(50), default="Mid-size", nullable=False)  # Startup, Mid-size, Large, Enterprise
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    job_sources: Mapped[List["JobSource"]] = relationship("JobSource", back_populates="company", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="company")


class JobSource(Base):
    __tablename__ = "job_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), default="career_page", nullable=False)  # career_page, rss_feed, ats_api
    base_url: Mapped[str] = mapped_column(String(500), nullable=False)
    connector_key: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "generic_html", "workday_api", "greenhouse_api"
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    policy_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="job_sources")
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="job_source")
