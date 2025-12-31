import psycopg2
db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

def verify():
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Try to select the problematic columns
        cursor.execute("SELECT id, email, onboarded, career_preferences FROM users LIMIT 1")
        row = cursor.fetchone()
        print(f"Successfully queried user table. Row sample: {row}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Verification failed: {e}")

if __name__ == "__main__":
    verify()
