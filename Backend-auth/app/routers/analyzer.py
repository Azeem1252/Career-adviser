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

# Debug endpoint
@router.get("/test")
async def test_endpoint():
    return {"status": "ok", "message": "Analyzer router is working"}

def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = file.file.read()
    file.file.seek(0) # Reset for potential re-reads
    
    if filename.endswith('.pdf'):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    elif filename.endswith('.docx'):
        doc = Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs])
    else:
        # Assume text/markdown
        try:
            return content.decode('utf-8')
        except UnicodeDecodeError:
            return content.decode('latin-1')

@router.post("/resume")
async def analyze_resume(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze resume file and provide feedback"""
    try:
        # Manually parse form data
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
        
        # Get the file
        resume = form.get('resume')
        print(f"Resume object: {resume}")
        print(f"Has filename attr: {hasattr(resume, 'filename') if resume else 'None'}")
        
        if not resume or not hasattr(resume, 'filename'):
            print(f"ERROR: No resume file provided or invalid format")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No resume file provided. Form keys: {list(form.keys())}"
            )
        
        # Get job description (optional)
        job_description = form.get('job_description', '')
        if job_description and hasattr(job_description, 'decode'):
            job_description = job_description.decode('utf-8')
        
        print(f"RESUME UPLOAD - File: {resume.filename}, Content-Type: {resume.content_type}")
        print(f"Job Description: {job_description if job_description else 'None'}")
        print(f"User: {current_user.email}")
        print(f"=" * 80)
        
        # Extract text from uploaded file
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
        
        # Check if AI returned an error
        if isinstance(analysis, dict) and "error" in analysis:
            print(f"AI SERVICE ERROR: {analysis}")
            error_type = analysis.get('error_type', 'general_error')
            error_message = analysis.get('error', 'Unknown error')
            
            # Return 429 for rate limit errors, 500 for others
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
        
        print(f"Analysis successful - Overall score: {analysis.get('overall_score', 'N/A')}")
        
        # Save the run
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
        # Build context-rich prompt
        company_context = f"at {request.company_name}" if request.company_name else "for this position"
        job_context = f"\n\nJob Requirements:\n{request.job_description}" if request.job_description else ""
        
        prompt = f"""
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
        
        response = ai_service.client.models.generate_content(
            model=ai_service.model_name,
            contents=prompt
        )
        content = response.text.strip()
        
        # Clean up any markdown that might have slipped through
        content = content.replace('**', '').replace('*', '').replace('##', '').replace('###', '')
        
        # Save the run
        saved_run = SavedRun(
            user_id=current_user.id,
            title=f"Cover Letter - {request.job_title}",
            content=content,
            run_type="cover_letter_generation"
        )
        db.add(saved_run)
        db.commit()
        
        return {"content": content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
