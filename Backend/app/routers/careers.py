from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, SavedRun
from ..routers.auth import get_current_user
from ..schemas.ai import CareerMatchRequest, CareerRecommendation, MarketTrendResponse
from ..services.ai_service import ai_service
from typing import List
import json

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.post("/match", response_model=List[CareerRecommendation])
async def match_careers(
    request: CareerMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Match user skills and interests to potential career paths"""
    try:
        recommendations = await ai_service.discover_careers(request.skills, request.interests)
        
        if isinstance(recommendations, dict) and "error" in recommendations:
            error_msg = recommendations.get("error", "Failed to match careers")
            
            if error_msg == "GIBBERISH_INPUT":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide valid skills and interests. Random characters are not allowed."
                )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_msg
            )
        
        saved_run = SavedRun(
            user_id=current_user.id,
            title="Career Match Analysis",
            content=json.dumps(recommendations),
            run_type="career_matching"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        return recommendations
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/market-trends", response_model=MarketTrendResponse)
async def get_market_trends(
    industry: str = "Technology",
    current_user: User = Depends(get_current_user)
):
    """Get AI-driven market trends for a specific industry"""
    try:
        trends = await ai_service.analyze_market_trends(industry)
        
        if isinstance(trends, dict) and "error" in trends:
            error_msg = trends.get("error", "Failed to analyze trends")
            
            if error_msg == "GIBBERISH_INPUT":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid industry name."
                )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_msg
            )
            
        return trends
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
