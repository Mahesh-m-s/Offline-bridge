/**
 * OfflineBridge — Batch Sync API Client
 */

import { apiClient } from './apiClient';

/**
 * Execute batch synchronization of offline queued applications and grievances
 */
export async function executeBatchSyncApi({ clientBatchId, applications = [], grievances = [] }) {
  return apiClient.post('/api/sync/batch', {
    clientBatchId: clientBatchId || `BATCH-${Date.now()}`,
    applications,
    grievances
  });
}

