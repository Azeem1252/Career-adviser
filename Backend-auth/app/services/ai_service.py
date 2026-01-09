from fastapi import HTTPException
from google import genai
from google.genai import types
from typing import Dict, Any, List
import json
import re
from ..core.config import settings

class AIService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self.model_name = settings.AI_MODEL
        else:
            self.client = None
            self.model_name = None

    def _clean_json_response(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON from AI response"""
        cleaned_text = re.sub(r'```json\s*|\s*```', '', text).strip()
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            try:
                start = cleaned_text.find('{')
                end = cleaned_text.rfind('}') + 1
                if start != -1 and end != 0:
                    json_str = cleaned_text[start:end]
                    return json.loads(json_str)
            except:
                pass
            
            try:
                return json.loads(text)
            except:
                return {
                    "error": "Failed to parse AI response",
                    "message": "The AI response could not be parsed as valid JSON"
                }

    async def analyze_resume(self, resume_text: str, target_job: str = None) -> Dict[str, Any]:
        """Analyze resume for gaps and improvements"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        Perform a comprehensive professional resume analysis.
        {f"Target Job/Role: {target_job}" if target_job else "Provide a general career analysis across multiple dimensions."}
        Prompt:
        VALIDATION RULE:
        - If the provided Resume Text or Job Description appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT perform an analysis.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide a valid resume and job description."}}

        Analyze the following resume text and provide a detailed JSON response.
        
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
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            try:
                content = response.text
                if not content:
                    if response.candidates and response.candidates[0].content.parts:
                        content = response.candidates[0].content.parts[0].text
            except Exception as text_err:
                print(f"Error accessing response.text: {text_err}")
                content = None
                
            if not content:
                if response.candidates and response.candidates[0].finish_reason:
                    reason = response.candidates[0].finish_reason
                    return {
                        "error": f"AI could not generate content. Reason: {reason}. This often happens due to safety filters or restricted content.",
                        "error_type": "safety_error"
                    }
                return {
                    "error": "AI returned an empty response. Please try again or adjust your criteria.",
                    "error_type": "empty_response"
                }

            print(f"AI Response received - Length: {len(content)} characters")
            
            result = self._clean_json_response(content)
            
            if "error" in result:
                print(f"JSON parsing error: {result}")
                print(f"Raw AI response snippet: {content[:500]}...")
            
            return result
        except Exception as e:
            error_message = str(e).lower()
            print(f"AI Service Error in analyze_resume: {type(e).__name__}: {str(e)}")
            
            if "429" in str(e) or "quota" in error_message or "rate limit" in error_message or "resource exhausted" in error_message:
                return {
                    "error": "Rate limit exceeded. The Gemini API has a limit for the free tier. Please wait a moment and try again.",
                    "error_type": "rate_limit"
                }
            elif "leaked" in error_message:
                return {
                    "error": "CRITICAL: Your Gemini API key has been reported as leaked and has been disabled by Google. You MUST generate a new API key from Google AI Studio (https://aistudio.google.com/) and update your .env file.",
                    "error_type": "leaked_key"
                }
            elif "model not found" in error_message or "not found" in error_message:
                return {
                    "error": f"AI model '{self.model_name}' not found. Please check your configuration.",
                    "error_type": "model_error"
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
        if not self.client:
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
                    "title": "Stage title (e.g., 'Foundation Building', 'Skill Acquisition', 'Portfolio Development')",
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

        prompt += f"""
        VALIDATION RULE:
        - If the {target_career} or {current_profile} appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT generate a roadmap.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide a valid career goal."}}

        Generate a VOCATIONAL ROADMAP in JSON format for a candidate transitioning to {target_career}.
        """

        try:
            print(f"Generating roadmap for: {target_career}")
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            print(f"Roadmap response received - Length: {len(response.text)} characters")
            return self._clean_json_response(response.text)
        except Exception as e:
            error_message = str(e).lower()
            print(f"AI Service Error in generate_career_roadmap: {type(e).__name__}: {str(e)}")
            
            if "429" in str(e) or "quota" in error_message or "rate limit" in error_message or "resource exhausted" in error_message:
                return {
                    "error": "Rate limit exceeded. Please wait a moment and try again.",
                    "error_type": "rate_limit"
                }
            elif "api key" in error_message or "authentication" in error_message:
                return {
                    "error": "API authentication failed. Please check your Gemini API key configuration.",
                    "error_type": "auth_error"
                }
            else:
                return {
                    "error": f"Roadmap generation failed: {str(e)}",
                    "error_type": "general_error"
                }

    async def generate_interview_questions(self, job_title: str, level: str = "Mid", count: int = 5) -> Dict[str, Any]:
        """Generate mock interview questions for a specific role"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        VALIDATION RULE:
        - If the job title ('{job_title}') appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT generate questions.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide a valid job title."}}

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

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            return self._handle_ai_error(e, "generate_interview_questions")
    
    
    async def evaluate_interview_answer(self, question: str, answer: str, job_title: str = "") -> Dict[str, Any]:
        """Evaluate an interview answer and provide feedback"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        VALIDATION RULE:
        - If the candidate's answer appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT evaluate it.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide a more detailed and valid answer."}}

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

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            return self._handle_ai_error(e, "evaluate_interview_answer")

    async def discover_careers(self, skills: List[str], interests: List[str]) -> Dict[str, Any]:
        """Recommend career paths based on skills and interests"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        VALIDATION RULE:
        - If the skills ({', '.join(skills)}) or interests ({', '.join(interests)}) appear to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT recommend careers.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide valid skills and interests."}}

        Based on skills: {', '.join(skills)} and interests: {', '.join(interests)},
        recommend 3-5 career paths.
        
        Provide the output as a JSON list of objects with:
        - title: Job title
        - match_percentage: int (0-100)
        - why_match: Brief explanation
        - growth_potential: 'High', 'Medium', or 'Stable'
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            return self._handle_ai_error(e, "discover_careers")

    async def analyze_market_trends(self, sector: str) -> Dict[str, Any]:
        """Analyze current market trends for a given sector"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        VALIDATION RULE:
        - If the sector name ('{sector}') appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT perform an analysis.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide a valid industry or sector name."}}

        Analyze current job market trends for the {sector} sector.
        
        Provide the output in JSON format with:
        - industry: '{sector}'
        - growth_rate: (percentage or trend)
        - demand_level: 'High', 'Medium', or 'Low'
        - top_skills: [list of skill objects with name, growth, demand_index]
        - remote_availability: 'High', 'Medium', or 'Low'
        - salary_range: string
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            return self._handle_ai_error(e, "analyze_market_trends")

    def _handle_ai_error(self, e: Exception, method_name: str) -> Dict[str, Any]:
        """Centralized error handling for AI methods"""
        error_message = str(e).lower()
        print(f"AI Service Error in {method_name}: {type(e).__name__}: {str(e)}")
        
        if "429" in str(e) or "quota" in error_message or "rate limit" in error_message or "resource exhausted" in error_message:
            return {
                "error": "Rate limit exceeded. Please wait a moment and try again.",
                "error_type": "rate_limit"
            }
        elif "leaked" in error_message:
            return {
                "error": "CRITICAL: Your Gemini API key has been reported as leaked. Please update your .env with a new key.",
                "error_type": "leaked_key"
            }
        elif "api key" in error_message or "authentication" in error_message:
            return {
                "error": "API authentication failed. Please check your Gemini API key.",
                "error_type": "auth_error"
            }
        else:
            return {
                "error": f"AI service failed: {str(e)}",
                "error_type": "general_error"
            }

    async def analyze_career_assessment(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze career assessment responses and provide career recommendations"""
        if not self.client:
            return {"error": "AI service not configured"}

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
        VALIDATION RULE:
        - If the skills ({', '.join(skills)}) or interests ({', '.join(interests)}) appear to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT perform an analysis.
        - Instead, return a JSON object with this exact structure: {{"error": "GIBBERISH_INPUT", "message": "Please provide valid skills and interests."}}

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
            "overall_clarity_score": 85,
            "career_matches": [
                {{
                    "career_title": "Senior Software Engineer",
                    "match_percentage": 92,
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
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            print(f"Career assessment analysis error: {e}")
            return {
                "error": "Failed to analyze assessment",
                "error_type": "ai_error",
                "message": str(e)
            }

    async def generate_tactical_advice(self, current_profile: str, target_career: str, stage_title: str, stage_description: str) -> Dict[str, Any]:
        """Generate personalized tactical advice for a specific roadmap stage"""
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        You are an elite career strategist. Provide personalized TACTICAL ADVICE for this specific roadmap stage:
        
        CONTEXT:
        Candidate Current Profile: {current_profile}
        Target Career: {target_career}
        Stage Title: {stage_title}
        Stage Description: {stage_description}
        
        Provide high-level, actionable, and specific tactical advice in JSON format:
        {{
            "tactical_overview": "A brief strategic overview of why this stage is critical",
            "immediate_actions": [
                "Specific action 1 (e.g., 'Optimize your GitHub with 3 projects using X')",
                "Specific action 2",
                "3-4 prioritized actions"
            ],
            "common_pitfalls": [
                "Pitfall 1 to avoid during this stage",
                "Pitfall 2 to avoid",
                "2-3 warnings"
            ],
            "expert_tip": "A 'pro-tip' that only a senior professional in this field would know"
        }}
        
        CRITICAL RULES:
        - DO NOT use markdown formatting
        - Be extremely specific to the {target_career} field
        - Ensure the advice bridges the gap between the {current_profile} and the stage requirements
        - Return valid JSON only
        """

        try:
            print(f"Generating tactical advice for: {stage_title}")
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._clean_json_response(response.text)
        except Exception as e:
            print(f"Tactical advice error: {e}")
            return {"error": "Failed to generate tactics", "message": str(e)}

    async def generate_cover_letter(self, prompt: str) -> Dict[str, Any]:
        """Generate a cover letter based on a prompt"""
        if not self.client:
            return {"error": "AI service not configured"}
            
        try:
            print("Generating cover letter...")
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            try:
                content = response.text
                if not content:
                    if response.candidates and response.candidates[0].content.parts:
                        content = response.candidates[0].content.parts[0].text
            except Exception as text_err:
                print(f"Error accessing response.text: {text_err}")
                content = None
                
            if not content:
                if response.candidates and response.candidates[0].finish_reason:
                    reason = response.candidates[0].finish_reason
                    return {"error": f"AI could not generate content. Reason: {reason}. This often happens due to safety filters or restricted content."}
                return {"error": "AI returned an empty response. Please try again or adjust your criteria."}
                
            content = content.strip()
            content = content.replace('**', '').replace('*', '').replace('##', '').replace('###', '')
            
            return {"content": content}
        except Exception as e:
            error_message = str(e).lower()
            print(f"AI Service Error in generate_cover_letter: {type(e).__name__}: {str(e)}")
            
            if "429" in str(e) or "quota" in error_message or "rate limit" in error_message:
                return {
                    "error": "Rate limit exceeded. The Gemini API has a limit for free tier. Please wait and try again.",
                    "error_type": "rate_limit"
                }
            elif "model not found" in error_message or "not found" in error_message:
                 return {
                    "error": f"AI model '{self.model_name}' not found. Please check your configuration.",
                    "error_type": "model_error"
                }
            else:
                return {
                    "error": f"Cover letter generation failed: {str(e)}",
                    "error_type": "general_error"
                }

ai_service = AIService()
