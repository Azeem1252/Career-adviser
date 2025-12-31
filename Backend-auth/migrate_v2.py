import psycopg2
from urllib.parse import urlparse

# DATABASE_URL = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"
db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

def migrate():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("--- Adding new columns to 'users' table ---")
        users_columns = [
            ("onboarded", "BOOLEAN DEFAULT FALSE"),
            ("career_preferences", "JSON")
        ]

        for col_name, col_type in users_columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column users.{col_name}")
            except Exception as e:
                print(f"Skipping users.{col_name}: {e}")

        print("\n--- Updating 'career_assessments' table ---")
        try:
            cursor.execute("ALTER TABLE career_assessments ADD COLUMN assessment_type VARCHAR DEFAULT 'initial'")
            print("Added column career_assessments.assessment_type")
        except Exception as e:
            print(f"Skipping career_assessments.assessment_type: {e}")

        print("\n--- Creating 'job_applications' table ---")
        create_table_query = """
        CREATE TABLE IF NOT EXISTS job_applications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            company_name VARCHAR NOT NULL,
            job_title VARCHAR NOT NULL,
            status VARCHAR DEFAULT 'Wishlist',
            applied_at TIMESTAMP WITH TIME ZONE,
            job_url VARCHAR,
            notes TEXT,
            salary_expectation VARCHAR,
            location VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        )
        """
        try:
            cursor.execute(create_table_query)
            print("Table 'job_applications' created or already exists.")
        except Exception as e:
            print(f"Error creating 'job_applications' table: {e}")

        cursor.close()
        conn.close()
        print("\nMigration completed successfully.")
    except Exception as e:
        print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate()
