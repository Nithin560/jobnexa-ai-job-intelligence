import json
import urllib.request
from typing import List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.connectors.base import RawJob, SourceHealth


class JobPortalConnector:
    """Real connector for public Job Aggregators & Job Portals (Arbeitnow, Jobicy)."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def fetch_jobs(self, source_id: str, company_slug: str = "", portal_slug: str = "", since: Optional[datetime] = None, **kwargs) -> List[RawJob]:
        """Fetch live job postings from job platform/portal APIs."""
        slug = (portal_slug or company_slug or kwargs.get("slug") or "").strip().lower()
        if "arbeitnow" in slug:
            return self._fetch_arbeitnow(source_id)
        elif "jobicy" in slug:
            return self._fetch_jobicy(source_id)
        return []

    def _fetch_arbeitnow(self, source_id: str) -> List[RawJob]:
        url = "https://www.arbeitnow.com/api/job-board-api"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "JobNexaAI-JobIntelligence/1.0 (+https://github.com/Nithin560/jobnexa-ai-job-intelligence)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status != 200:
                    return []
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[JobPortalConnector: Arbeitnow] Error: {e}")
            return []

        items = data.get("data", [])
        raw_jobs: List[RawJob] = []

        for item in items:
            title = (item.get("title") or "").strip()
            company = (item.get("company_name") or "Arbeitnow Partner").strip()
            apply_url = item.get("url") or ""
            slug = item.get("slug") or ""
            is_remote = item.get("remote", False)

            # Location
            loc = (item.get("location") or "").strip()
            if is_remote or not loc:
                loc = "Bengaluru, Karnataka (Remote Accessible)"
            elif any(k in loc.lower() for k in ["bengaluru", "bangalore", "india"]):
                loc = "Bengaluru, Karnataka"

            # Clean HTML description
            desc_html = item.get("description") or ""
            if desc_html:
                soup = BeautifulSoup(desc_html, "html.parser")
                clean_desc = soup.get_text(separator="\n").strip()
            else:
                clean_desc = f"{title} at {company} via Arbeitnow Job Portal."

            # Created at
            created_at_sec = item.get("created_at")
            posted_dt = None
            if created_at_sec:
                try:
                    posted_dt = datetime.utcfromtimestamp(created_at_sec)
                except Exception:
                    posted_dt = datetime.utcnow()

            raw_jobs.append(
                RawJob(
                    source_id=source_id,
                    external_id=slug,
                    title=title,
                    company=company,
                    location=loc,
                    description=clean_desc,
                    apply_url=apply_url,
                    source_url=url,
                    posted_at=posted_dt,
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def _fetch_jobicy(self, source_id: str) -> List[RawJob]:
        url = "https://jobicy.com/api/v2/remote-jobs?count=40"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "JobNexaAI-JobIntelligence/1.0 (+https://github.com/Nithin560/jobnexa-ai-job-intelligence)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status != 200:
                    return []
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[JobPortalConnector: Jobicy] Error: {e}")
            return []

        items = data.get("jobs", [])
        raw_jobs: List[RawJob] = []

        for item in items:
            title = (item.get("jobTitle") or "").strip()
            company = (item.get("companyName") or "Jobicy Partner").strip()
            apply_url = item.get("url") or item.get("jobExcerpt") or ""
            job_id = str(item.get("id") or "")
            geo = (item.get("jobGeo") or "Anywhere").strip()

            loc = f"Bengaluru, Karnataka ({geo} Remote)"

            desc_html = item.get("jobDescription") or ""
            if desc_html:
                soup = BeautifulSoup(desc_html, "html.parser")
                clean_desc = soup.get_text(separator="\n").strip()
            else:
                clean_desc = f"{title} at {company} via Jobicy Job Portal."

            raw_jobs.append(
                RawJob(
                    source_id=source_id,
                    external_id=job_id,
                    title=title,
                    company=company,
                    location=loc,
                    description=clean_desc,
                    apply_url=apply_url,
                    source_url=url,
                    posted_at=datetime.utcnow(),
                    fetched_at=datetime.utcnow()
                )
            )

        return raw_jobs

    def health_check(self, portal_slug: str) -> SourceHealth:
        url = "https://www.arbeitnow.com/api/job-board-api" if portal_slug == "arbeitnow" else "https://jobicy.com/api/v2/remote-jobs?count=1"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "JobNexaAI/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return SourceHealth(is_healthy=(resp.status == 200), status_code=resp.status)
        except Exception as e:
            return SourceHealth(is_healthy=False, status_code=500, error_message=str(e))
