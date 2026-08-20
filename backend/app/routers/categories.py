from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.ProfessionResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Profession).all()
