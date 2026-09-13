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
  MapPin
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
      await db.grievances.add(grievanceRecord);
      setSubmittedUuid(clientUuid);

      if (navigator.onLine) {
        triggerSyncNow();
      }
    } catch (err) {
      setError('Failed to record grievance in device memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {submittedUuid ? (
        <div className="p-8 sm:p-10 rounded-xl bg-white border-2 border-[#16A34A] shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#087443] flex items-center justify-center mx-auto border-2 border-[#16A34A]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-[#172033]">
              Grievance Registered Offline
            </h2>
            <p className="text-sm text-[#334155]">
              Your issue regarding <strong className="text-[#087443]">{category}</strong> has been saved locally and queued to sync to district authorities upon reconnection.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#CBD5E1] max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Ticket Reference:</span>
              <span className="font-mono font-bold text-[#172033]">{submittedUuid.slice(0, 13)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Queue Status:</span>
              <span className="font-bold text-[#92400E]">Pending Automatic Sync</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/grievances/track"
              className="min-h-[48px] px-6 py-3 rounded-lg text-xs font-bold text-white bg-[#087443] hover:bg-[#065f37] flex items-center gap-2 cursor-pointer shadow-sm"
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
              className="min-h-[48px] px-6 py-3 rounded-lg text-xs font-bold text-[#172033] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>File Another Grievance</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border-2 border-[#CBD5E1] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[#E5E7EB] pb-5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706]">
              <AlertTriangle className="w-4 h-4" />
              <span>Public Grievance Redressal Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              Report a Civic or Village Issue
            </h1>
            <p className="text-sm text-[#475569]">
              Submit issues even without internet connection. Saved safely on your device and submitted automatically when network signal returns.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626] text-xs font-bold text-[#991B1B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Issue Category <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443] text-sm"
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
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Village / Gram Panchayat / Taluk <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Bilikere Gram Panchayat, Hunsur"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Callback Mobile Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number for status alerts"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Detailed Description of the Issue <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe what is broken, location details, how long the issue has persisted..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] p-4 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#087443]">
                <WifiOff className="w-4 h-4 text-[#087443]" />
                <span>Zero network needed. Stored immediately on device.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-lg font-bold text-white bg-[#087443] hover:bg-[#065f37] border border-[#065f37] flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording on Device...' : 'Lodge Grievance'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
