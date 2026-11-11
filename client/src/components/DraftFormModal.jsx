import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  Info,
  Paperclip,
  CheckSquare,
  Square,
  ExternalLink,
  ChevronRight,
  Eye,
  Edit3,
  Send,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { saveDraft, getDraft, deleteDraft } from '../offline/draftStorage';
import { getCatalogueSchemeById, KARNATAKA_DISTRICTS } from '../data/schemesCatalogue';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { submitApplicationApi } from '../api/applications';
import { queueApplicationForSync } from '../offline/syncQueue';
import { isOnline } from '../registerServiceWorker';
import { Link } from 'react-router-dom';

export default function DraftFormModal({ service, onClose, onDraftChanged }) {
  const { isKannada, t } = useLanguage();

  // Retrieve full scheme definition if available
  const fullScheme = getCatalogueSchemeById(service?.id) || service;

  // Active view mode: 'edit' | 'review'
  const [viewMode, setViewMode] = useState('edit');

  // Form fields state
  const [formData, setFormData] = useState({
    // Standard applicant fields
    applicantName: '',
    contactPhone: '',
    district: '',
    taluk: '',
    villagePanchayat: '',
    categoryDetails: '',
    notes: '',
    // Document checklist: array of completed doc strings
    docChecklist: [],
    // Local attachment metadata
    localAttachments: []
  });

  // Validation errors map
  const [errors, setErrors] = useState({});

  // Auto-save & persistence states
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [createdAt, setCreatedAt] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const { currentUser, isAuthenticated } = useAuth();

  // Real backend submission states
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const debounceTimerRef = useRef(null);

  // Load existing draft from IndexedDB
  useEffect(() => {
    let isMounted = true;

    async function loadExistingDraft() {
      if (!service?.id) return;
      try {
        const stored = await getDraft(service.id);
        if (isMounted && stored?.formData) {
          setFormData((prev) => ({
            ...prev,
            ...stored.formData
          }));
          setCreatedAt(stored.createdAt || stored.updatedAt);
          setLastSaved(stored.updatedAt);
          setHasStoredDraft(true);
          setIsRestored(true);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.warn('Failed to load existing draft from storage:', err);
      }
    }

    loadExistingDraft();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [service?.id]);

  // Execute storage save
  const executeSave = async (dataToSave) => {
    if (!service?.id) return;
    setSaveStatus('saving');
    setErrorMessage('');

    try {
      const record = await saveDraft(
        service.id,
        service.title || fullScheme?.title || 'Government Service Application',
        dataToSave,
        {
          department: fullScheme?.department || service?.dept || '',
          category: fullScheme?.category || ''
        }
      );
      setCreatedAt(record.createdAt);
      setLastSaved(record.updatedAt);
      setSaveStatus('saved');
      setHasStoredDraft(true);
      if (onDraftChanged) onDraftChanged(record);
    } catch (err) {
      console.error('Save draft error:', err);
      setSaveStatus('error');
      setErrorMessage(err?.message || 'Could not save to local storage.');
    }
  };

  // Handle field change with debounced auto-save
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaveStatus('unsaved');

    // Clear error for edited field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // Debounce auto-save by 800ms
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSave(updated);
    }, 800);
  };

  // Toggle document checklist item
  const toggleDocChecklist = (docName) => {
    const currentList = Array.isArray(formData.docChecklist) ? formData.docChecklist : [];
    const exists = currentList.includes(docName);
    const updatedList = exists
      ? currentList.filter((d) => d !== docName)
      : [...currentList, docName];

    handleChange('docChecklist', updatedList);
  };

  // Handle local file selection
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      selectedAt: new Date().toISOString()
    }));

    const existing = Array.isArray(formData.localAttachments) ? formData.localAttachments : [];
    const merged = [...existing, ...newAttachments].slice(0, 10);
    handleChange('localAttachments', merged);
  };

  const removeAttachment = (index) => {
    const existing = Array.isArray(formData.localAttachments) ? formData.localAttachments : [];
    const updated = existing.filter((_, idx) => idx !== index);
    handleChange('localAttachments', updated);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.applicantName || formData.applicantName.trim().length < 3) {
      newErrors.applicantName = isKannada
        ? 'ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು)'
        : 'Please enter the applicant full name (minimum 3 characters)';
    }

    if (!formData.contactPhone || !/^[6-9]\d{9}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = isKannada
        ? 'ಮಾನ್ಯ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
        : 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.district) {
      newErrors.district = isKannada ? 'ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' : 'Please select your Karnataka district';
    }

    if (!formData.taluk || formData.taluk.trim().length < 2) {
      newErrors.taluk = isKannada ? 'ತಾಲೂಕಿನ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your Taluk name';
    }

    if (!formData.villagePanchayat || formData.villagePanchayat.trim().length < 2) {
      newErrors.villagePanchayat = isKannada ? 'ಗ್ರಾಮ ಪಂಚಾಯತಿ / ಗ್ರಾಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your Gram Panchayat or Village name';
    }

    // Scheme-specific required field validations
    if (fullScheme?.formFields && Array.isArray(fullScheme.formFields)) {
      fullScheme.formFields.forEach((field) => {
        // Skip conditional fields if parent condition is not met
        if (field.dependsOn) {
          const parentVal = formData[field.dependsOn.field];
          if (parentVal !== field.dependsOn.value) return;
        }

        if (field.required) {
          const val = formData[field.id];
          if (val === undefined || val === null || String(val).trim() === '') {
            newErrors[field.id] = isKannada
              ? `${field.labelKn || field.label} ನಮೂದಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ`
              : `${field.label} is required`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Switch to review mode or manual save
  const handleReviewClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setViewMode('review');
    }
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeSave(formData);
  };

  // Submit application directly to backend API or queue for background sync
  const handleOnlineSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      setViewMode('edit');
      return;
    }

    setIsSubmittingApp(true);
    setSubmitError('');

    try {
      if (!isAuthenticated) {
        setSubmitError(isKannada
          ? 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ ಅಥವಾ ನೋಂದಾಯಿಸಿ.'
          : 'Please sign in or register to submit directly to the government portal.');
        setIsSubmittingApp(false);
        return;
      }

      if (isOnline()) {
        const clientSubmissionId = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const res = await submitApplicationApi({
          schemeId: service.id,
          localDraftId: service.id,
          formData,
          clientSubmissionId,
          sourceProvenance: { userAgent: navigator.userAgent, submittedVia: 'DraftFormModal' }
        });

        if (res.success && res.data) {
          setSubmissionSuccess({
            referenceId: res.data.id,
            clientSubmissionId,
            status: res.data.status,
            createdAt: res.data.created_at
          });

          await saveDraft(
            service.id,
            service.title || fullScheme?.title,
            formData,
            {
              isSubmitted: true,
              serverApplicationId: res.data.id,
              submittedAt: new Date().toISOString()
            }
          );
          if (onDraftChanged) onDraftChanged();
        } else {
          throw new Error(res.error?.message || 'Server rejected application submission.');
        }
      } else {
        const clientSubmissionId = queueApplicationForSync({
          schemeId: service.id,
          localDraftId: service.id,
          formData,
          sourceProvenance: { offlineQueued: true }
        });

        setSubmissionSuccess({
          referenceId: clientSubmissionId,
          isOfflineQueued: true,
          status: 'queued'
        });

        await saveDraft(
          service.id,
          service.title || fullScheme?.title,
          formData,
          {
            queuedForSync: true,
            clientSubmissionId
          }
        );
        if (onDraftChanged) onDraftChanged();
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Delete draft from IndexedDB
  const handleDeleteDraft = async () => {
    const confirmMsg = isKannada
      ? 'ಈ ನಮೂನೆಯಲ್ಲಿ ನಮೂದಿಸಲಾದ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಅಳಿಸಬೇಕೇ?'
      : 'Delete this saved local draft from this device? All entered information will be cleared.';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteDraft(service.id);
      setFormData({
        applicantName: '',
        contactPhone: '',
        district: '',
        taluk: '',
        villagePanchayat: '',
        categoryDetails: '',
        notes: '',
        docChecklist: [],
        localAttachments: []
      });
      setHasStoredDraft(false);
      setLastSaved(null);
      setSaveStatus('idle');
      setIsRestored(false);
      setErrors({});
      if (onDraftChanged) onDraftChanged(null);
    } catch (err) {
      alert('Failed to delete draft: ' + err.message);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  // Filter scheme-specific fields that should be rendered based on conditional dependencies
  const visibleSchemeFields = (fullScheme?.formFields || []).filter((field) => {
    if (!field.dependsOn) return true;
    const parentVal = formData[field.dependsOn.field];
    return parentVal === field.dependsOn.value;
  });

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#93c5fd', letterSpacing: '0.04em' }}>
              {t(fullScheme?.department || service?.dept, fullScheme?.departmentKn)}
            </span>
            <h3 style={{ fontSize: '1.18rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              <span>{t(fullScheme?.title || service?.title, fullScheme?.titleKn)}</span>
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Demonstration Notice */}
          <div className="draft-notice-banner" style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #2563eb',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '0.82rem',
            color: '#1e40af',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{isKannada ? 'ಆಫ್‌ಲೈನ್ ನಮೂನೆ ಡ್ರಾಫ್ಟ್:' : 'Offline Draft Form:'}</strong>{' '}
              {isKannada
                ? 'ಈ ಅರ್ಜಿಯನ್ನು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ (IndexedDB). ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲದಿದ್ದರೂ ವಿವರಗಳು ಕಳೆದುಹೋಗುವುದಿಲ್ಲ.'
                : 'Entries save automatically to this device\'s IndexedDB so you can safely close or disconnect. This is a local draft and has not been submitted to the department.'}
            </div>
          </div>

          {/* Restoration Notice */}
          {isRestored && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: '#166534',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} color="#16a34a" />
              <span>
                {isKannada ? 'ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪನೆಯಾಗಿದೆ' : 'Existing draft restored from local storage'} (Created: {formatTimestamp(createdAt)} • Last updated: {formatTimestamp(lastSaved)})
              </span>
            </div>
          )}

          {/* Mode Switcher: Edit Form vs Review Summary */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '16px',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewMode === 'edit' ? '3px solid var(--gov-blue-primary)' : '3px solid transparent',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '0.86rem',
                color: viewMode === 'edit' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={15} />
              <span>{isKannada ? '1. ನಮೂನೆ ಭರ್ತಿ ಮಾಡಿ' : '1. Fill Application Details'}</span>
            </button>

            <button
              type="button"
              onClick={handleReviewClick}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewMode === 'review' ? '3px solid var(--gov-blue-primary)' : '3px solid transparent',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '0.86rem',
                color: viewMode === 'review' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={15} />
              <span>{isKannada ? '2. ಸಾರಾಂಶ ಪರಿಶೀಲಿಸಿ' : '2. Review Summary Before Save'}</span>
            </button>
          </div>

          {/* Live Auto-Save Status Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '6px 10px',
            backgroundColor: 'var(--bg-body)',
            borderRadius: '4px',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 600, color: 'var(--text-subtle)' }}>
                {saveStatus === 'saving' && (isKannada ? 'ಸಾಧನದಲ್ಲಿ ಸೇವ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Saving draft to local storage...')}
                {saveStatus === 'saved' && (isKannada ? `ಡ್ರಾಫ್ಟ್ ಸುರಕ್ಷಿತವಾಗಿದೆ (${formatTimestamp(lastSaved)})` : `Draft saved locally (Updated: ${formatTimestamp(lastSaved)})`)}
                {saveStatus === 'unsaved' && (isKannada ? 'ಹೊಸ ಬದಲಾವಣೆಗಳು (ಸ್ವಯಂ ಸೇವ್ ಆಗುತ್ತಿದೆ...)' : 'Unsaved edits (auto-saving...)')}
                {saveStatus === 'error' && `Storage error: ${errorMessage}`}
                {saveStatus === 'idle' && (isKannada ? 'ಸಿದ್ಧವಾಗಿದೆ — ಬದಲಾವಣೆಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇವ್ ಆಗುತ್ತವೆ' : 'Ready — edits save automatically')}
              </span>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: saveStatus === 'saved' ? '#dcfce7' : saveStatus === 'saving' ? '#fef3c7' : '#e2e8f0',
              color: saveStatus === 'saved' ? '#15803d' : saveStatus === 'saving' ? '#b45309' : '#475569'
            }}>
              {saveStatus === 'saved' ? '● Saved Locally' : saveStatus === 'saving' ? '● Saving...' : '● Pending'}
            </span>
          </div>

          {/* MODE 1: EDIT FORM */}
          {viewMode === 'edit' && (
            <form onSubmit={handleReviewClick}>
              {/* SECTION 1: APPLICANT IDENTITY & CONTACT */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '12px' }}>
                  {isKannada ? 'ಅರ್ಜಿದಾರರ ಮೂಲ ವಿವರಗಳು' : 'Applicant Contact & Identification'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                      {isKannada ? 'ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು' : 'Applicant Full Name'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.applicantName || ''}
                      onChange={(e) => handleChange('applicantName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.88rem',
                        borderRadius: '4px',
                        border: errors.applicantName ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-dark)',
                        outline: 'none'
                      }}
                    />
                    {errors.applicantName && (
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                        {errors.applicantName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                      {isKannada ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು)' : 'Mobile Contact Number'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.contactPhone || ''}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.88rem',
                        borderRadius: '4px',
                        border: errors.contactPhone ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-dark)',
                        outline: 'none'
                      }}
                    />
                    {errors.contactPhone && (
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                        {errors.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                      {isKannada ? 'ಕರ್ನಾಟಕ ಜಿಲ್ಲೆ' : 'Karnataka District'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={formData.district || ''}
                      onChange={(e) => handleChange('district', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.88rem',
                        borderRadius: '4px',
                        border: errors.district ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-dark)',
                        outline: 'none'
                      }}
                    >
                      <option value="">-- Select District --</option>
                      {KARNATAKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                        {errors.district}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                      {isKannada ? 'ತಾಲೂಕು' : 'Taluk'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hunsur / T. Narasipura"
                      value={formData.taluk || ''}
                      onChange={(e) => handleChange('taluk', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.88rem',
                        borderRadius: '4px',
                        border: errors.taluk ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-dark)',
                        outline: 'none'
                      }}
                    />
                    {errors.taluk && (
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                        {errors.taluk}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                      {isKannada ? 'ಗ್ರಾಮ ಪಂಚಾಯತಿ / ಗ್ರಾಮ' : 'Gram Panchayat / Village'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maraluru Village"
                      value={formData.villagePanchayat || ''}
                      onChange={(e) => handleChange('villagePanchayat', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.88rem',
                        borderRadius: '4px',
                        border: errors.villagePanchayat ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-dark)',
                        outline: 'none'
                      }}
                    />
                    {errors.villagePanchayat && (
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                        {errors.villagePanchayat}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHEME-SPECIFIC VERIFIED FIELDS */}
              {visibleSchemeFields.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '12px' }}>
                    {isKannada ? 'ಯೋಜನಾ ನಿರ್ದಿಷ್ಟ ವಿವರಗಳು' : 'Scheme-Specific Application Details'}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {visibleSchemeFields.map((field) => {
                      const fieldError = errors[field.id];

                      return (
                        <div key={field.id} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                            {t(field.label, field.labelKn)}
                            {field.required ? (
                              <span style={{ color: '#dc2626' }}> *</span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> (Optional)</span>
                            )}
                          </label>

                          {field.type === 'select' ? (
                            <select
                              value={formData[field.id] || ''}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '0.88rem',
                                borderRadius: '4px',
                                border: fieldError ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-dark)',
                                outline: 'none'
                              }}
                            >
                              <option value="">-- Select --</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.type === 'radio' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                              {field.options?.map((opt) => (
                                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={field.id}
                                    value={opt.value}
                                    checked={formData[field.id] === opt.value}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              placeholder={field.placeholder || ''}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '0.88rem',
                                borderRadius: '4px',
                                border: fieldError ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-dark)',
                                outline: 'none',
                                resize: 'vertical'
                              }}
                            />
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              placeholder={field.placeholder || ''}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '0.88rem',
                                borderRadius: '4px',
                                border: fieldError ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-dark)',
                                outline: 'none'
                              }}
                            />
                          )}

                          {field.helpText && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                              {field.helpText}
                            </span>
                          )}

                          {fieldError && (
                            <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                              {fieldError}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: DOCUMENT READINESS CHECKLIST */}
              {fullScheme?.requiredDocuments && fullScheme.requiredDocuments.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '8px' }}>
                    {isKannada ? 'ಕಡ್ಡಾಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' : 'Required Documents Checklist'}
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {isKannada
                      ? 'ನಿಮ್ಮ ಬಳಿ ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳನ್ನು ಗುರುತಿಸಿ. ಅರ್ಜಿ ಪರಿಶೀಲನೆಗೆ ಇವು ಅಗತ್ಯವಿರುತ್ತವೆ.'
                      : 'Mark the official documents you have ready for department verification:'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {fullScheme.requiredDocuments.map((doc, idx) => {
                      const isChecked = Array.isArray(formData.docChecklist) && formData.docChecklist.includes(doc);

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleDocChecklist(doc)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            backgroundColor: isChecked ? '#f0fdf4' : 'var(--bg-body)',
                            borderRadius: '4px',
                            border: isChecked ? '1px solid #86efac' : '1px solid var(--border-light)',
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} color="#16a34a" />
                          ) : (
                            <Square size={16} color="var(--text-muted)" />
                          )}
                          <span style={{ color: isChecked ? '#166534' : 'var(--text-dark)', fontWeight: isChecked ? 600 : 400 }}>
                            {doc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 4: LOCAL ATTACHMENT SELECTION (EXPLAINED LIMITATION) */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '8px' }}>
                  {isKannada ? 'ದಾಖಲೆಗಳ ಸ್ಥಳೀಯ ಲಗತ್ತು (ಪರಿಶೀಲನೆಗಾಗಿ)' : 'Local Document Attachments (Local Review Only)'}
                </h4>

                <div style={{
                  backgroundColor: '#fefce8',
                  border: '1px solid #fef08a',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  color: '#854d0e',
                  lineHeight: '1.4',
                  marginBottom: '10px'
                }}>
                  <strong>Notice on File Uploads:</strong> Selected files are saved locally on this browser device for offline reference and checklist verification. They are not uploaded to government servers until an official backend sync connection is authorized.
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <label style={{
                    backgroundColor: 'var(--bg-body)',
                    border: '1px dashed var(--border-medium)',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--gov-blue-primary)'
                  }}>
                    <Paperclip size={15} />
                    <span>Choose Local File (Photo / PDF)</span>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                </div>

                {Array.isArray(formData.localAttachments) && formData.localAttachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.localAttachments.map((file, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.76rem',
                          backgroundColor: '#e2e8f0',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={12} />
                        <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                        <X
                          size={12}
                          onClick={() => removeAttachment(idx)}
                          style={{ cursor: 'pointer', color: '#b91c1c' }}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: NOTES */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  {isKannada ? 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು / ವಿವರಗಳು' : 'Additional Application Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter any additional remarks or notes..."
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-dark)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Official Status Advisory */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: '#92400e',
                marginBottom: '16px'
              }}>
                <strong>Status: Saved locally — not submitted.</strong> Official submission numbers and departmental queue entries are issued exclusively upon formal server transmission.
              </div>

              {/* Actions Toolbar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleManualSave}
                    style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={15} />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Review Summary</span>
                    <ChevronRight size={15} />
                  </button>

                  {hasStoredDraft && (
                    <button
                      type="button"
                      onClick={handleDeleteDraft}
                      style={{
                        background: 'none',
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onClose}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Close Form
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REVIEW SUMMARY BEFORE SAVE */}
          {viewMode === 'review' && (
            <div>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} color="var(--gov-blue-primary)" />
                  <span>Draft Application Summary</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>
                  <div><strong>Applicant Name:</strong> {formData.applicantName || '—'}</div>
                  <div><strong>Contact Mobile:</strong> {formData.contactPhone || '—'}</div>
                  <div><strong>District:</strong> {formData.district || '—'}</div>
                  <div><strong>Taluk:</strong> {formData.taluk || '—'}</div>
                  <div><strong>Panchayat / Village:</strong> {formData.villagePanchayat || '—'}</div>
                </div>

                {/* Scheme fields preview */}
                {visibleSchemeFields.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '6px' }}>
                      Scheme Specifics:
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
                      {visibleSchemeFields.map((f) => (
                        <div key={f.id}>
                          <strong>{f.label}:</strong> {String(formData[f.id] || 'Not specified')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist preview */}
                {Array.isArray(formData.docChecklist) && formData.docChecklist.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '4px' }}>
                      Ready Documents ({formData.docChecklist.length}):
                    </h5>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#166534' }}>
                      {formData.docChecklist.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Attachments preview */}
                {Array.isArray(formData.localAttachments) && formData.localAttachments.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '4px' }}>
                      Locally Preserved Attachments ({formData.localAttachments.length}):
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.76rem' }}>
                      {formData.localAttachments.map((f, i) => (
                        <span key={i} style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Official application link */}
              {fullScheme?.officialUrl && (
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#1e40af',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <strong>Official Application Submission:</strong> To submit an official government application, use the verified department portal.
                  </div>
                  <a
                    href={fullScheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Submission Status Alerts */}
              {submitError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>{submitError}</span>
                  </div>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      style={{
                        backgroundColor: '#1556A0',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      Sign In Now
                    </Link>
                  )}
                </div>
              )}

              {submissionSuccess && (
                <div style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.98rem', marginBottom: '6px' }}>
                    <CheckCircle2 size={20} color="#16834A" />
                    <span>
                      {submissionSuccess.isOfflineQueued
                        ? (isKannada ? 'ಅರ್ಜಿ ಹಿನ್ನೆಲೆ ಸಿಂಕ್‌ಗಾಗಿ ಸರದಿಯಲ್ಲಿದೆ!' : 'Application Queued for Background Sync!')
                        : (isKannada ? 'ಅರ್ಜಿಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Application Successfully Submitted to Server!')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#14532D', marginBottom: '10px' }}>
                    {submissionSuccess.isOfflineQueued
                      ? (isKannada
                          ? 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲದ ಕಾರಣ ನಿಮ್ಮ ಅರ್ಜಿಯು ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಆಗಿದೆ. ಸಂಪರ್ಕ ದೊರೆತಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.'
                          : 'You are currently offline. Your application is safely preserved on this device and will auto-sync once internet connectivity resumes.')
                      : (isKannada
                          ? `ಅಧಿಕೃತ ಅರ್ಜಿ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ: ${submissionSuccess.referenceId}. ಈ ಸಂಖ್ಯೆಯನ್ನು ಟ್ರ್ಯಾಕಿಂಗ್‌ಗಾಗಿ ಬಳಸಬಹುದು.`
                          : `Official Government Application Reference ID: ${submissionSuccess.referenceId}. You can track status anytime.`)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to="/tracking"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', textDecoration: 'none' }}
                    >
                      Track in Tracking Desk →
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={onClose}
                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}

              {/* Review Actions */}
              {!submissionSuccess && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setViewMode('edit')}
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={(e) => {
                      handleManualSave(e);
                      alert(isKannada ? 'ಡ್ರಾಫ್ಟ್ ಸ್ಥಳೀಯವಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!' : 'Draft successfully saved to local device!');
                    }}
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={15} />
                    <span>Save Draft Locally</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSubmittingApp}
                    onClick={handleOnlineSubmit}
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#16834A',
                      borderColor: '#16834A'
                    }}
                  >
                    {isSubmittingApp ? (
                      <>
                        <RefreshCw size={15} className="spin-animate" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit to Government Server</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
