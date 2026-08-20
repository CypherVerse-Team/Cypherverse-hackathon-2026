from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from .security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_worker(user: models.User = Depends(get_current_user)):
    if user.account_type != models.RoleEnum.WORKER:
        raise HTTPException(status_code=403, detail="Not a worker")
    return user

def get_current_admin(user: models.User = Depends(get_current_user)):
    if user.account_type != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

def get_current_customer(user: models.User = Depends(get_current_user)):
    if user.account_type != models.RoleEnum.CUSTOMER:
        raise HTTPException(status_code=403, detail="Not a customer")
    return user
