import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { triggerSyncNow, subscribeSyncStatus } from '../sync/syncEngine';
import { Wifi, WifiOff, RefreshCw, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConnectivityBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const pendingSubmissions = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('pending').count(),
    [],
    0
  );
  const pendingGrievances = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('pending').count(),
    [],
    0
  );
  const failedCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('failed').count(),
    [],
    0
  );

  const totalPending = (pendingSubmissions || 0) + (pendingGrievances || 0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = subscribeSyncStatus((data) => {
      setIsSyncing(data.isSyncing);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    await triggerSyncNow({ forceRetryFailed: failedCount > 0 });
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Prominent Status Pill - Matches Screenshot */}
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all text-left cursor-pointer ${
          !isOnline
            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] hover:bg-[#FDE68A]'
            : totalPending > 0
            ? 'bg-[#E8FAFC] text-[#007C89] border-[#B5EBF0] hover:bg-[#D4F6F9]'
            : 'bg-[#E8FAFC] text-[#007C89] border-[#B5EBF0] hover:bg-[#D4F6F9]'
        }`}
        title="Network & sync state. Click for details."
      >
        <div className="flex-shrink-0">
          {!isOnline ? (
            <div className="w-7 h-7 rounded-full bg-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <WifiOff className="w-4 h-4" />
            </div>
          ) : isSyncing ? (
            <div className="w-7 h-7 rounded-full bg-[#D0F2F6] flex items-center justify-center text-[#00AFC1]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00AFC1]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <Wifi className="w-4 h-4 text-[#16A34A]" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-tight">
              {!isOnline
                ? 'Offline Mode'
                : isSyncing
                ? 'Syncing...'
                : 'Online'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </div>
          <span className="text-[10px] font-medium opacity-80 leading-tight">
            {!isOnline
              ? 'Saved on this device'
              : totalPending > 0
              ? `${totalPending} waiting to sync`
              : 'All Synced'}
          </span>
        </div>
      </button>

      {/* Dropdown status summary & manual sync action */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg p-4 z-50 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <span className="text-xs font-bold text-[#102A43]">Sync Status</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOnline ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF3C7] text-[#D97706]'
              }`}
            >
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#526B7A]">
            <div className="flex justify-between">
              <span>Local Storage:</span>
              <span className="font-semibold text-[#102A43]">IndexedDB Active</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Sync:</span>
              <span className="font-semibold text-[#102A43]">{totalPending} item(s)</span>
            </div>
            {failedCount > 0 && (
              <div className="flex justify-between text-[#DC2626]">
                <span>Failed Retries:</span>
                <span className="font-bold">{failedCount}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing}
            className="w-full min-h-[36px] py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#00AFC1] hover:bg-[#009CAD] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
