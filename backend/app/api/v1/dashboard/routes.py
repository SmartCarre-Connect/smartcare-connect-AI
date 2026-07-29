from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.utils.helpers import success_response
from bson import ObjectId
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get overall dashboard statistics based on user role."""
    db = get_database()
    role = current_user.get("role", "patient")

    if role == "patient":
        patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
        if not patient:
            return success_response(data={})
        pid = patient["_id"]
        total_appointments = await db.appointments.count_documents({"patient_id": pid})
        upcoming = await db.appointments.count_documents({"patient_id": pid, "status": "Booked"})
        total_reports = await db.medical_reports.count_documents({"patient_id": pid})
        active_reminders = await db.medicine_reminders.count_documents({"patient_id": pid, "status": "Active"})
        unread_notifs = await db.notifications.count_documents({"user_id": ObjectId(current_user["_id"]), "is_read": False})

        # Latest vitals
        latest_vital = await db.vitals.find_one({"patient_id": pid}, sort=[("recorded_at", -1)])
        vitals_data = None
        if latest_vital:
            vitals_data = {
                "heart_rate": latest_vital.get("heart_rate"),
                "blood_pressure": latest_vital.get("blood_pressure"),
                "temperature": latest_vital.get("temperature"),
                "oxygen": latest_vital.get("oxygen"),
            }

        return success_response(data={
            "total_appointments": total_appointments,
            "upcoming_appointments": upcoming,
            "total_reports": total_reports,
            "active_reminders": active_reminders,
            "unread_notifications": unread_notifs,
            "latest_vitals": vitals_data,
        })

    elif role in ("admin", "super_admin"):
        total_patients = await db.patients.count_documents({})
        total_doctors = await db.doctors.count_documents({})
        total_appointments = await db.appointments.count_documents({})
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_appts = await db.appointments.count_documents({"appointment_date": {"$regex": today_str}})
        total_employees = await db.employees.count_documents({})
        pending_leaves = await db.leave_requests.count_documents({"status": "Pending"})
        total_reports = await db.medical_reports.count_documents({})
        total_revenue = total_appointments * 500  # simplified

        return success_response(data={
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "today_appointments": today_appts,
            "total_employees": total_employees,
            "pending_leaves": pending_leaves,
            "total_reports": total_reports,
            "estimated_revenue": total_revenue,
        })

    elif role == "doctor":
        doctor = await db.doctors.find_one({"user_id": ObjectId(current_user["_id"])})
        if not doctor:
            return success_response(data={})
        did = doctor["_id"]
        total_appts = await db.appointments.count_documents({"doctor_id": did})
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_appts = await db.appointments.count_documents({"doctor_id": did, "appointment_date": {"$regex": today_str}})
        pending_appts = await db.appointments.count_documents({"doctor_id": did, "status": "Booked"})

        # Average feedback
        pipeline = [{"$match": {"doctor_id": did}}, {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}]
        feedback_result = await db.feedback.aggregate(pipeline).to_list(1)
        avg_rating = round(feedback_result[0]["avg"], 1) if feedback_result else 0
        total_reviews = feedback_result[0]["count"] if feedback_result else 0

        return success_response(data={
            "total_appointments": total_appts,
            "today_appointments": today_appts,
            "pending_appointments": pending_appts,
            "average_rating": avg_rating,
            "total_reviews": total_reviews,
        })

    return success_response(data={})


@router.get("/recent-activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    """Get recent activity logs for the current user."""
    db = get_database()
    cursor = db.activity_logs.find({"user_id": ObjectId(current_user["_id"])}).sort("timestamp", -1).limit(20)
    from app.utils.helpers import serialize_docs
    activities = await cursor.to_list(length=20)
    return success_response(data=serialize_docs(activities))


@router.get("/admin/audit-logs")
async def get_audit_logs(current_user: dict = Depends(require_roles("admin", "super_admin"))):
    db = get_database()
    cursor = db.audit_logs.find().sort("created_at", -1).limit(100)
    from app.utils.helpers import serialize_docs
    logs = await cursor.to_list(length=100)
    return success_response(data=serialize_docs(logs))
