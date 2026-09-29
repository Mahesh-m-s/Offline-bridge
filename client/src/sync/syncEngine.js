import { db } from '../db/db';
import apiClient from '../api/apiClient';

const MAX_RETRIES = 5;
const listeners = new Set();
let running = false;
let initialized = false;
let retryTimer;
let authPaused = false;

export const subscribeSyncStatus = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const publish = (state) => listeners.forEach((listener) => listener(state));
export const calculateBackoffDelay = (retryCount, random = Math.random) =>
  Math.min(30000, Math.min(1000 * (2 ** Math.max(0, retryCount - 1)), 30000) * (0.8 + random() * 0.4));

const healthCheck = async () => {
  if (!navigator.onLine) return false;
  try { await apiClient.get('/health/ready', { timeout: 3000, headers: { 'Cache-Control': 'no-cache' } }); return true; }
  catch { return false; }
};

const scheduleRetry = async () => {
  clearTimeout(retryTimer);
  const records = [...await db.submissions.toArray(), ...await db.grievances.toArray()]
    .filter((record) => record.syncStatus === 'pending' && record.nextRetryAt);
  if (!records.length || authPaused) return;
  const nextAt = Math.min(...records.map((record) => new Date(record.nextRetryAt).getTime()));
  retryTimer = setTimeout(() => triggerSyncNow(), Math.max(0, nextAt - Date.now()));
};

async function syncTable(entityType, table, endpoint, forceRetryFailed) {
  const now = Date.now();
  const records = (await table.toArray()).filter((record) =>
    (record.syncStatus === 'pending' && (!record.nextRetryAt || new Date(record.nextRetryAt).getTime() <= now)) ||
    (forceRetryFailed && record.syncStatus === 'failed')
  );
  if (!records.length) return { succeeded: 0, failed: 0, authRequired: false };

  await db.transaction('rw', table, db.syncQueue, async () => {
    for (const record of records) {
      await table.update(record.client_uuid, { syncStatus: 'syncing' });
      await db.syncQueue.put({ id: `${entityType}:${record.client_uuid}`, entityType,
        clientUuid: record.client_uuid, state: 'syncing', nextRetryAt: null, updatedAt: new Date().toISOString() });
    }
  });

  let response;
  try {
    response = await apiClient.post(endpoint, { items: records.map((record) => ({
      ...(record.payload || {}),
      client_uuid: record.client_uuid,
      updated_at: record.updated_at || record.updatedAt || record.created_at || new Date().toISOString()
    })) });
  } catch (error) {
    if (error.response?.status === 401) {
      authPaused = true;
      await db.transaction('rw', table, db.syncQueue, async () => {
        for (const record of records) {
          await table.update(record.client_uuid, { syncStatus: 'pending', errorMessage: 'Sign in to continue syncing.' });
          await db.syncQueue.update(`${entityType}:${record.client_uuid}`, { state: 'pending' });
        }
      });
      return { succeeded: 0, failed: 0, authRequired: true };
    }
    const message = error.response?.data?.error?.message || error.message || 'Network error';
    await recordFailures(entityType, table, records, message);
    return { succeeded: 0, failed: records.length, authRequired: false };
  }

  const results = response.data?.data || [];
  let succeeded = 0;
  let failed = 0;
  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const result = results.find((item) => item.index === index) || results[index];
    if (result?.success) {
      const server = result.data || result.submission || result.grievance || {};
      await db.transaction('rw', table, db.syncQueue, async () => {
        await table.update(record.client_uuid, { syncStatus: 'synced', syncedAt: server.synced_at || new Date().toISOString(),
          synced_at: server.synced_at || new Date().toISOString(), serverId: server.id, id: server.id || record.id,
          reference_no: server.reference_no, retryCount: 0, nextRetryAt: null, errorMessage: null });
        await db.syncQueue.delete(`${entityType}:${record.client_uuid}`);
      });
      succeeded++;
    } else {
      await recordFailures(entityType, table, [record], result?.error?.message || result?.message || 'Server rejected this item');
      failed++;
    }
  }
  return { succeeded, failed, authRequired: false };
}

async function recordFailures(entityType, table, records, message) {
  await db.transaction('rw', table, db.syncQueue, async () => {
    for (const record of records) {
      const retryCount = (record.retryCount || 0) + 1;
      const exhausted = retryCount >= MAX_RETRIES;
      const nextRetryAt = exhausted ? null : new Date(Date.now() + calculateBackoffDelay(retryCount)).toISOString();
      await table.update(record.client_uuid, { syncStatus: exhausted ? 'failed' : 'pending', retryCount,
        nextRetryAt, errorMessage: message });
      await db.syncQueue.put({ id: `${entityType}:${record.client_uuid}`, entityType,
        clientUuid: record.client_uuid, state: exhausted ? 'failed' : 'pending', retryCount, nextRetryAt,
        updatedAt: new Date().toISOString() });
    }
  });
}

export async function triggerSyncNow({ forceRetryFailed = false } = {}) {
  if (running) return { status: 'in_progress' };
  if (!(await healthCheck())) return { status: 'offline' };
  running = true;
  publish({ isSyncing: true, event: 'sync_start' });
  try {
    authPaused = false;
    const submissions = await syncTable('submission', db.submissions, '/submissions/bulk-sync', forceRetryFailed);
    if (submissions.authRequired) {
      publish({ isSyncing: false, event: 'auth_required' });
      return { status: 'auth_required' };
    }
    const grievances = await syncTable('grievance', db.grievances, '/grievances/bulk-sync', forceRetryFailed);
    if (grievances.authRequired) {
      publish({ isSyncing: false, event: 'auth_required' });
      return { status: 'auth_required' };
    }
    const summary = { syncedSubmissions: submissions.succeeded, syncedGrievances: grievances.succeeded,
      failedCount: submissions.failed + grievances.failed };
    publish({ isSyncing: false, event: 'sync_complete', ...summary, timestamp: new Date().toISOString() });
    return summary;
  } finally {
    running = false;
    await scheduleRetry();
  }
}

export const initSyncEngine = () => {
  if (initialized) return;
  initialized = true;
  db.transaction('rw', db.submissions, db.grievances, db.syncQueue, async () => {
    for (const table of [db.submissions, db.grievances]) {
      const interrupted = await table.where('syncStatus').equals('syncing').toArray();
      for (const record of interrupted) {
        await table.update(record.client_uuid, { syncStatus: 'pending', nextRetryAt: null });
        await db.syncQueue.put({ id: `${table.name === 'submissions' ? 'submission' : 'grievance'}:${record.client_uuid}`,
          entityType: table.name === 'submissions' ? 'submission' : 'grievance', clientUuid: record.client_uuid,
          state: 'pending', nextRetryAt: null, updatedAt: new Date().toISOString() });
      }
    }
  }).finally(() => triggerSyncNow());
  window.addEventListener('online', () => triggerSyncNow());
  window.addEventListener('focus', () => triggerSyncNow());
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_REQUEST') triggerSyncNow();
  });
  window.addEventListener('offline', () => publish({ isOnline: false, event: 'offline' }));
  if (localStorage.getItem('offlinebridge_token')) authPaused = false;
};

export const resumeSyncAfterLogin = () => { authPaused = false; publish({ event: 'auth_resumed' }); triggerSyncNow(); };
