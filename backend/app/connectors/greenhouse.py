import json
import re
import urllib.request
from typing import List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.connectors.base import RawJob, SourceHealth


class GreenhouseConnector:
    """Real ATS connector for companies hosting careers on Greenhouse."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def fetch_jobs(self, source_id: str, company_slug: str, since: Optional[datetime] = None, **kwargs) -> List[RawJob]:
        """Fetch live job postings from Greenhouse Board API."""
        url = f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs?content=true"
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
            print(f"[GreenhouseConnector] Error fetching {company_slug}: {e}")
            return []

        raw_jobs: List[RawJob] = []
        jobs_list = payload.get("jobs", [])

        for item in jobs_list:
            title = (item.get("title") or "").strip()
            loc_dict = item.get("location") or {}
            loc_name = (loc_dict.get("name") or "Bengaluru, Karnataka").strip()
            apply_url = item.get("absolute_url") or ""
            external_id = str(item.get("id") or "")
            
            # Clean HTML description to plain text
            html_content = item.get("content") or ""
            if html_content:
                soup = BeautifulSoup(html_content, "html.parser")
                clean_desc = soup.get_text(separator="\n").strip()
            else:
                clean_desc = f"{title} at {company_slug.capitalize()}. Located in {loc_name}."

            # Parse posted_at if present
            updated_at_str = item.get("updated_at")
            posted_dt = None
            if updated_at_str:
                try:
                    posted_dt = datetime.fromisoformat(updated_at_str.replace("Z", "+00:00"))
                except Exception:
                    posted_dt = datetime.utcnow()

            raw_jobs.append(
                RawJob(
                    source_id=source_id,
                    external_id=external_id,
                    title=title,
                    company=company_slug,
                    location=loc_name,
                    description=clean_desc,
                    apply_url=apply_url,
                    source_url=url,
                    posted_at=posted_dt,
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def health_check(self, company_slug: str) -> SourceHealth:
        url = f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "JobNexaAI/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return SourceHealth(is_healthy=(resp.status == 200), status_code=resp.status)
        except Exception as e:
            return SourceHealth(is_healthy=False, status_code=500, error_message=str(e))
