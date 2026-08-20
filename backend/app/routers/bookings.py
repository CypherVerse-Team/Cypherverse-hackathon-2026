from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_customer, get_current_worker, get_current_user
from typing import List

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, current_customer: models.User = Depends(get_current_customer), db: Session = Depends(get_db)):
    # Lookup customer profile
    customer_profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == current_customer.user_id).first()
    if not customer_profile:
        raise HTTPException(status_code=404, detail="Customer profile not found")
        
    # Lookup worker user via user_id instead of profile id (since frontend passes user_id as worker_id)
    worker_user = db.query(models.User).filter(models.User.user_id == booking.worker_id).first()
    if not worker_user:
        raise HTTPException(status_code=404, detail="Worker user not found")
        
    worker_profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == booking.worker_id).first()
    if not worker_profile:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    new_booking = models.Booking(
        customer_id=customer_profile.customer_profile_id,
        worker_id=worker_profile.worker_profile_id,
        scheduled_date=booking.scheduled_date,
        agreed_amount=booking.agreed_amount,
        currency=booking.currency,
        service_address_id=booking.service_address_id
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
    
    return new_booking

@router.get("/me", response_model=List[schemas.BookingResponse])
def get_my_bookings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.account_type == models.RoleEnum.CUSTOMER:
        profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == current_user.user_id).first()
        if not profile: return []
        return db.query(models.Booking).filter(models.Booking.customer_id == profile.customer_profile_id).all()
    elif current_user.account_type == models.RoleEnum.WORKER:
        profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == current_user.user_id).first()
        if not profile: return []
        return db.query(models.Booking).filter(models.Booking.worker_id == profile.worker_profile_id).all()
    return []

@router.patch("/{booking_id}/status", response_model=schemas.BookingResponse)
def update_booking_status(booking_id: str, status: models.BookingStatusEnum, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    old_status = booking.booking_status
    booking.booking_status = status
    
    history = models.BookingStatusHistory(
        booking_id=booking.booking_id,
        previous_status=old_status,
        new_status=status,
        actor_role=current_user.account_type
    )
    db.add(history)
    db.commit()
    db.refresh(booking)
    
    return booking
