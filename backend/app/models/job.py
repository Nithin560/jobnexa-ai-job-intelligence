from datetime import datetime
import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.company import Company, JobSource
    from app.models.skill import Skill
    from app.models.user import User


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(ForeignKey("companies.id", ondelete="SET NULL"), index=True, nullable=True)
    source_id: Mapped[Optional[str]] = mapped_column(ForeignKey("job_sources.id", ondelete="SET NULL"), index=True, nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    canonical_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    apply_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="Bengaluru, Karnataka", index=True, nullable=False)
    
    work_mode: Mapped[str] = mapped_column(String(50), default="On-site", index=True, nullable=False)  # On-site, Hybrid, Remote
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-time", index=True, nullable=False)  # Full-time, Part-time, Contract, Internship
    experience_min: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    experience_max: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    salary_min_lpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_max_lpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), default="active", index=True, nullable=False)  # active, not_seen, stale, closed, paused_source
    fingerprint: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)  # Hash of company + title + description
    
    first_seen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="jobs")
    job_source: Mapped[Optional["JobSource"]] = relationship("JobSource", back_populates="jobs")
    job_skills: Mapped[List["JobSkill"]] = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    history: Mapped[List["JobHistory"]] = relationship("JobHistory", back_populates="job", cascade="all, delete-orphan")


class JobSkill(Base):
    __tablename__ = "job_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)  # 0.0 to 1.0
    evidence_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    required_or_nice: Mapped[str] = mapped_column(String(50), default="required", nullable=False)  # required, nice_to_have

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="job_skills")
    skill: Mapped["Skill"] = relationship("Skill")


class JobHistory(Base):
    __tablename__ = "job_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    changed_fields: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    snapshot_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    evidence: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="history")


class JobDuplicate(Base):
    __tablename__ = "job_duplicates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    canonical_job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    decision: Mapped[str] = mapped_column(String(50), default="pending_review", nullable=False)  # pending_review, merged, rejected
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class JobEmbedding(Base):
    __tablename__ = "job_embeddings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), default="all-MiniLM-L6-v2", nullable=False)
    dimensions: Mapped[int] = mapped_column(Integer, default=384, nullable=False)
    embedding_json: Mapped[dict] = mapped_column(JSON, nullable=False)  # Stored as JSON list for cross-DB compatibility
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    application_state: Mapped[str] = mapped_column(String(50), default="saved", nullable=False)  # saved, applied, interviewing, rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_jobs")
    job: Mapped["Job"] = relationship("Job")
