from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.user import User, SavedRun
from ..routers.auth import get_current_user
from ..schemas.ai import ResumeAnalysisResponse, CoverLetterRequest, CoverLetterResponse
from ..services.ai_service import ai_service
import json
import io
import PyPDF2
from docx import Document

router = APIRouter(prefix="/analyzer", tags=["Analyzer"])

@router.get("/test")
async def test_endpoint():
    return {"status": "ok", "message": "Analyzer router is working"}

def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    try:
        content = file.file.read()
        file.file.seek(0)
        
        if filename.endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() or ""
                return text
            except Exception as pdf_err:
                print(f"PDF extraction error: {pdf_err}")
                return ""
        elif filename.endswith('.docx'):
            try:
                doc = Document(io.BytesIO(content))
                return "\n".join([para.text for para in doc.paragraphs])
            except Exception as docx_err:
                print(f"DOCX extraction error: {docx_err}")
                return ""
        else:
            try:
                return content.decode('utf-8')
            except UnicodeDecodeError:
                return content.decode('latin-1')
    except Exception as e:
        print(f"General file extraction error: {e}")
        return ""

@router.post("/resume")
async def analyze_resume(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze resume file and provide feedback"""
    try:
        form = await request.form()
        
        print(f"=" * 80)
        print(f"FORM DATA RECEIVED:")
        print(f"Form keys: {list(form.keys())}")
        for key in form.keys():
            value = form.get(key)
            if hasattr(value, 'filename'):
                print(f"  {key}: FILE - {value.filename} ({value.content_type})")
            else:
                print(f"  {key}: {value}")
        print(f"=" * 80)
        
        resume = form.get('resume')
        print(f"Resume object: {resume}")
        print(f"Has filename attr: {hasattr(resume, 'filename') if resume else 'None'}")
        
        if not resume or not hasattr(resume, 'filename'):
            print(f"ERROR: No resume file provided or invalid format")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No resume file provided. Form keys: {list(form.keys())}"
            )
        
        job_description = form.get('job_description', '')
        if job_description and hasattr(job_description, 'decode'):
            job_description = job_description.decode('utf-8')
        
        print(f"RESUME UPLOAD - File: {resume.filename}, Content-Type: {resume.content_type}")
        print(f"Job Description: {job_description if job_description else 'None'}")
        print(f"User: {current_user.email}")
        print(f"=" * 80)
        
        resume_text = extract_text_from_file(resume)
        
        if not resume_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from the provided file."
            )

        print(f"ANALYZING RESUME - User: {current_user.email}")
        print(f"Resume length: {len(resume_text)} characters")
        print(f"Job description: {job_description[:100] if job_description else 'None'}...")
        print(f"=" * 80)

        analysis = await ai_service.analyze_resume(resume_text, job_description if job_description else None)
        
        if isinstance(analysis, dict) and "error" in analysis:
            print(f"AI SERVICE ERROR: {analysis}")
            error_msg = analysis.get("error", "Analysis failed")
            
            if error_msg == "GIBBERISH_INPUT":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid resume file. Random characters are not allowed."
                )
                
            error_type = analysis.get('error_type', 'general_error')
            error_message = analysis.get('error', 'Unknown error')
            
            if error_type == 'rate_limit':
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message
                )
            elif error_type == 'leaked_key':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=error_message
                )
            elif error_type == 'auth_error':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=error_message
                )
            elif error_type == 'model_error':
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=error_message
                )
            elif error_type == 'safety_error':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_message
                )
        
        print(f"Analysis successful - Overall score: {analysis.get('overall_score', 'N/A')}")
        
        saved_run = SavedRun(
            user_id=current_user.id,
            title=f"Resume Analysis - {job_description[:50] if job_description else 'General'}",
            content=json.dumps(analysis),
            run_type="resume_analysis"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"=" * 80)
        print(f"ANALYZER ERROR: {type(e).__name__}: {str(e)}")
        print(f"Traceback:")
        traceback.print_exc()
        print(f"=" * 80)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a cover letter based on user profile and job details"""
    try:
        company_context = f"at {request.company_name}" if request.company_name else "for this position"
        job_context = f"\n\nJob Requirements:\n{request.job_description}" if request.job_description else ""
        
        prompt = f"""
        You are an elite career strategist and professional writer.
        
        VALIDATION RULE:
        - If the Target Position ('{request.job_title}') or Company ('{request.company_name}') appears to be random sequences of characters, gibberish, or nonsensical text (e.g., 'ksdfj', 'asdf', '12345'), you MUST NOT generate a cover letter.
        - Instead, you MUST return exactly this string: "ERROR: GIBBERISH_INPUT - Please provide valid job details."
        
        Generate a highly professional, compelling cover letter for {current_user.name or 'the candidate'}.
        
        Target Position: {request.job_title} {company_context}
        Tone: {request.tone}
        Key Accomplishments: {request.key_accomplishments or 'Relevant professional experience'}
        Candidate Background: {current_user.bio or 'Experienced professional'}{job_context}
        
        CRITICAL FORMATTING RULES:
        - DO NOT use any markdown formatting (no **, *, ##, bullets, etc.)
        - Use plain text only with natural, professional language
        - Structure with clear paragraphs separated by double line breaks
        - Use proper business letter format
        - Write in first person from the candidate's perspective
        
        CONTENT REQUIREMENTS:
        1. Opening Paragraph:
           - Express genuine enthusiasm for the {request.job_title} role{f' at {request.company_name}' if request.company_name else ''}
           - Mention how you learned about the position (if applicable)
           - Include a compelling hook about your relevant experience
        
        2. Body Paragraphs (2-3 paragraphs):
           - Highlight specific accomplishments that align with the role
           - Use quantifiable achievements where possible
           - Demonstrate knowledge of the company/industry{f' (specifically {request.company_name})' if request.company_name else ''}
           - Show how your skills directly address the job requirements
           - Integrate the key accomplishments naturally
        
        3. Closing Paragraph:
           - Reiterate your enthusiasm and fit for the role
           - Include a call to action (expressing interest in an interview)
           - Professional sign-off
        
        QUALITY STANDARDS:
        - Length: 300-400 words (3-4 substantial paragraphs)
        - Tone: {request.tone}, confident, and authentic
        - Avoid clichés and generic statements
        - Make it specific to this role and company
        - Ensure proper grammar and professional language
        - No placeholder text or brackets
        
        Generate the complete cover letter now as plain text:
        """
        
        result = await ai_service.generate_cover_letter(prompt)
        
        content = result.get("content", "")
        
        if "GIBBERISH_INPUT" in content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide a valid Job Title and Company. Nonsense characters are not allowed."
            )
            
        if "error" in result:
            print(f"COVER LETTER ERROR: {result}")
            error_type = result.get('error_type', 'general_error')
            error_message = result.get('error', 'Unknown error')
            
            if error_type == 'rate_limit':
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_message
                )
        
        content = result.get("content", "")
        
        saved_run = SavedRun(
            user_id=current_user.id,
            title=f"Cover Letter - {request.job_title}",
            content=content,
            run_type="cover_letter_generation"
        )
        db.add(saved_run)
        db.commit()
        db.refresh(saved_run)
        
        return {"content": content}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"=" * 80)
        print(f"COVER LETTER GENERATION ERROR: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        print(f"=" * 80)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )

@router.get("/history")
async def get_analyzer_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get previous resume analyses"""
    runs = db.query(SavedRun).filter(
        SavedRun.user_id == current_user.id,
        SavedRun.run_type == "resume_analysis"
    ).order_by(SavedRun.created_at.desc()).all()
    
    return [
        {
            "id": run.id,
            "title": run.title,
            "analysis": json.loads(run.content),
            "created_at": run.created_at
        }
        for run in runs
    ]
