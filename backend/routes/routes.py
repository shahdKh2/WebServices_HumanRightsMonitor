
# routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from database import db
from models.caseModel import CaseModel
from datetime import datetime
from fastapi import Body
import os


router = APIRouter()


# ===============================================
@router.post("/cases/")
async def create_case(case: CaseModel):
    case_dict = case.dict()
    # generate ID here
    case_dict["case_id"] = f"HRM-{int(datetime.utcnow().timestamp())}"
    case_dict["created_at"] = datetime.utcnow()
    case_dict["updated_at"] = datetime.utcnow()
    case_dict["evidence"] = []
    case_dict["date_occurred"] = case.date_occurred

    result = await db["cases"].insert_one(case_dict)
    await db["case_status_history"].insert_one({
        "case_id": case_dict["case_id"],
        "status": case_dict["status"],
        "timestamp": case_dict["created_at"]
    })
    return {"message": "Case created", "id": case_dict["case_id"]}

# ===============================================


@router.get("/cases/")
async def list_cases(
    status: str = None,
    location: str = None,
    violation_type: str = None,
    priority: str = None,
    start_date: str = None,
    # end_date: str = None
):
    query = {}

    if status:
        query["status"] = status

    if location:
        query["$or"] = [
            {"location.country": {"$regex": location, "$options": "i"}},
            {"location.region": {"$regex": location, "$options": "i"}},
        ]

    if violation_type:
        query["violation_types"] = violation_type

    if priority:
        query["priority"] = priority
    print("🗓️ Raw start_date:", start_date)

    if start_date:
        try:
            query["date_occurred"] = {
                "$gte": datetime.fromisoformat(start_date),
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    print("🔍 Filter Query:", query)

    cases = []
    async for c in db["cases"].find(query):
        c["_id"] = str(c["_id"])
        cases.append(c)
    return cases


# ===============================================


@router.get("/cases/{case_id}")
async def get_case(case_id: str):
    case = await db["cases"].find_one({"case_id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case["_id"] = str(case["_id"])
    return case


@router.get("/cases/search/")
async def search_cases(case_id: str = None, title: str = None):
    query = {}
    if case_id:
        query["case_id"] = case_id
    if title:
        query["title"] = {"$regex": title, "$options": "i"}

    results = []
    async for case in db["cases"].find(query):
        case["_id"] = str(case["_id"])
        results.append(case)

    if not results:
        raise HTTPException(
            status_code=404, detail="No matching case(s) found")

    return results


# ===============================================
@router.patch("/cases/{case_id}")
async def update_case_status(case_id: str, update: dict):
    update["updated_at"] = datetime.utcnow()
    result = await db["cases"].update_one({"case_id": case_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Case not found or not updated")
    await db["case_status_history"].insert_one({
        "case_id": case_id,
        "status": update.get("status"),
        "timestamp": update["updated_at"]
    })
    return {"message": "Case updated"}


@router.delete("/cases/{case_id}")
async def delete_case(case_id: str):
    result = await db["cases"].delete_one({"case_id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case deleted"}


@router.post("/cases/{case_id}/upload/")
async def upload_evidence(case_id: str, file: UploadFile = File(...)):
    print(f"📁 Uploaded file: {file.filename}")
    print(f"📄 Content type: {file.content_type}")

    # Define file save path
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)  # Ensure folder exists
    file_location = os.path.join(upload_dir, file.filename)

    content = await file.read()

    try:
        print("📦 File content preview:\n", content.decode("utf-8"))
    except Exception:
        print("⚠️ File content is binary or not decodable.")

    # Save the file
    with open(file_location, "wb") as f:
        f.write(content)

    await db["cases"].update_one(
        {"case_id": case_id},
        {"$set": {"evidence": [f"/{file_location}"]}}
    )

    return {"message": "File uploaded", "filename": file.filename}


@router.patch("/cases/{case_id}/archive")
async def archive_case(case_id: str):
    result = await db["cases"].update_one(
        {"case_id": case_id},
        {"$set": {"status": "archived", "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Case not found or not updated")
    return {"message": "Case archived"}

# ====================TASK 4=======================


@router.get("/analytics/violations")
async def get_violations_summary(
    start_date: str = Query(None),
    end_date: str = Query(None),
    region: str = Query(None),
    type: str = Query(None)
):
    match_stage = {}

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_filter["$lte"] = datetime.fromisoformat(end_date)
        match_stage["date_occurred"] = date_filter

    if region:
        match_stage["location.region"] = {"$regex": region, "$options": "i"}

    if type:
        match_stage["violation_types"] = type

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline += [
        {"$unwind": "$violation_types"},
        {"$group": {"_id": "$violation_types", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]

    results = await db["cases"].aggregate(pipeline).to_list(length=100)
    return {r["_id"]: r["count"] for r in results}

@router.get("/analytics/geodata")
async def count_by_region(
    start_date: str = Query(None),
    end_date: str = Query(None),
    type: str = Query(None),
    region: str = Query(None)  # 👈 Add this line
):
    match_stage = {}

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_filter["$lte"] = datetime.fromisoformat(end_date)
        match_stage["date_occurred"] = date_filter

    if type:
        match_stage["violation_types"] = type

    if region:
        match_stage["location.region"] = {"$regex": region, "$options": "i"} 

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline += [
        {"$group": {"_id": "$location.region", "count": {"$sum": 1}}}
    ]

    results = await db["cases"].aggregate(pipeline).to_list(length=None)
    return {r["_id"]: r["count"] for r in results}


@router.get("/analytics/timeline")
async def count_by_month(
    start_date: str = Query(None),
    end_date: str = Query(None),
    region: str = Query(None),
    type: str = Query(None)
):
    match_stage = {}

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_filter["$lte"] = datetime.fromisoformat(end_date)
        match_stage["date_occurred"] = date_filter

    if region:
        match_stage["location.region"] = {"$regex": region, "$options": "i"}

    if type:
        match_stage["violation_types"] = type

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline += [
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m", "date": "$date_occurred"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    results = await db["cases"].aggregate(pipeline).to_list(length=None)
    return {r["_id"]: r["count"] for r in results}
