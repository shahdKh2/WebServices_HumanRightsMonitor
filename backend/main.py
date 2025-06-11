# main.py
from routes.victims import router as victim_router  # import your victim router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.routes import router as cases_router
from routes.victims import router as victims_router
from routes.report_routes import router as report_router
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (uploaded evidence)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include both routers
app.include_router(cases_router)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(cases_router)
app.include_router(victim_router)
app.include_router(report_router, prefix="/api")
