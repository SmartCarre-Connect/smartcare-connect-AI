from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import (
    DepartmentCreate, EmergencyContactCreate, VitalsCreate, FeedbackCreate,
    EmployeeCreate, LeaveRequestCreate, AttendanceCreate,
)
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(tags=["Departments, Navigation, Vitals, HR, Feedback"])

# =============== DEPARTMENTS ===============

@router.get("/departments")
async def list_departments():
    db = get_database()
    cursor = db.departments.find()
    depts = await cursor.to_list(length=100)
    return success_response(data=serialize_docs(depts))


@router.post("/departments")
async def create_department(data: DepartmentCreate, current_user: dict = Depends(require_roles("admin", "super_admin"))):
    db = get_database()
    doc = {
        "department_name": data.department_name,
        "description": data.description or "",
        "floor_id": ObjectId(data.floor_id) if data.floor_id else None,
        "head_doctor": ObjectId(data.head_doctor) if data.head_doctor else None,
    }
    result = await db.departments.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Department created", status=201)


# =============== HOSPITAL NAVIGATION ===============

@router.get("/hospital/floors")
async def list_floors():
    db = get_database()
    cursor = db.hospital_floors.find().sort("floor_number", 1)
    floors = await cursor.to_list(length=50)
    return success_response(data=serialize_docs(floors))


@router.get("/hospital/rooms")
async def list_rooms(floor_id: str = Query(None), department_id: str = Query(None)):
    db = get_database()
    query = {}
    if floor_id:
        query["floor_id"] = ObjectId(floor_id)
    if department_id:
        query["department_id"] = ObjectId(department_id)
    cursor = db.rooms.find(query)
    rooms = await cursor.to_list(length=200)
    return success_response(data=serialize_docs(rooms))


@router.get("/hospital/navigation")
async def get_navigation(from_loc: str = Query(...), to_loc: str = Query(...)):
    db = get_database()
    nav = await db.hospital_navigation.find_one({
        "from_location": {"$regex": from_loc, "$options": "i"},
        "to_location": {"$regex": to_loc, "$options": "i"},
    })
    if not nav:
        return success_response(
            data={"from_location": from_loc, "to_location": to_loc, "path": [], "estimated_time": "Unknown"},
            message="No navigation path found",
        )
    return success_response(data=serialize_doc(nav))


# =============== EMERGENCY CONTACTS ===============

@router.post("/emergency-contacts")
async def create_emergency_contact(data: EmergencyContactCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    doc = {
        "patient_id": patient["_id"],
        "contact_name": data.contact_name,
        "relationship": data.relationship,
        "phone": data.phone,
    }
    result = await db.emergency_contacts.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Emergency contact added", status=201)


@router.get("/emergency-contacts/my")
async def get_my_emergency_contacts(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    cursor = db.emergency_contacts.find({"patient_id": patient["_id"]})
    contacts = await cursor.to_list(length=20)
    return success_response(data=serialize_docs(contacts))


# =============== VITALS ===============

@router.post("/vitals")
async def record_vitals(data: VitalsCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    doc = {
        "patient_id": patient["_id"],
        "heart_rate": data.heart_rate,
        "blood_pressure": data.blood_pressure,
        "temperature": data.temperature,
        "oxygen": data.oxygen,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.vitals.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Vitals recorded", status=201)


@router.get("/vitals/my/latest")
async def get_latest_vitals(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    vital = await db.vitals.find_one({"patient_id": patient["_id"]}, sort=[("recorded_at", -1)])
    return success_response(data=serialize_doc(vital) if vital else None)


# =============== FEEDBACK ===============

@router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    doc = {
        "patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]),
        "doctor_id": ObjectId(data.doctor_id),
        "rating": data.rating,
        "comment": data.comment or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.feedback.insert_one(doc)

    # Update doctor average rating
    pipeline = [
        {"$match": {"doctor_id": ObjectId(data.doctor_id)}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}},
    ]
    result = await db.feedback.aggregate(pipeline).to_list(1)
    if result:
        await db.doctors.update_one(
            {"_id": ObjectId(data.doctor_id)},
            {"$set": {"rating": round(result[0]["avg_rating"], 1)}},
        )
    return success_response(message="Feedback submitted. Thank you!")


# =============== HR - EMPLOYEES ===============

@router.get("/hr/employees")
async def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_roles("admin", "hr", "super_admin")),
):
    db = get_database()
    skip = (page - 1) * limit
    cursor = db.employees.find().skip(skip).limit(limit)
    employees = await cursor.to_list(length=limit)
    total = await db.employees.count_documents({})
    return success_response(data={"employees": serialize_docs(employees), "total": total, "page": page})


@router.post("/hr/employees")
async def create_employee(data: EmployeeCreate, current_user: dict = Depends(require_roles("admin", "hr", "super_admin"))):
    db = get_database()
    doc = {
        "employee_name": data.employee_name,
        "department": data.department,
        "designation": data.designation,
        "salary": data.salary,
        "joining_date": data.joining_date or datetime.now(timezone.utc).isoformat(),
    }
    result = await db.employees.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Employee added", status=201)


# =============== HR - ATTENDANCE ===============

@router.post("/hr/attendance")
async def record_attendance(data: AttendanceCreate, current_user: dict = Depends(require_roles("admin", "hr", "super_admin"))):
    db = get_database()
    doc = {
        "employee_id": ObjectId(data.employee_id),
        "date": data.date,
        "check_in": data.check_in,
        "check_out": data.check_out,
        "status": data.status,
    }
    result = await db.attendance.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Attendance recorded", status=201)


@router.get("/hr/attendance/{employee_id}")
async def get_employee_attendance(
    employee_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    current_user: dict = Depends(require_roles("admin", "hr", "super_admin")),
):
    db = get_database()
    skip = (page - 1) * limit
    cursor = db.attendance.find({"employee_id": ObjectId(employee_id)}).sort("date", -1).skip(skip).limit(limit)
    records = await cursor.to_list(length=limit)
    return success_response(data=serialize_docs(records))


# =============== HR - LEAVE REQUESTS ===============

@router.post("/hr/leave-requests")
async def create_leave_request(data: LeaveRequestCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = {
        "employee_id": ObjectId(current_user["_id"]),
        "leave_type": data.leave_type,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "reason": data.reason or "",
        "status": "Pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.leave_requests.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Leave request submitted", status=201)


@router.get("/hr/leave-requests")
async def list_leave_requests(
    status: str = Query(None),
    current_user: dict = Depends(require_roles("admin", "hr", "super_admin")),
):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    cursor = db.leave_requests.find(query).sort("created_at", -1)
    requests = await cursor.to_list(length=100)
    return success_response(data=serialize_docs(requests))


@router.put("/hr/leave-requests/{request_id}")
async def update_leave_request(
    request_id: str,
    status: str = Query(...),
    current_user: dict = Depends(require_roles("admin", "hr", "super_admin")),
):
    db = get_database()
    result = await db.leave_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": status}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return success_response(message=f"Leave request {status}")
