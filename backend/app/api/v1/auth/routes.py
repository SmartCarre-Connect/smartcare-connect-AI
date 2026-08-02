from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, SendOTPRequest, VerifyOTPRequest
from app.utils.helpers import success_response, error_response, serialize_doc
from datetime import datetime, timezone, timedelta
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

    # Determine if contact was verified via OTP recently
    verified = False
    if request.email:
        v = await db.verified_contacts.find_one({"email": request.email})
        if v:
            verified = True
    if not verified and request.phone:
        v = await db.verified_contacts.find_one({"phone": request.phone})
        if v:
            verified = True

    # Create user
    user_doc = {
        "full_name": request.full_name,
        "email": request.email,
        "phone": request.phone,
        "password": hash_password(request.password),
        "role": request.role.value,
        "profile_image": "",
        "is_verified": verified,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Cleanup verified contact entry after successful registration
    if verified:
        if request.email:
            await db.verified_contacts.delete_one({"email": request.email})
        if request.phone:
            await db.verified_contacts.delete_one({"phone": request.phone})

    # Create role-specific profile
    if request.role.value == "patient":
        patient_doc = {
            "user_id": result.inserted_id,
            "patient_id": generate_id("PAT"),
            "full_name": request.full_name,
            "dob": request.dob or "",
            "gender": request.gender or "",
            "blood_group": request.blood_group or "",
            "address": request.address or "",
            "height": "",
            "weight": "",
            "allergies": [],
            "chronic_diseases": [],
            "insurance_id": None,
            "emergency_contact": request.emergency_contact or None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.patients.insert_one(patient_doc)
    elif request.role.value == "doctor":
        doctor_doc = {
            "user_id": result.inserted_id,
            "doctor_id": generate_id("DOC"),
            "full_name": request.full_name,
            "medical_reg_number": request.medical_reg_number or "",
            "department_id": request.department or None,
            "specialization": request.specialization or "",
            "experience": request.experience or 0,
            "qualification": "",
            "consultation_fee": 500,
            "availability": [],
            "rating": 0.0,
            "hospital_id": request.hospital_id or None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.doctors.insert_one(doctor_doc)
    elif request.role.value == "hr":
        hr_doc = {
            "user_id": result.inserted_id,
            "employee_id": request.employee_id or generate_id("EMP"),
            "employee_name": request.full_name,
            "department": request.department or "",
            "designation": request.designation or "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.hrs.insert_one(hr_doc)
    elif request.role.value == "trainee":
        trainee_doc = {
            "user_id": result.inserted_id,
            "trainee_id": generate_id("TRN"),
            "full_name": request.full_name,
            "college_name": request.college_name or "",
            "department": request.department or "",
            "supervisor": request.supervisor or "",
            "year": request.year or "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.trainees.insert_one(trainee_doc)

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


@router.post("/send-otp")
async def send_otp(request: SendOTPRequest):
    db = get_database()
    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Prepare document to store
    set_doc = {
        "otp": otp,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if request.email:
        await db.otp_codes.update_one(
            {"email": request.email},
            {"$set": set_doc},
            upsert=True,
        )
    else:
        await db.otp_codes.update_one(
            {"phone": request.phone},
            {"$set": set_doc},
            upsert=True,
        )

    # Ensure TTL index exists for expiry cleanup; use sparse indexes to allow either field
    await db.otp_codes.create_index("phone", unique=True, sparse=True)
    await db.otp_codes.create_index("email", unique=True, sparse=True)
    await db.otp_codes.create_index("expires_at", expireAfterSeconds=0)

    identifier = request.email or request.phone
    id_type = "email" if request.email else "phone"
    logger.info(f"OTP generated for {id_type}: {identifier}")

    # Attempt to send via email if email provided; fallback to terminal if SMTP not available
    if request.email:
        from app.utils.email import send_email
        subject = "Your SmartCare Connect OTP"
        body = f"Your verification code is {otp}. It will expire in 10 minutes."
        sent = send_email(subject, request.email, body)
        if sent:
            logger.info(f"OTP email sent to {request.email}")
        else:
            # Development fallback: print OTP in terminal
            print(f"Generated OTP: {otp}")
            logger.warning("Email service unavailable. Using development mode.")
    else:
        # No SMS provider configured — developer fallback
        print(f"Generated OTP: {otp}")
        logger.warning("SMS service not configured. Using development mode.")

    return success_response(
        data={"identifier": identifier, "identifier_type": id_type, "expires_at": expires_at.isoformat()},
        message="OTP sent successfully",
    )


@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    db = get_database()

    # Find OTP entry by email or phone
    query = {"email": request.email} if request.email else {"phone": request.phone}
    otp_entry = await db.otp_codes.find_one(query)
    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_entry.get("otp") != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    expires_at = otp_entry.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    # Mark contact as verified for a short window so register can use it
    verified_doc = {
        "email": request.email if request.email else None,
        "phone": request.phone if request.phone else None,
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)),
    }
    # Upsert and create TTL index
    if request.email:
        await db.verified_contacts.update_one({"email": request.email}, {"$set": verified_doc}, upsert=True)
    else:
        await db.verified_contacts.update_one({"phone": request.phone}, {"$set": verified_doc}, upsert=True)
    await db.verified_contacts.create_index("expires_at", expireAfterSeconds=0)

    # Remove OTP entry
    await db.otp_codes.delete_one(query)
    logger.info(f"OTP verified for {'email' if request.email else 'phone'}: {request.email or request.phone}")
    return success_response(message="OTP verified successfully")


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
async def get_current_profile(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user profile."""
    user = current_user.copy()
    user.pop("password", None)
    return success_response(data=user, message="User profile retrieved")
