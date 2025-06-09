# # main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from fastapi.staticfiles import StaticFiles
import os

from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(router)
