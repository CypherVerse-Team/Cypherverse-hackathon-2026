import os
import shutil
import random
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
    complaint_category: str = Form(...),
    description: str = Form(...),
    booking_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_booking_id = None
    if booking_id and booking_id.strip() and booking_id != 'none' and booking_id != 'undefined':
        booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id.strip()).first()
        if booking:
            valid_booking_id = booking.booking_id

    case_id = f"TKT-{random.randint(10000, 99999)}"

    new_complaint = models.Complaint(
        case_id=case_id,
        booking_id=valid_booking_id,
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
        file_path = f"{UPLOAD_DIR}/support_{new_complaint.complaint_id}.{file_ext}"
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

    # Attach complainant info
    resp = schemas.ComplaintResponse.model_validate(new_complaint)
    resp.complainant_name = current_user.full_name
    resp.complainant_mobile = current_user.mobile_number
    return resp

@router.get("/me", response_model=List[schemas.ComplaintResponse])
def get_my_complaints(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaints = db.query(models.Complaint).filter(
        models.Complaint.complainant_user_id == current_user.user_id
    ).order_by(models.Complaint.created_at.desc()).all()

    result = []
    for c in complaints:
        item = schemas.ComplaintResponse.model_validate(c)
        item.complainant_name = current_user.full_name
        item.complainant_mobile = current_user.mobile_number
        result.append(item)
    return result

@router.get("/admin", response_model=List[schemas.ComplaintResponse])
def get_complaints_admin(
    status: Optional[models.ComplaintStatusEnum] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)
    if status:
        query = query.filter(models.Complaint.complaint_status == status)
    complaints = query.order_by(models.Complaint.created_at.desc()).all()

    result = []
    for c in complaints:
        user = db.query(models.User).filter(models.User.user_id == c.complainant_user_id).first()
        item = schemas.ComplaintResponse.model_validate(c)
        item.complainant_name = user.full_name if user else "User"
        item.complainant_mobile = user.mobile_number if user else "—"
        result.append(item)
    return result

@router.patch("/admin/{complaint_id}/resolve", response_model=schemas.ComplaintResponse)
def resolve_complaint(
    complaint_id: str,
    status: models.ComplaintStatusEnum,
    admin_remarks: str = "",
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint / Ticket not found")
        
    complaint.complaint_status = status
    if admin_remarks:
        complaint.admin_remarks = admin_remarks
        
    db.commit()
    db.refresh(complaint)

    user = db.query(models.User).filter(models.User.user_id == complaint.complainant_user_id).first()
    resp = schemas.ComplaintResponse.model_validate(complaint)
    resp.complainant_name = user.full_name if user else "User"
    resp.complainant_mobile = user.mobile_number if user else "—"
    return resp
