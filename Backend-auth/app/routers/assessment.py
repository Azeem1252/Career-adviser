from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, CareerAssessment
from ..routers.auth import get_current_user
from ..schemas.ai import AssessmentSubmitRequest, AssessmentResultsResponse, CareerMatch
from ..services.ai_service import ai_service
from typing import List, Dict, Any
from datetime import datetime
import json

router = APIRouter(prefix="/assessment", tags=["Career Assessment"])

@router.post("/start")
async def start_assessment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new career assessment"""
    # Check if user has an incomplete assessment
    existing = db.query(CareerAssessment).filter(
        CareerAssessment.user_id == current_user.id,
        CareerAssessment.completed_at == None
    ).first()
    
    if existing:
        return {
            "assessment_id": existing.id,
            "message": "You have an incomplete assessment. Continue where you left off.",
            "created_at": existing.created_at
        }
    
    # Create new assessment
    assessment = CareerAssessment(
        user_id=current_user.id,
        responses="{}",  # Empty JSON
        assessment_type="initial"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    return {
        "assessment_id": assessment.id,
        "message": "New assessment created. Let's discover your ideal career path!",
        "created_at": assessment.created_at
    }

@router.put("/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: int,
    request: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit completed assessment and trigger AI analysis"""
    assessment = db.query(CareerAssessment).filter(
        CareerAssessment.id == assessment_id,
        CareerAssessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Save responses
    assessment.responses = json.dumps(request.responses)
    assessment.completed_at = datetime.now()
    
    # Trigger AI analysis
    try:
        results = await ai_service.analyze_career_assessment(request.responses)
        assessment.results = json.dumps(results)
    except Exception as e:
        print(f"AI analysis error: {e}")
        assessment.results = json.dumps({"error": "Analysis failed, please try again"})
    
    db.commit()
    db.refresh(assessment)
    
    return {
        "assessment_id": assessment.id,
        "message": "Assessment completed! Analyzing your responses...",
        "completed_at": assessment.completed_at
    }

@router.get("/{assessment_id}/results", response_model=AssessmentResultsResponse)
async def get_assessment_results(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get career recommendations from completed assessment"""
    assessment = db.query(CareerAssessment).filter(
        CareerAssessment.id == assessment_id,
        CareerAssessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.completed_at:
        raise HTTPException(status_code=400, detail="Assessment not yet completed")
    
    if not assessment.results:
        raise HTTPException(status_code=400, detail="Results not available")
    
    results = json.loads(assessment.results)
    
    return {
        "assessment_id": assessment.id,
        "career_matches": results.get("career_matches", []),
        "overall_clarity_score": results.get("overall_clarity_score", 0),
        "skills_breakdown": results.get("skills_breakdown", {}),
        "interests_alignment": results.get("interests_alignment", {}),
        "values_match": results.get("values_match", {}),
        "completed_at": assessment.completed_at
    }

@router.get("/latest")
async def get_latest_assessment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's most recent assessment"""
    assessment = db.query(CareerAssessment).filter(
        CareerAssessment.user_id == current_user.id
    ).order_by(CareerAssessment.created_at.desc()).first()
    
    if not assessment:
        return {"message": "No assessments found. Start your career discovery journey!"}
    
    return {
        "assessment_id": assessment.id,
        "completed": assessment.completed_at is not None,
        "completed_at": assessment.completed_at,
        "created_at": assessment.created_at,
        "has_results": assessment.results is not None
    }

@router.get("/history")
async def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all past assessments"""
    assessments = db.query(CareerAssessment).filter(
        CareerAssessment.user_id == current_user.id
    ).order_by(CareerAssessment.created_at.desc()).all()
    
    return [
        {
            "assessment_id": a.id,
            "assessment_type": a.assessment_type,
            "completed": a.completed_at is not None,
            "completed_at": a.completed_at,
            "created_at": a.created_at
        }
        for a in assessments
    ]
