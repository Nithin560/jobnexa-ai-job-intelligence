import re
from typing import List, Dict, Tuple


# Bengaluru Location Aliases
LOCATION_ALIASES = {
    "bangalore": "Bengaluru, Karnataka",
    "bengaluru": "Bengaluru, Karnataka",
    "blr": "Bengaluru, Karnataka",
    "bangalore urban": "Bengaluru, Karnataka",
    "koramangala": "Bengaluru, Karnataka",
    "indiranagar": "Bengaluru, Karnataka",
    "whitefield": "Bengaluru, Karnataka",
    "electronic city": "Bengaluru, Karnataka",
    "hsr layout": "Bengaluru, Karnataka"
}

# Standardized Skill Alias Dictionary
SKILL_DICTIONARY = {
    "python": "Python",
    "py": "Python",
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "aws": "AWS",
    "amazon web services": "AWS",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "react": "React",
    "reactjs": "React",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "fastapi": "FastAPI",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "node": "Node.js",
    "nodejs": "Node.js",
    "spark": "Spark",
    "pyspark": "Spark",
    "system design": "System Design",
    "microservices": "Microservices"
}


def normalize_location(location_str: str) -> str:
    """Normalize location variants (Bangalore, BLR, Koramangala) to 'Bengaluru, Karnataka'."""
    if not location_str:
        return "Bengaluru, Karnataka"
    
    loc_lower = location_str.lower()
    for alias, canonical in LOCATION_ALIASES.items():
        if alias in loc_lower:
            return canonical
            
    return location_str.strip()


def extract_skills_from_text(text: str) -> List[Tuple[str, float]]:
    """Rule-based phrase matching for skill extraction returning (skill_name, confidence)."""
    if not text:
        return []
        
    extracted = {}
    text_lower = text.lower()

    for term, canonical in SKILL_DICTIONARY.items():
        pattern = r'\b' + re.escape(term) + r'\b'
        if re.search(pattern, text_lower):
            extracted[canonical] = 1.0

    return [(name, conf) for name, conf in extracted.items()]


def parse_experience_range(text: str) -> Tuple[int, int]:
    """Parse years of experience from description text (e.g. '2-5 years' -> (2, 5))."""
    match = re.search(r'(\d+)\s*[-to]*\s*(\d+)\s*years?', text, re.IGNORECASE)
    if match:
        return int(match.group(1)), int(match.group(2))
        
    single_match = re.search(r'(\d+)\+?\s*years?', text, re.IGNORECASE)
    if single_match:
        val = int(single_match.group(1))
        return val, val + 3
        
    return 0, 5


def extract_hiring_role(title: str) -> str:
    """Standardize and extract canonical hiring role from job title."""
    if not title:
        return "Software Engineer"
    
    t_lower = title.lower()

    if any(k in t_lower for k in ["mlops", "machine learning", "deep learning", "ai ", "artificial intelligence", "llm", "genai", "computer vision", "nlp"]):
        return "AI / ML Engineer"
    if any(k in t_lower for k in ["data engineer", "etl", "big data", "data platform"]):
        return "Data Engineer"
    if any(k in t_lower for k in ["data scientist"]):
        return "Data Scientist"
    if any(k in t_lower for k in ["data analyst", "business analyst", "bi analyst", "analytics"]):
        return "Data Analyst"
    if any(k in t_lower for k in ["product manager", "product lead", "group product manager"]):
        return "Product Manager"
    if any(k in t_lower for k in ["full stack", "fullstack", "full-stack"]):
        return "Full Stack Engineer"
    if any(k in t_lower for k in ["backend", "back-end", "back end", "server-side"]):
        return "Backend Engineer"
    if any(k in t_lower for k in ["frontend", "front-end", "front end", "ui/ux engineer", "web developer"]):
        return "Frontend Engineer"
    if any(k in t_lower for k in ["devops", "sre", "site reliability", "cloud engineer", "infrastructure engineer", "platform engineer"]):
        return "DevOps / SRE"
    if any(k in t_lower for k in ["android", "ios", "mobile", "flutter", "react native"]):
        return "Mobile Engineer"
    if any(k in t_lower for k in ["qa", "sdet", "test engineer", "quality assurance", "automation engineer"]):
        return "QA / SDET"
    if any(k in t_lower for k in ["security", "cyber", "infosec", "soc analyst"]):
        return "Security Engineer"
    if any(k in t_lower for k in ["engineering manager", "technical lead", "tech lead", "lead engineer"]):
        return "Engineering Manager"
    if any(k in t_lower for k in ["architect", "system architect"]):
        return "Solutions Architect"
    
    # Generic fallback based on engineer / developer / software
    if any(k in t_lower for k in ["software", "developer", "engineer", "sde"]):
        return "Software Engineer"
        
    cleaned = re.sub(r'\(.*?\)', '', title)
    cleaned = re.sub(r'\b(senior|junior|lead|staff|principal|associate|intern|sr\.|jr\.)\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip(" -–,|/")
    return cleaned if len(cleaned) > 2 else "Software Engineer"


def calculate_salary_range(experience_min: int, experience_max: int, company_type: str = "Mid-size") -> Tuple[float, float, str]:
    """Calculate realistic Bengaluru tech market salary range in LPA based on experience and company tier."""
    avg_exp = (experience_min + experience_max) / 2.0 if experience_max > 0 else float(experience_min)
    
    if avg_exp <= 1:
        base_min, base_max = 8.0, 15.0
    elif avg_exp <= 3:
        base_min, base_max = 14.0, 24.0
    elif avg_exp <= 5:
        base_min, base_max = 20.0, 36.0
    elif avg_exp <= 8:
        base_min, base_max = 30.0, 52.0
    else:
        base_min, base_max = 45.0, 80.0

    multiplier = 1.0
    c_lower = (company_type or "").lower()
    if "startup" in c_lower:
        multiplier = 1.15
    elif any(k in c_lower for k in ["large", "enterprise", "faang", "mnc"]):
        multiplier = 1.25

    final_min = round(base_min * multiplier)
    final_max = round(base_max * multiplier)
    label = f"₹{int(final_min)} - {int(final_max)} LPA"
    return float(final_min), float(final_max), label

