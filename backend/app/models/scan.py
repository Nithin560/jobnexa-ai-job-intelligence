from datetime import datetime
import uuid
from typing import Optional, List
from sqlalchemy import String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ScanRun(Base):
    __tablename__ = "scan_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="started", nullable=False)  # started, completed, partial, failed
    trigger: Mapped[str] = mapped_column(String(50), default="cron", nullable=False)  # cron, manual, retry
    totals_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # {fetched: 84, valid: 81, new: 9, updated: 14, expired: 4}

    # Relationships
    source_results: Mapped[List["SourceRunResult"]] = relationship("SourceRunResult", back_populates="scan_run", cascade="all, delete-orphan")


class SourceRunResult(Base):
    __tablename__ = "source_run_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_run_id: Mapped[str] = mapped_column(ForeignKey("scan_runs.id", ondelete="CASCADE"), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("job_sources.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="success", nullable=False)  # success, timeout, error, throttled
    fetched_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    parsed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    errors: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    scan_run: Mapped["ScanRun"] = relationship("ScanRun", back_populates="source_results")
