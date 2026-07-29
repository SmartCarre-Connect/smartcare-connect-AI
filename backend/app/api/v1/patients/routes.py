from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import PatientUpdate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from loguru import logger

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return success_response(data=serialize_doc(patient), message="Patient profile retrieved")


@router.put("/me")
async def update_my_profile(data: PatientUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    await db.patients.update_one(
        {"user_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )
    return success_response(message="Profile updated successfully")


@router.get("/")
async def list_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_roles("admin", "doctor", "super_admin")),
):
    db = get_database()
    skip = (page - 1) * limit
    cursor = db.patients.find().skip(skip).limit(limit)
    patients = await cursor.to_list(length=limit)
    total = await db.patients.count_documents({})
    return success_response(
        data={"patients": serialize_docs(patients), "total": total, "page": page, "limit": limit},
        message="Patients retrieved",
    )


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(require_roles("admin", "doctor", "super_admin")),
):
    db = get_database()
    patient = await db.patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Attach user info
    user = await db.users.find_one({"_id": patient["user_id"]})
    patient_data = serialize_doc(patient)
    if user:
        patient_data["full_name"] = user.get("full_name", "")
        patient_data["email"] = user.get("email", "")
        patient_data["phone"] = user.get("phone", "")
        patient_data["profile_image"] = user.get("profile_image", "")
    return success_response(data=patient_data)


@router.get("/{patient_id}/vitals")
async def get_patient_vitals(
    patient_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    patient = await db.patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    skip = (page - 1) * limit
    cursor = db.vitals.find({"patient_id": patient["_id"]}).sort("recorded_at", -1).skip(skip).limit(limit)
    vitals = await cursor.to_list(length=limit)
    return success_response(data=serialize_docs(vitals))


@router.get("/{patient_id}/health-records")
async def get_health_records(
    patient_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    patient = await db.patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    skip = (page - 1) * limit
    cursor = db.health_records.find({"patient_id": patient["_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    records = await cursor.to_list(length=limit)
    return success_response(data=serialize_docs(records))
