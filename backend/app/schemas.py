from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from .models import RoleEnum, AccountStatusEnum, AvailabilityStatusEnum, BookingStatusEnum, ComplaintStatusEnum, VerificationStatusEnum, TeamMemberRole, BulkRequestStatusEnum, PaymentModeEnum, PaymentStatusEnum, NotificationTypeEnum

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
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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

class BookingCreate(BaseModel):
    worker_id: str
    scheduled_date: datetime
    duration_type: str = "<2hrs"
    agreed_amount: float
    currency: str = "INR"
    service_address_id: str
    estimated_start_time: Optional[datetime] = None

class BookingUserResponse(BaseModel):
    name: str
    mobile_number: str

class BookingResponse(BaseModel):
    booking_id: str
    customer_id: str
    worker_id: str
    booking_status: BookingStatusEnum
    scheduled_date: datetime
    duration_type: Optional[str] = None
    agreed_amount: float
    currency: str
    price_locked: bool
    estimated_start_time: Optional[datetime] = None
    
    # Allow rendering names
    customer: Optional[BookingUserResponse] = None
    worker: Optional[BookingUserResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# Review Schemas
class ReviewCreate(BaseModel):
    quality_rating: int
    punctuality_rating: int
    communication_rating: int
    professionalism_rating: int
    review_text: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: str
    booking_id: str
    overall_rating: float
    quality_rating: int
    punctuality_rating: int
    communication_rating: int
    professionalism_rating: int
    review_text: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Complaint Schemas
class ComplaintCreate(BaseModel):
    booking_id: str
    complaint_category: str
    description: str

class ComplaintEvidenceResponse(BaseModel):
    evidence_id: str
    file_path: str
    mime_type: str
    
    model_config = ConfigDict(from_attributes=True)

class ComplaintResponse(BaseModel):
    complaint_id: str
    case_id: str
    booking_id: Optional[str] = None
    complainant_user_id: Optional[str] = None
    complainant_name: Optional[str] = None
    complainant_mobile: Optional[str] = None
    complaint_category: str
    complaint_status: ComplaintStatusEnum
    description: str
    admin_remarks: Optional[str] = None
    evidence: List[ComplaintEvidenceResponse] = []
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Team Schemas
class TeamMemberResponse(BaseModel):
    member_id: str
    team_id: str
    worker_profile_id: str
    role: TeamMemberRole
    worker: WorkerProfileResponse
    
    model_config = ConfigDict(from_attributes=True)

class TeamCreate(BaseModel):
    name: str
    primary_profession: str
    max_capacity: int = 10

class TeamResponse(BaseModel):
    team_id: str
    leader_id: str
    name: str
    primary_profession: str
    max_capacity: int
    members: List[TeamMemberResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# Bulk Request Schemas
class BulkWorkforceRequirementCreate(BaseModel):
    profession: str
    quantity: int

class BulkWorkforceRequirementResponse(BaseModel):
    requirement_id: str
    profession: str
    quantity: int
    
    model_config = ConfigDict(from_attributes=True)

class BulkWorkforceRequestCreate(BaseModel):
    project_name: str
    start_date: datetime
    end_date: datetime
    requirements: List[BulkWorkforceRequirementCreate]

class BulkWorkforceRequestResponse(BaseModel):
    request_id: str
    contractor_id: str
    project_name: str
    start_date: datetime
    end_date: datetime
    status: BulkRequestStatusEnum
    requirements: List[BulkWorkforceRequirementResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# Financial Schemas
class PaymentRecordCreate(BaseModel):
    mode: PaymentModeEnum
    transaction_reference: Optional[str] = None

class PaymentRecordResponse(BaseModel):
    payment_id: str
    booking_id: str
    mode: PaymentModeEnum
    status: PaymentStatusEnum
    agreed_amount: float
    travel_charges: float
    platform_commission: float
    tax_withholding: float
    net_payout: float
    transaction_reference: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InvoiceResponse(BaseModel):
    invoice_id: str
    booking_id: str
    invoice_number: str
    total_amount: float
    date_issued: datetime
    status: str
    
    model_config = ConfigDict(from_attributes=True)

class EarningsSummaryResponse(BaseModel):
    total_earnings: float
    monthly_earnings: float
    completed_jobs: int

class PayoutAccountCreate(BaseModel):
    account_type: PaymentModeEnum
    account_details: str

class PayoutAccountResponse(BaseModel):
    account_id: str
    account_type: PaymentModeEnum
    account_details: str
    is_primary: bool
    
    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(BaseModel):
    notification_id: str
    title: str
    message: str
    type: NotificationTypeEnum
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
