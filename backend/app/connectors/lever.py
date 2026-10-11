import json
import urllib.request
from typing import List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.connectors.base import RawJob, SourceHealth


class LeverConnector:
    """Real ATS connector for companies hosting careers on Lever."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def fetch_jobs(self, source_id: str, company_slug: str, since: Optional[datetime] = None) -> List[RawJob]:
        """Fetch live job postings from Lever API."""
        url = f"https://api.lever.co/v0/postings/{company_slug}?mode=json"
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
            print(f"[LeverConnector] Error fetching {company_slug}: {e}")
            return []

        raw_jobs: List[RawJob] = []
        if not isinstance(payload, list):
            return []

        for item in payload:
            title = (item.get("text") or "").strip()
            cats = item.get("categories") or {}
            loc_name = (cats.get("location") or "Bengaluru, Karnataka").strip()
            apply_url = item.get("hostedUrl") or item.get("applyUrl") or ""
            external_id = str(item.get("id") or "")
            
            # Plain text description
            desc_plain = item.get("descriptionPlain") or ""
            if not desc_plain:
                desc_html = item.get("description") or ""
                if desc_html:
                    soup = BeautifulSoup(desc_html, "html.parser")
                    desc_plain = soup.get_text(separator="\n").strip()
                else:
                    desc_plain = f"{title} at {company_slug.capitalize()}. Located in {loc_name}."

            created_at_ms = item.get("createdAt")
            posted_dt = None
            if created_at_ms:
                try:
                    posted_dt = datetime.utcfromtimestamp(created_at_ms / 1000.0)
                except Exception:
                    posted_dt = datetime.utcnow()

            raw_jobs.append(
                RawJob(
                    source_id=source_id,
                    external_id=external_id,
                    title=title,
                    company=company_slug,
                    location=loc_name,
                    description=desc_plain,
                    apply_url=apply_url,
                    source_url=url,
                    posted_at=posted_dt,
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def health_check(self, company_slug: str) -> SourceHealth:
        url = f"https://api.lever.co/v0/postings/{company_slug}?mode=json"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "JobNexaAI/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return SourceHealth(is_healthy=(resp.status == 200), status_code=resp.status)
        except Exception as e:
            return SourceHealth(is_healthy=False, status_code=500, error_message=str(e))
