from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import DoctorCreate, DoctorUpdate
from datetime import datetime, timezone
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
        # Attach department name
        if d.get("department_id"):
            try:
                dept = await db.departments.find_one({"_id": ObjectId(d["department_id"])})
                if dept:
                    d["department_name"] = dept.get("department_name", "")
            except Exception:
                d["department_name"] = ""

        # Compute availability flag from availability array
        availability = d.get("availability")
        if isinstance(availability, list):
            # if any day has slots, mark available
            d["is_available"] = any(day.get("slots") for day in availability if isinstance(day, dict))
        else:
            # fallback to availability string
            d["is_available"] = availability not in (None, "", "off")
        enriched.append(d)

    return success_response(
        data={"doctors": enriched, "total": total, "page": page, "limit": limit},
    )


@router.post("/")
async def create_doctor(
    data: DoctorCreate,
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    doctor_doc = {
        "user_id": None,
        "doctor_id": f"DOC{len(str(await db.doctors.count_documents({}))) + 1000}",
        "full_name": data.full_name or "Dr. New Doctor",
        "medical_reg_number": data.medical_reg_number or "",
        "department_id": ObjectId(data.department_id) if data.department_id else None,
        "specialization": data.specialization,
        "experience": data.experience,
        "qualification": data.qualification,
        "consultation_fee": data.consultation_fee,
        "availability": data.availability or "Available",
        "rating": 0.0,
        "hospital_id": data.hospital_id or None,
        "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }
    result = await db.doctors.insert_one(doctor_doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Doctor created", status=201)


@router.put("/{doctor_id}")
async def update_doctor(
    doctor_id: str,
    data: DoctorUpdate,
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    if update_data.get("department_id"):
        update_data["department_id"] = ObjectId(update_data["department_id"])
    result = await db.doctors.update_one({"_id": ObjectId(doctor_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return success_response(message="Doctor updated")


@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    result = await db.doctors.delete_one({"_id": ObjectId(doctor_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return success_response(message="Doctor deleted")


@router.put("/{doctor_id}/availability")
async def update_doctor_availability(
    doctor_id: str,
    availability: str = Query(...),
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    result = await db.doctors.update_one({"_id": ObjectId(doctor_id)}, {"$set": {"availability": availability}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    # Notify doctor user that availability updated
    try:
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if doctor and doctor.get("user_id"):
            await db.notifications.insert_one({
                "user_id": doctor.get("user_id"),
                "title": "Availability updated",
                "message": f"Your availability has been updated to: {availability}",
                "type": "doctor_availability",
                "is_read": False,
                "created_at": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),
            })
    except Exception:
        pass
    return success_response(message="Availability updated")


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
    # Support both Mongo _id string and doctor_id codes (e.g., DOC001)
    doctor = None
    try:
        # Try as ObjectId
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    except Exception:
        # Not an ObjectId, try doctor_id field
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
        try:
            dept = await db.departments.find_one({"_id": ObjectId(d["department_id"])})
            d["department_name"] = dept.get("department_name", "") if dept else ""
        except Exception:
            d["department_name"] = ""

    return success_response(data=d)


@router.get("/{doctor_id}/availability")
async def get_doctor_availability(doctor_id: str, date: str = Query(None)):
    """Return available time slots for a doctor on a given date (YYYY-MM-DD)."""
    db = get_database()
    # Locate doctor by ObjectId or doctor_id
    doctor = None
    try:
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    except Exception:
        doctor = await db.doctors.find_one({"doctor_id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # availability stored as list of { day: 'Mon', slots: [...] }
    availability = doctor.get("availability") or []

    # Determine weekday name from date
    day_name = None
    if date:
        try:
            dt = datetime.fromisoformat(date)
            day_name = dt.strftime('%a')  # Mon, Tue, Wed
        except Exception:
            # ignore parse errors
            day_name = None

    # Normalize availability to slots for the requested day or all slots
    slots = []
    if isinstance(availability, list):
        if day_name:
            for entry in availability:
                if isinstance(entry, dict) and entry.get('day') and entry.get('day')[:3].lower() == day_name.lower():
                    slots = entry.get('slots', [])
                    break
        else:
            # return combined unique slots
            s = []
            for entry in availability:
                if isinstance(entry, dict):
                    s.extend(entry.get('slots', []))
            slots = sorted(list(dict.fromkeys(s)))
    elif isinstance(availability, str) and availability:
        # If availability is a comma-separated string
        slots = [s.strip() for s in availability.split(',') if s.strip()]

    # Remove already booked slots for the date
    if date and slots:
        # Find appointments for this doctor and date with active statuses
        booked_cursor = db.appointments.find({
            'doctor_id': ObjectId(doctor.get('_id')) if doctor.get('_id') else ObjectId(doctor.get('id')),
            'appointment_date': date,
            'status': {'$in': ['Booked', 'Confirmed']}
        })
        booked = await booked_cursor.to_list(length=200)
        booked_slots = [b.get('time_slot') for b in booked if b.get('time_slot')]
        slots = [s for s in slots if s not in booked_slots]

    return success_response(data={'slots': slots, 'date': date, 'doctor_id': serialize_doc(doctor).get('id')})


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
