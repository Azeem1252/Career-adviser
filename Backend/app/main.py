import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .database import engine, Base
from .routers import auth, saved_runs, careers, analyzer, interviewer, roadmaps, users, assessment

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Professional Career Advising API for Carre Adviser"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(saved_runs.router)
app.include_router(careers.router)
app.include_router(analyzer.router)
app.include_router(interviewer.router)
app.include_router(roadmaps.router)
app.include_router(users.router)
app.include_router(assessment.router)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Carre Adviser Authentication API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
