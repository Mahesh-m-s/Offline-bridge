import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import apiClient from '../api/apiClient';
import { triggerSyncNow } from '../sync/syncEngine';
import {
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Calendar,
  MapPin,
  WifiOff
} from 'lucide-react';

export default function GrievanceTracker() {
  const [serverGrievances, setServerGrievances] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local Dexie query
  const localGrievances = useLiveQuery(
    () => db.grievances.orderBy('created_at').reverse().toArray(),
    [],
    []
  );

  const fetchServerGrievances = async () => {
    setIsRefreshing(true);
    let userId = null;
    try {
      const stored = localStorage.getItem('offlinebridge_user');
      if (stored) userId = JSON.parse(stored).id;
    } catch (e) {}

    if (navigator.onLine) {
      try {
        const res = await apiClient.get('/grievances', {
          params: { user_id: userId || undefined }
        });
        if (res.data?.grievances) {
          setServerGrievances(res.data.grievances);
        }
      } catch (err) {
        console.warn('[GrievanceTracker] Fetch failed:', err.message);
      }
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchServerGrievances();
  }, []);

  // Merge map
  const mergedMap = new Map();
  (serverGrievances || []).forEach((g) => {
    mergedMap.set(g.client_uuid, {
      ...g,
      syncStatus: 'synced',
      isLocal: false
    });
  });

  (localGrievances || []).forEach((lg) => {
    const existing = mergedMap.get(lg.client_uuid);
    if (existing) {
      mergedMap.set(lg.client_uuid, {
        ...existing,
        syncStatus: lg.syncStatus
      });
    } else {
      mergedMap.set(lg.client_uuid, {
        ...lg,
        isLocal: true,
        status: lg.syncStatus === 'synced' ? 'submitted' : 'pending_sync'
      });
    }
  });

  const allGrievances = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const filtered = allGrievances.filter((g) => {
    return (
      g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.client_uuid?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Grievance Redressal Status
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track actions taken on issues reported by you or your village community.
          </p>
        </div>

        <button
          onClick={() => {
            fetchServerGrievances();
            triggerSyncNow();
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by ticket ID or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* Grievances List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Grievances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't lodged any grievances yet. If you file one while offline, it will show up here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isPending = item.syncStatus === 'pending';
            const isSyncing = item.syncStatus === 'syncing';

            return (
              <div
                key={item.client_uuid}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/40">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Ticket #{item.client_uuid.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Queued Offline (Pending Sync)</span>
                      </span>
                    ) : isSyncing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Syncing...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Registered with Authorities</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Logged on {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</span>
                  </span>
                  {item.synced_at && (
                    <span className="text-emerald-400/80">
                      Synced to District Server
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
