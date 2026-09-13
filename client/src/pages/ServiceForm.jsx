import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db, defaultServiceForms } from '../db/db';
import { triggerSyncNow } from '../sync/syncEngine';
import FormRenderer from '../components/FormRenderer';
import {
  ArrowLeft,
  CheckCircle2,
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
        let found = await db.cachedForms.get(serviceType);
        if (!found) {
          found = defaultServiceForms.find((f) => f.service_type === serviceType);
        }
        setSchema(found || null);
      } catch (err) {
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
      await db.submissions.add(submissionRecord);
      setSubmittedUuid(clientUuid);

      if (navigator.onLine) {
        triggerSyncNow();
      }
    } catch (err) {
      console.error('[ServiceForm] Error storing submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#087443] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#172033] mt-4">Loading form from device memory...</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-lg bg-[#FEE2E2] border border-[#DC2626] flex items-center justify-center text-[#DC2626] mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">Service Not Found</h2>
        <p className="text-sm text-[#475569]">
          The requested service "{serviceType}" is not available.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-[#172033] text-white hover:bg-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#087443] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </Link>

      {/* Success Confirmation State */}
      {submittedUuid ? (
        <div className="p-8 sm:p-10 rounded-xl bg-white border-2 border-[#16A34A] shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#087443] flex items-center justify-center mx-auto border-2 border-[#16A34A]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-[#172033]">
              Application Recorded Successfully
            </h2>
            <p className="text-sm text-[#334155]">
              Your application for <strong className="text-[#087443]">{schema.title}</strong> has been saved directly on this device.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#CBD5E1] max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Reference Number:</span>
              <span className="font-mono font-bold text-[#172033]">{submittedUuid.slice(0, 13)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Sync Status:</span>
              <span className="font-bold text-[#92400E]">Pending Background Sync</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Automatic Sync:</span>
              <span className="font-bold text-[#087443]">Active (Transfers once online)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/tracker"
              className="min-h-[48px] px-6 py-3 rounded-lg text-xs font-bold text-white bg-[#087443] hover:bg-[#065f37] flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Track in My Applications</span>
            </Link>

            <button
              onClick={() => setSubmittedUuid(null)}
              className="min-h-[48px] px-6 py-3 rounded-lg text-xs font-bold text-[#172033] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Form</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="rounded-xl bg-white border-2 border-[#CBD5E1] p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="border-b border-[#E5E7EB] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007C83]">
              <span>{schema.category || 'Government Application'}</span>
              <span>•</span>
              <span className="text-[#087443] flex items-center gap-1 font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Form Fill Enabled</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {schema.title}
            </h1>

            {schema.description && (
              <p className="text-sm text-[#475569] leading-relaxed max-w-2xl">
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
