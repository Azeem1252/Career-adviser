from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..database import get_db
from ..models.user import User, SavedRun, RoadmapProgress
from ..routers.auth import get_current_user
from ..schemas.ai import RoadmapRequest, RoadmapResponse, TacticalAdviceResponse
from ..services.ai_service import ai_service
from typing import Optional
from datetime import datetime
import json

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    request: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a vocational roadmap for a target career"""
    try:
        roadmap = await ai_service.generate_career_roadmap(request.current_profile, request.target_career)
        
        # Check if AI service returned an error
        if "error" in roadmap:
            error_type = roadmap.get("error_type", "general_error")
            error_msg = roadmap.get("error", "Failed to generate roadmap")
            
            if error_type == "rate_limit":
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_msg
                )
            elif error_type == "auth_error":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="AI service configuration error. Please contact support."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_msg
                )
        
        # Save to history
        saved_run = SavedRun(
            user_id=current_user.id,
            title=roadmap.get("title", f"Roadmap: {request.target_career}"),
            content=json.dumps(roadmap),
            run_type="career_roadmap"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        # Return flattened roadmap with ID
        return {
            "id": saved_run.id,
            "title": roadmap.get("title", f"Roadmap: {request.target_career}"),
            "difficulty": roadmap.get("difficulty", "Intermediate"),
            "duration": roadmap.get("duration", "N/A"),
            "stages": roadmap.get("stages", []),
            "target_career": request.target_career,
            "created_at": saved_run.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/")
async def get_my_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get previously generated roadmaps with progress"""
    runs = db.query(SavedRun).filter(
        SavedRun.user_id == current_user.id,
        SavedRun.run_type == "career_roadmap"
    ).order_by(SavedRun.created_at.desc()).all()
    
    result = []
    for run in runs:
        roadmap_data = json.loads(run.content)
        
        # Get progress for this roadmap
        progress_records = db.query(RoadmapProgress).filter(
            RoadmapProgress.roadmap_id == run.id,
            RoadmapProgress.user_id == current_user.id
        ).all()
        
        # Add progress info to stages
        stages = roadmap_data.get('stages', [])
        for i, stage in enumerate(stages):
            # Map progress if exists
            p = next((p for p in progress_records if p.stage_index == i), None)
            stage["completed"] = p.completed if p else False
            stage["notes"] = p.notes if p else ""
            stage["completed_skills"] = p.completed_skills if p else []
            stage["completed_resources"] = p.completed_resources if p else []
            
            # Ensure title instead of name (migration support)
            if "name" in stage and "title" not in stage:
                stage["title"] = stage["name"]
        
        # Calculate completion stats for the summary block
        total_stages = len(stages)
        completed_stages = sum(1 for s in stages if s.get("completed"))
        completion_percentage = (completed_stages / total_stages * 100) if total_stages > 0 else 0
        
        result.append({
            "id": run.id,
            "title": run.title,
            "target_career": roadmap_data.get("target_career", ""),
            "difficulty": roadmap_data.get("difficulty", "Intermediate"),
            "duration": roadmap_data.get("duration", "N/A"),
            "stages": stages,
            "created_at": run.created_at,
            "progress": {
                "total_stages": total_stages,
                "completed_stages": completed_stages,
                "completion_percentage": round(completion_percentage, 1)
            }
        })
    
    return result

@router.post("/{roadmap_id}/stages/{stage_index}/toggle")
async def toggle_stage_completion(
    roadmap_id: int,
    stage_index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completion status of a specific stage"""
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap:
        print(f"Roadmap not found: id={roadmap_id}, user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Check if progress record exists
    progress = db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id,
        RoadmapProgress.stage_index == stage_index
    ).first()
    
    if progress:
        # Toggle completion
        progress.completed = not progress.completed
        progress.completed_at = datetime.now() if progress.completed else None
        progress.updated_at = datetime.now()
    else:
        # Create new progress record
        progress = RoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap_id,
            stage_index=stage_index,
            completed=True,
            completed_at=datetime.now()
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    
    return {
        "stage_index": stage_index,
        "completed": progress.completed,
        "completed_at": progress.completed_at
    }

@router.post("/{roadmap_id}/stages/{stage_index}/skills/toggle")
async def toggle_skill_completion(
    roadmap_id: int,
    stage_index: int,
    request_body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completion status of a specific skill within a stage"""
    skill_name = request_body.get("skill_name")
    if not skill_name:
        raise HTTPException(status_code=400, detail="Skill name is required")
        
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    # Get or create progress record
    progress = db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id,
        RoadmapProgress.stage_index == stage_index
    ).first()
    
    if not progress:
        progress = RoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap_id,
            stage_index=stage_index,
            completed_skills=[]
        )
        db.add(progress)
        
    # Ensure completed_skills is a list (use a copy to trigger SQLAlchemy dirty flag)
    current_skills = list(progress.completed_skills or [])
        
    if skill_name in current_skills:
        current_skills.remove(skill_name)
    else:
        current_skills.append(skill_name)
        
    progress.completed_skills = current_skills
    progress.updated_at = datetime.now()
    
    # Auto-complete stage if all skills are done? 
    # For now, keep it manual but update timestamp
    
    db.commit()
    db.refresh(progress)
    
    return {
        "stage_index": stage_index,
        "completed_skills": progress.completed_skills
    }

