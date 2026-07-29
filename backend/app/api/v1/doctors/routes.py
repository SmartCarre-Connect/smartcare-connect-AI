from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import DoctorUpdate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/")
async def list_doctors(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    department_id: str = Query(None),
    specialization: str = Query(None),
):
    db = get_database()
    query = {}
    if department_id:
        query["department_id"] = ObjectId(department_id)
    if specialization:
        query["specialization"] = {"$regex": specialization, "$options": "i"}

    skip = (page - 1) * limit
    cursor = db.doctors.find(query).skip(skip).limit(limit)
    doctors = await cursor.to_list(length=limit)
    total = await db.doctors.count_documents(query)

    # Attach user info for each doctor
    enriched = []
    for doc in doctors:
        d = serialize_doc(doc)
        user = await db.users.find_one({"_id": ObjectId(d.get("user_id", ""))}) if d.get("user_id") else None
        if user:
            d["full_name"] = user.get("full_name", "")
            d["email"] = user.get("email", "")
            d["profile_image"] = user.get("profile_image", "")
        enriched.append(d)

    return success_response(
        data={"doctors": enriched, "total": total, "page": page, "limit": limit},
    )


@router.get("/me")
async def get_my_doctor_profile(current_user: dict = Depends(get_current_user)):
    db = get_database()
    doctor = await db.doctors.find_one({"user_id": ObjectId(current_user["_id"])})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return success_response(data=serialize_doc(doctor))


@router.put("/me")
async def update_my_doctor_profile(data: DoctorUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    await db.doctors.update_one(
        {"user_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )
    return success_response(message="Doctor profile updated")


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):
    db = get_database()
    doctor = await db.doctors.find_one({"doctor_id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    d = serialize_doc(doctor)
    user = await db.users.find_one({"_id": ObjectId(d.get("user_id", ""))}) if d.get("user_id") else None
    if user:
        d["full_name"] = user.get("full_name", "")
        d["email"] = user.get("email", "")
        d["phone"] = user.get("phone", "")
        d["profile_image"] = user.get("profile_image", "")

    # Attach department
    if d.get("department_id"):
        dept = await db.departments.find_one({"_id": ObjectId(d["department_id"])})
        d["department_name"] = dept.get("department_name", "") if dept else ""

    return success_response(data=d)


@router.get("/{doctor_id}/appointments")
async def get_doctor_appointments(
    doctor_id: str,
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    doctor = await db.doctors.find_one({"doctor_id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    query = {"doctor_id": doctor["_id"]}
    if status:
        query["status"] = status
    skip = (page - 1) * limit
    cursor = db.appointments.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
    appointments = await cursor.to_list(length=limit)
    return success_response(data=serialize_docs(appointments))


@router.get("/{doctor_id}/feedback")
async def get_doctor_feedback(doctor_id: str, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    db = get_database()
    doctor = await db.doctors.find_one({"doctor_id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    skip = (page - 1) * limit
    cursor = db.feedback.find({"doctor_id": doctor["_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    reviews = await cursor.to_list(length=limit)
    return success_response(data=serialize_docs(reviews))
