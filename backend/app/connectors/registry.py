from typing import Dict, Any
from app.connectors.greenhouse import GreenhouseConnector
from app.connectors.lever import LeverConnector

CONNECTORS: Dict[str, Any] = {
    "greenhouse_api": GreenhouseConnector(),
    "lever_api": LeverConnector(),
}


def get_connector(connector_key: str):
    return CONNECTORS.get(connector_key)
