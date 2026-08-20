import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.ComplaintResponse)
def create_complaint(
    booking_id: str = Form(...),
    complaint_category: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify booking exists
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    import random
    case_id = f"CPL-{random.randint(10000, 99999)}"

    new_complaint = models.Complaint(
        case_id=case_id,
        booking_id=booking_id,
        complainant_user_id=current_user.user_id,
        complaint_category=complaint_category,
        description=description,
        complaint_status=models.ComplaintStatusEnum.SUBMITTED
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    if file:
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
        file_path = f"{UPLOAD_DIR}/complaint_{new_complaint.complaint_id}.{file_ext}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        evidence = models.ComplaintEvidence(
            complaint_id=new_complaint.complaint_id,
            file_path=f"/{file_path}",
            mime_type=file.content_type
        )
        db.add(evidence)
        db.commit()
        db.refresh(new_complaint)

    return new_complaint

@router.get("/admin", response_model=List[schemas.ComplaintResponse])
def get_complaints_admin(
    status: Optional[models.ComplaintStatusEnum] = None,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)
    if status:
        query = query.filter(models.Complaint.complaint_status == status)
    return query.all()

@router.patch("/admin/{complaint_id}/resolve", response_model=schemas.ComplaintResponse)
def resolve_complaint(
    complaint_id: str,
    status: models.ComplaintStatusEnum,
    admin_remarks: str = "",
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.complaint_status = status
    if admin_remarks:
        complaint.admin_remarks = admin_remarks
        
    db.commit()
    db.refresh(complaint)
    return complaint
