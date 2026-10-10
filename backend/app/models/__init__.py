from app.db.base import Base
from app.models.user import User
from app.models.candidate import CandidateProfile, CandidateSkill
from app.models.company import Company, JobSource
from app.models.job import Job, JobHistory, JobSkill, JobDuplicate, JobEmbedding, SavedJob
from app.models.skill import Skill
from app.models.scan import ScanRun, SourceRunResult

__all__ = [
    "Base",
    "User",
    "CandidateProfile",
    "CandidateSkill",
    "Company",
    "JobSource",
    "Job",
    "JobHistory",
    "Skill",
    "JobSkill",
    "JobDuplicate",
    "JobEmbedding",
    "SavedJob",
    "ScanRun",
    "SourceRunResult",
]
