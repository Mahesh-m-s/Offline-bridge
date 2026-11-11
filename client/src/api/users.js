/**
 * OfflineBridge — Users API Client (Admin)
 */

import { apiClient } from './apiClient';

/**
 * List all users with optional role filtering (Admin only)
 */
export async function listUsersApi({ limit = 50, offset = 0, role = null } = {}) {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  query.set('offset', String(offset));
  if (role) query.set('role', role);

  return apiClient.get(`/api/users?${query.toString()}`);
}

/**
 * Get user by UUID
 */
export async function getUserByIdApi(userId) {
  return apiClient.get(`/api/users/${userId}`);
}

/**
 * Update user details (name, panchayat, status)
 */
export async function updateUserApi(userId, data) {
  return apiClient.put(`/api/users/${userId}`, data);
}

