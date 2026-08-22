"""
Script to create or reset the admin account in the database.
Run from: e:\Cypherverse-hackathon-2026\backend\
Usage: python create_admin.py
"""
import uuid
from datetime import datetime
from passlib.context import CryptContext
from app import models
from app.database import SessionLocal, engine, Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_MOBILE = "9999999999"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "Super Admin"

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(models.User).filter(
            models.User.mobile_number == ADMIN_MOBILE
        ).first()

        hashed = pwd_context.hash(ADMIN_PASSWORD)

        if existing:
            # Update existing admin password
            existing.hashed_password = hashed
            existing.account_type = models.RoleEnum.ADMIN
            existing.full_name = ADMIN_NAME
            db.commit()
            print(f"✅ Admin account UPDATED")
        else:
            # Create fresh admin
            admin = models.User(
                user_id=str(uuid.uuid4()),
                mobile_number=ADMIN_MOBILE,
                full_name=ADMIN_NAME,
                hashed_password=hashed,
                account_type=models.RoleEnum.ADMIN,
                verification_status=models.VerificationStatusEnum.VERIFIED,
                account_status=models.AccountStatusEnum.ACTIVE,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin account CREATED")

        print(f"\n📱 Mobile : {ADMIN_MOBILE}")
        print(f"🔑 Password: {ADMIN_PASSWORD}")
        print(f"\nLogin at /login with these credentials.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
