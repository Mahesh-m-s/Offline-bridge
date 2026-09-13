import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db, defaultServiceForms } from '../db/db';
import { triggerSyncNow } from '../sync/syncEngine';
import FormRenderer from '../components/FormRenderer';
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  WifiOff,
  ClipboardList,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function ServiceForm() {
  const { serviceType } = useParams();
  const navigate = useNavigate();

  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittedUuid, setSubmittedUuid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      setLoading(true);
      try {
        // Try Dexie cached forms first
        let found = await db.cachedForms.get(serviceType);
        if (!found) {
          found = defaultServiceForms.find((f) => f.service_type === serviceType);
        }
        setSchema(found || null);
      } catch (err) {
        console.error('[ServiceForm] Error fetching schema:', err);
        const fallback = defaultServiceForms.find((f) => f.service_type === serviceType);
        setSchema(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [serviceType]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    const clientUuid = uuidv4();

    // Check logged in user
    let userId = null;
    try {
      const storedUser = localStorage.getItem('offlinebridge_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userId = u.id;
      }
    } catch (e) {}

    const submissionRecord = {
      client_uuid: clientUuid,
      form_id: schema.id || 1,
      service_type: serviceType,
      data_json: formData,
      user_id: userId,
      syncStatus: 'pending',
      retryCount: 0,
      errorMessage: null,
      created_at: new Date().toISOString(),
      synced_at: null
    };

    try {
      // 1. Save to Dexie IndexedDB (Offline First guarantee)
      await db.submissions.add(submissionRecord);
      setSubmittedUuid(clientUuid);

      // 2. Trigger background sync attempt if currently connected
      if (navigator.onLine) {
        triggerSyncNow();
      }
    } catch (err) {
      console.error('[ServiceForm] Error storing submission in Dexie:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 mt-4">Loading form schema from offline cache...</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Service Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested service "{serviceType}" does not exist in the offline forms catalog.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </Link>

      {/* Success Submission State */}
      {submittedUuid ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-teal-500/40 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-white">
              Application Saved Successfully!
            </h2>
            <p className="text-sm text-slate-300">
              Your application for <span className="font-semibold text-teal-300">{schema.title}</span> has been securely stored in your device's IndexedDB.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracking Reference (UUID):</span>
              <span className="font-mono text-teal-300">{submittedUuid.slice(0, 13)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Status:</span>
              <span className="font-semibold text-amber-400">Pending Background Sync</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Mode:</span>
              <span className="text-emerald-400">Auto-syncs on reconnection</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/tracker"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 flex items-center gap-2 shadow-lg shadow-teal-950 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Track Application in Dashboard</span>
            </Link>

            <button
              onClick={() => setSubmittedUuid(null)}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Application</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <span>{schema.category || 'Government Application'}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Form Fill Enabled</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {schema.title}
            </h1>

            {schema.description && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                {schema.description}
              </p>
            )}
          </div>

          {/* Form Renderer */}
          <FormRenderer
            schema={schema}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
