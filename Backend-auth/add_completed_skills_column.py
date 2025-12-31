from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local sqlite if no env
    DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print(f"Checking for completed_skills column in roadmap_progress...")
        try:
            # Check if column exists (SQLite specific check, but works for basic alter)
            if "sqlite" in DATABASE_URL:
                conn.execute(text("ALTER TABLE roadmap_progress ADD COLUMN completed_skills JSON"))
            else:
                # PostgreSQL/MySQL
                conn.execute(text("ALTER TABLE roadmap_progress ADD COLUMN IF NOT EXISTS completed_skills JSONB"))
            
            conn.commit()
            print("Migration successful: added completed_skills column.")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column already exists, skipping.")
            else:
                print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
