import psycopg2
from urllib.parse import urlparse

# DATABASE_URL = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"
# Hardcode or parse from .env if needed, but the user .env has this:
db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

def migrate():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        columns_to_add = [
            ("bio", "TEXT"),
            ("location", "TEXT"),
            ("linkedin", "TEXT"),
            ("github", "TEXT"),
            ("website", "TEXT"),
            ("skills", "JSON"),
            ("profile_summary", "TEXT"),
            ("xp", "INTEGER DEFAULT 0"),
            ("avatar_url", "TEXT"),
            ("created_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "TIMESTAMP WITH TIME ZONE")
        ]

        for col_name, col_type in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column {col_name}")
            except Exception as e:
                print(f"Skipping {col_name}: {e}")

        cursor.close()
        conn.close()
        print("Migration for PostgreSQL completed.")
    except Exception as e:
        print(f"Primary Migration Error: {e}")

if __name__ == "__main__":
    migrate()
