export const ROLES = ['patient', 'doctor', 'trainee', 'hr', 'admin'];

export const roleHome = (role) => {
  const normalizedRole = ROLES.includes(role) ? role : 'patient';
  return normalizedRole === 'admin' ? '/admin' : `/${normalizedRole}`;
};

export const roleMenus = {
  patient: [
    ['Care', [['Dashboard', '', 'dashboard'], ['My Appointments', 'appointments', 'appointments'], ['Find Doctor', 'doctors', 'doctors'], ['Medical Reports', 'reports', 'reports'], ['Digital Prescription', 'prescriptions', 'prescriptions'], ['Medicine Reminders', 'reminders', 'reminders'], ['Hospital Navigation', 'hospital-map', 'map'], ['AI Assistant', 'chat', 'chat'], ['Emergency', 'emergency', 'emergency']]],
    ['Account', [['Notifications', 'notifications', 'notifications'], ['Profile & Settings', 'profile', 'profile']]],
  ],
  doctor: [
    ['Clinical', [['Dashboard', '', 'dashboard'], ["Today's Appointments", 'appointments', 'appointments'], ['Patient Directory', 'doctors', 'doctors'], ['Medical Reports', 'reports', 'reports'], ['Digital Prescription', 'prescriptions', 'prescriptions'], ['AI Assistant', 'chat', 'chat']]],
    ['Account', [['Notifications', 'notifications', 'notifications'], ['Profile', 'profile', 'profile']]],
  ],
  trainee: [
    ['Duty', [['Dashboard', '', 'dashboard'], ['GPS Attendance', 'attendance', 'attendance'], ['Duty Schedule', 'appointments', 'appointments'], ['Hospital Navigation', 'hospital-map', 'map']]],
    ['Account', [['Notifications', 'notifications', 'notifications'], ['Profile & Settings', 'profile', 'profile']]],
  ],
  hr: [
    ['Operations', [['Dashboard', '', 'dashboard'], ['Manage Trainees', 'attendance', 'attendance'], ['Schedules', 'appointments', 'appointments'], ['Attendance Reports', 'vitals', 'vitals'], ['Staff Directory', 'doctors', 'doctors']]],
    ['Account', [['Notifications', 'notifications', 'notifications'], ['Profile', 'profile', 'profile']]],
  ],
  admin: [
    ['Administration', [['Dashboard', '', 'dashboard'], ['Hospital Analytics', 'admin', 'admin'], ['Manage Users', 'doctors', 'doctors'], ['Attendance Analytics', 'attendance', 'attendance'], ['Notifications', 'notifications', 'notifications']]],
    ['Account', [['Profile & Settings', 'profile', 'profile']]],
  ],
};

export const allowedPaths = (role) => new Set((roleMenus[role] || []).flatMap(([, items]) => items.map(([, path]) => path)));
