from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from loguru import logger
import os
import sys

from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection

# These paths are needed during import too: StaticFiles validates its directory
# before the application lifespan has started.
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Configure Loguru
logger.remove()
logger.add(sys.stdout, level="INFO", format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")
logger.add("logs/smartcare.log", rotation="10 MB", retention="30 days", level="DEBUG")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 SmartCare Connect Backend starting...")
    await connect_to_mongo()
    logger.info("✅ SmartCare Connect Backend ready!")
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("👋 SmartCare Connect Backend shutting down.")


app = FastAPI(
    title="SmartCare Connect API",
    description="AI-Powered Hospital Management System Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ===== Register all API Routers =====
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.users.routes import router as users_router
from app.api.v1.patients.routes import router as patients_router
from app.api.v1.doctors.routes import router as doctors_router
from app.api.v1.appointments.routes import router as appointments_router
from app.api.v1.reports.routes import router as reports_router
from app.api.v1.ai.routes import router as ai_router
from app.api.v1.notifications.routes import router as notifications_router
from app.api.v1.medicine.routes import router as medicine_router
from app.api.v1.prescriptions.routes import router as prescriptions_router
from app.api.v1.medical_images.routes import router as medical_images_router
from app.api.v1.dashboard.routes import router as dashboard_router
from app.api.v1.general.routes import router as general_router
from app.api.v1.training.routes import router as training_router
from app.api.v1.settings.routes import router as settings_router
from app.api.v1.hr.routes import router as vitals_router
from app.api.v1.heygen.routes import router as heygen_router
from app.api.v1.tts.routes import router as tts_router
from app.api.v1.media.routes import router as media_router

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(patients_router, prefix=API_PREFIX)
app.include_router(doctors_router, prefix=API_PREFIX)
app.include_router(appointments_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(medicine_router, prefix=API_PREFIX)
app.include_router(prescriptions_router, prefix=API_PREFIX)
app.include_router(medical_images_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(general_router, prefix=API_PREFIX)
app.include_router(training_router, prefix=API_PREFIX)
app.include_router(settings_router, prefix=API_PREFIX)
app.include_router(vitals_router, prefix=API_PREFIX)
app.include_router(heygen_router, prefix=API_PREFIX)
app.include_router(tts_router, prefix=API_PREFIX)
app.include_router(media_router, prefix=API_PREFIX)


# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "SmartCare Connect API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
