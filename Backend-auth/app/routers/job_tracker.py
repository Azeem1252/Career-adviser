from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, JobApplication
from .auth import get_current_user
from ..schemas.job_tracker import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/jobs-tracker", tags=["Job Tracker"])

@router.post("/", response_model=JobApplicationResponse)
async def create_job_application(
    application: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_application = JobApplication(
        **application.dict(),
        user_id=current_user.id
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/", response_model=List[JobApplicationResponse])
async def get_job_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobApplicationResponse)
async def get_job_application(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(
        JobApplication.id == job_id,
        JobApplication.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return application

@router.put("/{job_id}", response_model=JobApplicationResponse)
async def update_job_application(
    job_id: int,
    application_update: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_application = db.query(JobApplication).filter(
        JobApplication.id == job_id,
        JobApplication.user_id == current_user.id
    ).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Job application not found")
    
    update_data = application_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_application, key, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_application(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_application = db.query(JobApplication).filter(
        JobApplication.id == job_id,
        JobApplication.user_id == current_user.id
    ).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Job application not found")
    
    db.delete(db_application)
    db.commit()
    return None
