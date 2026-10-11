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
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


async def daily_8am_scan_scheduler():
    """Runs the real live Bengaluru job scan automatically at 8:00 AM every morning."""
    import asyncio
    from datetime import datetime, timedelta
    while True:
        now = datetime.now()
        target = now.replace(hour=8, minute=0, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        wait_sec = (target - now).total_seconds()
        print(f"[Scheduler] Daily 8:00 AM scanner scheduled. Next run at {target.strftime('%Y-%m-%d %H:%M:%S')} (in {wait_sec/3600:.1f}h)")
        await asyncio.sleep(wait_sec)
        try:
            print("[Scheduler] Triggering scheduled daily 8:00 AM job scan...")
            from app.tasks.scan import run_daily_scan
            run_daily_scan(scope="bengaluru", trigger="scheduled_daily_8am")
            print("[Scheduler] Daily 8:00 AM job scan completed successfully.")
        except Exception as e:
            print(f"[Scheduler] Error during scheduled scan: {e}")


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

