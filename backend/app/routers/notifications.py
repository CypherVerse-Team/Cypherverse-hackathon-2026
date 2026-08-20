from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..core.deps import get_current_user

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.user_id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications

@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id,
        models.Notification.user_id == current_user.user_id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.patch("/read-all")
def mark_all_as_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.user_id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    return {"status": "success"}
