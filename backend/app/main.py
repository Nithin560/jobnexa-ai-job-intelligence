from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine

# Initialize database tables if not created yet (for development)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


async def daily_8am_scan_scheduler():
    """Runs the real live Bengaluru job scan automatically at 8:00 AM every morning and ensures daily scanning."""
    import asyncio
    from datetime import datetime, timedelta
    from app.tasks.scan import start_background_scan_task, get_last_scan_info

    # On application boot: check if a scan was executed recently. If not, trigger immediately in background.
    try:
        last_info = get_last_scan_info()
        print(f"[Scheduler] Boot check: Last scan status={last_info.get('status')}, time={last_info.get('formatted_time')}")
        # Trigger startup scan non-blocking if catalog is older than 60 mins
        start_background_scan_task(trigger="server_boot_auto", force=False)
    except Exception as e:
        print(f"[Scheduler] Boot scan check warning: {e}")

    while True:
        now = datetime.now()
        target = now.replace(hour=8, minute=0, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        wait_sec = (target - now).total_seconds()
        print(f"[Scheduler] Daily 8:00 AM scanner scheduled. Next run at {target.strftime('%Y-%m-%d %H:%M:%S')} (in {wait_sec/3600:.1f}h)")
        await asyncio.sleep(wait_sec)
        try:
            print("[Scheduler] Triggering scheduled daily 8:00 AM job scan across all Career Websites & Job Portals...")
            start_background_scan_task(trigger="scheduled_daily_8am", force=True)
            print("[Scheduler] Daily 8:00 AM job scan dispatched.")
        except Exception as e:
            print(f"[Scheduler] Error during scheduled scan dispatch: {e}")



def init_default_accounts():
    """Ensure primary admin accounts and demo users always exist on startup."""
    try:
        from app.models.user import User
        from app.core.security import get_password_hash
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            admin_emails = list(set(["nithinvandana26@gmail.com", settings.ADMIN_EMAIL_ID.lower()]))
            for email in admin_emails:
                existing = db.query(User).filter(User.email == email).first()
                if not existing:
                    new_admin = User(
                        email=email,
                        password_hash=get_password_hash("22H71A0560pandu@"),
                        full_name="Nithin Vandana (Admin)",
                        role="admin",
                        is_verified=True
                    )
                    db.add(new_admin)
                    db.commit()
                    print(f"[Init] Created Admin Account: {email}")
                else:
                    if existing.role != "admin" or not existing.is_verified:
                        existing.role = "admin"
                        existing.is_verified = True
                        db.commit()

            # Ensure candidate testing accounts have candidate role (never redirect to admin)
            secondary_user = db.query(User).filter(User.email == "nithinvandana560@gmail.com").first()
            if secondary_user and secondary_user.role != "candidate":
                secondary_user.role = "candidate"
                db.commit()
                print("[Init] Set nithinvandana560@gmail.com to candidate role")
            
            cand = db.query(User).filter(User.email == "nithin@example.com").first()
            if not cand:
                new_cand = User(
                    email="nithin@example.com",
                    password_hash=get_password_hash("NithinPass123!"),
                    full_name="Nithin (Demo Candidate)",
                    role="candidate",
                    is_verified=True
                )
                db.add(new_cand)
                db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"[Init] Admin account check note: {e}")

# Run account check on import/startup
init_default_accounts()

@app.on_event("startup")
async def start_background_scheduler():
    init_default_accounts()
    import asyncio
    asyncio.create_task(daily_8am_scan_scheduler())


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

