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
  send: (chat_id, message, imageData = null, generateImagePrompt = null) =>
    api.post('/ai/chat', { session_id: chat_id, message }).then((response) => ({
      ...response,
      data: { ...response.data, content: response.data.message },
    })),
  listSessions: () => api.get('/ai/chat/sessions'),
  getSession: (id) => api.get(`/ai/chat/sessions/${id}/messages`),
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
    api.get(`/doctors/?page=${page}&limit=20${specialization ? `&specialization=${encodeURIComponent(specialization)}` : ''}`).then((response) => ({
      ...response,
      data: response.data.doctors || [],
    })),
  getById: (doctorId) => api.get(`/doctors/${doctorId}`),
  getAvailability: (doctorId) => api.get(`/doctors/${doctorId}/availability`),
};

export default api;
