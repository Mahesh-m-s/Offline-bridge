import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { triggerSyncNow } from '../sync/syncEngine';
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  Compass,
  WifiOff,
  RotateCcw,
  MapPin,
  FileText
} from 'lucide-react';

export default function GrievanceForm() {
  const [category, setCategory] = useState('Drinking Water & Sanitation');
  const [village, setVillage] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedUuid, setSubmittedUuid] = useState(null);
  const [error, setError] = useState('');

  const categories = [
    'Drinking Water & Sanitation',
    'Electricity & Power Outage',
    'Ration & Food Security (PDS)',
    'Rural Road & Transportation',
    'Agricultural Inputs & Fertilizers',
    'Panchayat Administration',
    'Healthcare & Village Clinic',
    'Other Rural Grievance'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of your grievance.');
      return;
    }
    if (!village.trim()) {
      setError('Please specify your village or Gram Panchayat.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const clientUuid = uuidv4();

    let userId = null;
    try {
      const stored = localStorage.getItem('offlinebridge_user');
      if (stored) userId = JSON.parse(stored).id;
    } catch (err) {}

    const fullDescription = `[Village/Panchayat: ${village}] [Contact: ${contactPhone || 'N/A'}] - ${description.trim()}`;

    const grievanceRecord = {
      client_uuid: clientUuid,
      category,
      description: fullDescription,
      user_id: userId,
      syncStatus: 'pending',
      retryCount: 0,
      errorMessage: null,
      created_at: new Date().toISOString(),
      synced_at: null
    };

    try {
      // Save locally to Dexie first
      await db.grievances.add(grievanceRecord);
      setSubmittedUuid(clientUuid);

      // Attempt background sync if connected
      if (navigator.onLine) {
        triggerSyncNow();
      }
    } catch (err) {
      console.error('[GrievanceForm] Dexie error:', err);
      setError('Failed to record grievance in local storage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {submittedUuid ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-teal-500/40 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-white">
              Grievance Registered Locally!
            </h2>
            <p className="text-sm text-slate-300">
              Your issue regarding <span className="text-teal-300 font-semibold">{category}</span> has been saved offline and queued for automatic sync to district authorities.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Grievance Ticket (UUID):</span>
              <span className="font-mono text-teal-300">{submittedUuid.slice(0, 13)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Queue Status:</span>
              <span className="font-semibold text-amber-400">Pending Sync</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/grievances/track"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 flex items-center gap-2 shadow-lg shadow-teal-950 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Track Grievance Status</span>
            </Link>

            <button
              onClick={() => {
                setSubmittedUuid(null);
                setDescription('');
                setVillage('');
              }}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>File Another Grievance</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Public Grievance Redressal Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Report a Civic or Village Issue
            </h1>
            <p className="text-sm text-slate-400">
              Submit your concern even during complete network blackouts. It will sync automatically as soon as your device finds mobile signal.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Village / Gram Panchayat / Taluk <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Bilikere Gram Panchayat, Hunsur"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Callback Mobile Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number for SMS updates"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Description of the Issue <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe what is wrong, exact location, how long the issue has persisted, and any relevant details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <WifiOff className="w-4 h-4 text-emerald-400" />
                <span>Zero network required. Instant local IndexedDB save.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 shadow-lg shadow-amber-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Offline...' : 'Lodge Grievance'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
