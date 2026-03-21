from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
import bcrypt
from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password[:72].encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    password_bytes = password[:72].encode('utf-8')
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def create_verification_token(email: str) -> str:
    """Create email verification token (valid for 24 hours)"""
    to_encode = {"sub": email, "type": "verification"}
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """Create password reset token (valid for 1 hour)"""
    to_encode = {"sub": email, "type": "password_reset"}
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
