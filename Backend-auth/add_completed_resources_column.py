from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print(f"Checking for completed_resources column in roadmap_progress...")
        try:
            if "sqlite" in DATABASE_URL:
                conn.execute(text("ALTER TABLE roadmap_progress ADD COLUMN completed_resources JSON"))
            else:
                conn.execute(text("ALTER TABLE roadmap_progress ADD COLUMN IF NOT EXISTS completed_resources JSONB"))
            
            conn.commit()
            print("Migration successful: added completed_resources column.")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column already exists, skipping.")
            else:
                print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
