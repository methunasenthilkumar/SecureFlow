import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('upishield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('upishield_token');
      localStorage.removeItem('upishield_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const forgotPasswordApi = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordApi = (data) => api.post('/auth/reset-password', data);
export const getMeApi = () => api.get('/auth/me');
export const updateProfileApi = (data) => api.put('/auth/profile', data);

// Transaction Endpoints
export const submitTransactionApi = (data) => api.post('/transactions', data);
export const getMyTransactionsApi = () => api.get('/transactions/my');
export const getTransactionDetailApi = (id) => api.get(`/transactions/${id}`);

// Analyst Endpoints
export const getPendingReviewsApi = () => api.get('/analyst/pending');
export const getReviewHistoryApi = () => api.get('/analyst/history');
export const submitReviewApi = (id, data) => api.post(`/analyst/review/${id}`, data);
export const getAnalystStatsApi = () => api.get('/analyst/stats');

// Admin Endpoints
export const getAdminDashboardApi = () => api.get('/admin/dashboard');
export const getUsersApi = (params) => api.get('/admin/users', { params });
export const updateUserStatusApi = (id, status) => api.put(`/admin/users/${id}/status`, { status });
export const updateUserRoleApi = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const getAuditLogsApi = () => api.get('/admin/audit-logs');
export const getThresholdConfigApi = () => api.get('/admin/threshold');
export const updateThresholdConfigApi = (data) => api.put('/admin/threshold', data);
export const getReportsApi = () => api.get('/admin/reports');

// Notifications Endpoints
export const getNotificationsApi = () => api.get('/notifications');
export const markNotificationReadApi = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => api.put('/notifications/read-all');

export default api;
