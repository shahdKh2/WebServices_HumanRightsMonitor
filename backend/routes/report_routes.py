from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime
from bson import ObjectId
import os
import shutil
from database import incident_reports  # assumed MongoDB collection
from datetime import datetime
router = APIRouter()
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper to generate readable report ID


def generate_report_id():
    count = incident_reports.count_documents({})
    year = datetime.utcnow().year
    return f"IR-{year}-{count+1:04d}"

# 1️⃣ POST /reports/ – Submit a new incident report


@router.post("/reports/")
async def create_report(
    reporter_type: str = Form(...),
    anonymous: bool = Form(...),
    email: str = Form(None),
    phone: str = Form(None),
    preferred_contact: str = Form(None),
    date: str = Form(...),
    location_country: str = Form(...),
    location_city: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    description: str = Form(...),
    violation_types: str = Form(...),
    evidence_files: UploadFile = File(None)
):
    location = {
        "country": location_country,
        "city": location_city,
        "coordinates": [lon, lat]
    }

    report = {
        "reporter_type": reporter_type,
        "anonymous": anonymous,
        "contact_info": {
            "email": email,
            "phone": phone,
            "preferred_contact": preferred_contact
        } if not anonymous else None,
        "incident_details": {
            # "date": datetime.fromisoformat(date),


            "date": datetime.strptime(date.replace("Z", ""), "%Y-%m-%dT%H:%M:%S.%f"),
            "location": location,
            "description": description,
            "violation_types": [violation_types]
        },
        "evidence": [],
        "status": "new",
        "created_at": datetime.utcnow(),
        "report_id": generate_report_id(),
        "assigned_to": None
    }

    result = incident_reports.insert_one(report)

    # Save uploaded file
    if evidence_files:
        file_path = os.path.join(
            UPLOAD_FOLDER, f"{result.inserted_id}_{evidence_files.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(evidence_files.file, buffer)

        evidence_data = {
            "type": evidence_files.content_type,
            "url": f"/{file_path}",
            "uploaded_at": datetime.utcnow()
        }

        incident_reports.update_one(
            {"_id": result.inserted_id},
            {"$push": {"evidence": evidence_data}}
        )

    return {"message": "Report submitted successfully", "id": str(result.inserted_id)}

# 2️⃣ GET /reports/ – List reports (filter by status, date, location)


@router.get("/reports/")
async def list_reports(status: str = None, country: str = None, city: str = None, start_date: str = None, end_date: str = None):
    query = {}

    if status:
        query["status"] = status
    if country:
        query["incident_details.location.country"] = country
    if city:
        query["incident_details.location.city"] = city
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_filter["$lte"] = datetime.fromisoformat(end_date)
        query["incident_details.date"] = date_filter

    reports = list(incident_reports.find(query))
    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return reports

# 3️⃣ PATCH /reports/{report_id} – Update report status


@router.patch("/reports/{report_id}")
async def update_status(report_id: str, status: str = Form(...)):
    result = incident_reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report status updated"}

# 4️⃣ GET /reports/analytics – Count reports by violation type


@router.get("/reports/analytics")
async def analytics_by_violation():
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    return list(incident_reports.aggregate(pipeline))
