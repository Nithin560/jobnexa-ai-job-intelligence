"""
End-to-end tests for Candidate Demo mode provisioning, profile access, and bookmarking.
"""
from app.db.seed import seed_db


def test_candidate_demo_authentication_and_workflow(client, db_session):
    # Seed Database
    seed_db(db_session)

    # 1. Test Demo Candidate 1-Click Provisioning
    demo_res = client.post("/api/v1/auth/demo-candidate")
    assert demo_res.status_code == 200
    token_data = demo_res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "candidate"
    assert token_data["email"] == "candidate.demo@jobnexa.ai"
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Demo Profile Fetch
    prof_res = client.get("/api/v1/candidate/profile", headers=headers)
    assert prof_res.status_code == 200
    profile = prof_res.json()
    assert profile["email"] == "candidate.demo@jobnexa.ai"
    assert len(profile["skills"]) > 0
    assert "Python" in profile["skills"]

    # 3. Test Demo Candidate AI Job Matches
    match_res = client.get("/api/v1/candidate/matches?limit=5", headers=headers)
    assert match_res.status_code == 200
    matches = match_res.json()
    assert isinstance(matches, list)
    if len(matches) > 0:
        first_job = matches[0]
        assert "match" in first_job
        assert first_job["match"]["score"] >= 0

    # 4. Test Demo Candidate Bookmark Toggle
    jobs_res = client.get("/api/v1/jobs?limit=1")
    assert jobs_res.status_code == 200
    items = jobs_res.json().get("items", [])
    if len(items) > 0:
        target_job_id = items[0]["id"]
        save_res = client.post(f"/api/v1/candidate/saved-jobs/{target_job_id}", headers=headers)
        assert save_res.status_code == 200
        assert save_res.json().get("saved") is True

        # 5. Test Demo Saved Jobs List (Recency Ordered)
        saved_list_res = client.get("/api/v1/candidate/saved-jobs", headers=headers)
        assert saved_list_res.status_code == 200
        saved_items = saved_list_res.json()
        assert any(j["id"] == target_job_id for j in saved_items)
