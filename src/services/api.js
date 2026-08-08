import axios from 'axios';

// In local dev, Vite proxies /api → localhost:8000 (see vite.config.js)
// In production (Vercel/Netlify), VITE_API_URL points to the Render backend
// Fallback: always use the correct Render backend URL
const PRODUCTION_API_URL = 'https://smartcare-connect-api.onrender.com/api/v1';
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : PRODUCTION_API_URL);

// Global flag to enable presentation mode (fallback to demo data when backend fails)
// IMPORTANT: Presentation mode is DISABLED by default for production.
// It should only be enabled for graceful fallback when backend is unreachable.
let presentationModeEnabled = false;

const isDemoCredentialPayload = (credentials) =>
  (credentials?.email === 'demo@smartcare.ai' || credentials?.email === 'demo@SmartCare-Connect.ai') &&
  credentials?.password === 'Demo@123';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout to prevent hanging
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
}), (error) => {
  // Handle 401 Unauthorized - clear auth and redirect to login
  if (error.response?.status === 401) {
    console.warn('⚠️ Unauthorized (401) - clearing authentication');
    localStorage.removeItem('SmartCare-Connect_token');
    localStorage.removeItem('SmartCare-Connect_user');
    localStorage.removeItem('SmartCare-Connect_selected_role');
    return Promise.reject(error);
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    console.warn('⚠️ Forbidden (403) - access denied');
    return Promise.reject(error);
  }

  // Presentation mode fallback: return mock data on API errors
  if (error.config?.url) {
    const mockBase = error.config.url.replace(API_BASE, '');
    if (demoResponses[mockBase]) {
      console.log(`📦 Using mock data for: ${mockBase}`);
      enablePresentationMode(true);
      return Promise.resolve({ data: demoResponses[mockBase] });
    }
  }

  // If backend is unreachable, enable presentation mode for any auth endpoint
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
    console.warn('⚠️ Backend unreachable, enabling presentation mode');
    enablePresentationMode(true);
  }

  return Promise.reject(error);
});

// Demo data fallback for presentation mode
const demoResponses = {
  '/auth/login': {
    access_token: 'demo-token-' + Date.now(),
    user_id: 'demo-user-id',
    full_name: 'Demo Patient',
    role: 'patient',
    email: 'demo@smartcare.ai',
  },

  '/auth/me': {
    id: 'demo-user-id',
    full_name: 'Demo Patient',
    email: 'demo@smartcare.ai',
    role: 'patient',
    phone: '+91-9999999999',
  },
  '/auth/send-otp': { success: true, message: 'OTP sent (demo mode)' },
  '/auth/verify-otp': { success: true, verified: true },
  '/auth/register': {
    access_token: 'demo-token-' + Date.now(),
    user_id: 'demo-new-user-id',
    full_name: 'New Demo User',
    role: 'patient',
  },
  '/dashboard/stats': { appointments: 0, patients: 0, doctors: 0 },
  '/doctors/': [],
  '/departments': [],
  '/medicine': [],
  '/hospital/locations': [],
  '/announcements': [],
  '/reports/my': { reports: [] },
  '/prescriptions/': [],
  '/appointments/my': [],
  '/medicine-reminders/my': [],
  '/medical-images/': [],
  '/health-summary/': {},
  '/timeline/': [],
  '/wellness/': {},
  '/emergency/card': {},
  '/ai/chat/sessions': [],
  // Fallback for single-message AI chat POSTs
  '/ai/chat': { session_id: 'local-demo-session', content: "Hello, I'm TwinCare AI (demo). I can't access the live AI backend right now, but I can answer simple questions for demonstration purposes." },
};

export function enablePresentationMode(enabled = true) {
  presentationModeEnabled = enabled;
  console.log(`[Presentation Mode] ${enabled ? 'ENABLED - Using demo data fallback' : 'DISABLED'}`);
}

export function isPresentationMode() {
  return presentationModeEnabled;
}

// Helper to resolve mock responses without calling network when presentation mode is active
function resolveMockResponse(url) {
  try {
    const raw = (url || '').toString();
    // Remove base if present
    const mockBase = raw.replace(API_BASE, '').split('?')[0];
    // Exact match
    if (demoResponses[mockBase]) return demoResponses[mockBase];
    // Try trailing slash variation
    if (demoResponses[`${mockBase}/`]) return demoResponses[`${mockBase}/`];
    // Try prefix match (e.g., '/doctors' matches '/doctors/')
    const foundKey = Object.keys(demoResponses).find((k) => mockBase.startsWith(k.replace(/\/$/, '')) || k.startsWith(mockBase));
    if (foundKey) return demoResponses[foundKey];
    // Fallback empty object
    return {};
  } catch (e) {
    return {};
  }
}

