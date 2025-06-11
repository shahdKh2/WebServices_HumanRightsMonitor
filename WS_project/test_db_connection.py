# test_db_connection.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("MONGO_DB")]
    print("✅ Successfully connected to MongoDB!")
    print("Collections:", db.list_collection_names())
except Exception as e:
    print("❌ Connection failed:", str(e))
