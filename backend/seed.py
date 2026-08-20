import sqlite3
import uuid
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

categories = [
    {"name": "Electrician (इलेक्ट्रीशियन)", "category": "Home Maintenance", "description": "Electrical repairs"},
    {"name": "Plumber (प्लंबर)", "category": "Home Maintenance", "description": "Pipe fitting and leaks"},
    {"name": "Painter (पेंटर)", "category": "Construction", "description": "House painting"},
    {"name": "Carpenter (बढ़ई)", "category": "Woodwork", "description": "Furniture repair"}
]

def get_hash(password: str):
    # Using a known bcrypt hash for simplicity in seed to avoid passlib bugs
    return "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

def seed():
    conn = sqlite3.connect("sql_app.db")
    cursor = conn.cursor()
    
    # 1. Seed Categories
    cursor.execute("DELETE FROM professions")
    for cat in categories:
        cursor.execute(
            "INSERT INTO professions (profession_id, name, category, description, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), cat["name"], cat["category"], cat["description"], datetime.utcnow(), datetime.utcnow(), 0)
        )
        
    # 2. Seed Users
    cursor.execute("DELETE FROM users")
    
    admin_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO users (user_id, mobile_number, full_name, hashed_password, account_type, verification_status, account_status, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (admin_id, "9999999999", "Super Admin", get_hash("admin123"), "ADMIN", "VERIFIED", "ACTIVE", datetime.utcnow(), datetime.utcnow(), 0))
                   
    worker_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO users (user_id, mobile_number, full_name, hashed_password, account_type, verification_status, account_status, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (worker_id, "8888888888", "Ramesh Kumar", get_hash("worker123"), "WORKER", "VERIFIED", "ACTIVE", datetime.utcnow(), datetime.utcnow(), 0))
                   
    customer_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO users (user_id, mobile_number, full_name, hashed_password, account_type, verification_status, account_status, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (customer_id, "7777777777", "Amit Sharma", get_hash("cust123"), "CUSTOMER", "VERIFIED", "ACTIVE", datetime.utcnow(), datetime.utcnow(), 0))

    # 3. Seed Worker Profile
    cursor.execute("DELETE FROM worker_profiles")
    cursor.execute("SELECT profession_id FROM professions LIMIT 1")
    prof_id = cursor.fetchone()[0]
    
    worker_prof_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO worker_profiles (worker_profile_id, user_id, years_of_experience, hourly_rate, daily_rate, home_city, availability_status, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (worker_prof_id, worker_id, 5, 200, 1500, "Delhi", "AVAILABLE_NOW", datetime.utcnow(), datetime.utcnow(), 0))
                   
    cursor.execute("DELETE FROM worker_skills")
    cursor.execute("INSERT INTO worker_skills (worker_skill_id, worker_id, profession_id, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                   (str(uuid.uuid4()), worker_prof_id, prof_id, datetime.utcnow(), datetime.utcnow(), 0))
    
    # 4. Seed Notification for Worker
    cursor.execute("DELETE FROM notifications")
    cursor.execute("INSERT INTO notifications (notification_id, user_id, title, message, type, is_read, action_url, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (str(uuid.uuid4()), worker_id, "Welcome to ShramSetu", "Your account has been verified.", "KYC_VERIFIED", 0, "/worker-dashboard", datetime.utcnow(), datetime.utcnow(), 0))

    conn.commit()
    conn.close()
    print("Seed complete with dummy users and translations.")

if __name__ == "__main__":
    seed()
