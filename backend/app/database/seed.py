"""
SmartCare Connect - Database Seeder
Populates the MongoDB database with initial sample data for development.
Run: python -m app.database.seed
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import hash_password
from datetime import datetime, timezone
from bson import ObjectId


async def seed():
    print("🌱 Seeding SmartCare Connect database...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # ===== Clear existing data =====
    collections = await db.list_collection_names()
    for col in collections:
        await db[col].drop()
    print("   Cleared existing collections.")

    # ===== 1. USERS =====
    admin_id = ObjectId()
    doctor1_id = ObjectId()
    doctor2_id = ObjectId()
    doctor3_id = ObjectId()
    patient1_id = ObjectId()
    patient2_id = ObjectId()
    hr_id = ObjectId()
    trainee_id = ObjectId()

    users = [
        {"_id": admin_id, "full_name": "Admin SmartCare", "email": "admin@smartcare.com", "phone": "+91-9000000001", "password": hash_password("admin123"), "role": "admin", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": doctor1_id, "full_name": "Dr. Sarah Johnson", "email": "sarah@smartcare.com", "phone": "+91-9000000002", "password": hash_password("doctor123"), "role": "doctor", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": doctor2_id, "full_name": "Dr. Michael Chen", "email": "michael@smartcare.com", "phone": "+91-9000000003", "password": hash_password("doctor123"), "role": "doctor", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": doctor3_id, "full_name": "Dr. Priya Sharma", "email": "priya@smartcare.com", "phone": "+91-9000000004", "password": hash_password("doctor123"), "role": "doctor", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": patient1_id, "full_name": "John Anderson", "email": "john@gmail.com", "phone": "+91-9876543210", "password": hash_password("patient123"), "role": "patient", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": patient2_id, "full_name": "Emily Davis", "email": "emily@gmail.com", "phone": "+91-9876543211", "password": hash_password("patient123"), "role": "patient", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": hr_id, "full_name": "Anita HR Manager", "email": "hr@smartcare.com", "phone": "+91-9000000005", "password": hash_password("hr123"), "role": "hr", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"_id": trainee_id, "full_name": "Rahul Trainee", "email": "rahul@smartcare.com", "phone": "+91-9000000006", "password": hash_password("trainee123"), "role": "trainee", "profile_image": "", "is_verified": True, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.users.insert_many(users)
    print(f"   ✅ {len(users)} users created")

    # ===== 2. HOSPITAL FLOORS =====
    floor_ids = {i: ObjectId() for i in range(6)}
    floors = [
        {"_id": floor_ids[0], "floor_name": "Ground Floor", "floor_number": 0},
        {"_id": floor_ids[1], "floor_name": "1st Floor", "floor_number": 1},
        {"_id": floor_ids[2], "floor_name": "2nd Floor", "floor_number": 2},
        {"_id": floor_ids[3], "floor_name": "3rd Floor", "floor_number": 3},
        {"_id": floor_ids[4], "floor_name": "4th Floor", "floor_number": 4},
        {"_id": floor_ids[5], "floor_name": "5th Floor", "floor_number": 5},
    ]
    await db.hospital_floors.insert_many(floors)
    print(f"   ✅ {len(floors)} floors created")

    # ===== 3. DEPARTMENTS =====
    dept_ids = {}
    departments = [
        {"name": "Cardiology", "desc": "Heart and cardiovascular system", "floor": 3},
        {"name": "Neurology", "desc": "Brain and nervous system", "floor": 4},
        {"name": "Orthopedics", "desc": "Bones, joints and muscles", "floor": 2},
        {"name": "Pediatrics", "desc": "Children's health and medicine", "floor": 1},
        {"name": "Dermatology", "desc": "Skin, hair and nails", "floor": 3},
        {"name": "Emergency", "desc": "Emergency medical care", "floor": 0},
        {"name": "Radiology", "desc": "Medical imaging and diagnostics", "floor": 0},
        {"name": "General Medicine", "desc": "Primary care and internal medicine", "floor": 1},
    ]
    dept_docs = []
    for d in departments:
        did = ObjectId()
        dept_ids[d["name"]] = did
        dept_docs.append({
            "_id": did,
            "department_name": d["name"],
            "description": d["desc"],
            "floor_id": floor_ids.get(d["floor"]),
            "head_doctor": None,
        })
    await db.departments.insert_many(dept_docs)
    print(f"   ✅ {len(dept_docs)} departments created")

    # ===== 4. DOCTORS =====
    doc1_id = ObjectId()
    doc2_id = ObjectId()
    doc3_id = ObjectId()
    doctors = [
        {"_id": doc1_id, "user_id": doctor1_id, "doctor_id": "DOC001", "department_id": dept_ids["Cardiology"], "specialization": "Cardiologist", "experience": 12, "qualification": "MD, DM Cardiology", "consultation_fee": 800, "availability": [{"day": "Mon", "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]}, {"day": "Wed", "slots": ["09:00", "10:00", "11:00"]}, {"day": "Fri", "slots": ["14:00", "15:00", "16:00"]}], "rating": 4.8, "created_at": datetime.now(timezone.utc).isoformat()},
        {"_id": doc2_id, "user_id": doctor2_id, "doctor_id": "DOC002", "department_id": dept_ids["Neurology"], "specialization": "Neurologist", "experience": 8, "qualification": "MD, DM Neurology", "consultation_fee": 700, "availability": [{"day": "Tue", "slots": ["09:00", "10:00", "11:00"]}, {"day": "Thu", "slots": ["14:00", "15:00", "16:00"]}], "rating": 4.6, "created_at": datetime.now(timezone.utc).isoformat()},
        {"_id": doc3_id, "user_id": doctor3_id, "doctor_id": "DOC003", "department_id": dept_ids["Dermatology"], "specialization": "Dermatologist", "experience": 6, "qualification": "MD Dermatology", "consultation_fee": 600, "availability": [{"day": "Mon", "slots": ["10:00", "11:00"]}, {"day": "Thu", "slots": ["09:00", "10:00", "11:00", "14:00"]}], "rating": 4.9, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.doctors.insert_many(doctors)
    print(f"   ✅ {len(doctors)} doctors created")

    # ===== 5. PATIENTS =====
    pat1_id = ObjectId()
    pat2_id = ObjectId()
    ins1_id = ObjectId()
    ins2_id = ObjectId()

    insurance = [
        {"_id": ins1_id, "provider": "Star Health Insurance", "policy_number": "SHI-2024-889744", "coverage": "Comprehensive", "expiry_date": "2026-12-31"},
        {"_id": ins2_id, "provider": "ICICI Lombard", "policy_number": "ICL-2024-445521", "coverage": "Basic", "expiry_date": "2025-06-30"},
    ]
    await db.insurance.insert_many(insurance)

    patients = [
        {"_id": pat1_id, "user_id": patient1_id, "patient_id": "PAT001", "dob": "1990-03-15", "gender": "Male", "blood_group": "O+", "height": "5'10\"", "weight": "78 kg", "allergies": ["Penicillin", "Peanuts"], "chronic_diseases": ["Pre-diabetes", "Hypertension Stage 1"], "insurance_id": ins1_id, "emergency_contact": None, "created_at": datetime.now(timezone.utc).isoformat()},
        {"_id": pat2_id, "user_id": patient2_id, "patient_id": "PAT002", "dob": "1985-07-22", "gender": "Female", "blood_group": "A+", "height": "5'5\"", "weight": "62 kg", "allergies": [], "chronic_diseases": [], "insurance_id": ins2_id, "emergency_contact": None, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.patients.insert_many(patients)
    print(f"   ✅ {len(patients)} patients created")

    # ===== 6. EMERGENCY CONTACTS =====
    ec1_id = ObjectId()
    ec2_id = ObjectId()
    contacts = [
        {"_id": ec1_id, "patient_id": pat1_id, "contact_name": "Jane Anderson", "relationship": "Spouse", "phone": "+91-9876543200"},
        {"_id": ec2_id, "patient_id": pat1_id, "contact_name": "Dr. Robert Anderson", "relationship": "Father", "phone": "+91-9876543201"},
    ]
    await db.emergency_contacts.insert_many(contacts)
    await db.patients.update_one({"_id": pat1_id}, {"$set": {"emergency_contact": ec1_id}})
    print(f"   ✅ {len(contacts)} emergency contacts created")

    # ===== 7. APPOINTMENTS =====
    appointments = [
        {"appointment_id": "APT10001", "patient_id": pat1_id, "doctor_id": doc1_id, "department_id": dept_ids["Cardiology"], "appointment_date": "2026-07-29", "time_slot": "09:00", "status": "Booked", "reason": "Regular checkup", "created_at": datetime.now(timezone.utc).isoformat()},
        {"appointment_id": "APT10002", "patient_id": pat1_id, "doctor_id": doc3_id, "department_id": dept_ids["Dermatology"], "appointment_date": "2026-07-30", "time_slot": "10:00", "status": "Booked", "reason": "Skin rash", "created_at": datetime.now(timezone.utc).isoformat()},
        {"appointment_id": "APT10003", "patient_id": pat2_id, "doctor_id": doc2_id, "department_id": dept_ids["Neurology"], "appointment_date": "2026-07-28", "time_slot": "14:00", "status": "Completed", "reason": "Headache consultation", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.appointments.insert_many(appointments)
    print(f"   ✅ {len(appointments)} appointments created")

    # ===== 8. VITALS =====
    vitals = [
        {"patient_id": pat1_id, "heart_rate": 72, "blood_pressure": "120/80", "temperature": 98.4, "oxygen": 98, "recorded_at": "2026-07-28T08:00:00Z"},
        {"patient_id": pat1_id, "heart_rate": 78, "blood_pressure": "125/82", "temperature": 98.6, "oxygen": 97, "recorded_at": "2026-07-27T08:00:00Z"},
        {"patient_id": pat2_id, "heart_rate": 68, "blood_pressure": "118/76", "temperature": 98.2, "oxygen": 99, "recorded_at": "2026-07-28T09:00:00Z"},
    ]
    await db.vitals.insert_many(vitals)
    print(f"   ✅ {len(vitals)} vitals records created")

    # ===== 9. MEDICINE REMINDERS =====
    reminders = [
        {"patient_id": pat1_id, "medicine_name": "Metformin 500mg", "dosage": "1 Tablet", "morning": True, "afternoon": False, "evening": False, "night": True, "start_date": "2026-07-01", "end_date": "2026-12-31", "instruction": "After meals", "status": "Active", "created_at": datetime.now(timezone.utc).isoformat()},
        {"patient_id": pat1_id, "medicine_name": "Amlodipine 5mg", "dosage": "1 Tablet", "morning": False, "afternoon": True, "evening": False, "night": False, "start_date": "2026-07-01", "end_date": "2026-12-31", "instruction": "After lunch", "status": "Active", "created_at": datetime.now(timezone.utc).isoformat()},
        {"patient_id": pat1_id, "medicine_name": "Vitamin D3 1000IU", "dosage": "1 Capsule", "morning": True, "afternoon": False, "evening": False, "night": False, "start_date": "2026-07-15", "end_date": None, "instruction": "With food", "status": "Active", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.medicine_reminders.insert_many(reminders)
    print(f"   ✅ {len(reminders)} medicine reminders created")

    # ===== 10. NOTIFICATIONS =====
    notifications = [
        {"user_id": patient1_id, "title": "Appointment Reminder", "message": "Your appointment with Dr. Sarah Johnson is tomorrow at 9:00 AM", "type": "appointment", "is_read": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"user_id": patient1_id, "title": "Medicine Reminder", "message": "Time to take Metformin 500mg", "type": "medicine", "is_read": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"user_id": patient1_id, "title": "Report Ready", "message": "Your blood test report is ready for review", "type": "report", "is_read": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.notifications.insert_many(notifications)
    print(f"   ✅ {len(notifications)} notifications created")

    # ===== 11. ROOMS =====
    rooms = []
    for i in range(1, 6):
        for j in range(1, 4):
            rooms.append({"room_number": f"{i}0{j}", "department_id": list(dept_ids.values())[min(i-1, len(dept_ids)-1)], "floor_id": floor_ids.get(i, floor_ids[1])})
    await db.rooms.insert_many(rooms)
    print(f"   ✅ {len(rooms)} rooms created")

    # ===== 12. NAVIGATION PATHS =====
    nav_paths = [
        {"from_location": "Main Entrance", "to_location": "Emergency", "path": ["Main Entrance", "Turn Left", "Walk 50m", "Emergency Bay"], "estimated_time": "1 min"},
        {"from_location": "Main Entrance", "to_location": "Cardiology", "path": ["Main Entrance", "Elevator to 3F", "Turn Right", "Room 301"], "estimated_time": "5 min"},
        {"from_location": "Main Entrance", "to_location": "Pharmacy", "path": ["Main Entrance", "Walk Straight", "Counter on Right"], "estimated_time": "2 min"},
    ]
    await db.hospital_navigation.insert_many(nav_paths)
    print(f"   ✅ {len(nav_paths)} navigation paths created")

    # ===== 13. EMPLOYEES =====
    employees = [
        {"employee_name": "Nurse Rekha", "department": "Cardiology", "designation": "Head Nurse", "salary": 45000, "joining_date": "2020-01-15"},
        {"employee_name": "Technician Amit", "department": "Radiology", "designation": "Lab Technician", "salary": 35000, "joining_date": "2021-06-10"},
        {"employee_name": "Receptionist Priya", "department": "Front Desk", "designation": "Receptionist", "salary": 25000, "joining_date": "2022-03-01"},
    ]
    await db.employees.insert_many(employees)
    print(f"   ✅ {len(employees)} employees created")

    # ===== 14. TRAINING MODULES =====
    modules = [
        {"title": "Hospital Safety Protocol", "description": "Learn essential safety procedures", "duration": "2 hours", "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Patient Communication", "description": "Effective communication with patients", "duration": "1.5 hours", "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Emergency Response", "description": "Emergency handling procedures", "duration": "3 hours", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.training_modules.insert_many(modules)
    print(f"   ✅ {len(modules)} training modules created")

    # ===== 15. SETTINGS =====
    await db.settings.insert_one({
        "hospital_name": "SmartCare Connect Hospital",
        "logo": "",
        "theme": "dark",
        "timezone": "Asia/Kolkata",
        "email_notifications": True,
        "sms_notifications": False,
    })
    print("   ✅ Hospital settings created")

    # ===== 16. FEEDBACK =====
    feedback = [
        {"patient_id": pat1_id, "doctor_id": doc1_id, "rating": 5, "comment": "Excellent doctor! Very thorough examination.", "created_at": datetime.now(timezone.utc).isoformat()},
        {"patient_id": pat2_id, "doctor_id": doc1_id, "rating": 4, "comment": "Good experience, short wait time.", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.feedback.insert_many(feedback)
    print(f"   ✅ {len(feedback)} feedback records created")

    # Create indexes
    from app.database.mongodb import create_indexes as _ci
    # Re-initialize db reference for index creation
    import app.database.mongodb as mdb
    mdb.db = db
    await _ci()

    print("\n🎉 Database seeding complete!")
    print("\n📋 Login Credentials:")
    print("   Admin:   admin@smartcare.com / admin123")
    print("   Doctor:  sarah@smartcare.com / doctor123")
    print("   Patient: john@gmail.com / patient123")
    print("   HR:      hr@smartcare.com / hr123")
    print("   Trainee: rahul@smartcare.com / trainee123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
