from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"
    HR = "hr"
    RECEPTIONIST = "receptionist"
    TRAINEE = "trainee"
    SUPER_ADMIN = "super_admin"


# ===== Auth Schemas =====

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.PATIENT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None


# ===== Patient Schemas =====

class PatientCreate(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: List[str] = []
    chronic_diseases: List[str] = []


class PatientUpdate(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_diseases: Optional[List[str]] = None


# ===== Doctor Schemas =====

class DoctorCreate(BaseModel):
    specialization: str
    experience: int
    qualification: str
    consultation_fee: float = 500
    department_id: Optional[str] = None


class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    experience: Optional[int] = None
    qualification: Optional[str] = None
    consultation_fee: Optional[float] = None
    department_id: Optional[str] = None
    availability: Optional[List[dict]] = None


# ===== Appointment Schemas =====

class AppointmentCreate(BaseModel):
    doctor_id: str
    department_id: Optional[str] = None
    appointment_date: str
    time_slot: str
    reason: Optional[str] = None


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[str] = None
    time_slot: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None


# ===== Medical Report Schemas =====

class MedicalReportCreate(BaseModel):
    report_type: str = "General"
    doctor_id: Optional[str] = None


# ===== AI Report Schemas =====

class AIReportResponse(BaseModel):
    summary: str
    detected_diseases: List[str]
    risk_level: str
    recommendations: List[str]
    confidence_score: float
    prescription_explanation: Optional[str] = None
    lifestyle_suggestions: Optional[List[str]] = None
    doctor_recommendation: Optional[str] = None


# ===== Chat Schemas =====

class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatSessionCreate(BaseModel):
    session_title: Optional[str] = "New Chat"


# ===== Medicine Reminder Schemas =====

class MedicineReminderCreate(BaseModel):
    medicine_name: str
    dosage: str
    morning: bool = False
    afternoon: bool = False
    evening: bool = False
    night: bool = False
    start_date: str
    end_date: Optional[str] = None
    instruction: Optional[str] = None


class MedicineReminderUpdate(BaseModel):
    morning: Optional[bool] = None
    afternoon: Optional[bool] = None
    evening: Optional[bool] = None
    night: Optional[bool] = None
    status: Optional[str] = None


# ===== Notification Schemas =====

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "general"


# ===== Department Schemas =====

class DepartmentCreate(BaseModel):
    department_name: str
    description: Optional[str] = None
    floor_id: Optional[str] = None
    head_doctor: Optional[str] = None


# ===== Emergency Schemas =====

class EmergencyContactCreate(BaseModel):
    contact_name: str
    relationship: str
    phone: str


# ===== Vitals Schemas =====

class VitalsCreate(BaseModel):
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    oxygen: Optional[int] = None


# ===== HR Schemas =====

class EmployeeCreate(BaseModel):
    employee_name: str
    department: str
    designation: str
    salary: float = 0
    joining_date: Optional[str] = None


class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: Optional[str] = None


class AttendanceCreate(BaseModel):
    employee_id: str
    date: str
    check_in: str
    check_out: Optional[str] = None
    status: str = "Present"


# ===== Feedback Schema =====

class FeedbackCreate(BaseModel):
    doctor_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

# ===== Trainee Management Schemas =====

class TraineeCreate(BaseModel):
    user_id: str
    department_id: str
    supervisor_id: str
    designation: str
    assigned_ward: Optional[str] = None
    duty_timing: str
    shift: str

# ===== HR Digital Duty Scheduler Schemas =====

class HRScheduleCreate(BaseModel):
    trainee_id: str
    department_id: str
    ward: str
    supervisor_id: str
    shift_name: str
    start_time: str
    end_time: str
    date: str
    status: str = "scheduled"  # scheduled, completed, absent, leave

# ===== GPS Attendance Schemas =====

class GPSLogCreate(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    location_accuracy: float
    device_info: str
    ip_address: str
    action: str  # check_in, check_out
    status: str  # inside_radius, outside_radius
    timestamp: Optional[str] = None

class GeofenceSettings(BaseModel):
    hospital_lat: float
    hospital_lng: float
    radius_meters: float

# ===== Doctor Weekly Schedule Schemas =====

class DoctorScheduleCreate(BaseModel):
    doctor_id: str
    day_of_week: str  # Monday, Tuesday, etc.
    start_time: str
    end_time: str
    is_available: bool = True
    max_patients: int = 50

# ===== Medicine Inventory Schemas =====

class MedicineCreate(BaseModel):
    name: str
    category: str
    stock_quantity: int
    shelf_number: str
    expiry_date: str
    price: float
    alternative_medicine_id: Optional[str] = None
    is_available: bool = True

# ===== Digital Prescription Schemas =====

class PrescriptionItem(BaseModel):
    medicine_id: str
    medicine_name: str
    dosage: str
    frequency: str
    duration_days: int
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    items: List[PrescriptionItem]
    notes: Optional[str] = None
    created_at: Optional[str] = None

# ===== Hospital Navigation Schemas =====

class NavigationNodeCreate(BaseModel):
    node_id: str
    name: str
    node_type: str  # department, room, lift, stairs, washroom, entrance, exit, emergency
    floor_level: int
    x_coordinate: float
    y_coordinate: float
    description: Optional[str] = None
    is_accessible: bool = True

class NavigationEdgeCreate(BaseModel):
    from_node_id: str
    to_node_id: str
    distance_meters: float
    is_accessible_route: bool = True
    instructions: str