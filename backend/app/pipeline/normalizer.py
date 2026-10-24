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


def parse_job_location_and_region(raw_location: str, title: str = "", description: str = "", company_name: str = "") -> Tuple[str, str]:
    """
    Carefully inspect raw location, title, and JD text to extract genuine location and region.
    Returns: (display_location, region_category)
      - region_category in: 'bengaluru', 'india', 'united_states', 'worldwide', 'international'
    """
    raw_loc = (raw_location or "").strip()
    raw_lower = raw_loc.lower()
    t_lower = (title or "").lower()
    d_snippet = (description or "")[:2500].lower()
    comp_lower = (company_name or "").lower()

    # 1. Check United States indicators in raw location, title, or JD
    us_cities = [
        'chicago', 'denver', 'boston', 'san francisco', 'new york', 'austin', 'seattle',
        'los angeles', 'atlanta', 'dallas', 'houston', 'miami', 'phoenix', 'philadelphia',
        'san jose', 'san diego', 'kansas', 'missouri', 'california', 'texas', 'colorado',
        'illinois', 'massachusetts', 'washington dc', 'washington'
    ]
    us_keywords = [
        'usa', 'united states', 'u.s.', 'us remote', 'remote - us', 'remote us', 'us only',
        'north america', 'americas', 'us/canada', 'canada, usa', 'europe, usa'
    ]

    # 1. Check Bengaluru Tech Hubs & Neighborhoods FIRST
    blr_hubs = [
        ('koramangala', 'Koramangala, Bengaluru'),
        ('hsr layout', 'HSR Layout, Bengaluru'),
        ('hsr', 'HSR Layout, Bengaluru'),
        ('whitefield', 'Whitefield, Bengaluru'),
        ('electronic city', 'Electronic City, Bengaluru'),
        ('electonic city', 'Electronic City, Bengaluru'),
        ('bellandur', 'Bellandur, Bengaluru'),
        ('indiranagar', 'Indiranagar, Bengaluru'),
        ('manyata', 'Manyata Tech Park, Bengaluru'),
        ('outer ring road', 'Outer Ring Road (ORR), Bengaluru'),
        ('orr', 'Outer Ring Road (ORR), Bengaluru'),
        ('bagmane', 'Bagmane Tech Park, Bengaluru'),
        ('domlur', 'Domlur (EGL), Bengaluru'),
        ('egl', 'Embassy GolfLinks, Bengaluru'),
        ('marathahalli', 'Marathahalli, Bengaluru'),
        ('sarjapur', 'Sarjapur Road, Bengaluru'),
        ('hebbal', 'Hebbal, Bengaluru'),
        ('jayanagar', 'Jayanagar, Bengaluru'),
        ('jp nagar', 'JP Nagar, Bengaluru'),
        ('btm', 'BTM Layout, Bengaluru'),
        ('mysuru', 'Mysuru, Karnataka'),
        ('mysore', 'Mysuru, Karnataka'),
        ('hubli', 'Hubli, Karnataka'),
        ('hubballi', 'Hubli, Karnataka'),
        ('mangalore', 'Mangalore, Karnataka'),
        ('mangaluru', 'Mangalore, Karnataka')
    ]

    for hub_key, hub_display in blr_hubs:
        pattern = r'\b' + re.escape(hub_key) + r'\b'
        if re.search(pattern, raw_lower) or re.search(pattern, t_lower):
            return hub_display, "bengaluru"

    # General Bengaluru / Bangalore / Karnataka indicators
    blr_general = ['bangalore', 'bengaluru', 'blr', 'karnataka']
    if any(re.search(r'\b' + re.escape(a) + r'\b', raw_lower) or re.search(r'\b' + re.escape(a) + r'\b', t_lower) for a in blr_general):
        if 'remote' in raw_lower or 'remote' in t_lower:
            return "Bengaluru, Karnataka (Remote)", "bengaluru"
        return "Bengaluru, Karnataka", "bengaluru"

    # Bengaluru-headquartered companies hiring in India / Remote
    blr_companies = [
        'razorpay', 'meesho', 'cred', 'groww', 'inmobi', 'zeta', 'thoughtworks', 
        'clear', 'cleartax', 'slice', 'porter', 'hackerrank', 'swiggy', 'flipkart', 
        'ather', 'atherenergy', 'postman', 'browserstack', 'zepto', 'phonepe'
    ]
    if any(bc in comp_lower for bc in blr_companies):
        if any(k in raw_lower or k in t_lower for k in ['india', 'remote', 'flexible', 'hybrid', 'work from anywhere']) or not raw_loc:
            # Exclude other explicit Indian metros
            if not any(k in raw_lower for k in ['mumbai', 'delhi', 'gurgaon', 'noida', 'hyderabad', 'pune', 'chennai', 'kolkata']):
                return "Bengaluru, Karnataka (HQ)", "bengaluru"

    # Non-Karnataka locations
    for city in us_cities:
        if city in raw_lower or city in t_lower:
            return f"{city.title()}, United States", "non_karnataka"

    if any(re.search(r'\b' + re.escape(k) + r'\b', raw_lower) for k in ['usa', 'united states', 'u.s.']):
        return "United States", "non_karnataka"

    if any(k in raw_lower for k in ['europe', 'germany', 'berlin', 'uk', 'united kingdom', 'london', 'canada', 'australia']):
        return "International", "non_karnataka"

    return raw_loc if raw_loc else "Bengaluru, Karnataka", "bengaluru"


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


