import json
import urllib.request
from typing import List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.connectors.base import RawJob, SourceHealth


class AshbyConnector:
    """Connector for companies hosting careers on Ashby HQ (Linear, Ramp, Cursor, Perplexity, etc.)."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def fetch_jobs(self, source_id: str, company_slug: str, since: Optional[datetime] = None, **kwargs) -> List[RawJob]:
        """Fetch live job postings from Ashby Job Board API."""
        url = f"https://api.ashbyhq.com/posting-api/job-board/{company_slug}"
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
            print(f"[AshbyConnector] Error fetching {company_slug}: {e}")
            return []

        raw_jobs: List[RawJob] = []
        jobs_list = payload.get("jobs", [])

        for item in jobs_list:
            title = (item.get("title") or "").strip()
            loc_name = (item.get("location") or "Bengaluru, Karnataka").strip()
            apply_url = item.get("jobUrl") or item.get("applyUrl") or ""
            external_id = str(item.get("id") or "")
            
            # Clean HTML description to plain text
            html_content = item.get("descriptionHtml") or item.get("description") or ""
            if html_content:
                soup = BeautifulSoup(html_content, "html.parser")
                clean_desc = soup.get_text(separator="\n").strip()
            else:
                clean_desc = f"{title} at {company_slug.capitalize()}. Located in {loc_name}."

            published_at_str = item.get("publishedAt")
            posted_dt = None
            if published_at_str:
                try:
                    posted_dt = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
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
                    posted_at=posted_dt or datetime.utcnow(),
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def health_check(self, company_slug: str) -> SourceHealth:
        url = f"https://api.ashbyhq.com/posting-api/job-board/{company_slug}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "JobNexaAI/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return SourceHealth(is_healthy=(resp.status == 200), status_code=resp.status)
        except Exception as e:
            return SourceHealth(is_healthy=False, status_code=500, error_message=str(e))
