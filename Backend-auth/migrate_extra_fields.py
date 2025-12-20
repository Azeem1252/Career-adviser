import sqlite3
import os

db_path = 'app.db'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

columns_to_add = [
    ("linkedin", "TEXT"),
    ("github", "TEXT"),
    ("website", "TEXT"),
    ("skills", "TEXT"), # even if using JSON in SQLAlchemy, it's TEXT in SQLite
    ("profile_summary", "TEXT"),
    ("xp", "INTEGER DEFAULT 0")
]

for col_name, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        print(f"Added column {col_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {col_name} already exists")
        else:
            print(f"Error adding {col_name}: {e}")

conn.commit()
conn.close()
print("Migration completed.")
