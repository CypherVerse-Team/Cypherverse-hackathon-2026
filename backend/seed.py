import uuid
from datetime import datetime
from passlib.context import CryptContext

from app import models
from app.database import Base, SessionLocal, engine

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
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())

        now = datetime.utcnow()
        profession_records = [
            models.Profession(
                profession_id=str(uuid.uuid4()),
                name=cat["name"],
                category=cat["category"],
                description=cat["description"],
                created_at=now,
                updated_at=now,
            )
            for cat in categories
        ]
        db.add_all(profession_records)

        admin = models.User(
            user_id=str(uuid.uuid4()), mobile_number="9999999999", full_name="Super Admin",
            hashed_password=get_hash("admin123"), account_type=models.RoleEnum.ADMIN,
            verification_status=models.VerificationStatusEnum.VERIFIED,
            account_status=models.AccountStatusEnum.ACTIVE, created_at=now, updated_at=now,
        )
        worker = models.User(
            user_id=str(uuid.uuid4()), mobile_number="8888888888", full_name="Ramesh Kumar",
            hashed_password=get_hash("worker123"), account_type=models.RoleEnum.WORKER,
            verification_status=models.VerificationStatusEnum.VERIFIED,
            account_status=models.AccountStatusEnum.ACTIVE, created_at=now, updated_at=now,
        )
        customer = models.User(
            user_id=str(uuid.uuid4()), mobile_number="7777777777", full_name="Amit Sharma",
            hashed_password=get_hash("cust123"), account_type=models.RoleEnum.CUSTOMER,
            verification_status=models.VerificationStatusEnum.VERIFIED,
            account_status=models.AccountStatusEnum.ACTIVE, created_at=now, updated_at=now,
        )
        db.add_all([admin, worker, customer])

        worker_profile = models.WorkerProfile(
            worker_profile_id=str(uuid.uuid4()), user=worker, years_of_experience=5,
            hourly_rate=200, daily_rate=1500, home_city="Delhi",
            availability_status=models.AvailabilityStatusEnum.AVAILABLE_NOW,
            created_at=now, updated_at=now,
        )
        customer_profile = models.CustomerProfile(
            customer_profile_id=str(uuid.uuid4()), user=customer, created_at=now, updated_at=now
        )
        db.add_all([worker_profile, customer_profile])
        db.add(models.WorkerSkill(
            worker_skill_id=str(uuid.uuid4()), worker=worker_profile,
            profession=profession_records[0], created_at=now, updated_at=now,
        ))
        db.add(models.Notification(
            notification_id=str(uuid.uuid4()), user=worker, title="Welcome to ShramSetu",
            message="Your account has been verified.", type=models.NotificationTypeEnum.KYC_VERIFIED,
            is_read=False, action_url="/worker-dashboard", created_at=now, updated_at=now,
        ))
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    print("Seed complete with dummy users and translations.")

if __name__ == "__main__":
    seed()
