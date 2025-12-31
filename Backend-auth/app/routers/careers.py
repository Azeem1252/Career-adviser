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
        # Construct current profile for AI
        current_profile = f"Skills: {', '.join(request.skills)}. Interests: {', '.join(request.interests)}. Experience Level: {request.experience_level}"
        
        # We'll use a specific prompt for matching
        prompt = f"""
        Based on the following profile, recommend 3 career paths.
        Profile: {current_profile}
        
        Provide the output as a JSON array of objects with keys:
        - title: Career Title
        - match_percentage: (0-100)
        - reason: Brief reason why it matches the skills/interests
        - growth_potential: (High/Medium/Low)
        """
        
        response = ai_service.client.models.generate_content(
            model=ai_service.model_name,
            contents=prompt
        )
        text = response.text
        import re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            recommendations = json.loads(match.group())
        else:
            recommendations = json.loads(text)
        
        # Save matching result
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
        prompt = f"""
        Analyze current market trends for the {industry} industry.
        Provide a detailed report in JSON format with exactly these keys:
        - industry: The name of the industry
        - growth_rate: (e.g., "+15% YoY")
        - top_skills: List of 3 objects with keys [name, growth, demand_index (0-100)]
        - remote_availability: (High/Medium/Low)
        - salary_range: (e.g., "$120k - $300k")
        """
        
        response = ai_service.client.models.generate_content(
            model=ai_service.model_name,
            contents=prompt
        )
        text = response.text
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            trends = json.loads(match.group())
        else:
            trends = json.loads(text)
            
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
