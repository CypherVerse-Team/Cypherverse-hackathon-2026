import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.orm import relationship

from .database import Base

class RoleEnum(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    WORKER = "WORKER"
    GROUP_LEADER = "GROUP_LEADER"
    CONTRACTOR = "CONTRACTOR"
    ADMIN = "ADMIN"

class VerificationStatusEnum(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class AccountStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"

class AvailabilityStatusEnum(str, enum.Enum):
    AVAILABLE_NOW = "AVAILABLE_NOW"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"
    ON_LEAVE = "ON_LEAVE"

class BookingStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    WAITING = "WAITING"
    EN_ROUTE = "EN_ROUTE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class ComplaintStatusEnum(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TeamMemberRole(str, enum.Enum):
    LEADER = "LEADER"
    SUPERVISOR = "SUPERVISOR"
    WORKER = "WORKER"
    HELPER = "HELPER"

class BulkRequestStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentModeEnum(str, enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"

class PaymentStatusEnum(str, enum.Enum):
    NOT_RECORDED = "NOT_RECORDED"
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    DISPUTED = "DISPUTED"

class NotificationTypeEnum(str, enum.Enum):
    BOOKING_CREATED = "BOOKING_CREATED"
    BOOKING_ACCEPTED = "BOOKING_ACCEPTED"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    KYC_VERIFIED = "KYC_VERIFIED"
    SYSTEM_ALERT = "SYSTEM_ALERT"

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    mobile_number = Column(String(20), unique=True, index=True, nullable=False)
    account_type = Column(Enum(RoleEnum), nullable=False)
    verification_status = Column(Enum(VerificationStatusEnum), default=VerificationStatusEnum.UNVERIFIED)
    account_status = Column(Enum(AccountStatusEnum), default=AccountStatusEnum.ACTIVE)
    hashed_password = Column(String(255), nullable=False)

    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False)
    contractor_profile = relationship("ContractorProfile", back_populates="user", uselist=False)

class WorkerProfile(Base, TimestampMixin):
    __tablename__ = "worker_profiles"

    worker_profile_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), unique=True)
    home_city = Column(String(100))
    service_radius_km = Column(Float, default=10.0)
    availability_status = Column(Enum(AvailabilityStatusEnum), default=AvailabilityStatusEnum.OFFLINE)
    average_rating = Column(Float, default=0.0)
    completed_jobs = Column(Integer, default=0)
    
    # New worker details
    profile_photo_url = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    age = Column(Integer, nullable=True)
    address = Column(String(255), nullable=True)
    years_of_experience = Column(Integer, default=0)
    hourly_rate = Column(Float, nullable=True)
    daily_rate = Column(Float, nullable=True)
    short_description = Column(Text, nullable=True)
    verification_badge = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user = relationship("User", back_populates="worker_profile")
    skills = relationship("WorkerSkill", back_populates="worker")
    bookings_as_worker = relationship("Booking", back_populates="worker", foreign_keys="[Booking.worker_id]")

class CustomerProfile(Base, TimestampMixin):
    __tablename__ = "customer_profiles"

    customer_profile_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), unique=True)
    preferred_language = Column(String(10), default="en")
    default_address_id = Column(String(36), nullable=True)
    emergency_contact = Column(String(20), nullable=True)

    user = relationship("User", back_populates="customer_profile")
    addresses = relationship("CustomerAddress", back_populates="customer")
    bookings_as_customer = relationship("Booking", back_populates="customer", foreign_keys="[Booking.customer_id]")

class CustomerAddress(Base, TimestampMixin):
    __tablename__ = "customer_addresses"

    address_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customer_profiles.customer_profile_id"))
    address_line_1 = Column(String(255), nullable=False)
    locality = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    customer = relationship("CustomerProfile", back_populates="addresses")

class Profession(Base, TimestampMixin):
    __tablename__ = "professions"

    profession_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

