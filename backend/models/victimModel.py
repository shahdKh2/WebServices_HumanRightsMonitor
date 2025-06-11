from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime


class Demographics(BaseModel):
    gender: Optional[str]
    age: Optional[int]
    ethnicity: Optional[str]
    occupation: Optional[str]


class ContactInfo(BaseModel):
    email: Optional[EmailStr]
    phone: Optional[str]
    secure_messaging: Optional[str]  # e.g., Signal, WhatsApp


class RiskAssessment(BaseModel):
    level: str  # "low", "medium", "high"
    threats: Optional[List[str]] = []
    protection_needed: bool = False


class SupportService(BaseModel):
    type: str  # legal, medical, psychological, etc.
    provider: str
    status: str  # active, closed, etc.


class VictimModel(BaseModel):
    type: str = "victim"  # or "witness"
    anonymous: bool = False
    pseudonym: Optional[str]
    demographics: Optional[Demographics]
    contact_info: Optional[ContactInfo]
    cases_involved: List[str] = []
    risk_assessment: RiskAssessment
    support_services: Optional[List[SupportService]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        arbitrary_types_allowed = True
        extra = "forbid"
