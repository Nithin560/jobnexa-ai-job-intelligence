from typing import Dict, Any
from app.connectors.greenhouse import GreenhouseConnector
from app.connectors.lever import LeverConnector
from app.connectors.job_portal import JobPortalConnector
from app.connectors.ashby import AshbyConnector
from app.connectors.smartrecruiters import SmartRecruitersConnector

CONNECTORS: Dict[str, Any] = {
    "greenhouse_api": GreenhouseConnector(),
    "lever_api": LeverConnector(),
    "job_portal_api": JobPortalConnector(),
    "ashby_api": AshbyConnector(),
    "smartrecruiters_api": SmartRecruitersConnector(),
}


def get_connector(connector_key: str):
    return CONNECTORS.get(connector_key)
