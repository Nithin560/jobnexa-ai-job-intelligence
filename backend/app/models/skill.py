import uuid
from typing import Optional, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canonical_name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    aliases: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # Comma-separated or JSON list of aliases
    category: Mapped[Optional[str]] = mapped_column(String(100), default="General", nullable=True)  # Languages, Databases, Cloud, Frameworks
