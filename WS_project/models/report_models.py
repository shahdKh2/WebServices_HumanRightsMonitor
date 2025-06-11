from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime

class ContactInfo(BaseModel):
    email: Optional[EmailStr]
    phone: Optional[str]
    preferred_contact: Optional[Literal["email", "phone"]]

class IncidentLocation(BaseModel):
    country: str
    city: str
    coordinates: List[float]  # [longitude, latitude]

class EvidenceItem(BaseModel):
    type: str
    url: str
    description: Optional[str] = ""

class IncidentDetails(BaseModel):
    date: datetime
    location: IncidentLocation
    description: str
    violation_types: List[str]

class IncidentReportCreate(BaseModel):
    reporter_type: str
    anonymous: bool
    contact_info: Optional[ContactInfo]
    incident_details: IncidentDetails
    evidence: Optional[List[EvidenceItem]] = []
