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
  Calendar
} from 'lucide-react';

export default function GrievanceTracker() {
  const [serverGrievances, setServerGrievances] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      } catch (err) {}
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchServerGrievances();
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1D5DB] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Grievance Redressal Tracker
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Track actions taken on village and civic issues logged by you.
          </p>
        </div>

        <button
          onClick={() => {
            fetchServerGrievances();
            triggerSyncNow();
          }}
          disabled={isRefreshing}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-[#F1F5F9] border-2 border-[#087443] text-[#087443] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by ticket ID or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-9 pr-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#087443]"
        />
      </div>

      {/* Grievances List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#CBD5E1] space-y-2">
          <AlertTriangle className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-bold text-[#172033]">No Grievances Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You have not registered any grievances yet. Grievances submitted while offline will appear here immediately.
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
                className="p-5 sm:p-6 rounded-xl bg-white border-2 border-[#CBD5E1] hover:border-[#087443] transition-colors space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#D97706]">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#64748B]">
                      Ticket #{item.client_uuid.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#D97706]">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Queued Offline (Pending Sync)</span>
                      </span>
                    ) : isSyncing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
                        <span>Syncing...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#087443] border border-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                        <span>Registered with Authorities</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-[#172033] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Logged on {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</span>
                  </span>
                  {item.synced_at && (
                    <span className="text-[#087443] font-bold">
                      ✓ Transferred to Portal
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
