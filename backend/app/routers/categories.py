from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
import uuid

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.ProfessionResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Profession).order_by(models.Profession.name.asc()).all()

@router.post("/", response_model=schemas.ProfessionResponse)
def create_category(category: schemas.ProfessionBase, db: Session = Depends(get_db)):
    existing = db.query(models.Profession).filter(models.Profession.name.ilike(category.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category/Profession already exists")
    
    new_prof = models.Profession(
        profession_id=str(uuid.uuid4()),
        name=category.name,
        category=category.category,
        description=category.description or f"Professional {category.name} services"
    )
    db.add(new_prof)
    db.commit()
    db.refresh(new_prof)
    return new_prof
