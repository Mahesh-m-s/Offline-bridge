/**
 * OfflineBridge — Audit Logs API Client (Admin)
 */

import { apiClient } from './apiClient';

/**
 * Fetch chronological audit logs from PostgreSQL (Admin only)
 */
export async function fetchAuditLogsApi({ limit = 50, offset = 0, action = null, actorId = null } = {}) {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  query.set('offset', String(offset));
  if (action) query.set('action', action);
  if (actorId) query.set('actorId', actorId);

  return apiClient.get(`/api/audit/logs?${query.toString()}`);
}

