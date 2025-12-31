import psycopg2
from urllib.parse import urlparse

db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

def migrate():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("--- Dropping XP-related columns from 'users' table ---")
        columns_to_drop = ["xp", "streak", "progress"]

        for col_name in columns_to_drop:
            try:
                # Check if column exists first
                cursor.execute(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{col_name}';
                """)
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE users DROP COLUMN {col_name}")
                    print(f"Dropped column users.{col_name}")
                else:
                    print(f"Column users.{col_name} does not exist, skipping.")
            except Exception as e:
                print(f"Error dropping users.{col_name}: {e}")

        cursor.close()
        conn.close()
        print("\nXP Cleanup Migration completed successfully.")
    except Exception as e:
        print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate()
