from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.schemas import VitalsCreate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/vitals", tags=["Vitals"])


@router.post("/")
async def log_vitals(data: VitalsCreate, current_user: dict = Depends(get_current_user)):
    """Log a new vitals reading for the current patient."""
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    vitals_doc = {
        "patient_id": patient["_id"],
        "user_id": ObjectId(current_user["_id"]),
        "heart_rate": data.heart_rate,
        "blood_pressure": data.blood_pressure,
        "temperature": data.temperature,
        "oxygen": data.oxygen,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.vitals.insert_one(vitals_doc)
    return success_response(
        data={"id": str(result.inserted_id)},
        message="Vitals logged successfully",
        status=201,
    )


@router.get("/my")
async def get_my_vitals(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get vitals history for the current patient."""
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    skip = (page - 1) * limit
    cursor = db.vitals.find({"patient_id": patient["_id"]}).sort("recorded_at", -1).skip(skip).limit(limit)
    vitals = await cursor.to_list(length=limit)
    total = await db.vitals.count_documents({"patient_id": patient["_id"]})

    # Latest reading
    latest = vitals[0] if vitals else None
    latest_data = None
    if latest:
        latest_data = {
            "heart_rate": latest.get("heart_rate"),
            "blood_pressure": latest.get("blood_pressure"),
            "temperature": latest.get("temperature"),
            "oxygen": latest.get("oxygen"),
            "recorded_at": latest.get("recorded_at"),
        }

    return success_response(
        data={
            "vitals": serialize_docs(vitals),
            "total": total,
            "page": page,
            "latest": latest_data,
        }
    )


@router.get("/latest")
async def get_latest_vitals(current_user: dict = Depends(get_current_user)):
    """Get the most recent vitals reading."""
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    latest = await db.vitals.find_one({"patient_id": patient["_id"]}, sort=[("recorded_at", -1)])
    if not latest:
        return success_response(data=None, message="No vitals recorded yet")

    return success_response(data=serialize_doc(latest))
