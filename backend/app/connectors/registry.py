from typing import Dict, Any
from app.connectors.greenhouse import GreenhouseConnector
from app.connectors.lever import LeverConnector
from app.connectors.job_portal import JobPortalConnector

CONNECTORS: Dict[str, Any] = {
    "greenhouse_api": GreenhouseConnector(),
    "lever_api": LeverConnector(),
    "job_portal_api": JobPortalConnector(),
}


def get_connector(connector_key: str):
    return CONNECTORS.get(connector_key)
