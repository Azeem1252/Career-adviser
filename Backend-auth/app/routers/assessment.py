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
    """Start a new assessment or return the current incomplete one"""
    existing = db.query(CareerAssessment).filter(
        CareerAssessment.user_id == current_user.id,
        CareerAssessment.completed_at == None
    ).first()
    
    if existing:
        return {
            "assessment_id": existing.id,
            "message": "Continuing existing diagnostic session.",
            "created_at": existing.created_at
        }
    
    assessment = CareerAssessment(
        user_id=current_user.id,
        responses="{}",
        assessment_type="full_diagnostic"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    return {
        "assessment_id": assessment.id,
        "message": "New diagnostic protocol initialized. Let's map your career trajectory.",
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
    
    assessment.responses = json.dumps(request.responses)
    assessment.completed_at = datetime.now()
    
    try:
        results = await ai_service.analyze_career_assessment(request.responses)
        assessment.results = json.dumps(results)
        
        matches = results.get("career_matches", [])
        if matches:
            top_matches = []
            for m in matches[:3]:
                top_matches.append({
                    "title": m.get("career_title"),
                    "match": m.get("match_percentage"),
                    "source": "assessment"
                })
                current_user.career_preferences = {
                    **(current_user.career_preferences or {}),
                    "top_recommendations": top_matches,
                    "last_assessment_id": assessment.id
                }
                db.add(current_user)
            
    except Exception as e:
        print(f"AI analysis error: {e}")
        assessment.results = json.dumps({"error": "Analysis failed, please try again"})
    
    db.commit()
    db.refresh(assessment)
    
    return {
        "assessment_id": assessment.id,
        "message": "Assessment completed! Your career trajectory has been updated.",
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
    """Get user's most recent assessment with full profile insights"""
    try:
        assessment = db.query(CareerAssessment).filter(
            CareerAssessment.user_id == current_user.id,
            CareerAssessment.completed_at != None
        ).order_by(CareerAssessment.created_at.desc()).first()
        
        if not assessment:
            return None
        
        try:
            if assessment.results is None:
                results = {}
            elif isinstance(assessment.results, dict):
                results = assessment.results
            elif isinstance(assessment.results, str):
                results = json.loads(assessment.results)
            else:
                results = {}
        except Exception:
            results = {}
        
        matches = results.get("career_matches", [])
        recommended_roles = []
        for m in matches:
            try:
                growth_outlook = m.get("growth_outlook", "Medium")
                demand = "Medium"
                if growth_outlook and isinstance(growth_outlook, str):
                    parts = growth_outlook.split(' ')
                    demand = parts[0] if parts else "Medium"
                
                recommended_roles.append({
                    "title": m.get("career_title"),
                    "match": m.get("match_percentage"),
                    "salary": m.get("salary_range", "N/A"),
                    "demand": demand
                })
            except Exception:
                pass
        
        skills_data = results.get("skills_breakdown", {})
        strengths = skills_data.get("top_strengths", [])
        
        next_steps = []
        if matches:
            try:
                action_plan = matches[0].get("action_plan", {})
                next_steps = action_plan.get("immediate", []) if isinstance(action_plan, dict) else []
            except Exception:
                pass
        
        user_skills = current_user.skills or []
        technical_score = 0
        try:
            technical_score = int(skills_data.get("technical_strength", min(len(user_skills) * 15, 95)))
        except (ValueError, TypeError):
            technical_score = min(len(user_skills) * 15, 95)
            
        soft_skills_score = 0
        try:
            soft_skills_score = int(skills_data.get("soft_skills_strength", 78))
        except (ValueError, TypeError):
            soft_skills_score = 78
            
        market_fit_score = 0
        try:
            market_fit_score = int(results.get("interests_alignment", {}).get("career_fit_score", 85))
        except (ValueError, TypeError, AttributeError):
            market_fit_score = 85
            
        overall_score = 0
        try:
            overall_score = int(results.get("overall_clarity_score", round((technical_score + soft_skills_score + market_fit_score) / 3)))
        except (ValueError, TypeError):
            overall_score = round((technical_score + soft_skills_score + market_fit_score) / 3)
        
        return {
            "assessment_id": assessment.id,
            "completed": True,
            "completed_at": assessment.completed_at,
            "created_at": assessment.created_at,
            "recommended_roles": recommended_roles,
            "strengths": strengths,
            "next_steps": next_steps,
            "scores": {
                "technical_score": technical_score,
                "soft_skills_score": soft_skills_score,
                "market_fit_score": market_fit_score,
                "overall_score": overall_score
            },
            "results": results
        }
    except Exception as e:
        import traceback
        print(f"ERROR: General failure in get_latest_assessment: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not retrieve assessment results: {str(e)}"
        )

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
