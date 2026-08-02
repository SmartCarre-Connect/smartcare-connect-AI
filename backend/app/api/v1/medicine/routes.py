from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.schemas import MedicineReminderCreate, MedicineReminderUpdate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/medicine-reminders", tags=["Medicine Reminders"])


@router.post("/")
async def create_reminder(data: MedicineReminderCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    reminder_doc = {
        "patient_id": patient["_id"],
        "medicine_name": data.medicine_name,
        "dosage": data.dosage,
        "morning": data.morning,
        "afternoon": data.afternoon,
        "evening": data.evening,
        "night": data.night,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "instruction": data.instruction or "",
        "status": "Active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.medicine_reminders.insert_one(reminder_doc)
    # Create notification for patient about reminder
    try:
        await db.notifications.insert_one({
            "user_id": ObjectId(current_user["_id"]),
            "title": "Medicine reminder set",
            "message": f"Reminder set for {data.medicine_name} starting {data.start_date}.",
            "type": "medicine_reminder",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass

    return success_response(
        data={"id": str(result.inserted_id)},
        message="Medicine reminder created",
        status=201,
    )


@router.get("/my")
async def get_my_reminders(
    status: str = Query(None),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    query = {"patient_id": patient["_id"]}
    if status:
        query["status"] = status
    cursor = db.medicine_reminders.find(query).sort("created_at", -1)
    reminders = await cursor.to_list(length=100)
    return success_response(data=serialize_docs(reminders))


@router.put("/{reminder_id}")
async def update_reminder(reminder_id: str, data: MedicineReminderUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.medicine_reminders.update_one(
        {"_id": ObjectId(reminder_id)},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return success_response(message="Reminder updated")


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.medicine_reminders.delete_one({"_id": ObjectId(reminder_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return success_response(message="Reminder deleted")
