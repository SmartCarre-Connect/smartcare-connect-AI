"""Demo user initialization for presentation purposes."""
from loguru import logger
from app.database.mongodb import get_database
from app.core.security import hash_password
from datetime import datetime, timezone


async def create_demo_user_if_not_exists():
    """
    Create a demo user account if it does not already exist.

    Demo credentials:
    - Email: demo@smartcare.ai
    - Password: Demo@123
    - Role: Patient
    """
    db = get_database()
    demo_email = "demo@smartcare.ai"

    # Check if demo user already exists
    existing = await db.users.find_one({"email": demo_email})
    if existing:
        logger.info("✅ Demo user already exists.")
        return

    # Create demo user with Patient role
    demo_user = {
        "full_name": "Demo Patient",
        "email": demo_email,
        "phone": "+91-9999999999",
        "password": hash_password("Demo@123"),
        "role": "patient",
        "profile_image": "",
        "is_verified": True,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    result = await db.users.insert_one(demo_user)
    user_id = str(result.inserted_id)

    # Create demo patient profile
    patient_profile = {
        "user_id": result.inserted_id,
        "patient_id": "PAT9999",
        "full_name": "Demo Patient",
        "dob": "",
        "gender": "",
        "blood_group": "",
        "address": "",
        "height": "",
        "weight": "",
        "allergies": [],
        "chronic_diseases": [],
        "insurance_id": None,
        "emergency_contact": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.patients.insert_one(patient_profile)

    logger.info(f"🎭 Demo user created! Email: {demo_email}, Password: Demo@123")
