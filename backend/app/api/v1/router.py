from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, jobs, candidate, admin

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs Search & Detail"])
api_router.include_router(candidate.router, prefix="/candidate", tags=["Candidate Profile & Matching"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations & Analytics"])
