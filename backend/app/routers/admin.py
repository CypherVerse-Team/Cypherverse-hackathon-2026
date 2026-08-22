from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db
from typing import List, Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_workers = db.query(models.User).filter(models.User.account_type.in_([models.RoleEnum.WORKER, models.RoleEnum.GROUP_LEADER])).count()
    total_customers = db.query(models.User).filter(models.User.account_type == models.RoleEnum.CUSTOMER).count()
    total_contractors = db.query(models.User).filter(models.User.account_type == models.RoleEnum.CONTRACTOR).count()
    total_bookings = db.query(models.Booking).count()
    total_revenue = db.query(func.sum(models.Booking.agreed_amount)).scalar() or 0
    
    pending_verifications = db.query(models.VerificationRequest).filter(
        models.VerificationRequest.status == models.VerificationStatusEnum.PENDING
    ).count()

    return {
        "total_users": total_users,
        "total_workers": total_workers,
        "total_customers": total_customers,
        "total_contractors": total_contractors,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "pending_verifications": pending_verifications
    }

@router.get("/users")
def get_all_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.account_type == role)
    users = query.order_by(models.User.created_at.desc()).all()
    
    result = []
    for u in users:
        result.append({
            "user_id": u.user_id,
            "full_name": u.full_name,
            "mobile_number": u.mobile_number,
            "account_type": u.account_type.value if hasattr(u.account_type, 'value') else str(u.account_type),
            "verification_status": u.verification_status.value if hasattr(u.verification_status, 'value') else str(u.verification_status),
            "account_status": u.account_status.value if hasattr(u.account_status, 'value') else str(u.account_status),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
        })
    return result

@router.patch("/users/{user_id}/status")
def update_user_status(user_id: str, status: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        user.account_status = models.AccountStatusEnum(status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid account status")
    
    db.commit()
    return {"message": "User status updated", "account_status": user.account_status.value}

@router.patch("/users/{user_id}/verify")
def update_user_verification(user_id: str, status: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        user.verification_status = models.VerificationStatusEnum(status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid verification status")
    
    db.commit()
    return {"message": "Verification status updated", "verification_status": user.verification_status.value}

@router.get("/bookings")
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        customer_user = b.customer.user if b.customer and b.customer.user else None
        worker_user = b.worker.user if b.worker and b.worker.user else None
        result.append({
            "booking_id": b.booking_id,
            "customer_name": customer_user.full_name if customer_user else "Customer",
            "customer_mobile": customer_user.mobile_number if customer_user else "—",
            "worker_name": worker_user.full_name if worker_user else "Worker",
            "worker_mobile": worker_user.mobile_number if worker_user else "—",
            "booking_status": b.booking_status.value if hasattr(b.booking_status, 'value') else str(b.booking_status),
            "agreed_amount": b.agreed_amount,
            "currency": b.currency,
            "duration_type": b.duration_type,
            "scheduled_date": b.scheduled_date.isoformat() if b.scheduled_date else None,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return result

@router.patch("/bookings/{booking_id}/status")
def update_booking_status(booking_id: str, status: str = Query(...), db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    try:
        b.booking_status = models.BookingStatusEnum(status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking status")
        
    db.commit()
    return {"message": "Booking status updated", "booking_status": b.booking_status.value}
