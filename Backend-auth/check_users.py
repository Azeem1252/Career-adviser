import psycopg2

db_url = "postgresql://postgres:Azeem12345@127.0.0.1:5432/CarreerAdviser"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute('SELECT id, email, name, is_verified, is_active, created_at FROM users ORDER BY id')
    users = cur.fetchall()
    
    print('=== ALL USERS IN DATABASE ===')
    if not users:
        print('No users found in database')
    else:
        for u in users:
            print(f'ID: {u[0]}')
            print(f'Email: {u[1]}')
            print(f'Name: {u[2]}')
            print(f'Verified: {u[3]}')
            print(f'Active: {u[4]}')
            print(f'Created: {u[5]}')
            print('-' * 50)
        print(f'\nTotal users: {len(users)}')
    
    cur.close()
    conn.close()
except Exception as e:
    print(f'Error: {e}')
