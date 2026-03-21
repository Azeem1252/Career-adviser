from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    link: Optional[str] = None
    technologies: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    is_verified: bool
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    skills: Optional[List[str]] = None
    xp: int = 0
    streak: int = 0
    progress: int = 0
    profile_summary: Optional[str] = None
    avatar_url: Optional[str] = None
    career_preferences: Optional[dict] = None
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmailRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str
