import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { triggerSyncNow, subscribeSyncStatus } from '../sync/syncEngine';
import { RefreshCw, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';

export default function SyncStatusBadge() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

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
      {totalPending > 0 ? (
        <button
          onClick={() => handleManualSync(false)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] hover:bg-[#FDE68A] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : `${totalPending} Pending`}</span>
        </button>
      ) : totalFailed > 0 ? (
        <button
          onClick={() => handleManualSync(true)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FECACA] transition-colors cursor-pointer"
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>{totalFailed} Failed — Retry</span>
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>All Synced</span>
        </div>
      )}

      {lastSyncResult && (
        <span className="text-xs font-bold text-[#00AFC1] animate-fade-in">
          Synced!
        </span>
      )}
    </div>
  );
}
