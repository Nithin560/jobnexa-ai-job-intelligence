"""
Utility for mapping companies to official canonical domains and resilient logo URLs.
Provides high-res Google 128px favicons and infallible branded avatar fallbacks.
"""

import urllib.parse
from typing import Optional

# Comprehensive canonical domain mapping for all target employers and aggregators
COMPANY_DOMAIN_MAP = {
    # Direct Career ATS companies
    "razorpay": "razorpay.com",
    "meesho": "meesho.com",
    "cred": "cred.club",
    "groww": "groww.in",
    "inmobi": "inmobi.com",
    "stripe": "stripe.com",
    "okta": "okta.com",
    "gitlab": "gitlab.com",
    "twilio": "twilio.com",
    "mongodb": "mongodb.com",
    "elastic": "elastic.co",
    "airbnb": "airbnb.com",
    "thoughtworks": "thoughtworks.com",
    "zeta": "zeta.tech",
    "rubrik": "rubrik.com",
    "google": "google.com",
    "microsoft": "microsoft.com",
    "flipkart": "flipkart.com",
    "phonepe": "phonepe.com",
    "swiggy": "swiggy.com",
    "zepto": "zepto.com",
    "zeptonow": "zeptonow.com",
    
    # Aggregators and Partner Portals
    "arbeitnow": "arbeitnow.com",
    "jobicy": "jobicy.com",

    # Hiring employers discovered via aggregators
    "spotify": "spotify.com",
    "datadog": "datadoghq.com",
    "qualtrics": "qualtrics.com",
    "vercel": "vercel.com",
    "harness": "harness.io",
    "grafana labs": "grafana.com",
    "grafanalabs": "grafana.com",
    "elevenlabs": "elevenlabs.io",
    "deliveroo": "deliveroo.co.uk",
    "camunda": "camunda.com",
    "mozilla": "mozilla.org",
    "cognite": "cognite.com",
    "cordance": "cordance.co",
    "datavant": "datavant.com",
    "distribusion technologies": "distribusion.com",
    "double": "withdouble.com",
    "dr. ansay ltd.": "dransay.com",
    "duck duck go": "duckduckgo.com",
    "duckduckgo": "duckduckgo.com",
    "echodyne": "echodyne.com",
    "fieldguide": "fieldguide.io",
    "happyrobot.ai": "happyrobot.ai",
    "instrument": "instrument.com",
    "language services associates": "lsaweb.com",
    "netbox labs": "netboxlabs.com",
    "proof": "proof.com",
    "roboflow": "roboflow.com",
    "samsara": "samsara.com",
    "walkme": "walkme.com",
    "who gives a crap": "whogivesacrap.org",
    "xebiadach": "xebia.com",
    "capco": "capco.com",
    "parloa": "parloa.com",
    "veeamsoftware": "veeam.com",
    "alma": "helloalma.com",
    "angi": "angi.com",
    "angeheuert gmbh": "angeheuert.com",
    "bridgebio": "bridgebio.com",
}


def get_canonical_domain(company_name: Optional[str], existing_domain: Optional[str] = None) -> Optional[str]:
    """Resolve the best canonical domain for a company."""
    if existing_domain and existing_domain.strip() and existing_domain.strip().lower() != "none":
        return existing_domain.strip().lower()
    
    clean_name = (company_name or "").strip().lower()
    if clean_name in COMPANY_DOMAIN_MAP:
        return COMPANY_DOMAIN_MAP[clean_name]

    # Partial match
    for k, v in COMPANY_DOMAIN_MAP.items():
        if k in clean_name or clean_name in k:
            return v
    return None


def get_company_logo(company_name: Optional[str] = None, logo_url: Optional[str] = None, canonical_domain: Optional[str] = None) -> str:
    """
    Return a reliable, crisp logo URL for the company.
    Replaces broken Clearbit URLs and generic avatar placeholders with high-resolution Google 128px Favicons,
    falling back to a clean branded UI-Avatar if no domain is available.
    """
    domain = get_canonical_domain(company_name, canonical_domain)
    if domain:
        return f"https://www.google.com/s2/favicons?domain={domain}&sz=128"

    # If a custom logo URL is present and not clearbit, keep it
    if logo_url and "logo.clearbit.com" not in logo_url and logo_url.strip():
        return logo_url.strip()

    # Fallback to UI-Avatars with initials
    name_display = (company_name or "Company").strip()
    encoded_name = urllib.parse.quote_plus(name_display)
    return f"https://ui-avatars.com/api/?name={encoded_name}&background=2563eb&color=fff&size=128&bold=true"
