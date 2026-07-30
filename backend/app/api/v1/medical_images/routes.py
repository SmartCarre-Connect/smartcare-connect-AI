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

router = APIRouter(prefix="/medical-images", tags=["Medical Images"])


@router.post("/upload")
async def upload_medical_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()

    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "medical-images")
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
        "image_type": "Radiology Scan",
        "findings_summary": "AI review is ready for this image once the full vision pipeline is configured.",
        "notable_observations": ["Image uploaded successfully", "Review pending"],
        "questions_for_doctor": ["Please confirm the scan type and clinical context"],
        "upload_date": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.medical_images.insert_one(doc)

    logger.info(f"Medical image uploaded: {file.filename} by user {current_user['_id']}")
    return success_response(
        data={
            "id": str(result.inserted_id),
            "filename": file.filename,
            "file_url": filepath,
            "image_type": "Radiology Scan",
            "findings_summary": "AI review is ready for this image once the full vision pipeline is configured.",
            "notable_observations": ["Image uploaded successfully", "Review pending"],
            "questions_for_doctor": ["Please confirm the scan type and clinical context"],
        },
        message="Medical image uploaded successfully",
        status=201,
    )


@router.get("/")
async def list_medical_images(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])}) if hasattr(db, "patients") else None
    if not patient:
        return success_response(data=[])
    cursor = db.medical_images.find({"patient_id": patient["_id"]}).sort("upload_date", -1)
    items = await cursor.to_list(length=50)
    return success_response(data=items)
