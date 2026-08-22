from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.mobile_number == user.mobile_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        account_type=user.account_type,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-create profile based on role
    if new_user.account_type == models.RoleEnum.WORKER:
        profile = models.WorkerProfile(user_id=new_user.user_id)
        db.add(profile)
    elif new_user.account_type == models.RoleEnum.CUSTOMER:
        profile = models.CustomerProfile(user_id=new_user.user_id)
        db.add(profile)
    
    db.commit()
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.mobile_number == login_data.mobile_number).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60*24*7)
    access_token = create_access_token(
        data={"sub": user.user_id, "role": user.account_type.value}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

from ..core.deps import get_current_user
from pydantic import BaseModel
from typing import Optional

class UserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    home_city: Optional[str] = None
    hourly_rate: Optional[float] = None
    years_of_experience: Optional[int] = None
    short_description: Optional[str] = None
    company_name: Optional[str] = None

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "user_id": current_user.user_id,
        "full_name": current_user.full_name,
        "mobile_number": current_user.mobile_number,
        "account_type": current_user.account_type,
        "verification_status": current_user.verification_status,
        "account_status": current_user.account_status,
        "worker_profile": current_user.worker_profile,
        "customer_profile": current_user.customer_profile,
        "contractor_profile": current_user.contractor_profile
    }

@router.put("/me")
def update_me(
    update_data: UserUpdateSchema,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    if update_data.mobile_number:
        # Check if mobile exists for another user
        existing = db.query(models.User).filter(
            models.User.mobile_number == update_data.mobile_number,
            models.User.user_id != current_user.user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Mobile number already in use by another account")
        current_user.mobile_number = update_data.mobile_number

    # Update role profiles
    if current_user.account_type == models.RoleEnum.WORKER:
        if not current_user.worker_profile:
            current_user.worker_profile = models.WorkerProfile(user_id=current_user.user_id)
            db.add(current_user.worker_profile)
        if update_data.home_city is not None:
            current_user.worker_profile.home_city = update_data.home_city
        if update_data.hourly_rate is not None:
            current_user.worker_profile.hourly_rate = update_data.hourly_rate
        if update_data.years_of_experience is not None:
            current_user.worker_profile.years_of_experience = update_data.years_of_experience
        if update_data.short_description is not None:
            current_user.worker_profile.short_description = update_data.short_description

    elif current_user.account_type == models.RoleEnum.CONTRACTOR:
        if not current_user.contractor_profile:
            current_user.contractor_profile = models.ContractorProfile(user_id=current_user.user_id)
            db.add(current_user.contractor_profile)
        if update_data.company_name is not None:
            current_user.contractor_profile.company_name = update_data.company_name

    db.commit()
    db.refresh(current_user)

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "user_id": current_user.user_id,
            "full_name": current_user.full_name,
            "mobile_number": current_user.mobile_number,
            "account_type": current_user.account_type,
            "verification_status": current_user.verification_status,
            "account_status": current_user.account_status,
            "worker_profile": current_user.worker_profile,
            "customer_profile": current_user.customer_profile,
            "contractor_profile": current_user.contractor_profile
        }
    }

