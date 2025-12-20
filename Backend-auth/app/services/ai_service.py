from fastapi import HTTPException
import google.generativeai as genai
from typing import Dict, Any, List
import json
import re
from ..core.config import settings

class AIService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.AI_MODEL)
        else:
            self.model = None

    def _clean_json_response(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON from AI response"""
        # Remove markdown code blocks if present
        cleaned_text = re.sub(r'```json\s*|\s*```', '', text).strip()
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            # Fallback for minor formatting issues
            try:
                # Try to find the first '{' and last '}'
                start = cleaned_text.find('{')
                end = cleaned_text.rfind('}') + 1
                if start != -1 and end != 0:
                    return json.loads(cleaned_text[start:end])
            except:
                pass
            return {"error": "Failed to parse AI response", "raw": text}

    async def analyze_resume(self, resume_text: str, target_job: str = None) -> Dict[str, Any]:
        """Analyze resume for gaps and improvements"""
        if not self.model:
            return {"error": "AI service not configured"}

        prompt = f"""
        Perform a comprehensive professional resume analysis.
        {f"Target Job/Role: {target_job}" if target_job else "Provide a general career analysis across multiple dimensions."}
        
        Analyze the following resume and provide detailed feedback in JSON format:
        
        {{
            "overall_score": 85,
            "ats_score": 90,
            "technical_score": 80,
            "market_alignment": 85,
            "impact_score": 75,
            "format_score": 88,
            "keyword_density": 70,
            
            "executive_summary": "A brief 2-3 sentence overview of the candidate's profile and readiness",
            
            "strengths": [
                "Specific strength 1 with evidence from resume",
                "Specific strength 2 with evidence from resume",
                "At least 4-6 strengths"
            ],
            
            "gaps": [
                "Specific gap 1 with explanation of why it matters",
                "Specific gap 2 with explanation of why it matters",
                "At least 3-5 gaps"
            ],
            
            "recommendations": [
                "Actionable recommendation 1 with specific steps",
                "Actionable recommendation 2 with specific steps",
                "At least 5-7 recommendations prioritized by impact"
            ],
            
            "keyword_optimized": [
                "Missing keyword 1 - why it's important for this role",
                "Missing keyword 2 - why it's important for this role",
                "At least 5-8 keywords"
            ],
            
            "formatting_suggestions": [
                "Specific formatting improvement 1",
                "Specific formatting improvement 2",
                "3-5 suggestions"
            ],
            
            "ats_tips": [
                "ATS-specific tip 1",
                "ATS-specific tip 2",
                "3-4 tips for better ATS compatibility"
            ]
        }}
        
        CRITICAL FORMATTING RULES:
        - DO NOT use markdown formatting (no **, *, ##, bullets with *, etc.)
        - Use plain text only with natural, professional language
        - Be specific and reference actual content from the resume
        - Provide actionable, concrete suggestions
        - Use numbered lists (1., 2., 3.) if needed, not bullet points
        - MUST return valid JSON only, no additional text before or after
        
        SCORING GUIDELINES:
        - overall_score: Holistic assessment (0-100)
        - ats_score: ATS compatibility - formatting, keywords, structure (0-100)
        - technical_score: Technical skills and expertise depth (0-100)
        - market_alignment: Relevance to current job market trends (0-100)
        - impact_score: Quality of achievement statements and quantifiable results (0-100)
        - format_score: Resume structure, readability, organization (0-100)
        - keyword_density: Presence of industry-relevant keywords (0-100)
        
        ANALYSIS FOCUS:
        - Identify specific achievements and quantify them
        - Check for action verbs and impact statements
        - Evaluate keyword usage for {target_job if target_job else "the candidate's field"}
        - Assess ATS compatibility (formatting, sections, keywords)
        - Provide industry-specific recommendations
        - Highlight missing certifications or skills
        - Suggest improvements to increase interview chances
        
        Resume Text:
        {resume_text[:3000]}
        """

        try:
            print("Sending resume to AI for analysis...")
            response = await self.model.generate_content_async(prompt)
            print(f"AI Response received - Length: {len(response.text)} characters")
            
            result = self._clean_json_response(response.text)
            
            if "error" in result:
                print(f"JSON parsing error: {result}")
                print(f"Raw AI response: {response.text[:500]}...")
            
            return result
        except Exception as e:
            error_message = str(e).lower()
            print(f"AI Service Error in analyze_resume: {type(e).__name__}: {str(e)}")
            
            # Check for rate limit errors
            if "429" in str(e) or "quota" in error_message or "rate limit" in error_message or "resource exhausted" in error_message:
                return {
                    "error": "Rate limit exceeded. The Gemini API has a limit of 15 requests per minute on the free tier. Please wait a moment and try again.",
                    "error_type": "rate_limit"
                }
            elif "api key" in error_message or "authentication" in error_message:
                return {
                    "error": "API authentication failed. Please check your Gemini API key configuration.",
                    "error_type": "auth_error"
                }
            else:
                return {
                    "error": f"AI analysis failed: {str(e)}",
                    "error_type": "general_error"
                }

    async def generate_career_roadmap(self, current_profile: str, target_career: str) -> Dict[str, Any]:
        """Generate a personalized career roadmap"""
        if not self.model:
            return {"error": "AI service not configured"}

        prompt = f"""
        Create a highly detailed, professional career roadmap for transitioning from:
        Current Profile: {current_profile}
        Target Career: {target_career}
        
        Provide a comprehensive, actionable roadmap in JSON format with the following structure:
        {{
            "title": "Clear, professional title for this career path (e.g., 'Software Developer to AI Engineer Roadmap')",
            "difficulty": "Beginner/Intermediate/Advanced (assess based on the transition complexity)",
            "duration": "Realistic timeframe (e.g., '6-12 months', '1-2 years')",
            "stages": [
                {{
                    "name": "Stage name (e.g., 'Foundation Building', 'Skill Acquisition', 'Portfolio Development')",
                    "description": "Detailed 2-3 sentence description of what this stage entails and why it's important",
                    "skills": [
                        "Specific skill 1 with context (e.g., 'Python programming - focus on data structures and algorithms')",
                        "Specific skill 2 with context",
                        "At least 4-6 skills per stage"
                    ],
                    "resources": [
                        "Specific resource 1 with description (e.g., 'DeepLearning.AI Coursera Specialization - comprehensive ML fundamentals')",
                        "Specific resource 2 with description",
                        "Include courses, books, projects, and communities - at least 3-5 resources per stage"
                    ]
                }}
            ]
        }}
        
        Important guidelines:
        - Include 4-6 comprehensive stages covering the entire journey
        - Each stage should have a clear progression from the previous one
        - Skills should be specific, actionable, and industry-relevant
        - Resources should be real, well-known platforms/books/tools (Coursera, Udemy, freeCodeCamp, official docs, etc.)
        - Include both technical skills and soft skills where relevant
        - Consider certifications, portfolio projects, and networking opportunities
        - Make the description inspiring but realistic
        """

        response = await self.model.generate_content_async(prompt)
        return self._clean_json_response(response.text)

    async def generate_interview_questions(self, job_title: str, level: str = "Mid", count: int = 5) -> Dict[str, Any]:
        """Generate mock interview questions for a specific role"""
        if not self.model:
            return {"error": "AI service not configured"}

        prompt = f"""
        Generate {count} high-quality interview questions for a {level} {job_title} role.
        
        Provide the output in JSON format with this structure:
        {{
            "questions": [
                {{
                    "id": 1,
                    "question": "The interview question text",
                    "category": "Technical/Behavioral/System Design/etc",
                    "difficulty": "Easy/Medium/Hard"
                }}
            ]
        }}
        
        Guidelines:
        - Questions should be realistic and commonly asked in {job_title} interviews
        - Mix technical and behavioral questions appropriately
        - Ensure questions are relevant to {level} level experience
        - Cover different aspects: technical skills, problem-solving, communication, past experience
        """

        response = await self.model.generate_content_async(prompt)
        return self._clean_json_response(response.text)
    
    
    async def evaluate_interview_answer(self, question: str, answer: str, job_title: str = "") -> Dict[str, Any]:
        """Evaluate an interview answer and provide feedback"""
        if not self.model:
            return {"error": "AI service not configured"}

        prompt = f"""
        Evaluate this interview answer:
        
        Question: {question}
        Candidate's Answer: {answer}
        {f"Role: {job_title}" if job_title else ""}
        
        Provide a comprehensive evaluation in JSON format:
        {{
            "score": 7,
            "feedback": "Detailed feedback paragraph explaining what was good and what could be improved",
            "strengths": ["strength 1", "strength 2", "strength 3"],
            "improvements": ["improvement 1", "improvement 2", "improvement 3"],
            "sample_better_answer": "An example of how to answer this question more effectively"
        }}
        
        CRITICAL FORMATTING RULES:
        - DO NOT use markdown formatting (no **, *, ##, etc.)
        - DO NOT use asterisks or special characters for emphasis
        - Use plain text only with natural language
        - For the sample_better_answer, structure it with clear paragraphs separated by double line breaks
        - Use numbered lists (1., 2., 3.) or natural transitions (First, Second, Additionally) instead of bullet points
        - Write in a professional, conversational tone
        - Make the sample answer comprehensive but well-organized with clear sections
        
        Guidelines:
        - Be constructive and specific in feedback
        - Highlight both strengths and areas for improvement
        - Provide actionable suggestions
        - The sample answer should demonstrate best practices with proper structure
        """

        response = await self.model.generate_content_async(prompt)
        return self._clean_json_response(response.text)

    async def discover_careers(self, skills: List[str], interests: List[str]) -> List[Dict[str, Any]]:
        """Recommend career paths based on skills and interests"""
        if not self.model:
            return []

        prompt = f"""
        Based on skills: {', '.join(skills)} and interests: {', '.join(interests)},
        recommend 3-5 career paths.
        
        Provide the output as a JSON list of objects with:
        - title: Job title
        - match_percentage: int (0-100)
        - why_match: Brief explanation
        - growth_potential: 'High', 'Medium', or 'Stable'
        """

        response = await self.model.generate_content_async(prompt)
        result = self._clean_json_response(response.text)
        return result if isinstance(result, list) else []

    async def analyze_market_trends(self, sector: str) -> Dict[str, Any]:
        """Analyze current market trends for a given sector"""
        if not self.model:
            return {}

        prompt = f"""
        Analyze current job market trends for the {sector} sector.
        
        Provide the output in JSON format with:
        - growth: int (percentage)
        - demand_level: 'High', 'Medium', or 'Low'
        - trending_skills: [list of skills]
        - salary_range: object with 'min', 'max', 'avg'
        - top_companies: [list of companies]
        """

        response = await self.model.generate_content_async(prompt)
        return self._clean_json_response(response.text)

    async def analyze_career_assessment(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze career assessment responses and provide career recommendations"""
        if not self.model:
            return {"error": "AI service not configured"}

        # Extract key information from responses
        skills = responses.get('skills', [])
        skill_levels = responses.get('skill_levels', {})
        interests = responses.get('interests', [])
        values = responses.get('values', [])
        experience_level = responses.get('experience_level', 'Entry Level')
        education = responses.get('education', 'Bachelor\'s Degree')
        work_style = responses.get('work_style', {})
        goals = responses.get('goals', {})
        preferences = responses.get('preferences', {})

        prompt = f"""
        Analyze this comprehensive career assessment and provide personalized career recommendations.

        CANDIDATE PROFILE:
        Skills: {', '.join(skills)}
        Skill Proficiency Levels: {json.dumps(skill_levels)}
        Interests: {', '.join(interests)}
        Core Values: {', '.join(values)}
        Experience Level: {experience_level}
        Education: {education}
        Work Style Preferences: {json.dumps(work_style)}
        Career Goals: {json.dumps(goals)}
        Other Preferences: {json.dumps(preferences)}

        Provide a comprehensive career analysis in JSON format with the following structure:

        {{
            "overall_clarity_score": 85,  // 0-100 score indicating how clear their career direction is
            "career_matches": [
                {{
                    "career_title": "Senior Software Engineer",
                    "match_percentage": 92,  // 0-100 based on skills (40%), interests (30%), values (20%), experience (10%)
                    "description": "Brief description of the role",
                    "reasons": [
                        "Strong alignment with technical skills",
                        "Matches interest in problem-solving",
                        "Values work-life balance which this role offers"
                    ],
                    "required_skills": ["Python", "JavaScript", "System Design"],
                    "skill_gaps": ["Kubernetes", "Advanced AWS"],
                    "salary_range": "$120,000 - $180,000",
                    "growth_outlook": "High - 22% growth expected",
                    "work_life_balance": "Good - Flexible hours, remote options",
                    "day_to_day": [
                        "Design and implement scalable systems",
                        "Code reviews and mentoring junior developers",
                        "Collaborate with product teams"
                    ],
                    "action_plan": {{
                        "immediate": [
                            "Complete Kubernetes certification",
                            "Build a portfolio project showcasing system design"
                        ],
                        "short_term": [
                            "Gain experience with microservices architecture",
                            "Contribute to open-source projects"
                        ],
                        "long_term": [
                            "Develop leadership skills",
                            "Specialize in distributed systems"
                        ]
                    }}
                }}
                // Provide top 5 career matches
            ],
            "skills_breakdown": {{
                "technical_strength": 85,
                "soft_skills_strength": 78,
                "leadership_potential": 65,
                "top_strengths": ["Problem Solving", "Technical Expertise", "Communication"],
                "areas_to_develop": ["Project Management", "Public Speaking"]
            }},
            "interests_alignment": {{
                "primary_interest_area": "Technology & Innovation",
                "secondary_interests": ["Problem Solving", "Creative Work"],
                "career_fit_score": 88
            }},
            "values_match": {{
                "top_values": ["Work-Life Balance", "Impact", "Growth"],
                "alignment_with_careers": "High - Recommended careers align well with your values"
            }}
        }}

        IMPORTANT:
        - Calculate match percentages based on: Skills (40%), Interests (30%), Values (20%), Experience fit (10%)
        - Provide realistic, actionable career recommendations
        - Include both aspirational and achievable options
        - Be specific with skill gaps and action plans
        - Consider current market trends and demand
        - Ensure salary ranges are realistic for the experience level
        - Provide 5 diverse career options ranked by match percentage
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return self._clean_json_response(response.text)
        except Exception as e:
            print(f"Career assessment analysis error: {e}")
            return {
                "error": "Failed to analyze assessment",
                "error_type": "ai_error",
                "message": str(e)
            }

ai_service = AIService()
