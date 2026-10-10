from app.db.seed import seed_db

def test_full_api_flow(client, db_session):
    # Seed Database
    seed_db(db_session)

    # 1. Test Jobs List API
    response = client.get("/api/v1/jobs?location=Bengaluru")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["items"][0]["location"] == "Bengaluru, Karnataka"

    # 2. Test Job Detail API
    job_id = data["items"][0]["id"]
    detail_res = client.get(f"/api/v1/jobs/{job_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == job_id
    assert "description" in detail_data
    assert "match" in detail_data

    # 3. Test User Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "nithin@example.com",
        "password": "NithinPass123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 4. Test Authenticated Candidate Profile API
    headers = {"Authorization": f"Bearer {token}"}
    prof_res = client.get("/api/v1/candidate/profile", headers=headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["email"] == "nithin@example.com"
    assert "Python" in prof_data["skills"]

    # 5. Test Candidate Match Recommendations API
    match_res = client.get("/api/v1/candidate/matches", headers=headers)
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) > 0
    assert matches[0]["match"]["score"] > 50.0

    # 6. Test Admin Overview API
    admin_res = client.get("/api/v1/admin/overview")
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["total_companies"] >= 1248
    assert admin_data["total_jobs"] >= 24842
