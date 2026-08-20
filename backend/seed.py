import requests

BASE_URL = "http://localhost:8000"

categories = [
    {"name": "Electrician", "category": "Home Maintenance", "description": "Electrical repairs and installations"},
    {"name": "Plumber", "category": "Home Maintenance", "description": "Pipe fitting, leakage, and plumbing"},
    {"name": "Painter", "category": "Construction & Renovation", "description": "House painting and polishing"},
    {"name": "Carpenter", "category": "Woodwork", "description": "Furniture repair and assembly"},
    {"name": "Mason", "category": "Construction & Renovation", "description": "Brickwork and concrete"},
    {"name": "Welder", "category": "Metalwork", "description": "Welding and metal fabrication"},
    {"name": "Cleaner", "category": "Cleaning", "description": "Deep cleaning and housekeeping"},
    {"name": "Driver", "category": "Transportation", "description": "Personal and commercial driving"},
    {"name": "Construction Worker", "category": "Construction & Renovation", "description": "General construction labor"},
    {"name": "AC/Appliance Technician", "category": "Appliance Repair", "description": "AC and appliance servicing"},
    {"name": "Gardener", "category": "Landscaping", "description": "Gardening and lawn care"},
    {"name": "Other", "category": "Miscellaneous", "description": "Other skilled services"}
]

import sqlite3
import uuid
from datetime import datetime

def seed():
    conn = sqlite3.connect("sql_app.db")
    cursor = conn.cursor()
    for cat in categories:
        # check if exists
        cursor.execute("SELECT * FROM professions WHERE name=?", (cat["name"],))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO professions (profession_id, name, category, description, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), cat["name"], cat["category"], cat["description"], datetime.utcnow(), datetime.utcnow(), 0)
            )
    conn.commit()
    conn.close()
    print("Seed complete.")

if __name__ == "__main__":
    seed()
