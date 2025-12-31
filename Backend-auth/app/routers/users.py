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
    career_preferences: Optional[dict] = None

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/onboard", response_model=UserResponse)
async def complete_onboarding(
    preferences: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark onboarding as complete and save initial preferences"""
    current_user.onboarded = True
    current_user.career_preferences = preferences
    db.commit()
    db.refresh(current_user)
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
    if update.career_preferences is not None: current_user.career_preferences = update.career_preferences
        
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


class NotificationPreferences(BaseModel):
    email: Optional[bool] = None
    push: Optional[bool] = None
    weekly: Optional[bool] = None


@router.put("/notifications")
async def update_notification_preferences(
    prefs: NotificationPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences"""
    if prefs.email is not None:
        current_user.notification_email = prefs.email
    if prefs.push is not None:
        current_user.notification_push = prefs.push
    if prefs.weekly is not None:
        current_user.notification_weekly = prefs.weekly
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "email": current_user.notification_email,
        "push": current_user.notification_push,
        "weekly": current_user.notification_weekly
    }


@router.get("/notifications")
async def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get current notification preferences"""
    return {
        "email": current_user.notification_email if current_user.notification_email is not None else True,
        "push": current_user.notification_push if current_user.notification_push is not None else False,
        "weekly": current_user.notification_weekly if current_user.notification_weekly is not None else True
    }


@router.get("/export")
async def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export all user data as CSV"""
    from ..models.user import CareerAssessment, JobApplication
    from fastapi.responses import StreamingResponse
    from fastapi import HTTPException
    import csv
    import io
    from datetime import datetime
    
    try:
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Profile Section
        output.write("=== Profile ===\n")
        writer.writerow(["Field", "Value"])
        writer.writerow(["Name", current_user.name or ""])
        writer.writerow(["Email", current_user.email or ""])
        writer.writerow(["Bio", current_user.bio or ""])
        writer.writerow(["Location", current_user.location or ""])
        writer.writerow(["LinkedIn", current_user.linkedin or ""])
        writer.writerow(["GitHub", current_user.github or ""])
        writer.writerow(["Website", current_user.website or ""])
        
        # Handle skills safely
        skills_str = ""
        if current_user.skills:
            if isinstance(current_user.skills, list):
                skills_str = ", ".join(current_user.skills)
            else:
                skills_str = str(current_user.skills)
        writer.writerow(["Skills", skills_str])
        
        writer.writerow(["Member Since", str(current_user.created_at) if current_user.created_at else ""])
        output.write("\n")
        
        # Projects Section
        output.write("=== Projects ===\n")
        writer.writerow(["Title", "Description", "Link", "Technologies", "Created At"])
        for p in current_user.projects:
            # technologies is stored as String/Text, not list
            tech_str = p.technologies or ""
            writer.writerow([
                p.title or "",
                p.description or "",
                p.link or "",
                tech_str,
                str(p.created_at) if p.created_at else ""
            ])
        output.write("\n")
        
        # Certifications Section
        output.write("=== Certifications ===\n")
        writer.writerow(["Name", "Issuing Organization", "Credential ID", "Credential URL", "Created At"])
        for c in current_user.certifications:
            writer.writerow([
                c.name or "",
                c.issuing_organization or "",
                c.credential_id or "",
                c.credential_url or "",
                str(c.created_at) if c.created_at else ""
            ])
        output.write("\n")
        
        # Assessments Section
        assessments = db.query(CareerAssessment).filter(
            CareerAssessment.user_id == current_user.id
        ).all()
        output.write("=== Career Assessments ===\n")
        writer.writerow(["Assessment Type", "Completed At"])
        for a in assessments:
            writer.writerow([
                a.assessment_type or "initial",
                str(a.completed_at) if a.completed_at else ""
            ])
        output.write("\n")
        
        # Job Applications Section
        job_apps = db.query(JobApplication).filter(
            JobApplication.user_id == current_user.id
        ).all()
        output.write("=== Job Applications ===\n")
        writer.writerow(["Company", "Job Title", "Status", "Location", "Salary", "Applied At", "Job URL", "Notes"])
        for j in job_apps:
            writer.writerow([
                j.company_name or "",
                j.job_title or "",
                j.status or "",
                j.location or "",
                j.salary_expectation or "",
                str(j.applied_at) if j.applied_at else "",
                j.job_url or "",
                j.notes or ""
            ])
        
        # Return as CSV file download
        filename = f"career-adviser-data-{datetime.now().strftime('%Y-%m-%d')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        import logging
        logging.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate data export. Potential model mismatch detected.")

