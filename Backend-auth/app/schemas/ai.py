from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Analyzer Schemas
class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_job: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    overall_score: int
    ats_score: Optional[int] = None
    technical_score: int
    market_alignment: int
    impact_score: Optional[int] = None
    format_score: Optional[int] = None
    keyword_density: Optional[int] = None
    executive_summary: Optional[str] = None
    strengths: List[str]
    gaps: List[str]
    recommendations: List[str]
    keyword_optimized: List[str]
    formatting_suggestions: Optional[List[str]] = None
    ats_tips: Optional[List[str]] = None
    
    class Config:
        extra = "allow"  # Allow additional fields

class CoverLetterRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    job_description: Optional[str] = None
    tone: str = "Architect"
    key_accomplishments: Optional[str] = None

class CoverLetterResponse(BaseModel):
    content: str

# Roadmap Schemas
class RoadmapStage(BaseModel):
    name: str
    description: str
    skills: List[str]
    resources: List[str]

class RoadmapRequest(BaseModel):
    current_profile: str
    target_career: str

class RoadmapResponse(BaseModel):
    title: str
    difficulty: str
    duration: str
    stages: List[RoadmapStage]

# Interviewer Schemas
class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str

class InterviewEvaluateRequest(BaseModel):
    question: str
    answer: str

class InterviewEvaluationResponse(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]
    sample_better_answer: str

# Career Schemas
class CareerRecommendation(BaseModel):
    title: str
    match_percentage: int
    reason: str
    growth_potential: str

class CareerMatchRequest(BaseModel):
    skills: List[str]
    interests: List[str]
    experience_level: str

# Market Trend Schemas
class SkillTrend(BaseModel):
    name: str
    growth: str
    demand_index: str

class MarketTrendResponse(BaseModel):
    industry: str
    growth_rate: str
    top_skills: List[SkillTrend]
    remote_availability: str
    salary_range: str

# Career Assessment Schemas
class AssessmentResponse(BaseModel):
    skills: List[str]
    skill_levels: Dict[str, int]  # skill: proficiency (1-5)
    interests: List[str]
    values: List[str]
    experience_level: str
    education: str
    work_style: Dict[str, Any]
    goals: Dict[str, str]  # short_term, long_term
    preferences: Dict[str, Any]

class CareerMatch(BaseModel):
    career_title: str
    match_percentage: int
    description: str
    reasons: List[str]
    required_skills: List[str]
    skill_gaps: List[str]
    salary_range: str
    growth_outlook: str
    work_life_balance: str
    day_to_day: List[str]
    action_plan: Dict[str, List[str]]  # immediate, short_term, long_term

class AssessmentSubmitRequest(BaseModel):
    responses: Dict[str, Any]

class AssessmentResultsResponse(BaseModel):
    assessment_id: int
    career_matches: List[CareerMatch]
    overall_clarity_score: int
    skills_breakdown: Dict[str, Any]
    interests_alignment: Dict[str, Any]
    values_match: Dict[str, Any]
    completed_at: datetime
