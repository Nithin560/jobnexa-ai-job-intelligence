# JobNexa — Bengaluru IT Company Discovery & Engineering Job Intelligence Platform

An AI-powered job discovery and engineering intelligence platform built specifically for **Bengaluru and Karnataka state**. JobNexa automatically scans permitted company career ATS portals (Greenhouse, Lever, Ashby, SmartRecruiters, Workday) and verified job platform feeds on a scheduled cadence, normalizes job listings across 7 IT Role Families and 9 Company Categories, extracts skills, detects duplicates, verifies physical Bangalore tech hub locations, and connects candidates directly to official application URLs with explainable match scoring.

![JobNexa Platform](docs/home_dashboard.jpg)

### Application Screenshots & Workflows

| Candidate Discovery & Feed | Admin Operations & Crawler Intelligence |
|---|---|
| ![User Experience & Job Match Analysis](docs/dashboard_flow.jpg) | ![Admin Operations Dashboard](docs/admin_dashboard.jpg) |

---

## 🌟 Key Platform Capabilities

- **120+ Bengaluru IT Companies & Direct ATS Ingestion:** Ingests vacancies directly from verified career portals (Razorpay, Swiggy, Zerodha, CRED, Flipkart, PhonePe, Infosys, Wipro, Bosch, etc.) with zero middleman or expired listings.
- **7 IT Role Families Categorization:**
  1. Software & Product Engineering
  2. Cloud, SRE & DevOps
  3. Cybersecurity & InfoSec
  4. Data & AI / ML
  5. QA & SDET
  6. Hardware & Embedded Systems
  7. Tech Product & Architecture
- **Dedicated Candidate Experience Tiers:**
  - **Fresher Opportunities (0 - 1 Years):** Curated for new graduates, entry-level engineers, and interns with 1-click on-demand fresh recommendations reload.
  - **Experienced Career Openings (1+ Years):** Tailored for mid, senior, lead, and staff engineers.
- **Strict Role-Based Security:**
  - **Admin Mode:** Full control over live career portal scanning, user intelligence, system crawler throughput, and source health.
  - **Candidate User Mode:** Streamlined, secure job discovery and application tracking with automated 24/7 verification sync.
- **Dynamic Real-Time Verification Timestamps:** Accurately reflects exact scan and verification times (`Today, 08:01 AM`, `Yesterday`, etc.) with full datetime hover inspection.
- **Bangalore Tech Hubs Filtering:** Neighborhood-level filtering across Koramangala & HSR, Whitefield & Bellandur (ORR), Electronic City, Manyata & North Bengaluru, Indiranagar & Central, and Remote/Hybrid Karnataka.
- **Zero Paid API Stack (₹0 Local Target):** Runs entirely locally without expensive third-party APIs using FastAPI, SQLite/PostgreSQL, React 18, Vite, and Tailwind CSS.

---

## 🏗️ System Architecture

```
Candidate / Admin Browser (React 18 + TypeScript + Vite + Tailwind)
       │ (HTTPS / REST JSON)
       ▼
 FastAPI Backend (Python 3.11+ + Pydantic v2 + SQLAlchemy ORM)
       │
       ├── SQLite / PostgreSQL Database
       │
       └── Bengaluru Discovery & Scan Pipeline
             ├── ATS Connectors (Greenhouse, Lever, Ashby, SmartRecruiters)
             ├── Normalization Engine (7 IT Role Families, 9 Company Types)
             ├── Physical BLR Location & JD Validator
             ├── Strict Role Access (Admin Scanner vs Candidate View)
             └── Explainable Match Scoring (Skills, Experience, Location)
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy ORM, HTTPX |
| **Database** | SQLite (development/local) / PostgreSQL 15+ (production) |
| **Security** | JWT Authentication, Passlib (Bcrypt / Argon2), RBAC (`candidate` vs `admin`) |
| **Connectors** | Greenhouse ATS, Lever ATS, Ashby ATS, SmartRecruiters, Job Aggregators |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nithin560/jobnexa-ai-job-intelligence.git
   cd jobnexa-ai-job-intelligence
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the platform:**
   - **Candidate & Discovery Portal:** `http://localhost:5173/`
   - **Admin Intelligence Dashboard:** `http://localhost:5173/admin`
   - **Interactive API Documentation:** `http://localhost:8000/docs`

---

## 📜 Zero-Cost Discovery Blueprint

Read the complete discovery blueprint strategy inside the platform at `/strategy` or in the codebase at `frontend/src/pages/DiscoveryStrategyPage.tsx`.

Built with responsible crawling principles: respects `robots.txt`, implements per-host rate limits, stores minimal necessary metadata, and provides 100% direct application links to verified employer career portals.
