import hashlib
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.job import Job, JobDuplicate


def generate_job_fingerprint(company_name: str, title: str, description: str) -> str:
    """Generate SHA-256 fingerprint hash of normalized company + title + description."""
    raw_str = f"{company_name.strip().lower()}|{title.strip().lower()}|{description.strip().lower()[:200]}"
    return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()


def check_and_deduplicate_job(
    db: Session,
    company_id: str,
    title: str,
    fingerprint: str,
    apply_url: str
) -> Tuple[Optional[Job], str]:
    """
    4-Layer Deduplication Check:
    1. Exact Fingerprint Match -> Existing Job
    2. Canonical URL Match -> Existing Job
    3. Title & Company Match -> Potential Duplicate Candidate Pair
    4. Unique New Listing -> Insert New Job
    """
    # Layer 1: Fingerprint hash check
    existing_fp = db.query(Job).filter(Job.fingerprint == fingerprint).first()
    if existing_fp:
        return existing_fp, "exact_fingerprint"

    # Layer 2: Apply URL match
    existing_url = db.query(Job).filter(Job.apply_url == apply_url).first()
    if existing_url:
        return existing_url, "canonical_url"

    # Layer 3: Title + Company similarity check
    existing_similar = db.query(Job).filter(
        Job.company_id == company_id,
        Job.title.ilike(f"%{title}%")
    ).first()
    if existing_similar:
        return existing_similar, "possible_duplicate_pair"

    return None, "new_listing"
