import sys
import os
from datetime import datetime, timedelta
from jose import jwt

# Add Backend-auth to path
sys.path.insert(0, os.path.abspath('Backend-auth'))

from app.core.config import settings

def test_token_decoding():
    print(f"Testing with SECRET_KEY: {settings.SECRET_KEY[:5]}...")
    print(f"Algorithm: {settings.ALGORITHM}")
    
    data = {"sub": "test@example.com", "type": "access", "exp": datetime.utcnow() + timedelta(minutes=30)}
    token = jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    print(f"Generated Token: {token[:20]}...")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"SUCCESS: Decoded payload: {payload}")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    test_token_decoding()
