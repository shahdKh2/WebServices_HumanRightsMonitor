from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["human_rights_monitor"]
incident_reports = db["incident_reports"]
report_evidence = db["report_evidence"]
