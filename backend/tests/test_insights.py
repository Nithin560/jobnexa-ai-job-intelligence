def test_job_insights_endpoint(client):
    response = client.get("/api/v1/jobs/insights")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs" in data
    assert "total_companies" in data
    assert "top_skills" in data
    assert isinstance(data["top_skills"], list)
    assert "experience_breakdown" in data
    assert isinstance(data["experience_breakdown"], list)
    assert "work_modes" in data
    assert "company_tiers" in data
    assert "recent_scans" in data
    assert "latest_scan" in data
    assert "companies_scanned" in data["latest_scan"]
