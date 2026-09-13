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
  CloudUpload,
  RefreshCw,
  Search,
  ExternalLink,
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

  // Live query for local Dexie submissions
  const localSubmissions = useLiveQuery(
    () => db.submissions.orderBy('created_at').reverse().toArray(),
    [],
    []
  );

  // Fetch from server and cache to IndexedDB
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

          // Cache to Dexie
          await db.cachedServerSubmissions.bulkPut(res.data.submissions);
        }
      } catch (err) {
        console.warn('[Tracker] Failed to fetch server submissions, using cache:', err.message);
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

  // Merge local submissions with server submissions using client_uuid
  const mergedMap = new Map();

  // 1. Add server records
  (serverSubmissions || []).forEach((item) => {
    mergedMap.set(item.client_uuid, {
      ...item,
      isLocalOnly: false,
      displayStatus: item.status || 'submitted',
      syncStatus: 'synced'
    });
  });

  // 2. Overlay or prepend local records
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Application Status Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor all your government applications across online submissions and local offline drafts.
          </p>
        </div>

        <button
          onClick={() => {
            fetchServerApplications();
            triggerSyncNow();
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh & Sync</span>
        </button>
      </div>

      {/* Offline Alert Banner if viewing cached data */}
      {isOfflineView && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Viewing offline cached records. Status updates from government servers will refresh automatically once reconnected.
            </span>
          </div>
          {lastUpdatedTime && (
            <span className="text-amber-400/80 hidden md:inline">Last cached: {lastUpdatedTime}</span>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID or service name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Pending Sync', 'Synced'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Applications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted any service applications yet. Applications submitted offline will appear here immediately.
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
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        {item.service_type?.replace(/_/g, ' ') || 'Service Application'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">
                        Ref: {item.client_uuid.slice(0, 8)}...
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {item.form_title || item.title || item.service_type}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Saved Locally (Pending Sync)</span>
                      </span>
                    ) : isSyncing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Syncing to Server...</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-600/50">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sync Failed (Tap to Retry)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Synced to Server</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</span>
                    </span>
                    {item.synced_at && (
                      <span className="text-slate-500 hidden md:inline">
                        Synced: {new Date(item.synced_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(item)}
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase text-teal-400 font-bold">Submission Details</span>
                <h3 className="text-lg font-bold text-white">
                  {selectedSubmission.form_title || selectedSubmission.service_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Idempotency UUID:</span>
                <span className="font-mono text-teal-300 select-all">{selectedSubmission.client_uuid}</span>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-300 block">Form Field Values:</span>
                {selectedSubmission.data_json && typeof selectedSubmission.data_json === 'object' ? (
                  Object.entries(selectedSubmission.data_json).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium text-slate-200">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No payload fields recorded.</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
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
