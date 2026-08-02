from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import AppointmentCreate, AppointmentUpdate
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone
import random

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/")
async def create_appointment(data: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()

    # Verify doctor exists
    doctor = await db.doctors.find_one({"_id": ObjectId(data.doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Get patient
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Check for conflicting appointment
    existing = await db.appointments.find_one({
        "doctor_id": ObjectId(data.doctor_id),
        "appointment_date": data.appointment_date,
        "time_slot": data.time_slot,
        "status": {"$in": ["Booked", "Confirmed"]},
    })
    if existing:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    dept_prefix = (data.department_id or doctor.get("department_id") or "OPD")
    token_prefix = str(dept_prefix)[:3].upper()
    token_number = data.token_number or f"OPD-{token_prefix}-{random.randint(10, 99)}"
    patient_uhid = data.patient_uhid or f"UHID-2026-{random.randint(100000, 999999)}"
    registration_id = data.registration_id or f"REG-{random.randint(1000, 9999)}"
    opd_number = data.opd_number or f"OPD-{random.randint(10000, 99999)}"
    scheme = data.scheme or "Ayushman Bharat (PM-JAY)"
    payment_status = data.payment_status or ("paid" if "Cash" in scheme else "covered_under_scheme")
    fee = data.fee if data.fee is not None else float(doctor.get("consultation_fee", 0) or 0)
    hospital_branch = data.hospital_branch or "SmartCare Central Hospital"
    opd_room = data.opd_room or doctor.get("opd_room") or "Room TBD"

    doctor_user = await db.users.find_one({"_id": doctor["user_id"]}) if doctor.get("user_id") else None
    appointment_doc = {
        "appointment_id": f"APT{random.randint(10000, 99999)}",
        "patient_id": patient["_id"],
        "doctor_id": ObjectId(data.doctor_id),
        "doctor_name": doctor_user.get("full_name", "") if doctor_user else "",
        "department_id": ObjectId(data.department_id) if data.department_id else doctor.get("department_id"),
        "department": doctor.get("department") or doctor.get("specialization") or data.department_id or "General Medicine",
        "appointment_date": data.appointment_date,
        "time_slot": data.time_slot,
        "status": "Confirmed",
        "reason": data.reason or "",
        "scheme": scheme,
        "payment_status": payment_status,
        "fee": fee,
        "hospital_branch": hospital_branch,
        "patient_name": data.patient_name or current_user.get("full_name", ""),
        "patient_age": data.patient_age,
        "patient_gender": data.patient_gender,
        "patient_phone": data.patient_phone or current_user.get("phone", ""),
        "blood_group": data.blood_group,
        "opd_room": opd_room,
        "token_number": token_number,
        "patient_uhid": patient_uhid,
        "registration_id": registration_id,
        "opd_number": opd_number,
        "qr_code_value": data.qr_code_value or f"https://smartcare.org/opd/verify?token={token_number}&uhid={patient_uhid}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_timestamp": datetime.now(timezone.utc).astimezone().strftime("%I:%M %p"),
    }
    result = await db.appointments.insert_one(appointment_doc)
    appointment_doc["_id"] = result.inserted_id

    # Create notification for doctor
    if doctor.get("user_id"):
        await db.notifications.insert_one({
            "user_id": doctor["user_id"],
            "title": "New Appointment",
            "message": f"New appointment booked by {current_user.get('full_name', 'Patient')} on {data.appointment_date} at {data.time_slot}",
            "type": "appointment",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Create notification for patient
    try:
        await db.notifications.insert_one({
            "user_id": ObjectId(current_user["_id"]),
            "title": "Appointment confirmed",
            "message": f"Your appointment with {doctor_user.get('full_name','Doctor') if doctor_user else data.doctor_id} is confirmed for {data.appointment_date} at {data.time_slot}.",
            "type": "appointment",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass

    return success_response(
        data=serialize_doc(appointment_doc),
        message="Appointment booked successfully",
        status=201,
    )


@router.get("/my")
async def get_my_appointments(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    query = {"patient_id": patient["_id"]}
    if status:
        query["status"] = status
    skip = (page - 1) * limit
    cursor = db.appointments.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
    appointments = await cursor.to_list(length=limit)
    total = await db.appointments.count_documents(query)

    # Enrich with doctor names
    enriched = []
    for appt in appointments:
        a = serialize_doc(appt)
        doc = await db.doctors.find_one({"_id": ObjectId(a.get("doctor_id", ""))}) if a.get("doctor_id") else None
        if doc:
            user = await db.users.find_one({"_id": doc["user_id"]})
            a["doctor_name"] = user.get("full_name", "") if user else ""
            a["specialization"] = doc.get("specialization", "")
        enriched.append(a)

    return success_response(data={"appointments": enriched, "total": total, "page": page})


@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    appt = await db.appointments.find_one({"appointment_id": appointment_id})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return success_response(data=serialize_doc(appt))


@router.put("/{appointment_id}")
async def update_appointment(appointment_id: str, data: AppointmentUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return success_response(message="Appointment updated")


@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": "Cancelled"}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return success_response(message="Appointment cancelled")
