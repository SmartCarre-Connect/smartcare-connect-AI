from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.schemas import MedicalReportCreate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from app.core.config import settings
from bson import ObjectId
from datetime import datetime, timezone
from loguru import logger
import os
import uuid

router = APIRouter(prefix="/reports", tags=["Medical Reports"])


@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    report_type: str = "General",
    current_user: dict = Depends(get_current_user),
):
    db = get_database()

    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and image files are allowed")

    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit")

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, "reports")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "pdf"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    # Get patient
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    patient_id = patient["_id"] if patient else None

    report_doc = {
        "patient_id": patient_id,
        "doctor_id": None,
        "report_type": report_type,
        "file_url": filepath,
        "original_filename": file.filename,
        "file_size": len(content),
        "content_type": file.content_type,
        "report_date": datetime.now(timezone.utc).isoformat(),
        "status": "Uploaded",
    }
    result = await db.medical_reports.insert_one(report_doc)

    logger.info(f"Report uploaded: {file.filename} by user {current_user['_id']}")
    return success_response(
        data={"report_id": str(result.inserted_id), "file_url": filepath},
        message="Report uploaded successfully",
        status=201,
    )


@router.get("/my")
async def get_my_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    skip = (page - 1) * limit
    cursor = db.medical_reports.find({"patient_id": patient["_id"]}).sort("report_date", -1).skip(skip).limit(limit)
    reports = await cursor.to_list(length=limit)
    total = await db.medical_reports.count_documents({"patient_id": patient["_id"]})
    return success_response(data={"reports": serialize_docs(reports), "total": total, "page": page})


@router.get("/{report_id}")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    report = await db.medical_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Check if AI analysis exists
    ai_report = await db.ai_reports.find_one({"medical_report_id": ObjectId(report_id)})
    data = serialize_doc(report)
    if ai_report:
        data["ai_analysis"] = serialize_doc(ai_report)
    return success_response(data=data)


@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    report = await db.medical_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Remove file from disk
    if os.path.exists(report.get("file_url", "")):
        os.remove(report["file_url"])

    await db.medical_reports.delete_one({"_id": ObjectId(report_id)})
    await db.ai_reports.delete_many({"medical_report_id": ObjectId(report_id)})
    return success_response(message="Report deleted")
