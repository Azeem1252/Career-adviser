import asyncio
import google.generativeai as genai

async def list_models():
    genai.configure(api_key="AIzaSyBIvMBLepSEx67oPi8oRh6XGQZLfQLpJxQ")
    
    print("Listing available models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")

if __name__ == "__main__":
    asyncio.run(list_models())
