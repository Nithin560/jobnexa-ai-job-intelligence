from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.candidate import CandidateProfile, CandidateSkill
from app.models.company import Company, JobSource
from app.models.job import Job, JobSkill, JobHistory, SavedJob
from app.models.skill import Skill
from app.models.scan import ScanRun, SourceRunResult
from app.core.security import get_password_hash
from app.core.config import settings


def seed_db(db: Session):
    """Seed initial skills, companies, job sources, users, and Bengaluru jobs."""
    Base.metadata.create_all(bind=db.get_bind())
    # 1. Seed Skills Dictionary
    skills_data = [
        ("Python", "py, python3", "Languages"),
        ("SQL", "postgres, mysql, sql server", "Databases"),
        ("Java", "java8, java17, spring", "Languages"),
        ("AWS", "amazon web services, ec2, s3", "Cloud"),
        ("JavaScript", "js, es6, nodejs", "Languages"),
        ("React", "reactjs, react.js", "Frameworks"),
        ("Docker", "container, docker-compose", "DevOps"),
        ("Kubernetes", "k8s, kubectl", "DevOps"),
        ("FastAPI", "fast-api, starlette", "Frameworks"),
        ("PostgreSQL", "postgres, pgsql", "Databases"),
        ("Distributed Systems", "microservices, messaging", "Architecture"),
        ("C++", "cpp, cplusplus", "Languages"),
        ("System Design", "architecture, high availability", "Architecture"),
        ("Data Pipelines", "etl, airflow", "Data"),
        ("Spark", "pyspark, apache spark", "Data"),
        ("Azure", "microsoft azure", "Cloud"),
        ("Node.js", "node, express", "Frameworks"),
        ("Microservices", "distributed architecture", "Architecture"),
        ("Analytics", "data analytics, bi", "Data"),
        ("User Research", "ux research, usability", "Product"),
        ("Product Strategy", "roadmap, vision", "Product"),
        ("A/B Testing", "experimentation, metrics", "Product"),
        ("Machine Learning", "ml, deep learning", "AI"),
        ("PyTorch", "torch", "AI"),
        ("TensorFlow", "tf", "AI")
    ]

    skill_map = {}
    for name, aliases, category in skills_data:
        existing = db.query(Skill).filter(Skill.canonical_name == name).first()
        if not existing:
            skill_obj = Skill(canonical_name=name, aliases=aliases, category=category)
            db.add(skill_obj)
            db.flush()
            skill_map[name] = skill_obj
        else:
            skill_map[name] = existing

    # 2. Seed Companies
    companies_data = [
        ("Google", "google.com", "https://careers.google.com", "Large", "https://logo.clearbit.com/google.com"),
        ("Microsoft", "microsoft.com", "https://careers.microsoft.com", "Large", "https://logo.clearbit.com/microsoft.com"),
        ("Razorpay", "razorpay.com", "https://razorpay.com/jobs", "Mid-size", "https://logo.clearbit.com/razorpay.com"),
        ("Swiggy", "swiggy.com", "https://careers.swiggy.com", "Large", "https://logo.clearbit.com/swiggy.com"),
        ("PhonePe", "phonepe.com", "https://phonepe.com/careers", "Mid-size", "https://logo.clearbit.com/phonepe.com"),
        ("Zepto", "zepto.com", "https://zepto.com/careers", "Startup", "https://logo.clearbit.com/zeptonow.com"),
        ("Flipkart", "flipkart.com", "https://flipkartcareers.com", "Enterprise", "https://logo.clearbit.com/flipkart.com")
    ]

    company_map = {}
    for name, domain, url, ctype, logo in companies_data:
        existing = db.query(Company).filter(Company.name == name).first()
        if not existing:
            comp = Company(name=name, canonical_domain=domain, careers_url=url, company_type=ctype, logo_url=logo)
            db.add(comp)
            db.flush()
            company_map[name] = comp
        else:
            company_map[name] = existing

    # 3. Seed Job Sources
    source_map = {}
    for name, comp in company_map.items():
        existing_source = db.query(JobSource).filter(JobSource.company_id == comp.id).first()
        if not existing_source:
            js = JobSource(
                company_id=comp.id,
                source_type="career_page",
                base_url=comp.careers_url or "https://example.com/careers",
                connector_key="generic_html",
                enabled=True
            )
            db.add(js)
            db.flush()
            source_map[name] = js
        else:
            source_map[name] = existing_source

    # 4. Seed Jobs matching BangaloreJobs design mockups
    jobs_seed = [
        {
            "title": "Software Engineer",
            "company": "Google",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "exp_min": 2,
            "exp_max": 5,
            "skills": ["Python", "System Design", "Distributed Systems", "C++", "AWS"],
            "apply_url": "https://careers.google.com/jobs/results/12345",
            "description": "Designing high-scale distributed backend components in C++ and Python. Requires 2+ years of experience in system design and cloud infrastructure."
        },
        {
            "title": "Data Engineer",
            "company": "Microsoft",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "exp_min": 3,
            "exp_max": 6,
            "skills": ["Python", "Azure", "SQL", "Data Pipelines", "Spark"],
            "apply_url": "https://careers.microsoft.com/us/en/job/987654",
            "description": "Build modern data pipelines on Azure using PySpark and SQL. Experience with ETL frameworks and real-time streaming architectures."
        },
        {
            "title": "Backend Engineer",
            "company": "Razorpay",
            "location": "Bengaluru, Karnataka",
            "work_mode": "On-site",
            "employment_type": "Full-time",
            "exp_min": 1,
            "exp_max": 4,
            "skills": ["Node.js", "Python", "PostgreSQL", "AWS", "Microservices"],
            "apply_url": "https://razorpay.com/jobs/backend-engineer-bengaluru",
            "description": "Building mission-critical payment APIs using Python, FastAPI, and PostgreSQL. High concurrency microservices handling millions of daily transactions."
        },
        {
            "title": "Product Manager",
            "company": "Swiggy",
            "location": "Bengaluru, Karnataka",
            "work_mode": "On-site",
            "employment_type": "Full-time",
            "exp_min": 4,
            "exp_max": 8,
            "skills": ["Product Strategy", "Analytics", "User Research", "A/B Testing"],
            "apply_url": "https://careers.swiggy.com/jobs/pm-consumer",
            "description": "Lead consumer product experience for Swiggy food delivery in Bengaluru. Drive growth through data-driven A/B testing and user research."
        },
        {
            "title": "ML Engineer",
            "company": "Zepto",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Full-time",
            "employment_type": "Full-time",
            "exp_min": 2,
            "exp_max": 6,
            "skills": ["Python", "Machine Learning", "AWS", "Docker", "PyTorch"],
            "apply_url": "https://zepto.com/careers/ml-engineer-supply-chain",
            "description": "Optimize quick-commerce supply chain logistics using deep learning models in PyTorch. Deploy containerized inference services on AWS."
        },
        {
            "title": "DevOps / SRE Engineer",
            "company": "PhonePe",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "exp_min": 3,
            "exp_max": 7,
            "skills": ["Docker", "Kubernetes", "AWS", "Python", "System Design"],
            "apply_url": "https://phonepe.com/careers/sre-lead",
            "description": "Manage Kubernetes clusters hosting UPI payment backend infrastructure. Implement automated CI/CD pipelines and zero-downtime deployments."
        },
        {
            "title": "Data Analyst",
            "company": "Flipkart",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "exp_min": 1,
            "exp_max": 3,
            "skills": ["SQL", "Python", "Analytics", "Spark"],
            "apply_url": "https://flipkartcareers.com/job/data-analyst-retail",
            "description": "Analyze e-commerce customer buying trends and seller metrics in SQL and Python to optimize supply chain inventory."
        }
    ]

    now = datetime.utcnow()
    for j_data in jobs_seed:
        comp = company_map.get(j_data["company"])
        source = source_map.get(j_data["company"])
        
        existing_job = db.query(Job).filter(Job.title == j_data["title"], Job.company_id == (comp.id if comp else None)).first()
        if not existing_job:
            job = Job(
                company_id=comp.id if comp else None,
                source_id=source.id if source else None,
                title=j_data["title"],
                description=j_data["description"],
                location=j_data["location"],
                work_mode=j_data["work_mode"],
                employment_type=j_data["employment_type"],
                experience_min=j_data["exp_min"],
                experience_max=j_data["exp_max"],
                apply_url=j_data["apply_url"],
                status="active",
                first_seen_at=now - timedelta(hours=random.randint(1, 48)),
                last_seen_at=now,
                posted_at=now - timedelta(hours=random.randint(2, 24))
            )
            db.add(job)
            db.flush()

            # Attach skills
            for sname in j_data["skills"]:
                sk_obj = skill_map.get(sname)
                if sk_obj:
                    js = JobSkill(job_id=job.id, skill_id=sk_obj.id, confidence=1.0, required_or_nice="required")
                    db.add(js)
            
            # Add audit history log
            hist = JobHistory(
                job_id=job.id,
                observed_at=now,
                changed_fields={"status": "new_listing"},
                snapshot_json={"title": job.title, "company": comp.name if comp else ""}
            )
            db.add(hist)

    # 5. Seed Admin User & Default Candidate User
    admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL_ID).first()
    if not admin_user:
        admin_user = User(
            email=settings.ADMIN_EMAIL_ID,
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            role="admin"
        )
        db.add(admin_user)
    else:
        admin_user.password_hash = get_password_hash(settings.ADMIN_PASSWORD)

    candidate_user = db.query(User).filter(User.email == "nithin@example.com").first()
    if not candidate_user:
        candidate_user = User(
            email="nithin@example.com",
            password_hash=get_password_hash("NithinPass123!"),
            role="candidate"
        )
        db.add(candidate_user)
        db.flush()

        profile = CandidateProfile(
            user_id=candidate_user.id,
            target_titles=["Backend Software Engineer", "Backend Engineer"],
            location_preferences=["Bengaluru"],
            years_experience=2,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.flush()

        # Candidate skills matching Image 2 mockup (Python, FastAPI, PostgreSQL, Docker, AWS)
        for sname in ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]:
            sk_obj = skill_map.get(sname)
            if sk_obj:
                cs = CandidateSkill(profile_id=profile.id, skill_id=sk_obj.id, proficiency="Expert", years_used=2)
                db.add(cs)

    # 6. Seed Scan Runs for Admin Dashboard
    scan_run = db.query(ScanRun).first()
    if not scan_run:
        srun = ScanRun(
            started_at=now - timedelta(hours=2),
            finished_at=now - timedelta(hours=1, minutes=12),
            status="completed",
            trigger="cron",
            totals_json={
                "companies_scanned": 1248,
                "jobs_found": 3842,
                "new_jobs": 1926,
                "expired_jobs": 427,
                "success_rate": 98.2
            }
        )
        db.add(srun)

    db.commit()
    print("Database successfully seeded with Bengaluru jobs, skills, companies, and test accounts!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
