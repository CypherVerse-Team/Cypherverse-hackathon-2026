from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from .. import models, schemas
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/v1", tags=["payments"])

@router.post("/bookings/{booking_id}/payments", response_model=schemas.PaymentRecordResponse)
def record_payment(
    booking_id: str,
    payment_in: schemas.PaymentRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.booking_status != models.BookingStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot record payment for incomplete booking")

    # Only involved parties can record/see this
    is_customer = booking.customer.user_id == current_user.user_id if booking.customer else False
    is_worker = booking.worker.user_id == current_user.user_id if booking.worker else False
    if not is_customer and not is_worker:
        raise HTTPException(status_code=403, detail="Not authorized")

    existing_payment = db.query(models.PaymentRecord).filter(models.PaymentRecord.booking_id == booking_id).first()
    if existing_payment:
        raise HTTPException(status_code=400, detail="Payment already recorded for this booking")

    agreed_amount = booking.agreed_amount
    travel_charges = 0.0 # simple logic for now
    platform_commission = agreed_amount * 0.10 # 10% commission
    tax_withholding = agreed_amount * 0.05 # 5% tax
    net_payout = agreed_amount - platform_commission - tax_withholding

    new_payment = models.PaymentRecord(
        booking_id=booking_id,
        mode=payment_in.mode,
        status=models.PaymentStatusEnum.PAID,
        agreed_amount=agreed_amount,
        travel_charges=travel_charges,
        platform_commission=platform_commission,
        tax_withholding=tax_withholding,
        net_payout=net_payout,
        transaction_reference=payment_in.transaction_reference
    )
    db.add(new_payment)
    
    # Auto-generate invoice
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    new_invoice = models.Invoice(
        booking_id=booking_id,
        invoice_number=invoice_number,
        total_amount=agreed_amount + travel_charges
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_payment)

    return new_payment

@router.get("/bookings/{booking_id}/invoice", response_model=schemas.InvoiceResponse)
def get_invoice(
    booking_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(models.Invoice).filter(models.Invoice.booking_id == booking_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found. Make sure payment is recorded.")
    
    booking = invoice.booking
    is_customer = booking.customer.user_id == current_user.user_id if booking.customer else False
    is_worker = booking.worker.user_id == current_user.user_id if booking.worker else False
    if not is_customer and not is_worker:
         raise HTTPException(status_code=403, detail="Not authorized")

    return invoice

@router.get("/worker/earnings", response_model=schemas.EarningsSummaryResponse)
def get_earnings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.worker_profile:
        raise HTTPException(status_code=400, detail="Worker profile required")

    worker_id = current_user.worker_profile.worker_profile_id
    
    # Calculate all payments
    payments = db.query(models.PaymentRecord).join(models.Booking).filter(
        models.Booking.worker_id == worker_id,
        models.PaymentRecord.status == models.PaymentStatusEnum.PAID
    ).all()

    total_earnings = sum(p.net_payout for p in payments)
    completed_jobs = len(payments)
    
    # Calculate this month's earnings
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    month_earnings = sum(p.net_payout for p in payments if p.created_at >= month_start)

    return {
        "total_earnings": total_earnings,
        "monthly_earnings": month_earnings,
        "completed_jobs": completed_jobs
    }

@router.get("/admin/financial-overview")
def get_financial_overview(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    all_payments = db.query(models.PaymentRecord).filter(
        models.PaymentRecord.status == models.PaymentStatusEnum.PAID
    ).all()

    total_transactions = sum(p.agreed_amount for p in all_payments)
    total_platform_revenue = sum(p.platform_commission for p in all_payments)
    total_withholding = sum(p.tax_withholding for p in all_payments)

    return {
        "total_transactions": total_transactions,
        "total_platform_revenue": total_platform_revenue,
        "total_tax_withheld": total_withholding,
        "total_payments_count": len(all_payments)
    }

@router.post("/worker/payout-account", response_model=schemas.PayoutAccountResponse)
def add_payout_account(
    account_in: schemas.PayoutAccountCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.worker_profile:
        raise HTTPException(status_code=400, detail="Worker profile required")
        
    new_account = models.ProviderPayoutAccount(
        worker_profile_id=current_user.worker_profile.worker_profile_id,
        account_type=account_in.account_type,
        account_details=account_in.account_details,
        is_primary=True # For simplicity, auto-set primary
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account
