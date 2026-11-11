/**
 * OfflineBridge — Applications API Client
 * 
 * Endpoints for:
 * - Submitting citizen applications (POST /api/applications)
 * - Fetching citizen's own applications (GET /api/applications/my)
 * - Fetching application by ID or reference (GET /api/applications/:id)
 * - Official queue listing (GET /api/applications)
 * - Official status transitions (PATCH /api/applications/:id/status)
 */

import { apiClient } from './apiClient';

/**
 * Submit an application (authenticated citizen)
 */
export async function submitApplicationApi({
  schemeId,
  localDraftId = null,
  formData = {},
  clientSubmissionId = null,
  sourceProvenance = {}
}) {
  return apiClient.post('/api/applications', {
    schemeId,
    localDraftId,
    formData,
    clientSubmissionId: clientSubmissionId || `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceProvenance
  });
}

/**
 * Get current authenticated citizen's applications
 */
export async function getMyApplicationsApi() {
  return apiClient.get('/api/applications/my');
}

/**
 * Get application by ID or reference number
 */
export async function getApplicationByIdApi(applicationId) {
  return apiClient.get(`/api/applications/${encodeURIComponent(applicationId)}`);
}

/**
 * List all applications with status/scheme filter (Official/Admin)
 */
export async function listApplicationsApi({ status, schemeId, limit = 50, offset = 0 } = {}) {
  const query = new URLSearchParams();
  if (status && status !== 'All') query.set('status', status.toLowerCase());
  if (schemeId && schemeId !== 'all') query.set('schemeId', schemeId);
  query.set('limit', String(limit));
  query.set('offset', String(offset));

  return apiClient.get(`/api/applications?${query.toString()}`);
}

/**
 * Update application status with remarks (Official/Admin)
 */
export async function updateApplicationStatusApi(applicationId, { status, remarks }) {
  return apiClient.patch(`/api/applications/${applicationId}/status`, {
    status,
    remarks
  });
}