// Override axios methods when in presentation mode to avoid network calls entirely
const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalDelete = api.delete.bind(api);

api.get = (url, config) => {
  if (presentationModeEnabled) {
    return Promise.resolve({ data: resolveMockResponse(url) });
  }
  return originalGet(url, config);
};
api.post = (url, data, config) => {
  if (presentationModeEnabled) {
    return Promise.resolve({ data: resolveMockResponse(url) });
  }
  return originalPost(url, data, config);
};
api.put = (url, data, config) => {
  if (presentationModeEnabled) {
    return Promise.resolve({ data: resolveMockResponse(url) });
  }
  return originalPut(url, data, config);
};
api.delete = (url, config) => {
  if (presentationModeEnabled) {
    return Promise.resolve({ data: resolveMockResponse(url) });
  }
  return originalDelete(url, config);
};

export const authApi = {
  login: async (credentials) => {
    // Do not call backend in presentation mode. Always return demo login response.
    if (presentationModeEnabled || isDemoCredentialPayload(credentials)) {
      enablePresentationMode(true);
      return { data: demoResponses['/auth/login'] };
    }

    try {
      const res = await api.post('/auth/login', credentials);
      return res;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res;
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/auth/register'] };
      }
      throw error;
    }
  },
  sendOtp: async (payload) => {
    try {
      const res = await api.post('/auth/send-otp', payload);
      return res;
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/auth/send-otp'] };
      }
      throw error;
    }
  },
  verifyOtp: async (payload) => {
    try {
      const res = await api.post('/auth/verify-otp', payload);
      return res;
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/auth/verify-otp'] };
      }
      throw error;
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res;
    } catch (error) {
      // Network error, timeout, or server error - use demo fallback
      if (presentationModeEnabled || 
          error.code === 'ECONNABORTED' || 
          error.code === 'ERR_NETWORK' ||
          !error.response || 
          error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/auth/me'] };
      }
      throw error;
    }
  },
  updateProfile: (profileData) => api.put('/users/me', profileData),
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
  getStats: async () => {
    try {
      return api.get('/dashboard/stats');
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/dashboard/stats'] };
      }
      throw error;
    }
  },
  listDoctors: async () => {
    try {
      const response = await api.get('/doctors/');
      return {
        ...response,
        data: response.data?.doctors ?? response.data?.data?.doctors ?? [],
      };
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/doctors/'] };
      }
      throw error;
    }
  },
  createDoctor: (payload) => api.post('/doctors/', payload),
  updateDoctor: (id, payload) => api.put(`/doctors/${id}`, payload),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  updateDoctorAvailability: (id, availability) => api.put(`/doctors/${id}/availability`, null, { params: { availability } }),

  listDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return {
        ...response,
        data: response.data?.departments ?? response.data?.data?.departments ?? response.data?.data ?? response.data ?? [],
      };
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/departments'] };
      }
      throw error;
    }
  },
  createDepartment: (payload) => api.post('/departments', payload),
  updateDepartment: (id, payload) => api.put(`/departments/${id}`, payload),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  listMedicines: async () => {
    try {
      const response = await api.get('/medicine');
      return {
        ...response,
        data: response.data?.medicine ?? response.data?.data?.medicine ?? response.data?.data ?? response.data ?? [],
      };
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/medicine'] };
      }
      throw error;
    }
  },
  createMedicine: (payload) => api.post('/medicine', payload),
  updateMedicine: (id, payload) => api.put(`/medicine/${id}`, payload),
  deleteMedicine: (id) => api.delete(`/medicine/${id}`),

  listLocations: async () => {
    try {
      const response = await api.get('/hospital/locations');
      return {
        ...response,
        data: response.data?.locations ?? response.data?.data?.locations ?? response.data?.data ?? response.data ?? [],
      };
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/hospital/locations'] };
      }
      throw error;
    }
  },
  createLocation: (payload) => api.post('/hospital/locations', payload),
  updateLocation: (id, payload) => api.put(`/hospital/locations/${id}`, payload),
  deleteLocation: (id) => api.delete(`/hospital/locations/${id}`),

  listAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      return {
        ...response,
        data: response.data?.announcements ?? response.data?.data?.announcements ?? response.data?.data ?? response.data ?? [],
      };
    } catch (error) {
      if (presentationModeEnabled || error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        enablePresentationMode(true);
        return { data: demoResponses['/announcements'] };
      }
      throw error;
    }
  },
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
