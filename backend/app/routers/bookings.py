import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_user
from typing import List

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Lookup or create customer profile for the current user
    customer_profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == current_user.user_id).first()
    if not customer_profile:
        customer_profile = models.CustomerProfile(
            user_id=current_user.user_id,
            city="Delhi NCR"
        )
        db.add(customer_profile)
        db.commit()
        db.refresh(customer_profile)
        
    # Find worker profile either by user_id or worker_profile_id
    worker_profile = db.query(models.WorkerProfile).filter(
        (models.WorkerProfile.user_id == booking.worker_id) | 
        (models.WorkerProfile.worker_profile_id == booking.worker_id)
    ).first()
    
    if not worker_profile:
        # Fallback: check if worker_id is a User
        worker_user = db.query(models.User).filter(models.User.user_id == booking.worker_id).first()
        if worker_user:
            worker_profile = models.WorkerProfile(
                user_id=worker_user.user_id,
                hourly_rate=350,
                home_city="Delhi NCR",
                short_description="Professional Labour"
            )
            db.add(worker_profile)
            db.commit()
            db.refresh(worker_profile)
        else:
            raise HTTPException(status_code=404, detail="Worker profile not found")

    new_booking = models.Booking(
        customer_id=customer_profile.customer_profile_id,
        worker_id=worker_profile.worker_profile_id,
        scheduled_date=booking.scheduled_date or datetime.utcnow(),
        duration_type=booking.duration_type or "<2hrs",
        agreed_amount=booking.agreed_amount,
        currency=booking.currency or "INR",
        service_address_id=booking.service_address_id,
        estimated_start_time=booking.estimated_start_time,
        price_locked=False
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # Add status history
    history = models.BookingStatusHistory(
        booking_id=new_booking.booking_id,
        new_status=models.BookingStatusEnum.PENDING,
        actor_role=models.RoleEnum.CUSTOMER
    )
    db.add(history)
    db.commit()
    
    return _mask_booking(new_booking)

def _mask_booking(b: models.Booking):
    hidden_status = [models.BookingStatusEnum.PENDING, models.BookingStatusEnum.REJECTED, models.BookingStatusEnum.CANCELLED]
    is_hidden = b.booking_status in hidden_status
    
    customer_name = b.customer.user.full_name if b.customer and b.customer.user else "Customer"
    customer_mobile = b.customer.user.mobile_number if b.customer and b.customer.user else ""
    worker_name = b.worker.user.full_name if b.worker and b.worker.user else "Worker"
    worker_mobile = b.worker.user.mobile_number if b.worker and b.worker.user else ""

    if is_hidden:
        if customer_mobile: customer_mobile = "+91-XXXXX-XXXXX"
        if worker_mobile: worker_mobile = "+91-XXXXX-XXXXX"

    return schemas.BookingResponse(
        booking_id=b.booking_id,
        customer_id=b.customer_id,
        worker_id=b.worker_id,
        booking_status=b.booking_status,
        scheduled_date=b.scheduled_date,
        duration_type=b.duration_type,
        agreed_amount=b.agreed_amount,
        currency=b.currency,
        price_locked=b.price_locked,
        estimated_start_time=b.estimated_start_time,
        customer=schemas.BookingUserResponse(name=customer_name, mobile_number=customer_mobile),
        worker=schemas.BookingUserResponse(name=worker_name, mobile_number=worker_mobile)
    )

@router.get("/me", response_model=List[schemas.BookingResponse])
def get_my_bookings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = []
    if current_user.account_type in [models.RoleEnum.CUSTOMER, models.RoleEnum.CONTRACTOR, models.RoleEnum.ADMIN]:
        profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == current_user.user_id).first()
        if profile:
            bookings = db.query(models.Booking).filter(models.Booking.customer_id == profile.customer_profile_id).order_by(models.Booking.created_at.desc()).all()
    elif current_user.account_type in [models.RoleEnum.WORKER, models.RoleEnum.GROUP_LEADER]:
        profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == current_user.user_id).first()
        if profile:
            bookings = db.query(models.Booking).filter(models.Booking.worker_id == profile.worker_profile_id).order_by(models.Booking.created_at.desc()).all()
    
    return [_mask_booking(b) for b in bookings]

@router.patch("/{booking_id}/status", response_model=schemas.BookingResponse)
def update_booking_status(booking_id: str, status: models.BookingStatusEnum, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    old_status = booking.booking_status
    booking.booking_status = status
    db.commit()
    db.refresh(booking)
    
    history = models.BookingStatusHistory(
        booking_id=booking.booking_id,
        new_status=status,
        actor_role=current_user.account_type
    )
    db.add(history)
    db.commit()
    
    return _mask_booking(booking)
