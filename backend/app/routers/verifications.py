import os
import shutil
import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..core.deps import get_current_worker, get_current_admin

router = APIRouter(prefix="/api/v1", tags=["verifications"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB
ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"]

@router.post("/verification/upload", response_model=schemas.VerificationRequestResponse)
def submit_verification(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_worker),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, and PNG are allowed.")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Check for existing pending/under_review request
    existing = db.query(models.VerificationRequest).filter(
        models.VerificationRequest.user_id == user.user_id,
        models.VerificationRequest.status.in_([models.VerificationStatusEnum.PENDING, models.VerificationStatusEnum.UNDER_REVIEW])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="A pending or under review verification request already exists.")

    # Calculate checksum and save file
    checksum_hash = hashlib.sha256()
    file_content = file.file.read()
    checksum_hash.update(file_content)
    checksum = checksum_hash.hexdigest()
    file.file.seek(0)

    # We will use original filename but append checksum to avoid collision
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{checksum}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    storage_reference = f"/uploads/{safe_filename}"

    # Create Request
    new_req = models.VerificationRequest(
        user_id=user.user_id,
        document_type=document_type,
        storage_reference=storage_reference,
        status=models.VerificationStatusEnum.PENDING
    )
    db.add(new_req)
    db.flush() # get request_id

    # Create Document record
    new_doc = models.VerificationDocument(
        request_id=new_req.request_id,
        file_path=storage_reference,
        mime_type=file.content_type,
        file_size=file_size,
        checksum=checksum
    )
    db.add(new_doc)

    user.verification_status = models.VerificationStatusEnum.PENDING
    
    db.commit()
    db.refresh(new_req)
    db.refresh(user)
    
    return new_req

@router.get("/verification/status", response_model=schemas.VerificationRequestResponse)
def get_verification_status(user: models.User = Depends(get_current_worker), db: Session = Depends(get_db)):
    req = db.query(models.VerificationRequest).filter(
        models.VerificationRequest.user_id == user.user_id
    ).order_by(models.VerificationRequest.created_at.desc()).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="No verification request found")
        
    return req


@router.get("/admin/verification/queue", response_model=List[schemas.VerificationRequestResponse])
def get_verification_queue(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    return db.query(models.VerificationRequest).filter(
        models.VerificationRequest.status.in_([models.VerificationStatusEnum.PENDING, models.VerificationStatusEnum.UNDER_REVIEW])
    ).all()


@router.patch("/admin/verification/{request_id}/review")
def review_verification(
    request_id: str, 
    status: models.VerificationStatusEnum,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    if status not in [models.VerificationStatusEnum.VERIFIED, models.VerificationStatusEnum.REJECTED, models.VerificationStatusEnum.UNDER_REVIEW]:
        raise HTTPException(status_code=400, detail="Invalid status update")

    req = db.query(models.VerificationRequest).filter(models.VerificationRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    user = db.query(models.User).filter(models.User.user_id == req.user_id).first()
    
    req.status = status
    user.verification_status = status
    
    if status == models.VerificationStatusEnum.VERIFIED:
        user.account_status = models.AccountStatusEnum.ACTIVE
        if user.worker_profile:
            user.worker_profile.verification_badge = True
    elif status == models.VerificationStatusEnum.REJECTED:
        req.rejection_reason = reason
        if user.worker_profile:
            user.worker_profile.verification_badge = False
            
    db.commit()
    return {"message": "Verification status updated", "request_id": request_id, "status": req.status}
