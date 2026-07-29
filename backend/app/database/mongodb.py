from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from loguru import logger

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    global client, db
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Create indexes
    await create_indexes()
    logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")


async def create_indexes():
    """Create performance indexes as specified in the database design."""
    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("phone")
    await db.users.create_index("role")

    # Patients
    await db.patients.create_index("user_id", unique=True)
    await db.patients.create_index("patient_id", unique=True)

    # Doctors
    await db.doctors.create_index("user_id", unique=True)
    await db.doctors.create_index("doctor_id", unique=True)
    await db.doctors.create_index("department_id")

    # Appointments
    await db.appointments.create_index("appointment_id", unique=True)
    await db.appointments.create_index([("patient_id", 1), ("appointment_date", -1)])
    await db.appointments.create_index([("doctor_id", 1), ("appointment_date", -1)])
    await db.appointments.create_index("status")

    # Medical Reports
    await db.medical_reports.create_index([("patient_id", 1), ("report_date", -1)])
    await db.medical_reports.create_index("status")

    # AI Reports
    await db.ai_reports.create_index("medical_report_id")

    # Notifications
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await db.notifications.create_index("is_read")

    # Chat
    await db.chat_sessions.create_index("patient_id")
    await db.chat_messages.create_index("session_id")

    # Medicine Reminders
    await db.medicine_reminders.create_index("patient_id")

    # Vitals
    await db.vitals.create_index([("patient_id", 1), ("recorded_at", -1)])

    # Audit Logs
    await db.audit_logs.create_index([("user_id", 1), ("created_at", -1)])

    # Attendance
    await db.attendance.create_index([("employee_id", 1), ("date", -1)])

    logger.info("Database indexes created successfully.")


def get_database() -> AsyncIOMotorDatabase:
    return db
