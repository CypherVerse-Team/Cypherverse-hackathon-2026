from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from .. import models, schemas
from ..database import get_db
import uuid

router = APIRouter(prefix="/api/categories", tags=["categories"])

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

@router.get("/", response_model=List[schemas.ProfessionResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Profession).order_by(models.Profession.name.asc()).all()

@router.post("/", response_model=schemas.ProfessionResponse)
def create_category(category: schemas.ProfessionBase, db: Session = Depends(get_db)):
    existing = db.query(models.Profession).filter(models.Profession.name.ilike(category.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{category.name}' already exists")
    
    new_prof = models.Profession(
        profession_id=str(uuid.uuid4()),
        name=category.name.strip(),
        category=category.category.strip() if category.category else "Home Maintenance",
        description=category.description.strip() if category.description else f"Professional {category.name} services"
    )
    db.add(new_prof)
    db.commit()
    db.refresh(new_prof)
    return new_prof

@router.put("/{profession_id}", response_model=schemas.ProfessionResponse)
def update_category(profession_id: str, data: CategoryUpdate, db: Session = Depends(get_db)):
    prof = db.query(models.Profession).filter(models.Profession.profession_id == profession_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if data.name:
        prof.name = data.name.strip()
    if data.category:
        prof.category = data.category.strip()
    if data.description is not None:
        prof.description = data.description.strip()
        
    db.commit()
    db.refresh(prof)
    return prof

@router.delete("/{profession_id}")
def delete_category(profession_id: str, db: Session = Depends(get_db)):
    prof = db.query(models.Profession).filter(models.Profession.profession_id == profession_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Remove associated worker skills first to prevent foreign key errors
    db.query(models.WorkerSkill).filter(models.WorkerSkill.profession_id == profession_id).delete()
    
    db.delete(prof)
    db.commit()
    return {"message": "Category deleted successfully", "profession_id": profession_id}
