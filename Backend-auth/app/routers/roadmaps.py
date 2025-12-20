from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..database import get_db
from ..models.user import User, SavedRun, RoadmapProgress
from ..routers.auth import get_current_user
from ..schemas.ai import RoadmapRequest, RoadmapResponse
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
        
        # Save to history
        saved_run = SavedRun(
            user_id=current_user.id,
            title=f"Roadmap: {request.target_career}",
            content=json.dumps(roadmap),
            run_type="career_roadmap"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        return roadmap
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
        
        # Calculate completion stats
        total_stages = len(roadmap_data.get('stages', []))
        completed_stages = sum(1 for p in progress_records if p.completed)
        completion_percentage = (completed_stages / total_stages * 100) if total_stages > 0 else 0
        
        result.append({
            "id": run.id,
            "title": run.title,
            "roadmap": roadmap_data,
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
            "completed_at": p.completed_at
        }
        for p in progress_records
    }
    
    return progress_map

@router.put("/{roadmap_id}/stages/{stage_index}/notes")
async def update_stage_notes(
    roadmap_id: int,
    stage_index: int,
    notes: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notes for a specific stage"""
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
