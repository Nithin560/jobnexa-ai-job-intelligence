# PLAN.md — Project Roadmap & Task Execution Tracker

## Project Overview
**Title:** AI-Powered Job Intelligence & Direct Application Discovery Platform (BangaloreJobs)
**Target Scope:** Bengaluru, Karnataka, India
**Tech Stack:** React + TypeScript + Vite + Tailwind CSS | FastAPI + Pydantic + SQLAlchemy + PostgreSQL (pgvector) | Docker Compose

---

## Current Status Block
```yaml
current_day: Full Platform Built & Verified
last_completed_task: Full-stack implementation (FastAPI REST APIs, Database Seeding, Transparent Match Engine, Crawler Task, React + TypeScript Frontend)
next_task: Deployment & Optional Cloud Hosting
blockers: None
tool_used: Antigravity
last_commit_hash: Pending commit
repo_url: https://github.com/Nithin560/jobnexa-ai-job-intelligence
```

---

## Phased Implementation Roadmap

### Day 1: Foundation, DB Models & API Infrastructure
- [x] Initial project setup (GITHUB_WORKFLOW.md, .gitignore, .env.example, PLAN.md, README.md)
- [x] Backend structure (`backend/app/main.py`, `core/config.py`, `db/session.py`)
- [x] SQLAlchemy Models (`users`, `candidate_profiles`, `candidate_skills`, `companies`, `job_sources`, `jobs`, `job_history`, `skills`, `job_skills`, `scan_runs`, `source_run_results`, `saved_jobs`)
- [x] Pydantic Schemas & API Health endpoint (`/api/v1/health`)
- [x] Alembic database migration baseline
- [x] Unit tests for API health & database models

### Day 2: Catalog, Search, Filtering & User Auth
- [x] Seed database with fixture Bengaluru jobs & skills dictionary
- [x] Authentication System (JWT token generation, login/register endpoints, password hashing)
- [x] Candidate & Admin Role-Based Access Control (RBAC) middleware
- [x] Job Catalog APIs (`GET /api/v1/jobs` with filtering by title, skills, experience, company type, work mode, pagination)
- [x] Job Detail API (`GET /api/v1/jobs/{job_id}`) with provenance & apply links
- [x] Unit & Integration tests for Search and Auth

### Day 3: Connector Framework & Automated Daily Scanning
- [x] Connector Protocol (`JobSourceConnector`) interface definition
- [x] Fixture/Mock Connector implementation & JSON/HTML parsers
- [x] Crawler Safety & Policy Enforcement (allowlist, robots.txt check, rate limiter, SSRF protection)
- [x] Orchestrated Daily Scanner service (`app/tasks/scan.py`)
- [x] Single-instance Overlap Lock mechanism
- [x] Idempotent Job Ingestion & Raw Job normalization pipeline
- [x] Unit tests for parsers, connectors, and scanner execution

### Day 4: Pipeline Normalization, Freshness & Duplicate Detection
- [x] Normalization module (Bengaluru location aliases, job title variations, standardized skill names)
- [x] Rule-based Skill Extraction engine (alias mapping + phrase matching)
- [x] `job_history` append-only audit tracking for field changes
- [x] Job Freshness & Lifecycle State Machine (`active`, `not_seen`, `stale`, `closed`, `paused_source`)
- [x] Multi-layer Duplicate Detection (Exact source ID, Canonical URL, Fingerprint hash, Similarity score)
- [x] Admin Review Queue for low-confidence extractions and potential duplicates

### Day 5: Candidate Profile Matching & React Frontend Implementation
- [x] Candidate Profile API (`POST/GET /api/v1/candidate/profile`)
- [x] Explainable Candidate-Job Match Score Algorithm (Skill Coverage 40%, Title Fit 20%, Experience Fit 15%, Location Fit 10%, Semantic/Freshness 15%)
- [x] Skill Gap Breakdown API (`GET /api/v1/candidate/matches`)
- [x] React + TypeScript + Vite + Tailwind CSS Frontend Scaffold
- [x] Home / Job Search Page (filters, job cards with direct apply buttons, skills breakdown chips)
- [x] User Dashboard & Recommended Jobs UI
- [x] Job Details Page with interactive 94% Match breakdown visualization
- [x] Saved Jobs & Bookmark feature UI

### Day 6: Admin Panel Dashboard, Hardening & Verification
- [x] Admin Dashboard API endpoints (`/api/v1/admin/overview`, `/api/v1/admin/scans`, `/api/v1/admin/sources`)
- [x] Admin Panel UI (Metrics cards, Discovered jobs trend chart, Crawler status donut, System health grid, Quick Actions)
- [x] Optional local AI enrichment (Ollama / Sentence Transformers vector fallback)
- [x] Security hardening (CORS, Rate limiting, Input validation, Redacted logs)
- [x] Docker Compose orchestration (`compose.yaml`, backend & frontend Dockerfiles)
- [x] End-to-end integration tests & verification run
- [x] README documentation finalization & interview presentation notes
