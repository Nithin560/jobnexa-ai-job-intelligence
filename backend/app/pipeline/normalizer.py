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
