from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, SavedRun, Project, Certification
from .auth import get_current_user
from ..schemas.user import UserResponse, ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import shutil
import os
import time

router = APIRouter(prefix="/users", tags=["Users"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    skills: Optional[List[str]] = None

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update.name is not None: current_user.name = update.name
    if update.bio is not None: current_user.bio = update.bio
    if update.location is not None: current_user.location = update.location
    if update.linkedin is not None: current_user.linkedin = update.linkedin
    if update.github is not None: current_user.github = update.github
    if update.website is not None: current_user.website = update.website
    if update.skills is not None: current_user.skills = update.skills
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_runs = db.query(SavedRun).filter(SavedRun.user_id == current_user.id).count()
    total_analyses = db.query(SavedRun).filter(SavedRun.user_id == current_user.id, SavedRun.run_type == "resume_analysis").count()
    total_roadmaps = db.query(SavedRun).filter(SavedRun.user_id == current_user.id, SavedRun.run_type == "roadmap_generation").count()
    total_projects = db.query(Project).filter(Project.user_id == current_user.id).count()
    total_certs = db.query(Certification).filter(Certification.user_id == current_user.id).count()
    
    return {
        "total_analyses": total_analyses,
        "total_roadmaps": total_roadmaps,
        "total_projects": total_projects,
        "total_certifications": total_certs,
        "total_activity": total_runs
    }

# Projects Endpoints
@router.post("/projects", response_model=ProjectResponse)
async def add_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = Project(**project.dict(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

# Certifications Endpoints
@router.post("/certifications", response_model=CertificationResponse)
async def add_certification(
    cert: CertificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_cert = Certification(**cert.dict(), user_id=current_user.id)
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.delete("/certifications/{cert_id}")
async def delete_certification(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == current_user.id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(db_cert)
    db.commit()
    return {"message": "Certification deleted"}

@router.post("/avatar")
async def upload_avatar(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Create unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"user_{current_user.id}_{int(time.time())}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Generate URL (use relative path + timestamp for cache busting)
    avatar_url = f"http://localhost:8000/uploads/{filename}"
    
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)
    return {"avatar_url": avatar_url}

@router.delete("/account")
async def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}
