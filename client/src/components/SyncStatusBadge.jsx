import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { triggerSyncNow, subscribeSyncStatus } from '../sync/syncEngine';
import { RefreshCw, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';

export default function SyncStatusBadge() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Live count from Dexie
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
      {/* Pending / Failed / Synced Indicator Badge */}
      {totalPending > 0 ? (
        <button
          onClick={() => handleManualSync(false)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#D97706] hover:bg-[#FDE68A] transition-colors cursor-pointer"
          title="Submissions saved locally. Click to sync now."
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : `${totalPending} Pending Sync`}</span>
        </button>
      ) : totalFailed > 0 ? (
        <button
          onClick={() => handleManualSync(true)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626] hover:bg-[#FECACA] transition-colors cursor-pointer"
          title="Some items failed to sync. Click to retry."
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>{totalFailed} Failed — Tap to Retry</span>
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#087443] border border-[#16A34A]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
          <span>All Synced</span>
        </div>
      )}

      {/* Direct Sync Now Button */}
      <button
        onClick={() => handleManualSync(totalFailed > 0)}
        disabled={isSyncing}
        className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#007C83] bg-white border border-[#007C83] hover:bg-[#E6F5F6] active:bg-[#CCEEF0] transition-colors disabled:opacity-50 cursor-pointer"
        title="Trigger manual background sync"
      >
        <CloudUpload className="w-3.5 h-3.5 text-[#007C83]" />
        <span className="hidden sm:inline">Sync Now</span>
      </button>

      {/* Feedback Message */}
      {lastSyncResult && (
        <span className="text-xs font-bold text-[#087443]">
          Synced {lastSyncResult.syncedSubmissions + lastSyncResult.syncedGrievances} item(s)!
        </span>
      )}
    </div>
  );
}
