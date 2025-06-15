from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str]
    role: Literal["admin", "viewer"]  # you can expand roles here


class UserCreate(UserBase):
    password: str  # plain password from frontend


class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str
