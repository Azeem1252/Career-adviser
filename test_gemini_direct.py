import asyncio
import google.generativeai as genai

async def test_gemini_direct():
    # Direct test with hardcoded API key
    genai.configure(api_key="AIzaSyBIvMBLepSEx67oPi8oRh6XGQZLfQLpJxQ")
    model = genai.GenerativeModel("gemini-1.5-pro")
    
    prompt = "Analyze this resume: Software engineer with 5 years experience in Python. Provide JSON with overall_score, technical_score, market_alignment, strengths, gaps, recommendations, and keyword_optimized fields."
    
    try:
        print("Calling Gemini API...")
        response = await model.generate_content_async(prompt)
        print(f"SUCCESS: {response.text[:200]}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gemini_direct())
