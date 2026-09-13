import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { triggerSyncNow, subscribeSyncStatus } from '../sync/syncEngine';
import { RefreshCw, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';

export default function SyncStatusBadge() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Live count of pending and failed items from Dexie
  const pendingSubmissionsCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('pending').count(),
    [],
    0
  );
  const failedSubmissionsCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('failed').count(),
    [],
    0
  );

  const pendingGrievancesCount = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('pending').count(),
    [],
    0
  );
  const failedGrievancesCount = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('failed').count(),
    [],
    0
  );

  const totalPending = (pendingSubmissionsCount || 0) + (pendingGrievancesCount || 0);
  const totalFailed = (failedSubmissionsCount || 0) + (failedGrievancesCount || 0);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((data) => {
      setIsSyncing(data.isSyncing);
      if (data.event === 'sync_complete') {
        setLastSyncResult(data);
        setTimeout(() => setLastSyncResult(null), 4000);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async (forceRetry = false) => {
    await triggerSyncNow({ forceRetryFailed: forceRetry });
  };

  return (
    <div id="sync-status-badge" className="flex items-center gap-2">
      {/* Pending / Synced Pill */}
      {totalPending > 0 ? (
        <button
          onClick={() => handleManualSync(false)}
          disabled={isSyncing}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm border ${
            isSyncing
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
              : 'bg-amber-950/80 text-amber-300 border-amber-500/50 hover:bg-amber-900/80 cursor-pointer'
          }`}
          title="Click to trigger background sync now"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>
            {isSyncing ? 'Syncing...' : `${totalPending} Pending Sync`}
          </span>
        </button>
      ) : totalFailed > 0 ? (
        <button
          onClick={() => handleManualSync(true)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-rose-950/90 text-rose-300 border border-rose-600/60 hover:bg-rose-900/80 cursor-pointer transition-all duration-300 shadow-sm animate-pulse"
          title="Sync errors encountered. Tap to retry."
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{totalFailed} Failed — Tap to Retry</span>
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>All Synced</span>
        </div>
      )}

      {/* Direct Sync Now Action Button */}
      <button
        onClick={() => handleManualSync(totalFailed > 0)}
        disabled={isSyncing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-600/20 text-teal-200 border border-teal-500/30 hover:bg-teal-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        title="Force manual synchronization"
      >
        <CloudUpload className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline">Sync Now</span>
      </button>

      {/* Sync Success Pop Toast Indicator */}
      {lastSyncResult && (
        <span className="text-xs text-emerald-400 font-medium animate-fade-in">
          Synced {lastSyncResult.syncedSubmissions + lastSyncResult.syncedGrievances} item(s)!
        </span>
      )}
    </div>
  );
}
