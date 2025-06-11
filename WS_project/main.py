from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.report_routes import router as report_router  # ✅ import router, not module

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust for your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include the router
app.include_router(report_router, prefix="/api")