def parse_experience_range(text: str, title: str = "") -> Tuple[int, int]:
    """
    Carefully parse years of experience from description text (JD) and job title.
    Accurately captures patterns like:
      - '• 8+ years writing highly performant frontend code' (user example)
      - '3-5 years', '2 to 4 years', 'minimum 5 years'
      - Entry level / fresher / intern (with strict boundary checks)
    """
    desc = text or ""
    t_clean = (title or "").strip()
    t_lower = t_clean.lower()
    d_lower = desc.lower()

    # Check for senior / executive roles in title
    is_senior_title = any(re.search(r'\b' + re.escape(k) + r'\b', t_lower) for k in [
        'senior', 'sr.', 'sr', 'lead', 'staff', 'principal', 'director', 'vp', 'head', 'architect', 'manager'
    ])

    # Check for genuine fresher in title
    is_fresher_title = any(re.search(r'\b' + re.escape(k) + r'\b', t_lower) for k in [
        'intern', 'internship', 'fresher', 'trainee', 'graduate trainee', 'campus', 'entry level', 'entry-level'
    ])

    # 1. Look for explicit bullet point or requirement statements:
    # Pattern A: '8+ years', '5+ years' (e.g. '• 8+ years writing highly performant frontend code')
    plus_matches = re.findall(r'(?:•|\*|-|\b)\s*(\d+)\+\s*years?', desc, re.IGNORECASE)
    
    # Pattern B: '2-5 years', '3 to 6 years', '2 - 4 years'
    range_matches = re.findall(r'\b(\d+)\s*(?:[-to–]+)\s*(\d+)\s*years?', desc, re.IGNORECASE)

    # Pattern C: 'minimum 5 years', 'at least 3 years', 'minimum of 8 years'
    min_matches = re.findall(r'(?:minimum|at least|minimum of)\s*(\d+)\s*years?', desc, re.IGNORECASE)

    # Pattern D: '5 years of experience', '8 years experience'
    exp_matches = re.findall(r'\b(\d+)\s*years?(?:\s+of)?(?:\s+(?:relevant|hands-on|professional|industry|software|engineering|coding|frontend|backend|full[- ]stack|product|design|work))?\s*(?:experience|writing|building|developing|working)', desc, re.IGNORECASE)

    candidates = []
    for p in plus_matches:
        v = int(p)
        if 0 <= v <= 20:
            candidates.append((v, v + 3))

    for r1, r2 in range_matches:
        v1, v2 = int(r1), int(r2)
        if 0 <= v1 <= 20 and v2 >= v1 and v2 <= 30:
            candidates.append((v1, v2))

    for m in min_matches:
        v = int(m)
        if 0 <= v <= 20:
            candidates.append((v, v + 3))

    for e in exp_matches:
        v = int(e)
        if 0 <= v <= 20:
            candidates.append((v, v + 2))

    # If we found explicit experience numbers from the JD:
    if candidates:
        valid_candidates = [c for c in candidates if c[0] <= 15]
        if valid_candidates:
            if is_senior_title:
                senior_cands = [c for c in valid_candidates if c[0] >= 4]
                if senior_cands:
                    return max(senior_cands, key=lambda x: x[0])
            best = valid_candidates[0]
            if is_fresher_title and best[0] <= 1:
                return 0, 1
            if best[0] >= 2 and is_fresher_title:
                return 0, 1
            return best

    # If title says intern / fresher and not senior
    if is_fresher_title and not is_senior_title:
        return 0, 1

    # Check for genuine fresher in JD body with strict word boundaries (no substring match like 'internal')
    has_fresher_phrase = any(re.search(r'\b' + re.escape(k) + r'\b', d_lower) for k in [
        'fresher', 'freshers', 'entry level', 'entry-level', 'graduate engineer trainee', 
        '0-1 years', '0 - 1 years', 'no experience required', 'recent graduates welcome'
    ])
    if has_fresher_phrase and not is_senior_title:
        return 0, 1

    # If title indicates Senior / Lead / Architect / Manager
    if is_senior_title:
        if any(k in t_lower for k in ['director', 'vp', 'head', 'principal', 'staff']):
            return 8, 12
        return 5, 8

    # Default mid-level
    return 2, 5


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
    if any(k in t_lower for k in ["embedded", "firmware", "vlsi", "hardware"]):
        return "Embedded / Hardware Engineer"
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


