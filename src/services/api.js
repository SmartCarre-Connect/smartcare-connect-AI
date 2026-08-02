import axios from 'axios';

// In local dev, Vite proxies /api → localhost:8000 (see vite.config.js)
// In production (Vercel/Netlify), VITE_API_URL points to the Render backend
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://smartcare-connect-api.onrender.com/api/v1');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('SmartCare-Connect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// The API uses a consistent { success, data, message } envelope.  Expose the
// payload to the UI so every page receives the same shape in development and
// production.
api.interceptors.response.use((response) => ({
  ...response,
  data: response.data?.data ?? response.data,
}));

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  sendOtp: (payload) => api.post('/auth/send-otp', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/users/me', profileData),
};

export const reportsApi = {
  upload: (formData) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: () => api.get('/reports/my').then((response) => ({
    ...response,
    data: response.data.reports || [],
  })),
  getDownloadUrl: (id) => `/api/reports/${id}/download-pdf`,
  analyzeReport: (id) => api.post(`/ai/analyze-report/${id}`),
};

export const prescriptionsApi = {
  upload: (formData) => api.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  confirm: (id, data) => api.post(`/prescriptions/${id}/confirm`, data),
  list: () => api.get('/prescriptions/'),
};

export const remindersApi = {
  list: () => api.get('/medicine-reminders/my'),
  create: (data) => api.post('/medicine-reminders/', data),
  updateStatus: (id, status) => api.put(`/medicine-reminders/${id}`, { status }),
};

export const chatApi = {
  // send supports optional options: { reports: [ids], prescriptions: [ids], metadata: {...} }
  send: (chat_id, message, imageData = null, generateImagePrompt = null, options = {}) =>
    api.post('/ai/chat', { session_id: chat_id, message, ...options }).then((response) => ({
      ...response,
      data: { ...response.data, content: response.data.message },
    })),

  startSession: () => api.post('/ai/chat/start'),
  listSessions: (search = '') => api.get('/ai/chat/sessions', { params: search ? { search } : undefined }),
  getSession: (id) => api.get(`/ai/chat/sessions/${id}/messages`),
  renameSession: (id, title) => api.put(`/ai/chat/sessions/${id}/rename`, { session_title: title }),
  deleteSession: (id) => api.delete(`/ai/chat/sessions/${id}`),
};

