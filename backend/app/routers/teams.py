from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..core.deps import get_current_user

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])

@router.post("/", response_model=schemas.TeamResponse)
def create_team(
    team_in: schemas.TeamCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.account_type != models.RoleEnum.GROUP_LEADER:
        raise HTTPException(status_code=403, detail="Only Group Leaders can create teams")

    existing_team = db.query(models.Team).filter(models.Team.leader_id == current_user.user_id).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="You already have a team")

    new_team = models.Team(
        leader_id=current_user.user_id,
        name=team_in.name,
        primary_profession=team_in.primary_profession,
        max_capacity=team_in.max_capacity
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Add the leader as a member
    if current_user.worker_profile:
        leader_member = models.TeamMember(
            team_id=new_team.team_id,
            worker_profile_id=current_user.worker_profile.worker_profile_id,
            role=models.TeamMemberRole.LEADER
        )
        db.add(leader_member)
        db.commit()
        db.refresh(new_team)

    return new_team

@router.post("/{team_id}/members", response_model=schemas.TeamMemberResponse)
def add_team_member(
    team_id: str,
    worker_mobile: str,
    role: models.TeamMemberRole = models.TeamMemberRole.WORKER,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).filter(models.Team.team_id == team_id).first()
    if not team or team.leader_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this team")

    worker_user = db.query(models.User).filter(models.User.mobile_number == worker_mobile).first()
    if not worker_user or not worker_user.worker_profile:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    if len(team.members) >= team.max_capacity:
        raise HTTPException(status_code=400, detail="Team capacity reached")

    existing_member = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.worker_profile_id == worker_user.worker_profile.worker_profile_id
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="Worker is already in the team")

    new_member = models.TeamMember(
        team_id=team_id,
        worker_profile_id=worker_user.worker_profile.worker_profile_id,
        role=role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member

@router.get("/my-team", response_model=schemas.TeamResponse)
def get_my_team(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(models.Team).filter(models.Team.leader_id == current_user.user_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team
