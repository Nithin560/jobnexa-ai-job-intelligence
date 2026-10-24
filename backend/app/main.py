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


@app.on_event("startup")
async def start_background_scheduler():
    import asyncio
    asyncio.create_task(daily_8am_scan_scheduler())


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

