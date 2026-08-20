from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from .models import RoleEnum, AccountStatusEnum, AvailabilityStatusEnum, BookingStatusEnum, ComplaintStatusEnum, VerificationStatusEnum

# Base schema for timestamped items
class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserBase(BaseModel):
    full_name: str
    mobile_number: str
    account_type: RoleEnum

class UserCreate(UserBase):
    password: str # For simulated OTP, normally just mobile_number

class UserResponse(UserBase, TimestampSchema):
    user_id: str
    verification_status: VerificationStatusEnum
    account_status: AccountStatusEnum

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginData(BaseModel):
    mobile_number: str
    password: str

# Worker Profile Schemas
class WorkerProfileBase(BaseModel):
    home_city: Optional[str] = None
    service_radius_km: float = 10.0
    profile_photo_url: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    years_of_experience: int = 0
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    short_description: Optional[str] = None

class WorkerProfileUpdate(WorkerProfileBase):
    pass

class ProfessionBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class ProfessionResponse(ProfessionBase, TimestampSchema):
    profession_id: str

class WorkerSkillBase(BaseModel):
    profession_id: str
    skill_level: str = "INTERMEDIATE"
    is_primary_skill: bool = False

class WorkerSkillResponse(WorkerSkillBase, TimestampSchema):
    worker_skill_id: str
    profession: ProfessionResponse

class WorkerProfileResponse(WorkerProfileBase, TimestampSchema):
    worker_profile_id: str
    user_id: str
    availability_status: AvailabilityStatusEnum
    average_rating: float
    completed_jobs: int
    verification_badge: bool
    skills: List[WorkerSkillResponse] = []

class WorkerListResponse(UserResponse):
    worker_profile: WorkerProfileResponse
    model_config = ConfigDict(from_attributes=True)

class VerificationDocumentResponse(TimestampSchema):
    document_id: str
    request_id: str
    file_path: str
    mime_type: str
    file_size: int
    checksum: str

class VerificationRequestCreate(BaseModel):
    document_type: str
    storage_reference: str

class VerificationRequestResponse(TimestampSchema):
    request_id: str
    user_id: str
    document_type: str
    storage_reference: str
    status: VerificationStatusEnum
    rejection_reason: Optional[str] = None
    user: UserResponse
    documents: List[VerificationDocumentResponse] = []

# Booking Schemas
class BookingCreate(BaseModel):
    worker_id: str
    scheduled_date: datetime
    agreed_amount: float
    currency: str = "INR"
    service_address_id: str

class BookingResponse(BaseModel):
    booking_id: str
    customer_id: str
    worker_id: str
    booking_status: BookingStatusEnum
    scheduled_date: datetime
    agreed_amount: float
    currency: str
    
    # Allow rendering names
    customer: Optional[Any] = None
    worker: Optional[Any] = None
    
    model_config = ConfigDict(from_attributes=True)
