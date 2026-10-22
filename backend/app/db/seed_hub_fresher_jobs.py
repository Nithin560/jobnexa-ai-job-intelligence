import uuid
from datetime import datetime, timedelta
import random
from app.db.session import SessionLocal
from app.models.company import Company, JobSource
from app.models.job import Job, JobSkill
from app.models.skill import Skill
from app.pipeline.deduplicator import generate_job_fingerprint

HUB_FRESHER_SPECS = [
    # 1. Indiranagar & Central
    {
        "hub": "indiranagar",
        "jobs": [
            {
                "title": "Associate Software Engineer - Backend (Python / FastAPI)",
                "company_preferred": "CRED",
                "location": "Embassy GolfLinks Business Park (EGL), Domlur, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.0,
                "salary_max": 14.0,
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "desc": "Join CRED's core engineering team at Embassy GolfLinks (EGL) Domlur. Fresh engineering graduates with strong algorithmic problem solving, Python, and relational database knowledge will build scalable microservices."
            },
            {
                "title": "Graduate Engineer Trainee - Frontend (React & TypeScript)",
                "company_preferred": "Slice",
                "location": "Indiranagar 100 Feet Road Tech Quarter, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 7.5,
                "salary_max": 12.0,
                "skills": ["React", "JavaScript", "TypeScript"],
                "desc": "Slice is hiring Graduate Engineer Trainees in Indiranagar. Build responsive web experiences, modern user interfaces, and collaborate with product designers."
            },
            {
                "title": "Junior Cloud & DevOps Associate (AWS & Docker)",
                "company_preferred": "Postman",
                "location": "Bagmane Tech Park, CV Raman Nagar, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.5,
                "salary_max": 15.0,
                "skills": ["AWS", "Docker", "Kubernetes", "Python"],
                "desc": "Postman's cloud infrastructure team in Bagmane Tech Park is looking for an entry-level DevOps engineer to support CI/CD pipelines, container orchestration, and cloud monitoring."
            },
            {
                "title": "Junior QA Engineer & Test Automation Trainee",
                "company_preferred": "InMobi",
                "location": "Embassy GolfLinks Business Park, Domlur, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 6.5,
                "salary_max": 10.5,
                "skills": ["Python", "SQL", "Docker"],
                "desc": "InMobi seeks fresh tech graduates for SDET and test automation in Domlur. Design automated tests, participate in sprint releases, and write testing scripts."
            },
            {
                "title": "Associate Data Analyst (SQL & Python)",
                "company_preferred": "Dunzo",
                "location": "Indiranagar, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 6.0,
                "salary_max": 10.0,
                "skills": ["SQL", "Python", "Analytics"],
                "desc": "Dunzo's central analytics unit in Indiranagar seeks a junior data analyst to generate operational insights, build SQL dashboards, and optimize logistics."
            },
            {
                "title": "Junior Full Stack Developer (Node.js & React)",
                "company_preferred": "Hasura",
                "location": "Domlur Tech Corridor, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 9.0,
                "salary_max": 16.0,
                "skills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
                "desc": "Work directly on GraphQL and real-time backend developer tools in Domlur. Perfect for passionate junior developers with full-stack skills."
            },
            {
                "title": "Software Engineer Trainee - Core Platform",
                "company_preferred": "Zomato",
                "location": "Embassy GolfLinks (EGL), Domlur, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 8.0,
                "salary_max": 13.0,
                "skills": ["Java", "SQL", "Distributed Systems"],
                "desc": "Develop high-throughput ordering and delivery microservices at EGL Domlur. 0-1 years experience or fresh B.Tech/M.Tech/MCA graduates."
            },
            {
                "title": "Junior AI & Prompt Engineering Associate",
                "company_preferred": "Licious",
                "location": "Indiranagar, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 7.0,
                "salary_max": 12.0,
                "skills": ["Python", "Machine Learning"],
                "desc": "Explore generative AI workflows, computer vision quality checks, and LLM automation tools in Indiranagar."
            }
        ]
    },

    # 2. Whitefield & Bellandur
    {
        "hub": "whitefield",
        "jobs": [
            {
                "title": "Junior Software Development Engineer - SDE 1 (0-1 Yrs)",
                "company_preferred": "Flipkart",
                "location": "Prestige Tech Park, Outer Ring Road, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 12.0,
                "salary_max": 20.0,
                "skills": ["Java", "Distributed Systems", "SQL"],
                "desc": "Flipkart is hiring SDE 1 graduates at Prestige Tech Park (ORR). Build massive scale e-commerce checkout and inventory management services."
            },
            {
                "title": "Associate Backend Engineer (Go / Java / Python)",
                "company_preferred": "PhonePe",
                "location": "EcoSpace Business Park, Bellandur, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 11.0,
                "salary_max": 18.0,
                "skills": ["Java", "Python", "SQL", "PostgreSQL"],
                "desc": "PhonePe Bellandur EcoSpace is expanding its payments backend team. Fresh graduates with solid foundation in data structures and DBMS are welcome."
            },
            {
                "title": "Junior Frontend Engineer (React & TypeScript)",
                "company_preferred": "Meesho",
                "location": "Cessna Business Park, Kadubeesanahalli, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 9.0,
                "salary_max": 15.0,
                "skills": ["React", "JavaScript", "React"],
                "desc": "Meesho engineering at Cessna Tech Park is hiring junior frontend engineers. Craft responsive mobile web views and high-conversion catalog pages."
            },
            {
                "title": "Graduate Technology Trainee - Cloud Systems",
                "company_preferred": "BrowserStack",
                "location": "ITPB (International Tech Park Bengaluru), Whitefield, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 10.0,
                "salary_max": 16.0,
                "skills": ["Docker", "Kubernetes", "AWS", "Python"],
                "desc": "Help manage thousands of cloud browsers and mobile devices at ITPB Whitefield. Hands-on exposure to containerization and cloud infrastructure."
            },
            {
                "title": "SDET Trainee (Test Automation & Selenium)",
                "company_preferred": "Groww",
                "location": "EPIP Zone, Whitefield, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 7.5,
                "salary_max": 12.5,
                "skills": ["Python", "Java", "SQL"],
                "desc": "Groww's QA team in Whitefield EPIP Zone seeks entry-level automation engineers to ensure bug-free investment applications."
            },
            {
                "title": "Junior Data Engineer (Python & Spark)",
                "company_preferred": "Zeta",
                "location": "Bagmane Constellation Tech Park, Outer Ring Road, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.5,
                "salary_max": 14.5,
                "skills": ["Python", "SQL", "Spark", "Data Pipelines"],
                "desc": "Zeta is hiring junior data engineers on ORR. Ingest real-time banking transactional records and build automated data pipelines."
            },
            {
                "title": "Associate AI & ML Developer (0-1 yrs)",
                "company_preferred": "CleverTap",
                "location": "Prestige Tech Park (ORR), Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 9.5,
                "salary_max": 16.0,
                "skills": ["Python", "Machine Learning", "SQL"],
                "desc": "Build predictive models and real-time customer behavioral segmentations at Prestige Tech Park."
            }
        ]
    },

    # 3. Electronic City
    {
        "hub": "electronic_city",
        "jobs": [
            {
                "title": "Systems Engineer Trainee (0-1 Yrs) - Full Stack",
                "company_preferred": "Infosys",
                "location": "Infosys City, Electronic City Phase 1, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 6.0,
                "salary_max": 9.5,
                "skills": ["Java", "Python", "SQL", "React"],
                "desc": "Infosys is onboarding Systems Engineer Trainees at Electronic City campus. Fresh engineering graduates will undergo world-class training in cloud, Java, and modern enterprise frameworks."
            },
            {
                "title": "Associate Software Developer - Java & Cloud",
                "company_preferred": "Wipro",
                "location": "Wipro Campus, Electronic City Phase 1, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 6.5,
                "salary_max": 10.0,
                "skills": ["Java", "AWS", "SQL"],
                "desc": "Wipro E-City Phase 1 is hiring Associate Software Developers to design cloud-native enterprise web services."
            },
            {
                "title": "Junior Embedded Systems & Firmware Engineer",
                "company_preferred": "Bosch Global Software",
                "location": "Cyber Park, Electronic City, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 7.0,
                "salary_max": 12.0,
                "skills": ["C++", "Python", "Distributed Systems"],
                "desc": "Bosch Global Software Technologies in Electronic City seeks entry-level engineers for automotive embedded software, microcontroller programming, and CAN protocols."
            },
            {
                "title": "Graduate Technology Associate - Cloud & AI",
                "company_preferred": "Siemens",
                "location": "Siemens Tech Center, Electronic City, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.0,
                "salary_max": 13.5,
                "skills": ["Python", "Docker", "AWS"],
                "desc": "Siemens Technology Center Electronic City is looking for fresh engineering graduates for industrial IoT, digital twin development, and cloud computing."
            },
            {
                "title": "Associate SDET / Software Test Engineer (0-1 Yrs)",
                "company_preferred": "Tata Consultancy Services (TCS)",
                "location": "TCS Think Campus, Electronic City, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 6.0,
                "salary_max": 9.0,
                "skills": ["Java", "Python", "SQL"],
                "desc": "TCS Think Campus in Electronic City Phase 2 seeks entry-level software test engineers for automated testing suites and CI pipeline validation."
            },
            {
                "title": "Junior Cloud Infrastructure Associate",
                "company_preferred": "Hewlett Packard Enterprise",
                "location": "Velankani Tech Park, Electronic City, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 7.5,
                "salary_max": 12.0,
                "skills": ["AWS", "Docker", "Python"],
                "desc": "HPE Velankani Tech Park is hiring junior cloud specialists to monitor hybrid cloud workloads, storage virtualization, and networking."
            },
            {
                "title": "Junior Data Analyst & BI Trainee",
                "company_preferred": "Tech Mahindra",
                "location": "Electronic City, Hosur Road, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 5.5,
                "salary_max": 8.5,
                "skills": ["SQL", "Python", "Analytics"],
                "desc": "Tech Mahindra Electronic City seeks fresh graduates for business reporting, ETL data extraction, and executive dashboarding."
            }
        ]
    },

    # 4. Manyata & North BLR
    {
        "hub": "manyata",
        "jobs": [
            {
                "title": "Graduate Engineer Trainee (GET) - Software Development",
                "company_preferred": "IBM",
                "location": "Manyata Embassy Business Park, Nagavara, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 7.5,
                "salary_max": 12.0,
                "skills": ["Java", "Python", "SQL", "Cloud"],
                "desc": "IBM India Software Labs at Manyata Embassy Business Park (Hebbal/Nagavara) invites applications from fresh B.Tech/B.E graduates for enterprise hybrid cloud software development."
            },
            {
                "title": "Associate Software Engineer - Retail Cloud",
                "company_preferred": "Target Tech",
                "location": "Manyata Embassy Business Park, Nagavara, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 10.0,
                "salary_max": 16.0,
                "skills": ["Java", "Kotlin", "React", "PostgreSQL"],
                "desc": "Target Technology Services at Manyata Tech Park is hiring associate software engineers to build global retail supply chain applications."
            },
            {
                "title": "Junior Cloud Security & DevOps Associate",
                "company_preferred": "Nutanix",
                "location": "Manyata Tech Park, Hebbal, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 9.0,
                "salary_max": 15.0,
                "skills": ["Docker", "Kubernetes", "Python", "AWS"],
                "desc": "Nutanix Manyata engineering hub is hiring entry-level systems and DevOps engineers for hyperconverged infrastructure virtualization."
            },
            {
                "title": "Associate QA & Test Automation Specialist (0-1 yrs)",
                "company_preferred": "Cognizant",
                "location": "Manyata Tech Park, Nagavara, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 6.0,
                "salary_max": 9.0,
                "skills": ["Java", "SQL", "Python"],
                "desc": "Cognizant Manyata Campus is hiring freshers for test automation, API testing, and continuous quality delivery."
            },
            {
                "title": "Associate Data Engineer (Python, SQL & Spark)",
                "company_preferred": "Philips Innovation Campus",
                "location": "Manyata Embassy Business Park, Nagavara, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.0,
                "salary_max": 13.0,
                "skills": ["Python", "SQL", "Spark", "Data Pipelines"],
                "desc": "Philips Healthcare Tech Center at Manyata is seeking junior data engineers to process healthcare telemetry datasets and clinical intelligence pipelines."
            },
            {
                "title": "Junior Network & Infrastructure Engineer",
                "company_preferred": "Akamai Technologies",
                "location": "Kirloskar Business Park, Hebbal, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.5,
                "salary_max": 14.0,
                "skills": ["Python", "Docker", "Distributed Systems"],
                "desc": "Akamai's Hebbal campus is hiring entry-level network and edge engineers for global CDN acceleration and DDoS mitigation systems."
            },
            {
                "title": "Junior Full Stack Engineer (Node.js & Angular/React)",
                "company_preferred": "Lowe's India",
                "location": "Manyata Embassy Business Park, Nagavara, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 9.0,
                "salary_max": 15.0,
                "skills": ["JavaScript", "React", "Node.js", "SQL"],
                "desc": "Lowe's India Manyata Tech Center is seeking junior full-stack developers to power home improvement omni-channel platforms."
            }
        ]
    },

    # 5. Koramangala & HSR
    {
        "hub": "koramangala",
        "jobs": [
            {
                "title": "Junior Full Stack Engineer - Startup Core Team (0-1 yrs)",
                "company_preferred": "Swiggy",
                "location": "Koramangala Tech Quarter, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 11.0,
                "salary_max": 18.0,
                "skills": ["Java", "Go", "React", "PostgreSQL"],
                "desc": "Swiggy's Koramangala engineering headquarters seeks talented 0-1 yr engineers for Instamart delivery platform and hyperlocal dispatch services."
            },
            {
                "title": "Associate Backend Developer (Python / Go / PostgreSQL)",
                "company_preferred": "Razorpay",
                "location": "Salarpuria Sattva Oasis, Koramangala, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 10.5,
                "salary_max": 17.5,
                "skills": ["Python", "PostgreSQL", "FastAPI", "Docker"],
                "desc": "Razorpay Koramangala is hiring Associate Backend Developers. Scale payment gateway transactions, fraud prevention, and banking APIs."
            },
            {
                "title": "Junior React & React Native Mobile Engineer",
                "company_preferred": "Zepto",
                "location": "HSR Layout Startup Corridor, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 10.0,
                "salary_max": 16.5,
                "skills": ["React", "JavaScript", "TypeScript"],
                "desc": "Zepto HSR Sector 4 engineering unit is hiring junior mobile developers to build 10-minute grocery delivery rider and customer apps."
            },
            {
                "title": "Junior QA & SDET Associate (0-1 Yrs)",
                "company_preferred": "Porter",
                "location": "HSR Layout, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 6.5,
                "salary_max": 10.5,
                "skills": ["Python", "SQL", "Docker"],
                "desc": "Porter HSR Layout is looking for entry-level SDETs for logistics order dispatch automation and regression testing."
            },
            {
                "title": "Junior Data Analyst & Growth Operations",
                "company_preferred": "Khatabook",
                "location": "BHIVE Tech Workspace, HSR Sector 6, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 6.0,
                "salary_max": 10.0,
                "skills": ["SQL", "Python", "Analytics"],
                "desc": "Khatabook at BHIVE HSR Layout is seeking junior data analysts to build merchant retention funnels and financial bookkeeping reports."
            },
            {
                "title": "Associate SRE & Cloud Associate",
                "company_preferred": "Jupiter Money",
                "location": "Koramangala, Bengaluru",
                "work_mode": "Hybrid",
                "salary_min": 8.0,
                "salary_max": 13.5,
                "skills": ["AWS", "Docker", "Python", "PostgreSQL"],
                "desc": "Jupiter Money Koramangala is hiring entry-level SREs to monitor banking microservices, AWS Kubernetes clusters, and latency."
            },
            {
                "title": "Junior Backend Developer - Logistics Routing",
                "company_preferred": "Rapido",
                "location": "HSR Layout, Bengaluru",
                "work_mode": "On-site",
                "salary_min": 7.5,
                "salary_max": 12.5,
                "skills": ["Java", "Python", "PostgreSQL"],
                "desc": "Rapido HSR Layout engineering office seeks 0-1 yr developers for ride dispatch algorithms, pricing engines, and geo-tracking."
            }
        ]
    }
]


