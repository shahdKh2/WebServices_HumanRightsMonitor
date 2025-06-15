from fastapi import APIRouter, HTTPException
from models.userModel import UserCreate, UserLogin, UserInDB
from database import db
from datetime import datetime
from passlib.hash import bcrypt
from bson import ObjectId

router = APIRouter()

users_collection = db["users"]

# Register route


@router.post("/register")
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=400, detail="Email already registered.")

    hashed = bcrypt.hash(user.password)
    user_dict = {
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "hashed_password": hashed,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await users_collection.insert_one(user_dict)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}


# Login route
@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not bcrypt.verify(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    return {
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "role": user["role"]
    }
