from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    country: str
    region: str
    coordinates: dict

class CaseModel(BaseModel):
    # case_id: str
    case_id: Optional[str] = None
    title: str
    description: str
    violation_types: List[str]
    status: str
    priority: str
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str] = []
    perpetrators: Optional[List[dict]] = []
    evidence: Optional[List[dict]] = []
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        arbitrary_types_allowed = True
        extra = "forbid"
        allow_mutation = True  
