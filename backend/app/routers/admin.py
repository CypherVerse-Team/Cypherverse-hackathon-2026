from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_admin
from typing import List

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)): # Removed Depends(get_current_admin) for easier testing, add back in prod
    total_users = db.query(models.User).count()
    total_workers = db.query(models.User).filter(models.User.account_type == models.RoleEnum.WORKER).count()
    total_bookings = db.query(models.Booking).count()
    total_revenue = db.query(func.sum(models.Booking.agreed_amount)).scalar() or 0
    
    pending_verifications = db.query(models.User).filter(
        models.User.account_type == models.RoleEnum.WORKER,
        models.User.verification_status == False
    ).count()

    return {
        "total_users": total_users,
        "total_workers": total_workers,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "pending_verifications": pending_verifications
    }

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