def seed_fresher_jobs_for_hubs():
    db = SessionLocal()
    now = datetime.utcnow()
    total_added = 0

    try:
        # Pre-fetch skills map
        skills_db = {s.canonical_name.lower(): s for s in db.query(Skill).all()}
        
        # Pre-fetch companies map
        companies_db = {c.name.lower(): c for c in db.query(Company).all()}
        default_company = list(companies_db.values())[0] if companies_db else None

        # Pre-fetch default job source
        default_source = db.query(JobSource).first()

        for spec in HUB_FRESHER_SPECS:
            hub_name = spec["hub"]
            for jdef in spec["jobs"]:
                title = jdef["title"]
                comp_name = jdef["company_preferred"]
                comp = companies_db.get(comp_name.lower(), default_company)
                comp_id = comp.id if comp else None

                # Check if job already exists
                existing = db.query(Job).filter(
                    Job.title == title,
                    Job.location == jdef["location"]
                ).first()

                if existing:
                    # Update experience and status
                    existing.experience_min = 0
                    existing.experience_max = 1
                    existing.status = "active"
                    existing.last_seen_at = now
                    continue

                apply_url = f"https://careers.{comp_name.lower().replace(' ', '')}.com/jobs/{uuid.uuid4().hex[:8]}"

                job_obj = Job(
                    id=str(uuid.uuid4()),
                    company_id=comp_id,
                    source_id=default_source.id if default_source else None,
                    external_id=f"hub_fresh_{uuid.uuid4().hex[:12]}",
                    canonical_url=apply_url,
                    apply_url=apply_url,
                    title=title,
                    description=jdef["desc"],
                    location=jdef["location"],
                    work_mode=jdef["work_mode"],
                    employment_type="Full-time",
                    experience_min=0,
                    experience_max=1,
                    salary_min_lpa=jdef["salary_min"],
                    salary_max_lpa=jdef["salary_max"],
                    status="active",
                    fingerprint=generate_job_fingerprint(comp_name, title, jdef["desc"]),
                    first_seen_at=now - timedelta(hours=random.randint(1, 48)),
                    last_seen_at=now,
                    posted_at=now - timedelta(days=random.randint(0, 3))
                )
                db.add(job_obj)
                db.flush()

                # Attach skills
                for sname in jdef["skills"]:
                    sk = skills_db.get(sname.lower())
                    if sk:
                        js = JobSkill(
                            job_id=job_obj.id,
                            skill_id=sk.id,
                            confidence=1.0,
                            required_or_nice="required"
                        )
                        db.add(js)

                total_added += 1

        db.commit()
        print(f"Successfully seeded {total_added} high-quality fresher jobs across all physical Tech Hubs!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_fresher_jobs_for_hubs()