def is_it_engineering_job(title: str, description: str = "") -> Tuple[bool, str]:
    """
    JobNexa Blueprint Section 2: Strict IT & Software Engineering Ingestion Filter.
    Strictly excludes non-IT and non-engineering role families:
      - Marketing, Growth, Brand, SEO, Content, Social Media, PR
      - Finance, FP&A, Accounting, Audit, Tax, Treasury, Billing
      - Sales, BD, Account Executives, Commercial Sales, Inside Sales, Telecaller, BPO
      - Non-coding Design (UX Design, UI Design, Product Design, Visual/Graphic Designer, Illustrator)
      - HR, Talent Acquisition, People Operations, Recruiter
      - Legal, Compliance, Facilities, Admin, Customer Support (Non-tech)
    
    Returns (is_it, reason)
    """
    t_lower = (title or "").lower().strip()

    # Core engineering titles (developer, engineer, programmer, etc.)
    core_eng_patterns = [
        r"\bsoftware engineer\b", r"\bbackend engineer\b", r"\bfrontend engineer\b", r"\bfull stack engineer\b",
        r"\bfullstack engineer\b", r"\bdata engineer\b", r"\bmachine learning engineer\b", r"\bml engineer\b",
        r"\bdevops engineer\b", r"\bsre\b", r"\bsite reliability engineer\b", r"\bqa engineer\b", r"\bsdet\b",
        r"\bsecurity engineer\b", r"\bcloud engineer\b", r"\bplatform engineer\b", r"\bsystems engineer\b",
        r"\bfirmware engineer\b", r"\bembedded engineer\b", r"\bengineering manager\b", r"\btech lead\b",
        r"\btechnical lead\b", r"\bsoftware developer\b", r"\bdeveloper\b", r"\bprogrammer\b"
    ]
    has_core_eng = any(re.search(pat, t_lower) for pat in core_eng_patterns)

    # 1. Non-IT Role Exclusions (checked with word boundaries)
    non_it_patterns = [
        # Marketing & Growth
        r"\bmarketing\b", r"\bmarket research\b", r"\bgrowth marketing\b", r"\bcontent marketing\b", r"\bsocial media\b",
        r"\bcopywriter\b", r"\bseo\b", r"\bsem\b", r"\bbrand marketing\b", r"\bbrand manager\b", r"\bpublic relations\b",
        r"\bcommunications specialist\b", r"\bcommunications manager\b", r"\bcommunity manager\b", r"\bevent manager\b",
        
        # Finance, FP&A, Accounting & Audit
        r"\bfp&a\b", r"\bfp & a\b", r"\bfinancial planning\b", r"\bfinance\b", r"\bfinancial analyst\b",
        r"\baccountant\b", r"\baccounting\b", r"\baccounts payable\b", r"\baccounts receivable\b",
        r"\btax\b", r"\btaxation\b", r"\bauditor\b", r"\baudit\b", r"\btreasury\b", r"\bpayroll\b",
        
        # Sales, Account Management, BD
        r"\bsales\b", r"\bbusiness development\b", r"\baccount executive\b", r"\baccount management\b",
        r"\baccount manager\b", r"\binside sales\b", r"\bcommercial sales\b", r"\brevenue operations\b",
        r"\bsponsorship\b", r"\btelecaller\b", r"\blead generation\b", r"\bbpo\b",
        
        # HR, Talent Acquisition & Recruiting
        r"\bhuman resources\b", r"\bhr\b", r"\bhrbp\b", r"\brecruiter\b", r"\brecruiting\b",
        r"\btalent acquisition\b", r"\bpeople operations\b", r"\bpeople partner\b", r"\bpeople team\b",
        
        # Non-coding Design (Designers, UX Design, Product Design)
        r"\bux design\b", r"\bui design\b", r"\bui/ux design\b", r"\bproduct design\b", r"\bgraphic design\b",
        r"\bvisual design\b", r"\bmotion design\b", r"\bbrand designer\b", r"\bux designer\b", r"\bui designer\b",
        r"\bproduct designer\b", r"\bvisual designer\b", r"\bmotion designer\b", r"\bux researcher\b", r"\billustrator\b",
        
        # Legal & Corporate Administration
        r"\blegal\b", r"\battorney\b", r"\bcounsel\b", r"\bparalegal\b", r"\bcompliance\b",
        r"\boffice manager\b", r"\breceptionist\b", r"\bfacilities\b", r"\badmin executive\b", r"\bcorporate secretary\b",
        
        # Non-tech customer support & operations
        r"\bcustomer support\b", r"\bcustomer success\b", r"\bcustomer care\b", r"\bwarehouse\b",
        r"\blogistics\b", r"\bprocurement\b"
    ]

    for pat in non_it_patterns:
        if re.search(pat, t_lower):
            # If it has core engineering title (e.g. "Salesforce Developer", "Engineering Manager, Supply Chain")
            if has_core_eng:
                # Disallow purely non-tech fields even if they have engineer suffix e.g. "sales representative", "financial analyst"
                if any(re.search(r"\b" + k + r"\b", t_lower) for k in ["marketing", "finance", "fp&a", "accounting", "recruiter", "talent acquisition", "hr", "legal", "sales representative"]):
                    return False, f"Excluded: Non-IT domain role ({pat})"
                return True, "Included: Verified core software engineering role"
            return False, f"Excluded: Non-IT role family ({pat})"

    # 2. Positive IT engineering indicators (using strict word boundaries)
    it_indicators = [
        r"\bsoftware\b", r"\bdeveloper\b", r"\bengineer\b", r"\bsde\b", r"\bfrontend\b", r"\bbackend\b",
        r"\bfull stack\b", r"\bfullstack\b", r"\bdevops\b", r"\bsre\b", r"\bcloud\b", r"\binfrastructure\b",
        r"\bsystems\b", r"\bnetwork\b", r"\blinux\b", r"\bdatabase\b", r"\bdba\b", r"\bdata\b",
        r"\bmachine learning\b", r"\bml\b", r"\bai\b", r"\bnlp\b", r"\bcomputer vision\b", r"\bllm\b",
        r"\bqa\b", r"\btest\b", r"\bsdet\b", r"\bquality assurance\b", r"\bautomation\b",
        r"\bsecurity\b", r"\binfosec\b", r"\bcyber\b", r"\bsoc\b", r"\bappsec\b",
        r"\bembedded\b", r"\bfirmware\b", r"\bvlsi\b", r"\bhardware\b", r"\bfpga\b", r"\brobotics\b",
        r"\bproduct manager\b", r"\barchitect\b", r"\btech lead\b", r"\btechnical lead\b", r"\bengineering manager\b"
    ]
    if any(re.search(pat, t_lower) for pat in it_indicators):
        return True, "Included: Verified IT/Engineering role"

    # 3. Description snippet fallback ONLY if title has generic intern/trainee/associate signals
    if any(k in t_lower for k in ["intern", "trainee", "associate", "graduate", "fellow", "mts"]):
        d_snippet = (description or "")[:1000].lower()
        if any(re.search(r"\b" + k + r"\b", d_snippet) for k in ["python", "java", "golang", "c\+\+", "react", "fastapi", "docker", "kubernetes", "sql", "aws"]):
            return True, "Included: Technical IT engineering duties verified in description"

    # Default to non-IT if no engineering signals
    return False, "Excluded: No explicit technology or engineering duties identified"


