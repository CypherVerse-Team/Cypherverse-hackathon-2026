"""
Resets or creates the admin account with a properly hashed password.
Run: python reset_admin.py
"""
import uuid
import bcrypt
from datetime import datetime
from app import models
from app.database import SessionLocal, engine, Base

ADMIN_MOBILE = "9999999999"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "Super Admin"

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        hashed = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode()

        existing = db.query(models.User).filter(
            models.User.mobile_number == ADMIN_MOBILE
        ).first()

        if existing:
            existing.hashed_password = hashed
            existing.account_type = models.RoleEnum.ADMIN
            existing.full_name = ADMIN_NAME
            db.commit()
            print("Admin account UPDATED successfully.")
        else:
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
            print("Admin account CREATED successfully.")

        print(f"\nLogin credentials:")
        print(f"  Mobile  : {ADMIN_MOBILE}")
        print(f"  Password: {ADMIN_PASSWORD}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
