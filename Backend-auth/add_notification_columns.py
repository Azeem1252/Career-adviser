"""
Add notification preference columns to users table
Run this script once to add the new columns
"""
import sys
sys.path.insert(0, '.')

from app.database import engine
from sqlalchemy import text

def add_notification_columns():
    with engine.connect() as conn:
        # Check if columns exist before adding
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'notification_email'
        """))
        
        if result.fetchone() is None:
            print("Adding notification columns to users table...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS notification_weekly BOOLEAN DEFAULT TRUE
            """))
            conn.commit()
            print("✅ Notification columns added successfully!")
        else:
            print("✅ Notification columns already exist!")

if __name__ == "__main__":
    add_notification_columns()
