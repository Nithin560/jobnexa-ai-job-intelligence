from datetime import datetime
import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.skill import Skill


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_titles: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # List of strings e.g. ["Backend Engineer"]
    location_preferences: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # e.g. ["Bengaluru", "Remote"]
    years_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    work_mode: Mapped[Optional[str]] = mapped_column(String(50), default="Hybrid", nullable=True)  # On-site, Hybrid, Remote
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="candidate_profile")
    candidate_skills: Mapped[List["CandidateSkill"]] = relationship("CandidateSkill", back_populates="profile", cascade="all, delete-orphan")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency: Mapped[Optional[str]] = mapped_column(String(50), default="Intermediate", nullable=True)  # Beginner, Intermediate, Expert
    years_used: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=True)

    # Relationships
    profile: Mapped["CandidateProfile"] = relationship("CandidateProfile", back_populates="candidate_skills")
    skill: Mapped["Skill"] = relationship("Skill")
