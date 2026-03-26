import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── User ─────────────────────────────────────────────
export const registerUser   = (data) => api.post('/user/register', data);
export const loginUser      = (data) => api.post('/user/login', data);

// ── OTP / Mobile Auth ────────────────────────────────
export const sendOtp        = (phoneNumber) => api.post('/otp/send', { phoneNumber });
export const registerWithOtp = (data) => api.post('/otp/register', data);
export const loginWithOtp   = (data) => api.post('/otp/login', data);

// ── Wallet ────────────────────────────────────────────
export const addMoney = (data) => api.post('/wallet/addMoney', data);

// ── Transactions ──────────────────────────────────────
export const sendMoney = ({ senderId, receiverId, amount }) =>
  api.post('/transaction/send', null, { params: { senderId, receiverId, amount } });

export const getHistory = (userId) => api.get(`/transaction/history/${userId}`);

export const retryTransaction = (id) => api.post(`/transaction/retry/${id}`);

// ── QR Code ───────────────────────────────────────────
export const getQrCodeUrl = (userId) => `${BASE_URL}/qr/generate/${userId}`;
export const getQrInfo    = (userId) => api.get(`/qr/info/${userId}`);

export default api;
