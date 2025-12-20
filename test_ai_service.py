import asyncio
import sys
sys.path.insert(0, 'Backend-auth')

from app.services.ai_service import ai_service

async def test_resume_analysis():
    resume_text = """
    This is a test resume for a software engineer with skills in Python, React, and FastAPI. 
    I have 5 years of experience in cloud computing.
    """
    
    print("Testing AI Service...")
    print(f"Model configured: {ai_service.model is not None}")
    
    try:
        result = await ai_service.analyze_resume(resume_text, "Software Engineer")
        print(f"SUCCESS: {result}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_resume_analysis())
