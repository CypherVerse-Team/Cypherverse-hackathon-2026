from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

from .routers import auth, workers, bookings, admin, categories, verifications, reviews, complaints, teams, contractors, payments, notifications
from fastapi.staticfiles import StaticFiles
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShramSetu API",
    description="Digital Workforce & On-Demand Service Platform",
    version="1.0.0"
)

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

configured_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "*").split(",")
    if origin.strip()
]
allow_all_origins = "*" in configured_origins

app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(categories.router)
app.include_router(verifications.router)
app.include_router(reviews.router)
app.include_router(complaints.router)
app.include_router(teams.router)
app.include_router(contractors.router)
app.include_router(payments.router)
app.include_router(notifications.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else configured_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ShramSetu API"}
