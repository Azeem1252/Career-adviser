from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime

class JobApplicationBase(BaseModel):
    company_name: str
    job_title: str
    status: str = "Wishlist"
    job_url: Optional[str] = None
    notes: Optional[str] = None
    salary_expectation: Optional[str] = None
    location: Optional[str] = None
    applied_at: Optional[datetime] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    salary_expectation: Optional[str] = None
    location: Optional[str] = None
    applied_at: Optional[datetime] = None

class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
