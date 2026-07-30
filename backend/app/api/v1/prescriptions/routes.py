from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.core.config import settings
from app.utils.helpers import success_response
from bson import ObjectId
from datetime import datetime, timezone
from loguru import logger
import os
import uuid

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()

    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image and PDF files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "prescriptions")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])}) if hasattr(db, "patients") else None
    patient_id = patient["_id"] if patient else None

    doc = {
        "patient_id": patient_id,
        "filename": file.filename,
        "file_url": filepath,
        "content_type": file.content_type,
        "status": "Uploaded",
        "confirmed_by_user": False,
        "confidence_score": 0.92,
        "medicines": [],
        "doctor_notes": "",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.prescriptions.insert_one(doc)

    logger.info(f"Prescription uploaded: {file.filename} by user {current_user['_id']}")
    return success_response(
        data={
            "id": str(result.inserted_id),
            "filename": file.filename,
            "file_url": filepath,
            "status": "Uploaded",
            "confirmed_by_user": False,
            "confidence_score": 0.92,
            "medicines": [],
            "doctor_notes": "",
        },
        message="Prescription uploaded successfully",
        status=201,
    )


@router.get("/")
async def list_prescriptions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])}) if hasattr(db, "patients") else None
    if not patient:
        return success_response(data=[])
    cursor = db.prescriptions.find({"patient_id": patient["_id"]}).sort("uploaded_at", -1)
    items = await cursor.to_list(length=50)
    return success_response(data=items)


@router.post("/{prescription_id}/confirm")
async def confirm_prescription(prescription_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.prescriptions.update_one(
        {"_id": ObjectId(prescription_id)},
        {"$set": {"confirmed_by_user": True, "medicines": data.get("medicines", []), "doctor_notes": data.get("doctor_notes", "")}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return success_response(message="Prescription confirmed")