@router.post("/{roadmap_id}/stages/{stage_index}/resources/toggle")
async def toggle_resource_completion(
    roadmap_id: int,
    stage_index: int,
    request_body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completion status of a specific resource within a stage"""
    resource_name = request_body.get("resource_name")
    if not resource_name:
        raise HTTPException(status_code=400, detail="Resource name is required")
        
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    # Get or create progress record
    progress = db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id,
        RoadmapProgress.stage_index == stage_index
    ).first()
    
    if not progress:
        progress = RoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap_id,
            stage_index=stage_index,
            completed_resources=[]
        )
        db.add(progress)
        
    # Ensure completed_resources is a list (use a copy to trigger SQLAlchemy dirty flag)
    current_resources = list(progress.completed_resources or [])
        
    if resource_name in current_resources:
        current_resources.remove(resource_name)
    else:
        current_resources.append(resource_name)
        
    progress.completed_resources = current_resources
    progress.updated_at = datetime.now()
    
    db.commit()
    db.refresh(progress)
    
    return {
        "stage_index": stage_index,
        "completed_resources": progress.completed_resources
    }

@router.get("/{roadmap_id}/progress")
async def get_roadmap_progress(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress for a specific roadmap"""
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Get all progress records
    progress_records = db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id
    ).all()
    
    # Build progress map
    progress_map = {
        p.stage_index: {
            "completed": p.completed,
            "notes": p.notes,
            "completed_skills": p.completed_skills or [],
            "completed_resources": p.completed_resources or [],
            "completed_at": p.completed_at
        }
        for p in progress_records
    }
    
    return progress_map

@router.put("/{roadmap_id}/stages/{stage_index}/notes")
async def update_stage_notes(
    roadmap_id: int,
    stage_index: int,
    request_body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notes for a specific stage"""
    notes = request_body.get("notes", "")
    
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Get or create progress record
    progress = db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id,
        RoadmapProgress.stage_index == stage_index
    ).first()
    
    if progress:
        progress.notes = notes
        progress.updated_at = datetime.now()
    else:
        progress = RoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap_id,
            stage_index=stage_index,
            notes=notes
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    
    return {"stage_index": stage_index, "notes": progress.notes}

@router.post("/{roadmap_id}/stages/{stage_index}/tactics", response_model=TacticalAdviceResponse)
async def get_tactical_advice(
    roadmap_id: int,
    stage_index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate tactical advice for a specific stage"""
    # Verify roadmap belongs to user
    roadmap_record = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id
    ).first()
    
    if not roadmap_record:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    roadmap_data = json.loads(roadmap_record.content)
    stages = roadmap_data.get("stages", [])
    
    if stage_index < 0 or stage_index >= len(stages):
        raise HTTPException(status_code=400, detail="Invalid stage index")
        
    stage = stages[stage_index]
    
    tactics = await ai_service.generate_tactical_advice(
        current_profile=current_user.profile_summary or "Professional",
        target_career=roadmap_data.get("target_career", "this field"),
        stage_title=stage.get("title", ""),
        stage_description=stage.get("description", "")
    )
    
    return tactics

@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a roadmap and all associated progress"""
    # Verify roadmap belongs to user
    roadmap = db.query(SavedRun).filter(
        SavedRun.id == roadmap_id,
        SavedRun.user_id == current_user.id,
        SavedRun.run_type == "career_roadmap"
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Delete associated progress records
    db.query(RoadmapProgress).filter(
        RoadmapProgress.roadmap_id == roadmap_id,
        RoadmapProgress.user_id == current_user.id
    ).delete()
    
    # Delete the roadmap
    db.delete(roadmap)
    db.commit()
    
    return {"message": "Roadmap deleted successfully", "id": roadmap_id}