class WorkerSkill(Base, TimestampMixin):
    __tablename__ = "worker_skills"

    worker_skill_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"))
    profession_id = Column(String(36), ForeignKey("professions.profession_id"))
    skill_level = Column(String(50), default="INTERMEDIATE")
    is_primary_skill = Column(Boolean, default=False)

    worker = relationship("WorkerProfile", back_populates="skills")
    profession = relationship("Profession")

class ServiceCatalog(Base, TimestampMixin):
    __tablename__ = "service_catalog"

    service_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"))
    profession_id = Column(String(36), ForeignKey("professions.profession_id"))
    pricing_model = Column(String(50), default="HOURLY")
    unit_rate = Column(Float, nullable=False)
    price_locked = Column(Boolean, default=False)
    effective_from = Column(DateTime, default=datetime.utcnow)

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    booking_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customer_profiles.customer_profile_id"))
    worker_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"), nullable=True)
    team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=True)
    bulk_request_id = Column(String(36), ForeignKey("bulk_workforce_requests.request_id"), nullable=True)
    booking_status = Column(Enum(BookingStatusEnum), default=BookingStatusEnum.PENDING)
    scheduled_date = Column(DateTime, nullable=False)
    duration_type = Column(String(50), nullable=True)
    agreed_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    service_address_id = Column(String(36), ForeignKey("customer_addresses.address_id"))
    price_locked = Column(Boolean, default=False)
    estimated_start_time = Column(DateTime, nullable=True)

    customer = relationship("CustomerProfile", back_populates="bookings_as_customer")
    worker = relationship("WorkerProfile", back_populates="bookings_as_worker")
    team = relationship("Team", back_populates="bookings")
    bulk_request = relationship("BulkWorkforceRequest", back_populates="bookings")
    status_history = relationship("BookingStatusHistory", back_populates="booking")

class BookingStatusHistory(Base, TimestampMixin):
    __tablename__ = "booking_status_history"

    history_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.booking_id"))
    previous_status = Column(Enum(BookingStatusEnum), nullable=True)
    new_status = Column(Enum(BookingStatusEnum), nullable=False)
    actor_role = Column(Enum(RoleEnum), nullable=False)

    booking = relationship("Booking", back_populates="status_history")

class RatingReview(Base, TimestampMixin):
    __tablename__ = "ratings_reviews"

    review_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.booking_id"), unique=True)
    customer_id = Column(String(36), ForeignKey("customer_profiles.customer_profile_id"))
    worker_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"))
    overall_rating = Column(Float, nullable=False)
    quality_rating = Column(Integer, nullable=False)
    punctuality_rating = Column(Integer, nullable=False)
    communication_rating = Column(Integer, nullable=False)
    professionalism_rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    is_verified_booking = Column(Boolean, default=True)

class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    complaint_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String(20), unique=True, index=True) # E.g., CPL-12345
    booking_id = Column(String(36), ForeignKey("bookings.booking_id"))
    complainant_user_id = Column(String(36), ForeignKey("users.user_id"))
    complaint_category = Column(String(100), nullable=False) # e.g. Non-completion, Quality of work, Payment dispute, Misconduct
    complaint_status = Column(Enum(ComplaintStatusEnum), default=ComplaintStatusEnum.SUBMITTED)
    priority = Column(String(20), default="MEDIUM")
    description = Column(Text, nullable=False)
    admin_remarks = Column(Text, nullable=True)

    evidence = relationship("ComplaintEvidence", back_populates="complaint")

class ComplaintEvidence(Base, TimestampMixin):
    __tablename__ = "complaint_evidence"

    evidence_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.complaint_id"))
    file_path = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    complaint = relationship("Complaint", back_populates="evidence")

class VerificationRequest(Base, TimestampMixin):
    __tablename__ = "verification_requests"

    request_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"))
    document_type = Column(String(100), nullable=False)
    storage_reference = Column(String(255), nullable=False)
    status = Column(Enum(VerificationStatusEnum), default=VerificationStatusEnum.PENDING)
    rejection_reason = Column(Text, nullable=True)

    user = relationship("User")
    documents = relationship("VerificationDocument", back_populates="request")

