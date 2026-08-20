from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

from .routers import auth, workers, bookings, admin, categories, verifications
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

app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(categories.router)
app.include_router(verifications.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ShramSetu API"}
