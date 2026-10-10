from app.models import User, Company, JobSource, Job, Skill, JobSkill, CandidateProfile


def test_user_and_profile_creation(db_session):
    user = User(email="testcandidate@example.com", password_hash="hashed_pw_123", role="candidate")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.email == "testcandidate@example.com"
    assert user.role == "candidate"

    profile = CandidateProfile(
        user_id=user.id,
        target_titles=["Backend Engineer"],
        location_preferences=["Bengaluru"],
        years_experience=2,
        work_mode="Hybrid"
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)

    assert profile.user_id == user.id
    assert profile.years_experience == 2


def test_job_and_company_models(db_session):
    company = Company(name="Razorpay", canonical_domain="razorpay.com", company_type="Mid-size")
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)

    source = JobSource(company_id=company.id, source_type="career_page", base_url="https://razorpay.com/careers", connector_key="generic_html")
    db_session.add(source)
    db_session.commit()

    job = Job(
        company_id=company.id,
        source_id=source.id,
        title="Backend Software Engineer",
        description="We are hiring a Python & FastAPI engineer in Bengaluru.",
        location="Bengaluru, Karnataka",
        apply_url="https://razorpay.com/careers/jobs/123",
        status="active"
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    assert job.id is not None
    assert job.company.name == "Razorpay"
    assert job.status == "active"
