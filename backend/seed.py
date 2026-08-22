import uuid

from datetime import datetime

from passlib.context import CryptContext

from app import models

from app.database import Base, SessionLocal, engine


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


categories = [

]


def get_hash(password: str):
    # Using a known bcrypt hash for simplicity in seed
    return "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"


def seed():

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # Clear existing data
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())

        now = datetime.utcnow()

        # ==========================================
        # PROFESSIONS
        # ==========================================

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

        # ==========================================
        # ADMIN
        # ==========================================

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

        # ==========================================
        # CUSTOMER
        # ==========================================

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

        db.add_all([admin, customer])

        # ==========================================
        # DEMO WORKERS
        # ==========================================

        worker_data = [


    # =====================================================
    # CHANDIGARH — 10 WORKERS
    # =====================================================

    {
        "name": "Rajesh Kumar",
        "mobile": "8888888801",
        "skill": "Plumber",
        "city": "Chandigarh",
        "experience": 8,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Aman Verma",
        "mobile": "8888888802",
        "skill": "Electrician",
        "city": "Chandigarh",
        "experience": 7,
        "hourly": 400,
        "daily": 2000,
    },
    {
        "name": "Harpreet Singh",
        "mobile": "8888888803",
        "skill": "Carpenter",
        "city": "Chandigarh",
        "experience": 10,
        "hourly": 450,
        "daily": 2200,
    },
    {
        "name": "Simran Kaur",
        "mobile": "8888888804",
        "skill": "Painter",
        "city": "Chandigarh",
        "experience": 6,
        "hourly": 300,
        "daily": 1700,
    },
    {
        "name": "Manpreet Singh",
        "mobile": "8888888805",
        "skill": "Plumber",
        "city": "Chandigarh",
        "experience": 9,
        "hourly": 375,
        "daily": 1900,
    },
    {
        "name": "Rohit Sharma",
        "mobile": "8888888806",
        "skill": "Electrician",
        "city": "Chandigarh",
        "experience": 11,
        "hourly": 450,
        "daily": 2300,
    },
    {
        "name": "Karan Mehta",
        "mobile": "8888888807",
        "skill": "Carpenter",
        "city": "Chandigarh",
        "experience": 7,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Pooja Sharma",
        "mobile": "8888888808",
        "skill": "Painter",
        "city": "Chandigarh",
        "experience": 5,
        "hourly": 300,
        "daily": 1600,
    },
    {
        "name": "Vishal Kapoor",
        "mobile": "8888888809",
        "skill": "Plumber",
        "city": "Chandigarh",
        "experience": 12,
        "hourly": 425,
        "daily": 2200,
    },
    {
        "name": "Neha Arora",
        "mobile": "8888888810",
        "skill": "Electrician",
        "city": "Chandigarh",
        "experience": 6,
        "hourly": 375,
        "daily": 1900,
    },

    # =====================================================
    # MOHALI — 6 WORKERS
    # =====================================================

    {
        "name": "Gurpreet Singh",
        "mobile": "8888888811",
        "skill": "Plumber",
        "city": "Mohali",
        "experience": 7,
        "hourly": 325,
        "daily": 1700,
    },
    {
        "name": "Vikas Kumar",
        "mobile": "8888888812",
        "skill": "Electrician",
        "city": "Mohali",
        "experience": 9,
        "hourly": 400,
        "daily": 2000,
    },
    {
        "name": "Deepak Verma",
        "mobile": "8888888813",
        "skill": "Carpenter",
        "city": "Mohali",
        "experience": 8,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Pooja Kaur",
        "mobile": "8888888814",
        "skill": "Painter",
        "city": "Mohali",
        "experience": 5,
        "hourly": 300,
        "daily": 1600,
    },
    {
        "name": "Arjun Singh",
        "mobile": "8888888815",
        "skill": "Plumber",
        "city": "Mohali",
        "experience": 10,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Navdeep Gill",
        "mobile": "8888888816",
        "skill": "Electrician",
        "city": "Mohali",
        "experience": 8,
        "hourly": 375,
        "daily": 1950,
    },

    # =====================================================
    # PANCHKULA — 6 WORKERS
    # =====================================================

    {
        "name": "Suresh Kumar",
        "mobile": "8888888817",
        "skill": "Plumber",
        "city": "Panchkula",
        "experience": 10,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Neeraj Singh",
        "mobile": "8888888818",
        "skill": "Electrician",
        "city": "Panchkula",
        "experience": 6,
        "hourly": 375,
        "daily": 1900,
    },
    {
        "name": "Ravi Kumar",
        "mobile": "8888888819",
        "skill": "Carpenter",
        "city": "Panchkula",
        "experience": 12,
        "hourly": 425,
        "daily": 2200,
    },
    {
        "name": "Anjali Sharma",
        "mobile": "8888888820",
        "skill": "Painter",
        "city": "Panchkula",
        "experience": 7,
        "hourly": 300,
        "daily": 1700,
    },
    {
        "name": "Manoj Verma",
        "mobile": "8888888821",
        "skill": "Plumber",
        "city": "Panchkula",
        "experience": 8,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Ritika Kapoor",
        "mobile": "8888888822",
        "skill": "Electrician",
        "city": "Panchkula",
        "experience": 5,
        "hourly": 350,
        "daily": 1800,
    },

    # =====================================================
    # DELHI — 7 WORKERS
    # =====================================================

    {
        "name": "Imran Khan",
        "mobile": "8888888823",
        "skill": "Plumber",
        "city": "Delhi",
        "experience": 9,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Rakesh Yadav",
        "mobile": "8888888824",
        "skill": "Electrician",
        "city": "Delhi",
        "experience": 10,
        "hourly": 450,
        "daily": 2300,
    },
    {
        "name": "Arjun Mehta",
        "mobile": "8888888825",
        "skill": "Painter",
        "city": "Delhi",
        "experience": 7,
        "hourly": 350,
        "daily": 1900,
    },
    {
        "name": "Sahil Kumar",
        "mobile": "8888888826",
        "skill": "Carpenter",
        "city": "Delhi",
        "experience": 8,
        "hourly": 450,
        "daily": 2200,
    },
    {
        "name": "Naveen Sharma",
        "mobile": "8888888827",
        "skill": "Plumber",
        "city": "Delhi",
        "experience": 6,
        "hourly": 375,
        "daily": 2000,
    },
    {
        "name": "Ravi Singh",
        "mobile": "8888888828",
        "skill": "Electrician",
        "city": "Delhi",
        "experience": 12,
        "hourly": 500,
        "daily": 2500,
    },
    {
        "name": "Mohit Gupta",
        "mobile": "8888888829",
        "skill": "Carpenter",
        "city": "Delhi",
        "experience": 9,
        "hourly": 425,
        "daily": 2200,
    },

    # =====================================================
    # GURGAON — 5 WORKERS
    # =====================================================

    {
        "name": "Vijay Sharma",
        "mobile": "8888888830",
        "skill": "Carpenter",
        "city": "Gurgaon",
        "experience": 9,
        "hourly": 450,
        "daily": 2300,
    },
    {
        "name": "Anil Kumar",
        "mobile": "8888888831",
        "skill": "Plumber",
        "city": "Gurgaon",
        "experience": 8,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Rohan Malhotra",
        "mobile": "8888888832",
        "skill": "Electrician",
        "city": "Gurgaon",
        "experience": 11,
        "hourly": 475,
        "daily": 2400,
    },
    {
        "name": "Kunal Arora",
        "mobile": "8888888833",
        "skill": "Painter",
        "city": "Gurgaon",
        "experience": 6,
        "hourly": 350,
        "daily": 1900,
    },
    {
        "name": "Sunil Kumar",
        "mobile": "8888888834",
        "skill": "Plumber",
        "city": "Gurgaon",
        "experience": 10,
        "hourly": 425,
        "daily": 2200,
    },

    # =====================================================
    # NOIDA — 5 WORKERS
    # =====================================================

    {
        "name": "Karan Singh",
        "mobile": "8888888835",
        "skill": "Electrician",
        "city": "Noida",
        "experience": 7,
        "hourly": 400,
        "daily": 2000,
    },
    {
        "name": "Nitin Kumar",
        "mobile": "8888888836",
        "skill": "Plumber",
        "city": "Noida",
        "experience": 6,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Akash Verma",
        "mobile": "8888888837",
        "skill": "Carpenter",
        "city": "Noida",
        "experience": 9,
        "hourly": 425,
        "daily": 2200,
    },
    {
        "name": "Priya Sharma",
        "mobile": "8888888838",
        "skill": "Painter",
        "city": "Noida",
        "experience": 5,
        "hourly": 325,
        "daily": 1750,
    },
    {
        "name": "Ravi Gupta",
        "mobile": "8888888839",
        "skill": "Electrician",
        "city": "Noida",
        "experience": 8,
        "hourly": 425,
        "daily": 2150,
    },

    # =====================================================
    # LUCKNOW — 5 WORKERS
    # =====================================================

    {
        "name": "Vivek Singh",
        "mobile": "8888888840",
        "skill": "Plumber",
        "city": "Lucknow",
        "experience": 10,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Amit Verma",
        "mobile": "8888888841",
        "skill": "Electrician",
        "city": "Lucknow",
        "experience": 8,
        "hourly": 375,
        "daily": 1900,
    },
    {
        "name": "Sanjay Mishra",
        "mobile": "8888888842",
        "skill": "Carpenter",
        "city": "Lucknow",
        "experience": 11,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Rahul Tiwari",
        "mobile": "8888888843",
        "skill": "Painter",
        "city": "Lucknow",
        "experience": 7,
        "hourly": 300,
        "daily": 1700,
    },
    {
        "name": "Deepak Singh",
        "mobile": "8888888844",
        "skill": "Plumber",
        "city": "Lucknow",
        "experience": 9,
        "hourly": 350,
        "daily": 1800,
    },

    # =====================================================
    # JAIPUR — 4 WORKERS
    # =====================================================

    {
        "name": "Mohan Lal",
        "mobile": "8888888845",
        "skill": "Painter",
        "city": "Jaipur",
        "experience": 8,
        "hourly": 300,
        "daily": 1700,
    },
    {
        "name": "Ramesh Gupta",
        "mobile": "8888888846",
        "skill": "Carpenter",
        "city": "Jaipur",
        "experience": 13,
        "hourly": 425,
        "daily": 2200,
    },
    {
        "name": "Dinesh Sharma",
        "mobile": "8888888847",
        "skill": "Electrician",
        "city": "Jaipur",
        "experience": 9,
        "hourly": 375,
        "daily": 1950,
    },
    {
        "name": "Mahesh Kumar",
        "mobile": "8888888848",
        "skill": "Plumber",
        "city": "Jaipur",
        "experience": 7,
        "hourly": 325,
        "daily": 1750,
    },

    # =====================================================
    # AMRITSAR — 4 WORKERS
    # =====================================================

    {
        "name": "Balwinder Singh",
        "mobile": "8888888849",
        "skill": "Painter",
        "city": "Amritsar",
        "experience": 10,
        "hourly": 325,
        "daily": 1800,
    },
    {
        "name": "Gagandeep Singh",
        "mobile": "8888888850",
        "skill": "Electrician",
        "city": "Amritsar",
        "experience": 8,
        "hourly": 375,
        "daily": 1950,
    },
    {
        "name": "Harish Kumar",
        "mobile": "8888888851",
        "skill": "Plumber",
        "city": "Amritsar",
        "experience": 6,
        "hourly": 325,
        "daily": 1700,
    },
    {
        "name": "Mandeep Singh",
        "mobile": "8888888852",
        "skill": "Carpenter",
        "city": "Amritsar",
        "experience": 11,
        "hourly": 400,
        "daily": 2100,
    },

    # =====================================================
    # LUDHIANA — 4 WORKERS
    # =====================================================

    {
        "name": "Jaspreet Singh",
        "mobile": "8888888853",
        "skill": "Electrician",
        "city": "Ludhiana",
        "experience": 8,
        "hourly": 350,
        "daily": 1900,
    },
    {
        "name": "Amarjit Singh",
        "mobile": "8888888854",
        "skill": "Plumber",
        "city": "Ludhiana",
        "experience": 9,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Ravinder Singh",
        "mobile": "8888888855",
        "skill": "Carpenter",
        "city": "Ludhiana",
        "experience": 10,
        "hourly": 400,
        "daily": 2100,
    },
    {
        "name": "Navjot Kaur",
        "mobile": "8888888856",
        "skill": "Painter",
        "city": "Ludhiana",
        "experience": 6,
        "hourly": 300,
        "daily": 1650,
    },

    # =====================================================
    # KANPUR — 3 WORKERS
    # =====================================================

    {
        "name": "Ashok Kumar",
        "mobile": "8888888857",
        "skill": "Plumber",
        "city": "Kanpur",
        "experience": 12,
        "hourly": 325,
        "daily": 1750,
    },
    {
        "name": "Ravi Shukla",
        "mobile": "8888888858",
        "skill": "Electrician",
        "city": "Kanpur",
        "experience": 9,
        "hourly": 350,
        "daily": 1850,
    },
    {
        "name": "Pankaj Verma",
        "mobile": "8888888859",
        "skill": "Carpenter",
        "city": "Kanpur",
        "experience": 10,
        "hourly": 375,
        "daily": 1950,
    },

    # =====================================================
    # DEHRADUN — 3 WORKERS
    # =====================================================

    {
        "name": "Rohit Negi",
        "mobile": "8888888860",
        "skill": "Plumber",
        "city": "Dehradun",
        "experience": 7,
        "hourly": 325,
        "daily": 1750,
    },
    {
        "name": "Aakash Rawat",
        "mobile": "8888888861",
        "skill": "Electrician",
        "city": "Dehradun",
        "experience": 8,
        "hourly": 375,
        "daily": 1950,
    },
    {
        "name": "Mohan Rawat",
        "mobile": "8888888862",
        "skill": "Painter",
        "city": "Dehradun",
        "experience": 6,
        "hourly": 300,
        "daily": 1650,
    },

    # =====================================================
    # AMBALA — 3 WORKERS
    # =====================================================

    {
        "name": "Raj Kumar",
        "mobile": "8888888863",
        "skill": "Electrician",
        "city": "Ambala",
        "experience": 9,
        "hourly": 350,
        "daily": 1850,
    },
    {
        "name": "Sandeep Kumar",
        "mobile": "8888888864",
        "skill": "Plumber",
        "city": "Ambala",
        "experience": 8,
        "hourly": 325,
        "daily": 1750,
    },
    {
        "name": "Vikas Sharma",
        "mobile": "8888888865",
        "skill": "Carpenter",
        "city": "Ambala",
        "experience": 11,
        "hourly": 400,
        "daily": 2050,
    },

    # =====================================================
    # PATIALA — 3 WORKERS
    # =====================================================

    {
        "name": "Gurman Singh",
        "mobile": "8888888866",
        "skill": "Plumber",
        "city": "Patiala",
        "experience": 7,
        "hourly": 325,
        "daily": 1700,
    },
    {
        "name": "Kamal Singh",
        "mobile": "8888888867",
        "skill": "Electrician",
        "city": "Patiala",
        "experience": 10,
        "hourly": 375,
        "daily": 1950,
    },
    {
        "name": "Harman Singh",
        "mobile": "8888888868",
        "skill": "Painter",
        "city": "Patiala",
        "experience": 6,
        "hourly": 300,
        "daily": 1650,
    },

    # =====================================================
    # GHAZIABAD — 3 WORKERS
    # =====================================================

    {
        "name": "Sunil Yadav",
        "mobile": "8888888869",
        "skill": "Plumber",
        "city": "Ghaziabad",
        "experience": 8,
        "hourly": 350,
        "daily": 1800,
    },
    {
        "name": "Manish Kumar",
        "mobile": "8888888870",
        "skill": "Electrician",
        "city": "Ghaziabad",
        "experience": 7,
        "hourly": 375,
        "daily": 1900,
    },
    {
        "name": "Rakesh Sharma",
        "mobile": "8888888871",
        "skill": "Carpenter",
        "city": "Ghaziabad",
        "experience": 10,
        "hourly": 400,
        "daily": 2100,
    },
]

        # ==========================================
        # CREATE WORKERS
        # ==========================================

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

            db.add(worker)

            # Find matching profession
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

        # ==========================================
        # CUSTOMER PROFILE
        # ==========================================

        customer_profile = models.CustomerProfile(
            customer_profile_id=str(uuid.uuid4()),
            user=customer,
            created_at=now,
            updated_at=now
        )

        db.add(customer_profile)

        # ==========================================
        # SAVE EVERYTHING
        # ==========================================

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    print("Seed complete with demo workers.")


if __name__ == "__main__":
    seed()