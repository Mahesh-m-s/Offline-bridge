/**
 * OfflineBridge — Offline Sync Queue Engine
 * 
 * Manages pending offline submissions for applications and grievances.
 * Automatically synchronizes with PostgreSQL backend via /api/sync/batch
 * when network connectivity is restored.
 */

import { executeBatchSyncApi } from '../api/sync';
import { getAuthToken } from '../api/apiClient';
import { isOnline } from '../registerServiceWorker';
import { saveDraft, getDraft } from './draftStorage';

const SYNC_QUEUE_KEY = 'offlinebridge_sync_queue';

/**
 * Get all queued items
 */
export function getSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : { applications: [], grievances: [] };
  } catch {
    return { applications: [], grievances: [] };
  }
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue(queue) {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[SyncQueue] Failed to write queue to storage:', err);
  }
}

/**
 * Queue an application for background synchronization
 */
export function queueApplicationForSync(applicationData) {
  const queue = getSyncQueue();
  const clientSubmissionId = applicationData.clientSubmissionId || `APP-OFFLINE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  const item = {
    ...applicationData,
    clientSubmissionId,
    queuedAt: new Date().toISOString()
  };

  queue.applications.push(item);
  saveSyncQueue(queue);
  return clientSubmissionId;
}

/**
 * Queue a grievance for background synchronization
 */
export function queueGrievanceForSync(grievanceData) {
  const queue = getSyncQueue();
  const clientSubmissionId = grievanceData.clientSubmissionId || `GRV-OFFLINE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const item = {
    ...grievanceData,
    clientSubmissionId,
    queuedAt: new Date().toISOString()
  };

  queue.grievances.push(item);
  saveSyncQueue(queue);
  return clientSubmissionId;
}

/**
 * Execute pending sync items against backend
 */
export async function triggerQueueSync() {
  if (!isOnline()) {
    return { synced: false, reason: 'OFFLINE' };
  }

  const token = getAuthToken();
  if (!token) {
    return { synced: false, reason: 'UNAUTHENTICATED' };
  }

  const queue = getSyncQueue();
  if (queue.applications.length === 0 && queue.grievances.length === 0) {
    return { synced: true, count: 0 };
  }

  try {
    const clientBatchId = `BATCH-${Date.now()}`;
    const result = await executeBatchSyncApi({
      clientBatchId,
      applications: queue.applications,
      grievances: queue.grievances
    });

    if (result.success && result.data) {
      const { syncedApplications = [], syncedGrievances = [] } = result.data;

      // Update local draft statuses for synced applications
      for (const syncedApp of syncedApplications) {
        if (syncedApp.status === 'synced' && syncedApp.serverId) {
          try {
            // Find matched local draft
            const original = queue.applications.find((a) => a.clientSubmissionId === syncedApp.clientSubmissionId);
            if (original?.localDraftId) {
              const existing = await getDraft(original.localDraftId);
              if (existing) {
                await saveDraft(
                  original.localDraftId,
                  existing.serviceTitle,
                  existing.formData,
                  {
                    ...existing.metadata,
                    isSubmitted: true,
                    serverApplicationId: syncedApp.serverId,
                    submittedAt: new Date().toISOString()
                  }
                );
              }
            }
          } catch (err) {
            console.warn('[SyncQueue] Failed to update draft post-sync:', err);
          }
        }
      }

      // Filter out items that succeeded
      const successfulAppIds = new Set(
        syncedApplications.filter((r) => r.status === 'synced').map((r) => r.clientSubmissionId)
      );
      const successfulGrvIds = new Set(
        syncedGrievances.filter((r) => r.status === 'synced').map((r) => r.clientSubmissionId)
      );

      const remainingQueue = {
        applications: queue.applications.filter((a) => !successfulAppIds.has(a.clientSubmissionId)),
        grievances: queue.grievances.filter((g) => !successfulGrvIds.has(g.clientSubmissionId))
      };

      saveSyncQueue(remainingQueue);

      return {
        synced: true,
        count: successfulAppIds.size + successfulGrvIds.size,
        remaining: remainingQueue.applications.length + remainingQueue.grievances.length
      };
    }

    return { synced: false, error: result.error };
  } catch (err) {
    console.warn('[SyncQueue] Error processing sync batch:', err);
    return { synced: false, error: err.message };
  }
}

// Auto-trigger on window 'online' event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SyncQueue] Network restored — triggering automated background sync...');
    triggerQueueSync().catch((err) => console.warn('[SyncQueue] Background sync error:', err));
  });
}

