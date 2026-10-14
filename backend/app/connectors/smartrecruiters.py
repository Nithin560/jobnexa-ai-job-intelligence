import json
import urllib.request
from typing import List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.connectors.base import RawJob, SourceHealth


class SmartRecruitersConnector:
    """Connector for companies hosting careers on SmartRecruiters (Bosch, etc.)."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def fetch_jobs(self, source_id: str, company_slug: str, since: Optional[datetime] = None, **kwargs) -> List[RawJob]:
        """Fetch live job postings from SmartRecruiters Public API."""
        url = f"https://api.smartrecruiters.com/v1/companies/{company_slug}/postings?limit=100"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "JobNexaAI-JobIntelligence/1.0 (+https://github.com/Nithin560/jobnexa-ai-job-intelligence)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status != 200:
                    return []
                payload = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            print(f"[SmartRecruitersConnector] Error fetching {company_slug}: {e}")
            return []

        raw_jobs: List[RawJob] = []
        jobs_list = payload.get("content", [])

        for item in jobs_list:
            title = (item.get("name") or "").strip()
            loc_dict = item.get("location") or {}
            city = loc_dict.get("city") or "Bengaluru"
            country = loc_dict.get("country") or "India"
            loc_name = f"{city}, {country}" if city else "Bengaluru, Karnataka"
            
            # Apply URL directly to the job on SmartRecruiters
            job_id = str(item.get("id") or "")
            apply_url = f"https://jobs.smartrecruiters.com/{company_slug}/{job_id}"
            
            # Company name
            company_obj = item.get("company") or {}
            comp_name = company_obj.get("name") or company_slug.capitalize()

            released_date_str = item.get("releasedDate")
            posted_dt = None
            if released_date_str:
                try:
                    posted_dt = datetime.fromisoformat(released_date_str.replace("Z", "+00:00"))
                except Exception:
                    posted_dt = datetime.utcnow()

            clean_desc = f"{title} at {comp_name}. Located in {loc_name}. Apply directly through official employer career portal."

            raw_jobs.append(
                RawJob(
                    source_id=source_id,
                    external_id=job_id,
                    title=title,
                    company=comp_name,
                    location=loc_name,
                    description=clean_desc,
                    apply_url=apply_url,
                    source_url=url,
                    posted_at=posted_dt or datetime.utcnow(),
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def health_check(self, company_slug: str) -> SourceHealth:
        url = f"https://api.smartrecruiters.com/v1/companies/{company_slug}/postings?limit=1"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "JobNexaAI/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return SourceHealth(is_healthy=(resp.status == 200), status_code=resp.status)
        except Exception as e:
            return SourceHealth(is_healthy=False, status_code=500, error_message=str(e))
