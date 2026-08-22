import uuid

from datetime import datetime

from passlib.context import CryptContext

from app import models

from app.database import Base, SessionLocal, engine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

categories = [
    {"name": "Electrician", "category": "Home Maintenance", "description": "Electrical repairs"},
    {"name": "Plumber", "category": "Home Maintenance", "description": "Pipe fitting and leaks"},
    {"name": "Painter", "category": "Construction", "description": "House painting"},
    {"name": "Carpenter", "category": "Woodwork", "description": "Furniture repair"},
    {"name": "Tractor Driver", "category": "Logistics & Driving", "description": "Agricultural and transport driving"},
    {"name": "Cleaner / Sweeper", "category": "Sanitation & Cleaning", "description": "Cleaning and sweep services"},
    {"name": "House Help / Maid", "category": "Domestic Help", "description": "Household chores and assistance"},
    {"name": "Daily Wage Labourer", "category": "General Labour", "description": "Unskilled and semi-skilled daily wage tasks"},
    {"name": "Construction Worker", "category": "Construction", "description": "Building and construction site assistance"}
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

        # -----------------------------------
        # PROFESSIONS
        # -----------------------------------

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

        # -----------------------------------
        # ADMIN
        # -----------------------------------

        admin = models.User(
            user_id=str(uuid.uuid4()),
            mobile_number="9999999999",
            full_name="Super Admin",
            hashed_password=get_hash("admin123"),
            account_type=models.RoleEnum.ADMIN,
            verification_status=models.VerificationStatusEnum.VERIFIED,
            account_status=models.AccountStatusEnum.ACTIVE,
            created_at=now,
            updated_at=now,
        )

        # -----------------------------------
        # CUSTOMER
        # -----------------------------------

        customer = models.User(
            user_id=str(uuid.uuid4()),
            mobile_number="7777777777",
            full_name="Amit Sharma",
            hashed_password=get_hash("cust123"),
            account_type=models.RoleEnum.CUSTOMER,
            verification_status=models.VerificationStatusEnum.VERIFIED,
            account_status=models.AccountStatusEnum.ACTIVE,
            created_at=now,
            updated_at=now,
        )

        # -----------------------------------
        # DEMO WORKERS
        # -----------------------------------

        worker_data = [
            {
                "name": "Rajesh Kumar",
                "mobile": "8888888801",
                "skill": "Plumber",
                "city": "Lucknow",
                "experience": 8,
                "hourly": 350,
                "daily": 1800,
            },
            {
                "name": "Aman Verma",
                "mobile": "8888888802",
                "skill": "Plumber",
                "city": "Lucknow",
                "experience": 6,
                "hourly": 300,
                "daily": 1600,
            },
            {
                "name": "Vivek Singh",
                "mobile": "8888888803",
                "skill": "Plumber",
                "city": "Lucknow",
                "experience": 10,
                "hourly": 400,
                "daily": 2000,
            },
            {
                "name": "Rohit Yadav",
                "mobile": "8888888804",
                "skill": "Electrician",
                "city": "Lucknow",
                "experience": 7,
                "hourly": 350,
                "daily": 1800,
            },
            {
                "name": "Suresh Mishra",
                "mobile": "8888888805",
                "skill": "Carpenter",
                "city": "Lucknow",
                "experience": 12,
                "hourly": 400,
                "daily": 2000,
            },
            {
                "name": "Arjun Gupta",
                "mobile": "8888888806",
                "skill": "Painter",
                "city": "Lucknow",
                "experience": 9,
                "hourly": 300,
                "daily": 1700,
            },
            {
                "name": "Baldev Singh",
                "mobile": "8888888807",
                "skill": "Tractor Driver",
                "city": "Lucknow",
                "experience": 10,
                "hourly": 400,
                "daily": 2200,
            },
            {
                "name": "Ramesh Chand",
                "mobile": "8888888808",
                "skill": "Cleaner / Sweeper",
                "city": "Lucknow",
                "experience": 4,
                "hourly": 250,
                "daily": 1200,
            },
            {
                "name": "Sunita Devi",
                "mobile": "8888888809",
                "skill": "House Help / Maid",
                "city": "Lucknow",
                "experience": 6,
                "hourly": 200,
                "daily": 1000,
            },
            {
                "name": "Ram Charan",
                "mobile": "8888888810",
                "skill": "Daily Wage Labourer",
                "city": "Lucknow",
                "experience": 5,
                "hourly": 250,
                "daily": 1200,
            },
            {
                "name": "Jagdish Prasad",
                "mobile": "8888888811",
                "skill": "Construction Worker",
                "city": "Lucknow",
                "experience": 9,
                "hourly": 300,
                "daily": 1500,
            },
        ]

        workers = []

        for data in worker_data:

            worker = models.User(
                user_id=str(uuid.uuid4()),
                mobile_number=data["mobile"],
                full_name=data["name"],
                hashed_password=get_hash("worker123"),
                account_type=models.RoleEnum.WORKER,
                verification_status=models.VerificationStatusEnum.VERIFIED,
                account_status=models.AccountStatusEnum.ACTIVE,
                created_at=now,
                updated_at=now,
            )

            workers.append(worker)

            db.add(worker)

            # Find the profession matching this worker's skill
            profession = next(
                p for p in profession_records
                if p.name.lower() == data["skill"].lower()
            )

            worker_profile = models.WorkerProfile(
                worker_profile_id=str(uuid.uuid4()),
                user=worker,
                years_of_experience=data["experience"],
                hourly_rate=data["hourly"],
                daily_rate=data["daily"],
                home_city=data["city"],
                availability_status=models.AvailabilityStatusEnum.AVAILABLE_NOW,
                created_at=now,
                updated_at=now,
            )

            db.add(worker_profile)

            worker_skill = models.WorkerSkill(
                worker_skill_id=str(uuid.uuid4()),
                worker=worker_profile,
                profession=profession,
                created_at=now,
                updated_at=now,
            )

            db.add(worker_skill)

            # Welcome notification for each worker
            notification = models.Notification(
                notification_id=str(uuid.uuid4()),
                user=worker,
                title="Welcome to ShramSetu",
                message="Your account has been verified.",
                type=models.NotificationTypeEnum.KYC_VERIFIED,
                is_read=False,
                action_url="/worker-dashboard",
                created_at=now,
                updated_at=now,
            )

            db.add(notification)

        # -----------------------------------
        # CUSTOMER PROFILE
        # -----------------------------------

        customer_profile = models.CustomerProfile(
            customer_profile_id=str(uuid.uuid4()),
            user=customer,
            created_at=now,
            updated_at=now
        )

        # -----------------------------------
        # SAVE ADMIN + CUSTOMER
        # -----------------------------------

        db.add(admin)
        db.add(customer)
        db.add(customer_profile)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    print("Seed complete with demo workers.")


if __name__ == "__main__":
    seed()