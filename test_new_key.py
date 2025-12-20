import asyncio
import sys
import os

# Add Backend-auth to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Backend-auth'))

async def test_with_new_key():
    from app.core.config import settings
    import google.generativeai as genai
    
    print(f"Testing with API Key: {settings.GEMINI_API_KEY[:20]}...")
    print(f"Model: {settings.AI_MODEL}")
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.AI_MODEL)
    
    prompt = """
    Analyze the following resume text for a Software Engineer position.
    
    Provide the analysis in JSON format with:
    - overall_score: (0-100)
    - technical_score: (0-100)
    - market_alignment: (0-100)
    - strengths: [list]
    - gaps: [list]
    - recommendations: [list]
    - keyword_optimized: [list]
    
    Resume: Software engineer with 5 years in Python, React, FastAPI, and cloud computing.
    """
    
    try:
        print("\n✓ Calling Gemini API...")
        response = await model.generate_content_async(prompt)
        print(f"✓ SUCCESS! Got {len(response.text)} chars")
        print(f"\nFirst 200 chars of response:\n{response.text[:200]}...")
        return True
    except Exception as e:
        print(f"\n✗ FAILED: {type(e).__name__}")
        print(f"Error: {str(e)[:200]}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_with_new_key())
    print(f"\n{'='*60}")
    print(f"Result: {'✓ API KEY WORKS!' if success else '✗ Still having issues'}")
    print(f"{'='*60}")
    exit(0 if success else 1)
