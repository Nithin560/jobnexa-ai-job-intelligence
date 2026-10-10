import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


def get_engine():
    db_url = settings.get_database_url()
    if os.getenv("TESTING") == "True" or "sqlite" in db_url:
        return create_engine(db_url, connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(db_url, pool_pre_ping=True)
        # Test connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception:
        # Fallback to local SQLite file for zero-dependency local testing/demo if Postgres is offline or unauthenticated
        fallback_url = "sqlite:///./job_intelligence_local.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing database session to API route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
