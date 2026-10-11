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
    full_name: Optional[str] = None
    is_verified: bool = False

    class Config:
        from_attributes = True


class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="register")  # "register" or "login"


class SendOTPResponse(BaseModel):
    status: str = "success"
    message: str
    email: str
    expires_in_seconds: int = 600
    dev_otp: Optional[str] = None  # Included in development when SMTP is pending


class VerifyRegisterRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=8)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: str = Field(default="candidate")  # "candidate" or "admin"


class VerifyOTPLoginRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=8)

