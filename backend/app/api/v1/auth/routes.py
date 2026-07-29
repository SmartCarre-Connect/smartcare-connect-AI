from fastapi import APIRouter, HTTPException, status
from app.database.mongodb import get_database
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.utils.helpers import success_response, error_response, serialize_doc
from datetime import datetime, timezone
from loguru import logger
import random

router = APIRouter(prefix="/auth", tags=["Authentication"])


def generate_id(prefix: str) -> str:
    return f"{prefix}{random.randint(1000, 9999)}"


@router.post("/register")
async def register(request: RegisterRequest):
    db = get_database()

    # Check existing user
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_phone = await db.users.find_one({"phone": request.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Create user
    user_doc = {
        "full_name": request.full_name,
        "email": request.email,
        "phone": request.phone,
        "password": hash_password(request.password),
        "role": request.role.value,
        "profile_image": "",
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Create role-specific profile
    if request.role.value == "patient":
        patient_doc = {
            "user_id": result.inserted_id,
            "patient_id": generate_id("PAT"),
            "dob": "",
            "gender": "",
            "blood_group": "",
            "height": "",
            "weight": "",
            "allergies": [],
            "chronic_diseases": [],
            "insurance_id": None,
            "emergency_contact": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.patients.insert_one(patient_doc)
    elif request.role.value == "doctor":
        doctor_doc = {
            "user_id": result.inserted_id,
            "doctor_id": generate_id("DOC"),
            "department_id": None,
            "specialization": "",
            "experience": 0,
            "qualification": "",
            "consultation_fee": 500,
            "availability": [],
            "rating": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.doctors.insert_one(doctor_doc)

    # Generate tokens
    token_data = {"sub": user_id, "role": request.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Audit log
    await db.audit_logs.insert_one({
        "user_id": result.inserted_id,
        "action": "User registered",
        "ip_address": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(f"New user registered: {request.email} as {request.role.value}")
    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": request.role.value,
            "user_id": user_id,
        },
        message="Registration successful",
    )


@router.post("/login")
async def login(request: LoginRequest):
    db = get_database()

    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if request.role and user.get("role") != request.role:
        raise HTTPException(status_code=403, detail=f"Account is not registered as a {request.role}")

    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user_id = str(user["_id"])
    token_data = {"sub": user_id, "role": user["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Activity log
    await db.activity_logs.insert_one({
        "user_id": user["_id"],
        "activity": "Login",
        "device": "",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(f"User logged in: {request.email}")
    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user["role"],
            "user_id": user_id,
            "full_name": user["full_name"],
            "email": user["email"],
            "profile_image": user.get("profile_image", ""),
        },
        message="Login successful",
    )


@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_data = {"sub": payload["sub"], "role": payload.get("role", "")}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return success_response(
        data={
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        },
        message="Token refreshed",
    )


@router.get("/me")
async def get_current_profile():
    """Public endpoint – requires token via dependency injection at router level."""
    pass  # handled by the /users/me route
