/**
 * OfflineBridge — Grievances API Client
 * 
 * Endpoints for:
 * - Submitting civic grievance (POST /api/grievances)
 * - Fetching citizen's grievances (GET /api/grievances/my)
 * - Listing all grievances for scrutiny (GET /api/grievances)
 * - Updating grievance status (PATCH /api/grievances/:id/status)
 */

import { apiClient } from './apiClient';

/**
 * Submit civic grievance (authenticated or anonymous)
 */
export async function submitGrievanceApi({
  category,
  description,
  villagePanchayat,
  contactPhone = null,
  clientSubmissionId = null,
  sourceProvenance = {}
}) {
  return apiClient.post('/api/grievances', {
    category,
    description,
    villagePanchayat,
    contactPhone,
    clientSubmissionId: clientSubmissionId || `GRV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceProvenance
  });
}

/**
 * Fetch citizen's own submitted grievances
 */
export async function getMyGrievancesApi() {
  return apiClient.get('/api/grievances/my');
}

/**
 * Fetch single grievance by ID or client reference
 */
export async function getGrievanceByIdApi(grievanceId) {
  return apiClient.get(`/api/grievances/${encodeURIComponent(grievanceId)}`);
}

/**
 * List all grievances for official scrutiny
 */
export async function listGrievancesApi({ category, status, limit = 50, offset = 0 } = {}) {
  const query = new URLSearchParams();
  if (category && category !== 'All') query.set('category', category);
  if (status && status !== 'All') query.set('status', status.toLowerCase());
  query.set('limit', String(limit));
  query.set('offset', String(offset));

  return apiClient.get(`/api/grievances?${query.toString()}`);
}

/**
 * Update grievance status (Official/Admin)
 */
export async function updateGrievanceStatusApi(grievanceId, { status, remarks }) {
  return apiClient.patch(`/api/grievances/${grievanceId}/status`, {
    status,
    remarks
  });
}

