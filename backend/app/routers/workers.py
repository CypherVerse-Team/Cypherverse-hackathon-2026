from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_worker
from typing import List

router = APIRouter(prefix="/api/workers", tags=["workers"])

@router.get("/me", response_model=schemas.WorkerListResponse)
def get_my_worker_profile(user: models.User = Depends(get_current_worker), db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user.user_id).first()
    # Since WorkerListResponse expects a UserResponse, we map it manually here or use ORM mode
    return user

@router.put("/me", response_model=schemas.WorkerProfileResponse)
def update_my_profile(profile_data: schemas.WorkerProfileUpdate, user: models.User = Depends(get_current_worker), db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile



@router.put("/me/skills", response_model=List[schemas.WorkerSkillResponse])
def update_my_skills(skills: List[schemas.WorkerSkillBase], user: models.User = Depends(get_current_worker), db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Delete existing skills
    db.query(models.WorkerSkill).filter(models.WorkerSkill.worker_id == profile.worker_profile_id).delete()
    
    # Add new skills
    new_skills = []
    for skill in skills:
        ws = models.WorkerSkill(
            worker_id=profile.worker_profile_id,
            profession_id=skill.profession_id,
            skill_level=skill.skill_level,
            is_primary_skill=skill.is_primary_skill
        )
        db.add(ws)
        new_skills.append(ws)
    
    db.commit()
    for ws in new_skills:
        db.refresh(ws)
    return new_skills

@router.get("/", response_model=List[schemas.WorkerListResponse])
def get_workers(
    city: str = Query(None),
    availability: models.AvailabilityStatusEnum = Query(None),
    category_id: str = Query(None),
    skill_name: str = Query(None),
    verified_only: bool = Query(False),
    min_rate: float = Query(None),
    max_rate: float = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.User).join(models.WorkerProfile)
    
    # Filter so it only returns workers where is_available == True and user is verified
    query = query.filter(
        models.WorkerProfile.is_available == True,
        models.User.verification_status == models.VerificationStatusEnum.VERIFIED
    )
        
    if city:
        query = query.filter(models.WorkerProfile.home_city == city)
    if availability:
        query = query.filter(models.WorkerProfile.availability_status == availability)
    if min_rate is not None:
        query = query.filter(models.WorkerProfile.hourly_rate >= min_rate)
    if max_rate is not None:
        query = query.filter(models.WorkerProfile.hourly_rate <= max_rate)
        
    if category_id or skill_name:
        query = query.join(models.WorkerSkill).join(models.Profession)
        if category_id:
            query = query.filter(models.Profession.profession_id == category_id)
        if skill_name:
            query = query.filter(models.Profession.name.ilike(f"%{skill_name}%"))
            
    return query.all()

@router.get("/{user_id}/profile")
def get_worker_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user or user.account_type != models.RoleEnum.WORKER:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user_id).first()
    return {"user": user, "profile": profile}

@router.patch("/{user_id}/availability")
def update_availability(user_id: str, status: models.AvailabilityStatusEnum, db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
    profile.availability_status = status
    db.commit()
    db.refresh(profile)
    return {"message": "Availability updated", "status": status}

@router.patch("/{worker_id}", response_model=schemas.WorkerProfileResponse)
def update_worker_profile(
    worker_id: str,
    profile_data: schemas.WorkerProfileUpdate,
    db: Session = Depends(get_db)
):
    profile = db.query(models.WorkerProfile).filter(
        (models.WorkerProfile.user_id == worker_id) | 
        (models.WorkerProfile.worker_profile_id == worker_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/{worker_id}", response_model=schemas.WorkerProfileResponse)
def update_worker_profile_put(
    worker_id: str,
    profile_data: schemas.WorkerProfileUpdate,
    db: Session = Depends(get_db)
):
    return update_worker_profile(worker_id, profile_data, db)
