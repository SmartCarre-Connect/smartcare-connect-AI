export const ROLE_LABELS = {
  patient: 'Patient',
  doctor: 'Doctor',
  trainee: 'Trainee',
  hr: 'HR',
  admin: 'Admin',
};

export const ROLE_DASHBOARDS = {
  patient: '/patient',
  doctor: '/doctor',
  trainee: '/trainee',
  hr: '/hr',
  admin: '/admin',
};

export const ROLE_PERMISSIONS = {
  patient: ['dashboard', 'appointments', 'book_appointment', 'doctor_availability', 'weekly_schedule', 'medicine_availability', 'digital_prescription', 'medical_reports', 'hospital_navigation', 'ai_assistant', 'emergency', 'notifications', 'profile', 'settings'],
  doctor: ['dashboard', 'today_appointments', 'patient_list', 'patient_records', 'digital_prescription', 'lab_requests', 'ai_assistant', 'notifications', 'profile', 'schedule', 'availability_status'],
  trainee: ['dashboard', 'today_duty', 'current_department', 'supervisor', 'ward', 'today_patients', 'attendance_status', 'check_in', 'check_out', 'working_hours', 'schedule', 'notifications', 'announcements', 'leave_request', 'attendance_history', 'performance', 'profile', 'settings'],
  hr: ['dashboard', 'manage_trainees', 'manage_schedules', 'attendance_reports', 'approve_leave', 'create_schedule', 'weekly_schedule', 'monthly_schedule', 'department_assignment', 'notifications', 'send_announcement', 'staff_list', 'search_staff', 'reports', 'profile'],
  admin: ['dashboard', 'manage_users', 'manage_doctors', 'manage_patients', 'manage_hr', 'manage_trainees', 'manage_departments', 'manage_pharmacy', 'manage_laboratory', 'hospital_analytics', 'attendance_analytics', 'revenue', 'notifications', 'system_logs', 'permissions', 'database_monitoring', 'application_settings'],
};

export const getDashboardPath = (role) => ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS.patient;

export const getRoleLabel = (role) => ROLE_LABELS[role] || 'Patient';

export const hasPermission = (role, permission) => ROLE_PERMISSIONS[role]?.includes(permission) || false;
