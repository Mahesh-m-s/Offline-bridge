import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Save,
  Trash2,
  CheckCircle2,
  Clock,
  Shield,
  Info,
  Paperclip,
  X,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';
import {
  saveGrievanceDraft,
  getGrievanceDraft,
  deleteGrievanceDraft
} from '../offline/draftStorage';
import { KARNATAKA_DISTRICTS } from '../data/schemesCatalogue';
import { useLanguage } from '../context/LanguageContext';

export default function GrievancePage() {
  const { isKannada, t } = useLanguage();

  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'review'

  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    district: '',
    taluk: '',
    villagePanchayat: '',
    habitation: '',
    complainantName: '',
    contactPhone: '',
    priorRefNumber: '',
    localAttachments: []
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const debounceTimerRef = useRef(null);

  const grievanceCategories = [
    { value: 'water_supply', label: 'Drinking Water Supply / Borewell Breakdown (ಕುಡಿಯುವ ನೀರು)' },
    { value: 'ration_delay', label: 'Ration Delay / Fair Price Shop Irregularity (ಪಡಿತರ ವಿತರಣೆ)' },
    { value: 'road_sanitation', label: 'Gram Panchayat Road / Drainage / Sanitation (ರಸ್ತೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ)' },
    { value: 'pension_delay', label: 'Social Pension Disbursement Delay (ಮಾಸಾಶನ ವಿಳಂಬ)' },
    { value: 'electricity_failure', label: 'Street Light / Transformer / Electricity Breakdown (ವಿದ್ಯುತ್ / ದೀಪಗಳು)' },
    { value: 'agri_subsidy', label: 'Agriculture Subsidy / Fertilizer Holdup (ಕೃಷಿ ಸಹಾಯಧನ)' },
    { value: 'housing_delay', label: 'Housing Grant Payment Stage Holdup (ವಸತಿ ಅನುದಾನ)' },
    { value: 'other_civic', label: 'Other Civic / Panchayat Grievance (ಇತರ ಸಮಸ್ಯೆ)' }
  ];

  // Load existing grievance draft from IndexedDB
  useEffect(() => {
    let isMounted = true;

    async function loadDraft() {
      try {
        const stored = await getGrievanceDraft();
        if (isMounted && stored?.formData) {
          setFormData((prev) => ({
            ...prev,
            ...stored.formData
          }));
          setLastSaved(stored.updatedAt);
          setHasStoredDraft(true);
          setIsRestored(true);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.warn('Failed to load grievance draft:', err);
      }
    }

    loadDraft();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Save grievance draft
  const executeSave = async (dataToSave) => {
    setSaveStatus('saving');
    setErrorMessage('');

    try {
      const record = await saveGrievanceDraft(dataToSave);
      setLastSaved(record.updatedAt);
      setSaveStatus('saved');
      setHasStoredDraft(true);
    } catch (err) {
      console.error('Save grievance draft error:', err);
      setSaveStatus('error');
      setErrorMessage(err?.message || 'Could not save grievance draft locally.');
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaveStatus('unsaved');

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSave(updated);
    }, 800);
  };

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
    const merged = [...existing, ...newAttachments].slice(0, 5);
    handleChange('localAttachments', merged);
  };

  const removeAttachment = (index) => {
    const existing = Array.isArray(formData.localAttachments) ? formData.localAttachments : [];
    const updated = existing.filter((_, idx) => idx !== index);
    handleChange('localAttachments', updated);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = isKannada ? 'ದೂರಿನ ವರ್ಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' : 'Please select a grievance category';
    }

    if (!formData.subject || formData.subject.trim().length < 4) {
      newErrors.subject = isKannada
        ? 'ದೂರಿನ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳು)'
        : 'Please enter a brief subject title (min 4 characters)';
    }

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = isKannada
        ? 'ದೂರಿನ ವಿವರವಾದ ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳು)'
        : 'Please provide detailed description of the issue (min 20 characters)';
    }

    if (!formData.district) {
      newErrors.district = isKannada ? 'ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' : 'Please select your Karnataka district';
    }

    if (!formData.taluk || formData.taluk.trim().length < 2) {
      newErrors.taluk = isKannada ? 'ತಾಲೂಕಿನ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your Taluk name';
    }

    if (!formData.villagePanchayat || formData.villagePanchayat.trim().length < 2) {
      newErrors.villagePanchayat = isKannada ? 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಥವಾ ಗ್ರಾಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your Gram Panchayat or Village name';
    }

    if (!formData.complainantName || formData.complainantName.trim().length < 3) {
      newErrors.complainantName = isKannada ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your full name';
    }

    if (!formData.contactPhone || !/^[6-9]\d{9}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = isKannada
        ? 'ಮಾನ್ಯ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
        : 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleDeleteDraft = async () => {
    const confirmMsg = isKannada
      ? 'ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿರುವ ದೂರಿನ ಡ್ರಾಫ್ಟ್ ವಿವರಗಳನ್ನು ಅಳಿಸಬೇಕೇ?'
      : 'Delete this saved grievance draft from this device? All entered information will be cleared.';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteGrievanceDraft();
      setFormData({
        category: '',
        subject: '',
        description: '',
        district: '',
        taluk: '',
        villagePanchayat: '',
        habitation: '',
        complainantName: '',
        contactPhone: '',
        priorRefNumber: '',
        localAttachments: []
      });
      setHasStoredDraft(false);
      setLastSaved(null);
      setSaveStatus('idle');
      setIsRestored(false);
      setErrors({});
    } catch (err) {
      alert('Failed to delete grievance draft: ' + err.message);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="grievance-page" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', color: 'var(--gov-blue-dark)' }}>
          {isKannada ? 'ನಾಗರಿಕ ದೂರು ಸಲ್ಲಿಕೆ (ಜನಸ್ಪಂದನ)' : 'File a Citizen Grievance (Janaspandana)'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {isKannada
            ? 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು, ಕುಡಿಯುವ ನೀರು, ಪಡಿತರ ವಿತರಣೆ ವಿಳಂಬ ಅಥವಾ ರಸ್ತೆ ಕಾಮಗಾರಿಗಳ ಕುರಿತು ಆಫ್‌ಲೈನ್ ದೂರು ನಮೂನೆ.'
            : 'Prepare civic complaints regarding local water shortages, ration irregularities, or welfare pension holdups even under zero connectivity.'}
        </p>
      </div>

      {/* Official Status Notice & Limitation */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7',
        borderLeft: '4px solid #f59e0b',
        padding: '12px 16px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: '#92400e',
        lineHeight: '1.5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '4px' }}>
          <AlertTriangle size={18} color="#d97706" />
          <span>Local Draft Prototype — Official Janaspandana Integration Pending</span>
        </div>
        <div>
          This grievance interface saves your complaint locally in browser <strong>IndexedDB</strong> so your inputs remain safe during network drops. <em>The backend server API for official submission to the Janaspandana government server is pending implementation. No official government acknowledgment number or departmental delivery is claimed in this draft state.</em>
        </div>
      </div>

      {/* Restoration Banner */}
      {isRestored && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#166534',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={15} color="#16a34a" />
          <span>
            Saved grievance draft restored from device storage (Last updated: {formatTimestamp(lastSaved)})
          </span>
        </div>
      )}

      {/* Auto-Save Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-body)',
        borderRadius: '4px',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, color: 'var(--text-subtle)' }}>
            {saveStatus === 'saving' && 'Saving draft to local storage...'}
            {saveStatus === 'saved' && `Draft saved locally (Updated: ${formatTimestamp(lastSaved)})`}
            {saveStatus === 'unsaved' && 'Unsaved edits (auto-saving...)'}
            {saveStatus === 'error' && `Storage error: ${errorMessage}`}
            {saveStatus === 'idle' && 'Ready — edits save automatically to browser storage'}
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

      {/* Mode Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setViewMode('edit')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: viewMode === 'edit' ? '3px solid var(--gov-blue-primary)' : '3px solid transparent',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: viewMode === 'edit' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Edit3 size={15} />
          <span>1. Fill Grievance Details</span>
        </button>

        <button
          type="button"
          onClick={handleReviewClick}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: viewMode === 'review' ? '3px solid var(--gov-blue-primary)' : '3px solid transparent',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: viewMode === 'review' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Eye size={15} />
          <span>2. Review Summary</span>
        </button>
      </div>

      {/* MODE 1: EDIT FORM */}
      {viewMode === 'edit' && (
        <form onSubmit={handleReviewClick} className="card" style={{ padding: '24px' }}>
          {/* Section 1: Grievance Classification */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '14px' }}>
              1. Grievance Classification & Subject
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Grievance Category <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '4px',
                    border: errors.category ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Select Grievance Category --</option>
                  {grievanceCategories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                    {errors.category}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Subject / Summary of Issue <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Village drinking water borewell pump broken for 2 weeks"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '4px',
                    border: errors.subject ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }}
                />
                {errors.subject && (
                  <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                    {errors.subject}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                Detailed Description of Grievance <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Explain the specific issue, how long it has persisted, which public facility or department is involved, and what action is required..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  borderRadius: '4px',
                  border: errors.description ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Minimum 20 characters required. Current: {formData.description.trim().length} chars.
              </span>
              {errors.description && (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '14px' }}>
              2. Incident / Facility Location
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  District <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.district}
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
                  Taluk <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hunsur"
                  value={formData.taluk}
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
                  Gram Panchayat / Village <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maraluru GP"
                  value={formData.villagePanchayat}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                Habitation / Specific Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Government Primary School / Ward 2 Tank"
                value={formData.habitation}
                onChange={(e) => handleChange('habitation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Section 3: Complainant Details */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '14px' }}>
              3. Complainant Identification & Contact
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Complainant Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basavaraju M"
                  value={formData.complainantName}
                  onChange={(e) => handleChange('complainantName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '4px',
                    border: errors.complainantName ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }}
                />
                {errors.complainantName && (
                  <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px', display: 'block' }}>
                    {errors.complainantName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Contact Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Prior Complaint Reference No. (If Repeating)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JS/2026/8941"
                  value={formData.priorRefNumber}
                  onChange={(e) => handleChange('priorRefNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Evidence Photo Selector */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gov-blue-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '10px' }}>
              4. Evidence / Site Photograph (Local Reference)
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Select photo evidence to hold on this device for offline review:
            </p>

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
              <span>Attach Site Photo (Local)</span>
              <input
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </label>

            {Array.isArray(formData.localAttachments) && formData.localAttachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
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

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
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
                <span>Review Grievance Summary</span>
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
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Draft</span>
                </button>
              )}
            </div>

            <Link to="/tracking" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
              View in Tracking Tab →
            </Link>
          </div>
        </form>
      )}

      {/* MODE 2: REVIEW SUMMARY */}
      {viewMode === 'review' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="var(--gov-blue-primary)" />
            <span>Grievance Application Summary Review</span>
          </h3>

          <div style={{ backgroundColor: 'var(--bg-body)', padding: '16px', borderRadius: '6px', marginBottom: '18px', fontSize: '0.84rem', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Category:</strong> {grievanceCategories.find((c) => c.value === formData.category)?.label || formData.category}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Subject:</strong> {formData.subject}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Description:</strong> {formData.description}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
              <div><strong>District:</strong> {formData.district}</div>
              <div><strong>Taluk:</strong> {formData.taluk}</div>
              <div><strong>Panchayat:</strong> {formData.villagePanchayat}</div>
              {formData.habitation && <div><strong>Landmark:</strong> {formData.habitation}</div>}
              <div><strong>Complainant:</strong> {formData.complainantName}</div>
              <div><strong>Phone:</strong> {formData.contactPhone}</div>
              {formData.priorRefNumber && <div><strong>Prior Ref:</strong> {formData.priorRefNumber}</div>}
            </div>
          </div>

          {/* Submission Notice & Emergency Toll-Free Alternative */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '12px 14px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#1e40af',
            marginBottom: '20px'
          }}>
            <strong>Direct Emergency Telephone Redressal:</strong> If internet connectivity is down and urgent civic action is required, rural citizens can call the toll-free Janaspandana helpline directly at <strong>1902</strong> or Sakala helpline at <strong>080-44554455</strong>.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
              className="btn btn-primary"
              onClick={(e) => {
                handleManualSave(e);
                alert(isKannada ? 'ದೂರಿನ ಡ್ರಾಫ್ಟ್ ಸ್ಥಳೀಯವಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!' : 'Grievance draft successfully preserved on this device!');
              }}
              style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>Confirm & Save Local Draft</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
