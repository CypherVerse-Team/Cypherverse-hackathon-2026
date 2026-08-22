from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_worker
from typing import List, Optional
from sqlalchemy import or_

router = APIRouter(prefix="/api/workers", tags=["workers"])

@router.get("/me", response_model=schemas.WorkerListResponse)
def get_my_worker_profile(user: models.User = Depends(get_current_worker), db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.user_id == user.user_id).first()
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
    city: Optional[str] = None,
    availability: Optional[models.AvailabilityStatusEnum] = None,
    category_id: Optional[str] = None,
    skill_name: Optional[str] = None,
    q: Optional[str] = None,
    verified_only: bool = False,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(
        models.User.account_type.in_([models.RoleEnum.WORKER, models.RoleEnum.GROUP_LEADER]),
        models.User.account_status == models.AccountStatusEnum.ACTIVE
    ).join(models.WorkerProfile, models.User.user_id == models.WorkerProfile.user_id)
    
    if verified_only:
        query = query.filter(models.User.verification_status == models.VerificationStatusEnum.VERIFIED)
        
    if city and isinstance(city, str) and city.strip():
        query = query.filter(
            models.WorkerProfile.home_city.ilike(f"%{city.strip()}%")
        )
    if availability and isinstance(availability, models.AvailabilityStatusEnum):
        query = query.filter(models.WorkerProfile.availability_status == availability)
    if min_rate is not None and isinstance(min_rate, (int, float)):
        query = query.filter(models.WorkerProfile.hourly_rate >= min_rate)
    if max_rate is not None and isinstance(max_rate, (int, float)):
        query = query.filter(models.WorkerProfile.hourly_rate <= max_rate)

    filter_conditions = []
    need_skill_join = False

    if category_id and isinstance(category_id, str) and category_id.strip():
        cat_term = category_id.strip()
        filter_conditions.append(
            or_(
                models.WorkerSkill.profession_id == cat_term,
                models.Profession.name.ilike(f"%{cat_term}%"),
                models.Profession.category.ilike(f"%{cat_term}%")
            )
        )
        need_skill_join = True

    search_raw = q if (q and isinstance(q, str)) else (skill_name if (skill_name and isinstance(skill_name, str)) else "")
    search_term = search_raw.strip()
    if search_term:
        filter_conditions.append(
            or_(
                models.User.full_name.ilike(f"%{search_term}%"),
                models.WorkerProfile.short_description.ilike(f"%{search_term}%"),
                models.WorkerProfile.home_city.ilike(f"%{search_term}%"),
                models.Profession.name.ilike(f"%{search_term}%"),
                models.Profession.category.ilike(f"%{search_term}%")
            )
        )
        need_skill_join = True

    if need_skill_join:
        query = query.outerjoin(models.WorkerSkill, models.WorkerSkill.worker_id == models.WorkerProfile.worker_profile_id)\
                     .outerjoin(models.Profession, models.Profession.profession_id == models.WorkerSkill.profession_id)
        for cond in filter_conditions:
            query = query.filter(cond)
        query = query.distinct()
            
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
