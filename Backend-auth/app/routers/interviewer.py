from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models.user import User, SavedRun
from ..routers.auth import get_current_user
from ..services.ai_service import ai_service
from typing import List, Optional
import json

router = APIRouter(prefix="/interviewer", tags=["Interviewer"])

class InterviewQuestionsRequest(BaseModel):
    job_title: str
    difficulty: Optional[str] = "intermediate"
    count: Optional[int] = 5

class InterviewEvaluationRequest(BaseModel):
    question: str
    answer: str
    job_title: Optional[str] = ""

@router.post("/questions")
async def generate_mock_questions(
    request: InterviewQuestionsRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate mock interview questions for a specific role"""
    try:
        data = await ai_service.generate_interview_questions(
            job_title=request.job_title,
            level=request.difficulty,
            count=request.count
        )
        
        if isinstance(data, dict) and data.get("error") == "GIBBERISH_INPUT":
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide a valid job title."
            )
            
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/evaluate")
async def evaluate_answer(
    request: InterviewEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Evaluate an interview answer and provide feedback"""
    try:
        evaluation = await ai_service.evaluate_interview_answer(
            question=request.question,
            answer=request.answer,
            job_title=request.job_title
        )
        
        if isinstance(evaluation, dict) and evaluation.get("error") == "GIBBERISH_INPUT":
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=evaluation.get("message", "Please provide a valid answer.")
            )
        
        saved_run = SavedRun(
            user_id=current_user.id,
            title=f"Interview Feedback: {request.question[:30]}...",
            content=json.dumps(evaluation),
            run_type="interview_feedback"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        return evaluation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
