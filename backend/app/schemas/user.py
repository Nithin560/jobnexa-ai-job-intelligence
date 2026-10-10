from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: str = Field(default="candidate")  # "candidate" or "admin"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    email: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime
    disabled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