class VerificationDocument(Base, TimestampMixin):
    __tablename__ = "verification_documents"

    document_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String(36), ForeignKey("verification_requests.request_id"))
    file_path = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    checksum = Column(String(64), nullable=False)

    request = relationship("VerificationRequest", back_populates="documents")

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    audit_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(36), nullable=False)
    details = Column(Text, nullable=True)

class ContractorProfile(Base, TimestampMixin):
    __tablename__ = "contractor_profiles"

    contractor_profile_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), unique=True)
    company_name = Column(String(255), nullable=False)
    gstin = Column(String(50), nullable=True)
    business_type = Column(String(100), nullable=True)

    user = relationship("User", back_populates="contractor_profile")
    bulk_requests = relationship("BulkWorkforceRequest", back_populates="contractor")

class Team(Base, TimestampMixin):
    __tablename__ = "teams"

    team_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    leader_id = Column(String(36), ForeignKey("users.user_id"))
    name = Column(String(255), nullable=False)
    primary_profession = Column(String(100), nullable=False)
    max_capacity = Column(Integer, nullable=False, default=10)

    leader = relationship("User")
    members = relationship("TeamMember", back_populates="team")
    bookings = relationship("Booking", back_populates="team")

class TeamMember(Base, TimestampMixin):
    __tablename__ = "team_members"

    member_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.team_id"))
    worker_profile_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"))
    role = Column(Enum(TeamMemberRole), default=TeamMemberRole.WORKER)

    team = relationship("Team", back_populates="members")
    worker = relationship("WorkerProfile")

class BulkWorkforceRequest(Base, TimestampMixin):
    __tablename__ = "bulk_workforce_requests"

    request_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contractor_id = Column(String(36), ForeignKey("contractor_profiles.contractor_profile_id"))
    project_name = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(BulkRequestStatusEnum), default=BulkRequestStatusEnum.PENDING)
    
    contractor = relationship("ContractorProfile", back_populates="bulk_requests")
    requirements = relationship("BulkWorkforceRequirement", back_populates="request")
    bookings = relationship("Booking", back_populates="bulk_request")

class BulkWorkforceRequirement(Base, TimestampMixin):
    __tablename__ = "bulk_workforce_requirements"

    requirement_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String(36), ForeignKey("bulk_workforce_requests.request_id"))
    profession = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)

    request = relationship("BulkWorkforceRequest", back_populates="requirements")

class PaymentRecord(Base, TimestampMixin):
    __tablename__ = "payment_records"

    payment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.booking_id"))
    mode = Column(Enum(PaymentModeEnum), nullable=False)
    status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING)
    
    agreed_amount = Column(Float, nullable=False)
    travel_charges = Column(Float, default=0.0)
    platform_commission = Column(Float, nullable=False)
    tax_withholding = Column(Float, default=0.0)
    net_payout = Column(Float, nullable=False)
    
    transaction_reference = Column(String(100), nullable=True)

    booking = relationship("Booking")

class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    invoice_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.booking_id"))
    invoice_number = Column(String(100), unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    date_issued = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="GENERATED")

    booking = relationship("Booking")

class ProviderPayoutAccount(Base, TimestampMixin):
    __tablename__ = "provider_payout_accounts"

    account_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_profile_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"))
    account_type = Column(Enum(PaymentModeEnum), nullable=False)
    account_details = Column(String(255), nullable=False) # UPI ID or Bank Account No
    is_primary = Column(Boolean, default=False)

    worker = relationship("WorkerProfile")

class ProviderPayout(Base, TimestampMixin):
    __tablename__ = "provider_payouts"

    payout_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_profile_id = Column(String(36), ForeignKey("worker_profiles.worker_profile_id"), nullable=True)
    team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING)
    reference = Column(String(100), nullable=True)

    worker = relationship("WorkerProfile")
    team = relationship("Team")

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    notification_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.SYSTEM_ALERT)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User")
