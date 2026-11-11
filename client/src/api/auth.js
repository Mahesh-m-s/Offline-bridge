/**
 * OfflineBridge — Authentication & User Profile API Client
 */

import { apiClient, getAuthToken, setAuthToken, clearAuthToken } from './apiClient';

/**
 * Register a new Citizen user via POST /api/auth/register
 */
export async function registerUser({ fullName, phone, password, villagePanchayat }) {
  const res = await apiClient.post('/api/auth/register', {
    fullName: fullName?.trim(),
    phone: phone?.trim(),
    password,
    villagePanchayat: villagePanchayat?.trim() || null
  }, { auth: false });

  if (res.success && res.raw?.token) {
    setAuthToken(res.raw.token);
  }

  return res;
}

/**
 * Universal login for all roles via POST /api/auth/login
 */
export async function loginUser({ identifier, password }) {
  const res = await apiClient.post('/api/auth/login', {
    identifier: String(identifier).trim(),
    password
  }, { auth: false });

  if (res.success && res.raw?.token) {
    setAuthToken(res.raw.token);
  }

  return res;
}

/**
 * Fetch authenticated profile via GET /api/auth/me
 */
export async function getProfile() {
  return apiClient.get('/api/auth/me');
}

/**
 * Update user profile via PUT /api/users/:id
 */
export async function updateProfile(userId, { fullName, villagePanchayat }) {
  return apiClient.put(`/api/users/${userId}`, {
    fullName,
    villagePanchayat
  });
}

/**
 * Logout and clear token
 */
export function logoutUser() {
  clearAuthToken();
}

