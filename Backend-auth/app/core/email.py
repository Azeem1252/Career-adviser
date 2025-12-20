from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType
from .config import settings  # Use initialized settings object instead of Config class
from pathlib import Path
import logging

logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parent

# Use settings object for consistent configuration loading
# Initialize mail configuration only if valid credentials are provided
mail = None
try:
    # Check if mail credentials are configured (not placeholder values)
    if (settings.MAIL_USERNAME and 
        settings.MAIL_PASSWORD and 
        'your-email' not in settings.MAIL_USERNAME.lower() and
        'your-gmail' not in settings.MAIL_PASSWORD.lower()):
        
        mail_config = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
        )
        mail = FastMail(config=mail_config)
        logger.info("Email service initialized successfully")
    else:
        logger.warning("Email credentials not configured - email features will be disabled")
except Exception as e:
    logger.error(f"Failed to initialize email service: {e}")
    mail = None

def create_message(recipients: list[str], subject: str, body: str) -> MessageSchema:
    """
    Create an email message with HTML body.
    
    Args:
        recipients: List of recipient email addresses
        subject: Email subject line
        body: HTML email body content
    
    Returns:
        MessageSchema object ready to be sent via mail.send_message()
    """
    return MessageSchema(
        recipients=recipients, 
        subject=subject, 
        body=body, 
        subtype=MessageType.html
    )
