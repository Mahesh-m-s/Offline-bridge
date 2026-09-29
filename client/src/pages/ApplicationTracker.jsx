import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import apiClient from '../api/apiClient';
import { triggerSyncNow } from '../sync/syncEngine';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  WifiOff,
  Eye,
  Calendar
} from 'lucide-react';

export default function ApplicationTracker() {
  const [serverSubmissions, setServerSubmissions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isOfflineView, setIsOfflineView] = useState(!navigator.onLine);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);

  const localSubmissions = useLiveQuery(
    () => db.submissions.orderBy('created_at').reverse().toArray(),
    [],
    []
  );

  const fetchServerApplications = async () => {
    setIsRefreshing(true);
    let userId = null;
    try {
      const stored = localStorage.getItem('offlinebridge_user');
      if (stored) userId = JSON.parse(stored).id;
    } catch (e) {}

    if (navigator.onLine) {
      try {
        const res = await apiClient.get('/submissions', {
          params: { user_id: userId || undefined }
        });
        if (res.data?.submissions) {
          setServerSubmissions(res.data.submissions);
          setIsOfflineView(false);
          setLastUpdatedTime(new Date().toLocaleTimeString());
          await db.cachedServerSubmissions.bulkPut(res.data.submissions);
        }
      } catch (err) {
        loadFromCache();
      }
    } else {
      loadFromCache();
    }
    setIsRefreshing(false);
  };

  const loadFromCache = async () => {
    setIsOfflineView(true);
    try {
      const cached = await db.cachedServerSubmissions.toArray();
      setServerSubmissions(cached);
    } catch (e) {
      setServerSubmissions([]);
    }
  };

  useEffect(() => {
    fetchServerApplications();

    const handleOnline = () => fetchServerApplications();
    const handleOffline = () => setIsOfflineView(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const mergedMap = new Map();

  (serverSubmissions || []).forEach((item) => {
    mergedMap.set(item.client_uuid, {
      ...item,
      isLocalOnly: false,
      displayStatus: item.status || 'submitted',
      syncStatus: 'synced'
    });
  });

  (localSubmissions || []).forEach((local) => {
    const existing = mergedMap.get(local.client_uuid);
    if (existing) {
      mergedMap.set(local.client_uuid, {
        ...existing,
        syncStatus: local.syncStatus,
        data_json: local.data_json || existing.data_json
      });
    } else {
      mergedMap.set(local.client_uuid, {
        ...local,
        isLocalOnly: true,
        displayStatus: local.syncStatus === 'synced' ? 'submitted' : 'pending_sync'
      });
    }
  });

  const allApplications = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const filteredApplications = allApplications.filter((app) => {
    const matchesSearch =
      (app.service_type && app.service_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.form_title && app.form_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.client_uuid && app.client_uuid.toLowerCase().includes(searchQuery.toLowerCase()));

    const isPending = app.syncStatus === 'pending' || app.displayStatus === 'pending_sync';
    const isSynced = app.syncStatus === 'synced' || app.displayStatus === 'submitted';

    if (statusFilter === 'Pending Sync') return matchesSearch && isPending;
    if (statusFilter === 'Synced') return matchesSearch && isSynced;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1D5DB] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Application Status Tracker
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Monitor the status of your applications across local offline drafts and synced government records.
          </p>
        </div>

        <button
          onClick={() => {
            fetchServerApplications();
            triggerSyncNow();
          }}
          disabled={isRefreshing}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-[#F1F5F9] border-2 border-[#087443] text-[#087443] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh & Sync</span>
        </button>
      </div>

      {/* Offline Alert Banner */}
      {isOfflineView && (
        <div className="p-4 rounded-lg bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-between text-xs font-bold text-[#92400E]">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <span>
              Showing offline cached records. Updates will refresh automatically when you reconnect to internet.
            </span>
          </div>
          {lastUpdatedTime && (
            <span className="text-[#B45309] hidden md:inline">Last cached: {lastUpdatedTime}</span>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID or service name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#087443]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Pending Sync', 'Synced'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`min-h-[44px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#087443] text-white'
                  : 'bg-white text-[#172033] hover:bg-[#EBF7F0] border border-[#CBD5E1]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#CBD5E1] space-y-2">
          <ClipboardList className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-bold text-[#172033]">No Applications Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You haven't submitted any service applications yet. Applications filled offline will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((item) => {
            const isPending = item.syncStatus === 'pending' || item.displayStatus === 'pending_sync';
            const isSyncing = item.syncStatus === 'syncing';
            const isFailed = item.syncStatus === 'failed';

            return (
              <div
                key={item.client_uuid}
                className="p-5 sm:p-6 rounded-xl bg-white border-2 border-[#CBD5E1] hover:border-[#087443] transition-colors space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#007C83]">
                        {item.service_type?.replace(/_/g, ' ') || 'Service Application'}
                      </span>
                      <span className="text-[#CBD5E1]">•</span>
                      <span className="text-xs font-mono font-bold text-[#64748B]">
                        Ref: #{item.client_uuid.slice(0, 8)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#172033]">
                      {item.form_title || item.title || item.service_type}
                    </h3>
                  </div>

                  {/* Status Badges: Clear Green / Amber / Red */}
                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#D97706]">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Saved Locally (Pending Sync)</span>
                      </span>
                    ) : isSyncing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
                        <span>Syncing to Server...</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                        <span>Sync Failed (Tap to Retry)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#087443] border border-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                        <span>Submitted & Synced</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#475569]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Submitted on {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</span>
                  </span>

                  <button
                    onClick={() => setSelectedSubmission(item)}
                    className="min-h-[36px] inline-flex items-center gap-1.5 text-[#087443] hover:underline font-bold cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Submitted Data</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="max-w-lg w-full rounded-xl bg-white border-2 border-[#172033] p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-xs uppercase text-[#007C83] font-bold">Submission Details</span>
                <h3 className="text-lg font-bold text-[#172033]">
                  {selectedSubmission.form_title || selectedSubmission.service_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-[#172033] hover:bg-[#F1F5F9] font-bold cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#CBD5E1]">
                <span className="text-[#64748B] block mb-0.5">Tracking UUID:</span>
                <span className="font-mono font-bold text-[#172033] select-all">{selectedSubmission.client_uuid}</span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#172033] block">Entered Field Values:</span>
                {selectedSubmission.data_json && typeof selectedSubmission.data_json === 'object' ? (
                  Object.entries(selectedSubmission.data_json).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2.5 rounded-md bg-[#F8F9FA] border border-[#E5E7EB]">
                      <span className="text-[#475569] font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-[#172033]">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#64748B]">No details recorded.</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full min-h-[44px] rounded-lg font-bold bg-[#172033] hover:bg-black text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
