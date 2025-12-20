
import sys
import os
from sqlalchemy import create_engine, text

# Add parent dir to path to import settings if needed, but let's just use .env directly or define here
db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Successfully connected to the database!")
        print(f"Result: {result.fetchone()}")
except Exception as e:
    print(f"Failed to connect: {e}")
    sys.exit(1)
