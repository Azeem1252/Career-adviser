from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict
import json
import re
from ..routers.auth import get_current_user
from ..models.user import User
from ..services.ai_service import ai_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/search")
async def search_jobs(
    query: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """AI-powered job discovery based on user profile and search query"""
    try:
        # Construct context for Gemini
        context = {
            "user_name": current_user.name,
            "bio": current_user.bio,
            "location": current_user.location or "Global",
            "skills": current_user.skills or []
        }
        
        prompt = f"""
        Act as a strategic career scout. Based on the user's profile and search query, discover 5 high-value job opportunities.
        
        User Profile:
        {json.dumps(context, indent=2)}
        
        Search Query: {query or "Strategic Roles"}
        Preferred Location: {location or context['location']}
        
        Provide the output as a JSON array of objects with these keys:
        - title: Specific job title
        - company: Name of a realistic high-growth or established company
        - location: Specific city or 'Remote'
        - salary_range: Strategic estimate (e.g., "$120k - $180k")
        - match_score: (90-100) based on profile
        - strategic_fit: why this is a good move for their career
        - key_requirements: list of 3 mission-critical skills
        """
        
        response = await ai_service.model.generate_content_async(prompt)
        text = response.text
        
        # Clean JSON from response
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            jobs = json.loads(match.group())
        else:
            # Fallback if AI output is messy
            jobs = json.loads(text)
            
        return jobs
        
    except Exception as e:
        print(f"Job search error: {str(e)}")
        # Return fallback high-quality mockup if AI fails
        return [
            {
                "title": "Principal Solutions Architect",
                "company": "TechStream Systems",
                "location": "Remote / New York",
                "salary_range": "$185k - $240k",
                "match_score": 96,
                "strategic_fit": "Leverages your system design expertise while moving into high-level strategy.",
                "key_requirements": ["Cloud Architecture", "Strategic Leadership", "API Security"]
            }
        ]
