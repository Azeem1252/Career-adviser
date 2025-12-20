import asyncio
import google.generativeai as genai

async def test_gemini_flash():
    genai.configure(api_key="AIzaSyBIvMBLepSEx67oPi8oRh6XGQZLfQLpJxQ")
    model = genai.GenerativeModel("gemini-flash-latest")
    
    prompt = """
    Analyze the following resume text. 
    Target Job: Software Engineer
    
    Provide the analysis in JSON format with the following keys:
    - overall_score: (0-100) summary score
    - technical_score: (0-100) score for technical skills
    - market_alignment: (0-100) score for current market demand
    - strengths: [list of strengths]
    - gaps: [list of missing skills/experiences]
    - recommendations: [list of actionable tips]
    - keyword_optimized: [missing relevant keywords]
    
    Resume Text: This is a test resume for a software engineer with skills in Python, React, and FastAPI. I have 5 years of experience in cloud computing.
    """
    
    try:
        print("Testing gemini-flash-latest...")
        response = await model.generate_content_async(prompt)
        print(f"✓ SUCCESS! Response length: {len(response.text)}")
        print(f"First 500 chars:\n{response.text[:500]}")
        return True
    except Exception as e:
        print(f"✗ ERROR: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_gemini_flash())
    exit(0 if success else 1)
