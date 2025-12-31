from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta
import hashlib
from datetime import datetime, timezone
from ..database import get_db
from ..models.user import User, RefreshToken, EmailToken
from ..schemas.user import UserCreate, UserLogin, UserResponse, EmailRequest, PasswordResetRequest, VerifyEmailRequest
from ..schemas.token import Token, RefreshTokenRequest
from ..core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_verification_token,
    create_password_reset_token
)
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


# Helper function to get current user from token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email if email service is configured
    try:
        from ..core.email import mail, create_message
        from ..core.email_templates import get_verification_email_template
        
        verification_token = create_verification_token(db_user.email)
        
        # Store verification token in DB
        token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
        db_token = EmailToken(
            token_hash=token_hash,
            email=db_user.email,
            token_type="verification",
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(db_token)
        db.commit()

        if mail:
            verification_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={verification_token}"
            html_body = get_verification_email_template(
                verification_url=verification_url,
                user_name=db_user.name
            )
            message = create_message(
                recipients=[db_user.email],
                subject="🎯 Verify your Carre Adviser account",
                body=html_body
            )
            await mail.send_message(message)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Failed to send verification email: {e}")
    
    # Do not return tokens for automatic login if verification is required
    return {
        "access_token": "",
        "refresh_token": "",
        "token_type": "bearer",
        "user": db_user,
        "message": "Registration successful. Please check your email to verify your account."
    }


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access and refresh tokens"""
    
    # Find user
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    # Store refresh token in DB
    refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    db_refresh_token = RefreshToken(
        token_hash=refresh_token_hash,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    
    payload = decode_token(token_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    email: str = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    # Revoke old refresh token and store new one
    old_token_hash = hashlib.sha256(token_data.refresh_token.encode()).hexdigest()
    db_old_token = db.query(RefreshToken).filter(RefreshToken.token_hash == old_token_hash).first()
    
    if not db_old_token or db_old_token.is_revoked or db_old_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    db_old_token.is_revoked = True
    
    new_token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
    db_new_token = RefreshToken(
        token_hash=new_token_hash,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_new_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


@router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if token is valid"""
    return {"valid": True, "user_id": current_user.id, "email": current_user.email}


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify user email with verification token"""
    
    payload = decode_token(request.token)
    
    if not payload or payload.get("type") != "verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Verify token in DB
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    db_token = db.query(EmailToken).filter(
        EmailToken.token_hash == token_hash,
        EmailToken.token_type == "verification",
        EmailToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    email: str = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        db.delete(db_token)
        db.commit()
        return {"message": "Email already verified"}
    
    # Mark user as verified and delete token
    user.is_verified = True
    db.delete(db_token)
    db.commit()
    
    # Send welcome email
    try:
        from ..core.email import mail, create_message
        from ..core.email_templates import get_welcome_email_template
        
        if mail:
            html_body = get_welcome_email_template(user_name=user.name)
            message = create_message(
                recipients=[user.email],
                subject="🎉 Welcome to Carre Adviser!",
                body=html_body
            )
            await mail.send_message(message)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(request: EmailRequest, db: Session = Depends(get_db)):
    """Resend email verification link to a user"""
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a verification link has been sent"}

    if user.is_verified:
        return {"message": "Email already verified"}

    try:
        from ..core.email import mail, create_message
        from ..core.email_templates import get_verification_email_template

        if not mail:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service is not configured. Please contact administrator."
            )

        verification_token = create_verification_token(user.email)
        
        # Store verification token in DB
        token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
        db_token = EmailToken(
            token_hash=token_hash,
            email=user.email,
            token_type="verification",
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(db_token)
        db.commit()

        verification_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={verification_token}"

        html_body = get_verification_email_template(
            verification_url=verification_url,
            user_name=user.name
        )

        message = create_message(
            recipients=[user.email],
            subject="🎯 Verify your Carre Adviser account",
            body=html_body
        )

        await mail.send_message(message)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Failed to resend verification email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )

    return {"message": "If the email exists, a verification link has been sent"}


@router.post("/forgot-password")
async def forgot_password(request: EmailRequest, db: Session = Depends(get_db)):
    """Send password reset email"""
    
    user = db.query(User).filter(User.email == request.email).first()
    
    # Don't reveal if email exists or not for security
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Rate limiting: Check if a token was sent in the last 60 seconds
    from datetime import datetime, timedelta
    recent_token = db.query(EmailToken).filter(
        EmailToken.email == user.email,
        EmailToken.token_type == "password_reset",
        EmailToken.created_at > datetime.utcnow() - timedelta(seconds=60)
    ).first()
    
    if recent_token:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait 60 seconds before requesting another link."
        )
    
    # Send password reset email
    try:
        from ..core.email import mail, create_message
        from ..core.email_templates import get_password_reset_email_template
        
        if not mail:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service is not configured. Please contact administrator."
            )
        
        reset_token = create_password_reset_token(user.email)
        
        # Store reset token in DB
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        db_token = EmailToken(
            token_hash=token_hash,
            email=user.email,
            token_type="password_reset",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.add(db_token)
        db.commit()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_body = get_password_reset_email_template(
            reset_url=reset_url,
            user_name=user.name
        )
        
        message = create_message(
            recipients=[user.email],
            subject="🔐 Reset your Carre Adviser password",
            body=html_body
        )
        
        await mail.send_message(message)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email"
        )
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Reset password using reset token"""
    
    payload = decode_token(request.token)
    
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Verify token in DB
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    db_token = db.query(EmailToken).filter(
        EmailToken.token_hash == token_hash,
        EmailToken.token_type == "password_reset",
        EmailToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    email: str = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password and delete token
    user.hashed_password = get_password_hash(request.new_password)
    db.delete(db_token)
    db.commit()
    
    return {"message": "Password reset successfully"}


from pydantic import BaseModel as PydanticBaseModel


class ChangePasswordRequest(PydanticBaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change password for authenticated user"""
    
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update to new password
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
