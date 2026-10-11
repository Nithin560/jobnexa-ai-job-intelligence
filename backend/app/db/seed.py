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
from app.tasks.scan import run_daily_scan, ensure_companies_and_sources


def seed_db(db: Session):
    """Seed initial skills, users, real job sources, and ingest real live Bengaluru jobs."""
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

    # 2. Seed Admin User & Default Candidate User
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
            target_titles=["Backend Software Engineer", "Backend Engineer", "Software Engineer"],
            location_preferences=["Bengaluru", "Bengaluru, Karnataka"],
            years_experience=2,
            work_mode="Hybrid"
        )
        db.add(profile)
        db.flush()

        # Candidate skills
        for sname in ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]:
            sk_obj = skill_map.get(sname)
            if sk_obj:
                cs = CandidateSkill(profile_id=profile.id, skill_id=sk_obj.id, proficiency="Expert", years_used=2)
                db.add(cs)

    db.commit()

    # 3. Clean up any previous fake sample jobs if present
    db.query(Job).filter(
        Job.apply_url.ilike("%example.com%") | 
        Job.apply_url.ilike("%careers.google.com/jobs/results/12345%") |
        Job.apply_url.ilike("%careers.microsoft.com/us/en/job/987654%")
    ).delete(synchronize_session=False)
    db.commit()

    # 4. Ingest real live jobs from verified company career ATS boards
    print("[Seed] Running live job scanner to fetch real jobs from company career sites...")
    ensure_companies_and_sources(db)
    run_daily_scan(scope="bengaluru", trigger="seed", db=db)
    print("Database successfully seeded with REAL live Bengaluru jobs from company career portals!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
