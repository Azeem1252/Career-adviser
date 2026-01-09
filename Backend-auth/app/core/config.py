from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    DATABASE_URL: str
    
    FRONTEND_URL: str = "http://localhost:3000"
    
    APP_NAME: str = "Carre Adviser Auth API"
    VERSION: str = "1.0.0"
    
    MAIL_USERNAME: Optional[str] = "your-email@gmail.com"
    MAIL_PASSWORD: Optional[str] = "your-gmail-app-password"
    MAIL_FROM: Optional[str] = "your-email@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "Carre Adviser"
    
    GEMINI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-1.5-pro-latest"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
