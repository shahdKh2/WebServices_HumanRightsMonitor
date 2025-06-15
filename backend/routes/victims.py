from fastapi import APIRouter, HTTPException, Depends
from database import db  # your MongoDB connection
from models.victimModel import VictimModel
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# Helper: check user role (mocked here, implement your auth system)


def get_current_user_role():
    # Ideally from a token/session, here just a placeholder
    return "admin"  # or "viewer" or "unauthorized"


# POST /victims/ - Add new victim/witness
@router.post("/victims/")
async def add_victim(victim: VictimModel):
    victim_dict = victim.dict()
    victim_dict["created_at"] = datetime.utcnow()
    victim_dict["updated_at"] = datetime.utcnow()

    result = await db["victims"].insert_one(victim_dict)
    return {"message": "Victim added", "id": str(result.inserted_id)}


# GET /victims/{victim_id} - Retrieve victim (restricted access)
@router.get("/victims/{victim_id}")
async def get_victim(victim_id: str, user_role: str = Depends(get_current_user_role)):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access")

    victim = await db["victims"].find_one({"_id": ObjectId(victim_id)})
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")
    victim["_id"] = str(victim["_id"])
    return victim


# PATCH /victims/{victim_id} - Update risk level
@router.patch("/victims/{victim_id}")
async def update_risk_level(victim_id: str, risk_update: dict, user_role: str = Depends(get_current_user_role)):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access")

    risk_data = risk_update.get("risk_assessment", {})
    update_data = {}
    if "level" in risk_data:
        update_data["risk_assessment.level"] = risk_data["level"]
    if "threats" in risk_data:
        update_data["risk_assessment.threats"] = risk_data["threats"]
    if "protection_needed" in risk_data:
        update_data["risk_assessment.protection_needed"] = risk_data["protection_needed"]

    update_data["updated_at"] = datetime.utcnow()

    victim = await db["victims"].find_one({"_id": ObjectId(victim_id)})
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    old_level = victim.get("risk_assessment", {}).get("level", None)
    new_level = risk_data.get("level", None)

    if new_level and old_level != new_level:
        await db["victim_risk_assessments"].insert_one({
            "victim_id": ObjectId(victim_id),
            "old_level": old_level,
            "new_level": new_level,
            "changed_by": user_role,
            "timestamp": datetime.utcnow()
        })

    # نفّذ التعديل
    result = await db["victims"].update_one({"_id": ObjectId(victim_id)}, {"$set": update_data})
    return {"message": "Risk assessment updated"}


# GET /victims/case/{case_id} - List victims linked to a case
@router.get("/victims/case/{case_id}")
async def list_victims_by_case(case_id: str, user_role: str = Depends(get_current_user_role)):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access")

    victims = []
    async for victim in db["victims"].find({"cases_involved": case_id}):
        victim["_id"] = str(victim["_id"])
        victims.append(victim)
    return victims


@router.get("/victims")
async def list_victims(user_role: str = Depends(get_current_user_role)):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access")

    victims = []
    async for victim in db["victims"].find():
        # Convert Mongo _id ObjectId to string and rename to id for frontend
        victim["id"] = str(victim["_id"])
        del victim["_id"]

        victims.append(victim)
    return victims


@router.get("/victims/{victim_id}/risk-history")
async def get_risk_history(victim_id: str, user_role: str = Depends(get_current_user_role)):
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access")

    history = []
    async for record in db["victim_risk_assessments"].find({"victim_id": ObjectId(victim_id)}).sort("timestamp", -1):
        record["_id"] = str(record["_id"])
        record["victim_id"] = str(record["victim_id"])
        history.append(record)
    return history