def classify_it_role_family(title: str, description: str = "") -> Tuple[str, str]:
    """
    Classify a verified IT job into one of the 7 JobNexa Blueprint IT Role Families.
    Returns (family_key, family_display_name).
    """
    t_lower = (title or "").lower()
    text = f"{t_lower} {description[:800].lower()}"

    # 1. Security
    if any(k in text for k in ["security", "cyber", "infosec", "soc", "iam", "appsec", "vulnerability", "incident response"]):
        return "security", "Cybersecurity & InfoSec"

    # 2. Hardware and Embedded
    if any(k in text for k in ["embedded", "firmware", "vlsi", "rtl", "asic", "hardware engineer", "electronics", "robotics", "fpga"]):
        return "hardware_embedded", "Hardware & Embedded Systems"

    # 3. Quality & Release (QA / SDET)
    if any(k in text for k in ["qa", "sdet", "test engineer", "automation engineer", "quality assurance", "test automation", "release engineer"]):
        return "quality_release", "Quality & SDET"

    # 4. Data & AI / ML
    if any(k in text for k in ["data engineer", "data scientist", "machine learning", "mlops", "ai ", "analytics engineer", "deep learning", "nlp", "llm", "dba", "big data", "spark", "bi engineer"]):
        return "data_ai", "Data & AI / ML"

    # 5. Infrastructure and Reliability (Cloud / SRE / DevOps)
    if any(k in text for k in ["devops", "sre", "site reliability", "cloud", "infrastructure", "platform engineer", "systems engineer", "network engineer", "sysadmin", "it support engineer"]):
        return "infrastructure_reliability", "Infrastructure & Cloud / DevOps"

    # 6. Technical Product & Architecture
    if any(k in text for k in ["technical product manager", "solution architect", "enterprise architect", "system architect", "engineering manager", "director of engineering", "vp engineering"]):
        return "technical_product", "Technical Product & Architecture"

    # 7. Default: Software and Product Engineering
    return "software_engineering", "Software & Product Engineering"


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

