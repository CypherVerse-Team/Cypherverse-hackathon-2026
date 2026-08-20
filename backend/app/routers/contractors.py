from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/v1/contractors", tags=["contractors"])

@router.post("/bulk-requests", response_model=schemas.BulkWorkforceRequestResponse)
def create_bulk_request(
    request_in: schemas.BulkWorkforceRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.account_type != models.RoleEnum.CONTRACTOR:
        raise HTTPException(status_code=403, detail="Only Contractors can submit bulk requests")

    contractor_profile = db.query(models.ContractorProfile).filter(models.ContractorProfile.user_id == current_user.user_id).first()
    if not contractor_profile:
        # Auto-create if not exists
        contractor_profile = models.ContractorProfile(
            user_id=current_user.user_id,
            company_name=current_user.full_name + " Contracting"
        )
        db.add(contractor_profile)
        db.commit()
        db.refresh(contractor_profile)

    new_request = models.BulkWorkforceRequest(
        contractor_id=contractor_profile.contractor_profile_id,
        project_name=request_in.project_name,
        start_date=request_in.start_date,
        end_date=request_in.end_date
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    for req in request_in.requirements:
        requirement = models.BulkWorkforceRequirement(
            request_id=new_request.request_id,
            profession=req.profession,
            quantity=req.quantity
        )
        db.add(requirement)
    
    db.commit()
    db.refresh(new_request)

    return new_request

@router.get("/bulk-requests", response_model=List[schemas.BulkWorkforceRequestResponse])
def get_my_bulk_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contractor = db.query(models.ContractorProfile).filter(models.ContractorProfile.user_id == current_user.user_id).first()
    if not contractor:
        return []
    return db.query(models.BulkWorkforceRequest).filter(models.BulkWorkforceRequest.contractor_id == contractor.contractor_profile_id).all()

@router.get("/admin/matchmaking", response_model=List[schemas.BulkWorkforceRequestResponse])
def admin_get_bulk_requests(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.BulkWorkforceRequest).order_by(models.BulkWorkforceRequest.created_at.desc()).all()

@router.patch("/admin/bulk-requests/{request_id}/assign")
def admin_assign_bulk_request(
    request_id: str,
    team_id: str,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    req = db.query(models.BulkWorkforceRequest).filter(models.BulkWorkforceRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    team = db.query(models.Team).filter(models.Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    req.status = models.BulkRequestStatusEnum.ASSIGNED
    db.commit()
    
    # Normally we might create a booking here linking the team_id.
    # For now, just update the request status.
    return {"status": "success", "message": "Team assigned successfully"}