export const medicalImagesApi = {
  upload: (formData) => api.post('/medical-images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: () => api.get('/medical-images/'),
};

export const healthSummaryApi = {
  get: () => api.get('/health-summary/'),
};

export const doctorCopilotApi = {
  generateSheet: (symptoms) => api.post('/doctor-copilot/generate-sheet', symptoms, {
    responseType: 'blob'
  }),
};

export const timelineApi = {
  get: () => api.get('/timeline/'),
};

export const wellnessApi = {
  get: () => api.get('/wellness/'),
  update: (data) => api.put('/wellness/update', data),
};

export const emergencyApi = {
  getCard: () => api.get('/emergency/card'),
};

export const helpCenterApi = {
  ask: (question, language = 'auto') => api.post('/ai/help-center', {
    message: question,
    language,
  }),
};

export const adminApi = {
  getStats: () => api.get('/dashboard/stats'),
  listDoctors: () => api.get('/doctors/').then((response) => ({
    ...response,
    data: response.data?.doctors ?? response.data?.data?.doctors ?? [],
  })),
  createDoctor: (payload) => api.post('/doctors/', payload),
  updateDoctor: (id, payload) => api.put(`/doctors/${id}`, payload),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  updateDoctorAvailability: (id, availability) => api.put(`/doctors/${id}/availability`, null, { params: { availability } }),

  listDepartments: () => api.get('/departments').then((response) => ({
    ...response,
    data: response.data?.departments ?? response.data?.data?.departments ?? response.data?.data ?? response.data ?? [],
  })),
  createDepartment: (payload) => api.post('/departments', payload),
  updateDepartment: (id, payload) => api.put(`/departments/${id}`, payload),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  listMedicines: () => api.get('/medicine').then((response) => ({
    ...response,
    data: response.data?.medicine ?? response.data?.data?.medicine ?? response.data?.data ?? response.data ?? [],
  })),
  createMedicine: (payload) => api.post('/medicine', payload),
  updateMedicine: (id, payload) => api.put(`/medicine/${id}`, payload),
  deleteMedicine: (id) => api.delete(`/medicine/${id}`),

  listLocations: () => api.get('/hospital/locations').then((response) => ({
    ...response,
    data: response.data?.locations ?? response.data?.data?.locations ?? response.data?.data ?? response.data ?? [],
  })),
  createLocation: (payload) => api.post('/hospital/locations', payload),
  updateLocation: (id, payload) => api.put(`/hospital/locations/${id}`, payload),
  deleteLocation: (id) => api.delete(`/hospital/locations/${id}`),

  listAnnouncements: () => api.get('/announcements').then((response) => ({
    ...response,
    data: response.data?.announcements ?? response.data?.data?.announcements ?? response.data?.data ?? response.data ?? [],
  })),
  createAnnouncement: (payload) => api.post('/announcements', payload),
  updateAnnouncement: (id, payload) => api.put(`/announcements/${id}`, payload),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

export const mediaApi = {
  create: (data) => api.post('/media', data),
  list: (role = null) => api.get('/media', { params: role ? { role } : undefined }),
  publish: (data) => api.post('/media/publish', data),
  migrate: (payload) => api.post('/media/migrate', payload),
};

// ===== NEW APIs =====

export const appointmentsApi = {
  list: (status = null) => api.get(`/appointments/my${status ? `?status=${status}` : ''}`),
  create: (data) => api.post('/appointments/', data),
  cancel: (appointmentId) => api.delete(`/appointments/${appointmentId}`),
  getById: (appointmentId) => api.get(`/appointments/${appointmentId}`),
  update: (appointmentId, data) => api.put(`/appointments/${appointmentId}`, data),
};

export const notificationsApi = {
  list: (page = 1) => api.get(`/notifications/?page=${page}`),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  unreadCount: () => api.get('/notifications/?limit=1'),
};

export const vitalsApi = {
  log: (data) => api.post('/vitals/', data),
  getHistory: (page = 1) => api.get(`/vitals/my?page=${page}&limit=30`),
  getLatest: () => api.get('/vitals/latest'),
};

export const doctorsApi = {
  list: (specialization = null, page = 1) =>
    api.get(`/doctors/?page=${page}&limit=20${specialization ? `&specialization=${encodeURIComponent(specialization)}` : ''}`).then((response) => {
      const payload = response.data || {};
      const docs = Array.isArray(payload.doctors) ? payload.doctors : [];
      // Normalize shape expected by UI components
      const normalized = docs.map((d) => ({
        id: d.id || d._id || d.doctor_id,
        _id: d.id || d._id || d.doctor_id,
        doctor_id: d.doctor_id,
        full_name: d.full_name || d.fullName || d.name || '',
        name: d.full_name || d.name || d.full_name || '',
        specialization: d.specialization || '',
        qualification: d.qualification || '',
        experience: d.experience || 0,
        availability: d.availability || [],
        is_available: d.is_available !== undefined ? d.is_available : Boolean(d.availability && d.availability.length),
        profile_image: d.profile_image || d.profile_image_url || '',
        rating: d.rating || d.avg_rating || 0,
        department: d.department_name || d.department || '',
        ...d,
      }));
      return { ...response, data: normalized };
    }),
  getById: (doctorId) => api.get(`/doctors/${doctorId}`).then((response) => {
    const d = response.data || {};
    const normalized = {
      id: d.id || d._id || d.doctor_id,
      _id: d.id || d._id || d.doctor_id,
      doctor_id: d.doctor_id,
      full_name: d.full_name || d.fullName || d.name || '',
      name: d.full_name || d.name || d.full_name || '',
      specialization: d.specialization || '',
      qualification: d.qualification || '',
      experience: d.experience || 0,
      availability: d.availability || [],
      is_available: d.is_available !== undefined ? d.is_available : Boolean(d.availability && d.availability.length),
      profile_image: d.profile_image || d.profile_image_url || '',
      rating: d.rating || d.avg_rating || 0,
      department: d.department_name || d.department || '',
      ...d,
    };
    return { ...response, data: normalized };
  }),
  getAvailability: (doctorId, date = null) => api.get(`/doctors/${doctorId}/availability${date ? `?date=${encodeURIComponent(date)}` : ''}`).then((response) => ({ ...response, data: response.data?.slots || [] })),
};

export default api;
