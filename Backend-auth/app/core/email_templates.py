"""
Email template utilities for sending formatted emails.
"""

def get_verification_email_template(verification_url: str, user_name: str) -> str:
    """
    Generate HTML template for email verification.
    
    Args:
        verification_url: The URL the user should click to verify their email
        user_name: The name of the user receiving the email
    
    Returns:
        HTML string for the email body
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 30px;
                border-bottom: 2px solid #4F46E5;
            }}
            .header h1 {{
                color: #4F46E5;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 30px 0;
                color: #333333;
                line-height: 1.6;
            }}
            .button {{
                display: inline-block;
                padding: 15px 40px;
                background-color: #4F46E5;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }}
            .button:hover {{
                background-color: #4338CA;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            .warning {{
                background-color: #FEF3C7;
                border-left: 4px solid #F59E0B;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .warning p {{
                margin: 0;
                color: #92400E;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Carre Adviser</h1>
            </div>
            <div class="content">
                <h2>Hello {user_name}! 👋</h2>
                <p>Thank you for signing up for Carre Adviser! We're excited to help you navigate your career path.</p>
                <p>To complete your registration and start exploring your career opportunities, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_url}" class="button">Verify Email Address</a>
                </div>
                
                <div class="warning">
                    <p><strong>⚠️ Security Notice:</strong> This link will expire in 24 hours for your security.</p>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">{verification_url}</p>
                
                <p>If you didn't create an account with Carre Adviser, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2025 Carre Adviser. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_password_reset_email_template(reset_url: str, user_name: str) -> str:
    """
    Generate HTML template for password reset.
    
    Args:
        reset_url: The URL the user should click to reset their password
        user_name: The name of the user receiving the email
    
    Returns:
        HTML string for the email body
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 30px;
                border-bottom: 2px solid #DC2626;
            }}
            .header h1 {{
                color: #DC2626;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 30px 0;
                color: #333333;
                line-height: 1.6;
            }}
            .button {{
                display: inline-block;
                padding: 15px 40px;
                background-color: #DC2626;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }}
            .button:hover {{
                background-color: #B91C1C;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            .warning {{
                background-color: #FEE2E2;
                border-left: 4px solid #DC2626;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .warning p {{
                margin: 0;
                color: #7F1D1D;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
                <h2>Hello {user_name}! 👋</h2>
                <p>We received a request to reset your password for your Carre Adviser account.</p>
                <p>Click the button below to choose a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </div>
                
                <div class="warning">
                    <p><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.</p>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #DC2626;">{reset_url}</p>
                
                <p><strong>Didn't request a password reset?</strong> You can safely ignore this email. Your password will not be changed.</p>
            </div>
            <div class="footer">
                <p>© 2025 Carre Adviser. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_welcome_email_template(user_name: str) -> str:
    """
    Generate HTML template for welcome email after successful verification.
    
    Args:
        user_name: The name of the user receiving the email
    
    Returns:
        HTML string for the email body
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Carre Adviser</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 30px;
                border-bottom: 2px solid #10B981;
            }}
            .header h1 {{
                color: #10B981;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 30px 0;
                color: #333333;
                line-height: 1.6;
            }}
            .features {{
                background-color: #F0FDF4;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .features ul {{
                margin: 10px 0;
                padding-left: 25px;
            }}
            .features li {{
                margin: 10px 0;
                color: #065F46;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Carre Adviser!</h1>
            </div>
            <div class="content">
                <h2>Congratulations {user_name}! 🚀</h2>
                <p>Your email has been successfully verified, and your account is now active!</p>
                
                <div class="features">
                    <h3 style="color: #065F46; margin-top: 0;">✨ What you can do now:</h3>
                    <ul>
                        <li><strong>AI Career Analysis:</strong> Get personalized career advice powered by AI</li>
                        <li><strong>Skill Assessment:</strong> Evaluate your professional skills</li>
                        <li><strong>Roadmap Generation:</strong> Create clear paths to your goals</li>
                        <li><strong>Job Compatibility:</strong> See how you match with different roles</li>
                        <li><strong>Progress Tracking:</strong> Monitor your professional growth</li>
                    </ul>
                </div>
                
                <p>Ready to start your professional journey? Head over to your dashboard and begin exploring!</p>
                
                <p>If you have any questions or need help, feel free to reach out to our support team.</p>
                
                <p>Happy learning! 📚</p>
            </div>
            <div class="footer">
                <p>© 2025 Carre Adviser. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """
