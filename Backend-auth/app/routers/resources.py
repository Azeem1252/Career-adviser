from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..routers.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/resources", tags=["Resources"])

RESOURCES = [
    {
        "id": "res_1",
        "title": "High-Impact Resume Engineering",
        "category": "Resume Mastery",
        "description": "Learn how to optimize your resume for ATS and human psychology. Focus on quantifiable achievements.",
        "type": "Article",
        "difficulty": "Intermediate",
        "url": "#"
    },
    {
        "id": "res_2",
        "title": "Strategic Interview Blueprints",
        "category": "Interview Prep",
        "description": "Master the STAR method and psychological anchoring techniques for high-stakes interviews.",
        "type": "Video",
        "difficulty": "Advanced",
        "url": "#"
    },
    {
        "id": "res_3",
        "title": "Networking in the Degital Age",
        "category": "Strategic Networking",
        "description": "Strategies for LinkedIn authority building and warm outreach to decision makers.",
        "type": "Guide",
        "difficulty": "Beginner",
        "url": "#"
    },
    {
        "id": "res_4",
        "title": "Salary Negotiation Frameworks",
        "category": "Career Strategy",
        "description": "Data-driven negotiation tactics to maximize your total compensation package.",
        "type": "Interactive",
        "difficulty": "Advanced",
        "url": "#"
    },
    {
        "id": "res_5",
        "title": "System Design for Tech Interviews",
        "category": "Technical Skill",
        "description": "Fundamental patterns for scalable architecture questions in senior engineering roles.",
        "type": "Course",
        "difficulty": "Advanced",
        "url": "#"
    },
    {
        "id": "res_6",
        "title": "The Art of Professional Storytelling",
        "category": "Personal Branding",
        "description": "Crafting a compelling vertical narrative for your career progression.",
        "type": "Article",
        "difficulty": "Intermediate",
        "url": "#"
    }
]

@router.get("/", response_model=List[Dict])
async def get_resources(current_user: User = Depends(get_current_user)):
    """Get curated career development resources"""
    return RESOURCES
