import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Edit3,
  WifiOff,
  Shield,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Search,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { getAllDrafts, deleteDraft } from '../offline/draftStorage';
import { getCatalogueSchemeById } from '../data/schemesCatalogue';
import DraftFormModal from '../components/DraftFormModal';
import ApplicationStatusLifecycle from '../components/ApplicationStatusLifecycle';
import { getApiBaseUrl } from '../api/schemes';
import { isOnline } from '../registerServiceWorker';
import { useLanguage } from '../context/LanguageContext';

export default function TrackingPage() {
  const { isKannada, t } = useLanguage();
  const navigate = useNavigate();

  // Local drafts state
  const [drafts, setDrafts] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [draftFilter, setDraftFilter] = useState('all'); // 'all' | 'schemes' | 'grievances'
  const [viewFormat, setViewFormat] = useState('table'); // 'table' | 'cards' (inspired by SPOT portal)
  const [activeDraftService, setActiveDraftService] = useState(null);
  const [expandedDraftId, setExpandedDraftId] = useState(null);

  // Server-side official tracking state
  const [isSearchingServer, setIsSearchingServer] = useState(false);
  const [searchRefNumber, setSearchRefNumber] = useState('');
  const [searchedRecord, setSearchedRecord] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null); // { type: 'not_found' | 'not_connected' | 'offline' | 'error', message: string }
  const [serverTrackingStatus, setServerTrackingStatus] = useState('not_implemented'); // 'connected' | 'not_implemented' | 'offline'

  const loadDrafts = async () => {
    setIsLoadingDrafts(true);
    try {
      const records = await getAllDrafts();
      setDrafts(records);
    } catch (err) {
      console.warn('Failed to load drafts in TrackingPage:', err);
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (draftId, draftTitle) => {
    const confirmMsg = isKannada
      ? `"${draftTitle}" ನಮೂನೆಯ ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ ಅನ್ನು ಈ ಸಾಧನದಿಂದ ಅಳಿಸಬೇಕೇ?`
      : `Delete the local draft for "${draftTitle}" from this device?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteDraft(draftId);
      if (expandedDraftId === draftId) {
        setExpandedDraftId(null);
      }
      await loadDrafts();
    } catch (err) {
      alert('Failed to delete draft: ' + err.message);
    }
  };

  const handleEditDraft = (draft) => {
    if (draft.id === 'citizen-grievance' || draft.type === 'grievance') {
      navigate('/grievance');
    } else {
      const fullScheme = getCatalogueSchemeById(draft.serviceId) || {
        id: draft.serviceId,
        title: draft.serviceTitle,
        dept: draft.department
      };
      setActiveDraftService(fullScheme);
    }
  };

  // Official Server Tracking Lookup
  const handleServerSearch = async (e) => {
    e.preventDefault();
    const query = searchRefNumber.trim();
    if (!query) return;

    if (!isOnline()) {
      setSearchFeedback({
        type: 'offline',
        message: isKannada
          ? 'ಸಾಧನ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಅಧಿಕೃತ ಸರ್ವರ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಮಾಡಲು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕದ ಅಗತ್ಯವಿದೆ.'
          : 'Your device is currently offline. An active internet connection is required to query the government tracking server.'
      });
      setSearchedRecord(null);
      return;
    }

    setIsSearchingServer(true);
    setSearchFeedback(null);
    setSearchedRecord(null);

    try {
      const baseUrl = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${baseUrl}/api/applications/${encodeURIComponent(query)}`, {
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (!response || response.status === 404 || response.status === 501 || response.status === 503) {
        // Honest explanation: backend route is not connected in this environment
        setSearchFeedback({
          type: 'not_connected',
          message: isKannada
            ? `ಅಧಿಕೃತ ಟ್ರ್ಯಾಕಿಂಗ್ ಎಂಜಿನ್ ಇನ್ನೂ ಸಕ್ರಿಯವಾಗಿಲ್ಲ. "${query}" ಸಂಖ್ಯೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸರ್ವರ್ ಕನೆಕ್ಷನ್ ಲಭ್ಯವಿಲ್ಲ.`
            : `Official Application Tracking API is not yet connected to a production database. No verified departmental record was found for reference "${query}".`
        });
      } else if (response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (payload.success && payload.data) {
          setSearchedRecord(payload.data);
        } else {
          setSearchFeedback({
            type: 'not_found',
            message: `No application matching reference "${query}" exists on the official server.`
          });
        }
      } else {
        setSearchFeedback({
          type: 'not_connected',
          message: 'The official departmental submission and tracking server is not reachable from this client.'
        });
      }
    } catch (err) {
      setSearchFeedback({
        type: 'not_connected',
        message: 'Could not contact departmental tracking gateway: Server endpoint is not implemented in this deployment.'
      });
    } finally {
      setIsSearchingServer(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
        ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Filter drafts
  const schemeDrafts = drafts.filter((d) => d.id !== 'citizen-grievance' && d.type !== 'grievance');
  const grievanceDrafts = drafts.filter((d) => d.id === 'citizen-grievance' || d.type === 'grievance');

  const visibleDrafts = draftFilter === 'schemes'
    ? schemeDrafts
    : draftFilter === 'grievances'
    ? grievanceDrafts
    : drafts;

  return (
    <div className="tracking-page" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', color: 'var(--gov-blue-dark)' }}>
          {isKannada ? 'ನನ್ನ ಅರ್ಜಿಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಡ್ರಾಫ್ಟ್‌ಗಳು' : 'My Applications & Offline Drafts'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {isKannada
            ? 'ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರುವ ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸಲ್ಲಿಕೆ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿ.'
            : 'Review locally preserved drafts stored on this device and query authoritative server-confirmed application statuses.'}
        </p>
      </div>

      {/* =========================================================================
          AREA 1: MY LOCAL DRAFTS (IndexedDB Storage)
          ========================================================================= */}
      <section style={{ marginBottom: '36px' }} aria-labelledby="local-drafts-heading">
        {/* Section Header */}
        <div style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-light)',
          borderLeft: '4px solid var(--gov-blue-primary)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} color="var(--gov-blue-primary)" />
              <h2 id="local-drafts-heading" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-blue-dark)', margin: 0 }}>
                {isKannada ? 'ಸ್ಥಳೀಯವಾಗಿ ಸೇವ್ ಆಗಿರುವ ಡ್ರಾಫ್ಟ್‌ಗಳು (My Local Drafts)' : 'My Local Drafts (IndexedDB)'}
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: '4px 0 0 0' }}>
              {isKannada
                ? 'ಈ ಸಾಧನದ ಬ್ರೌಸರ್ ಮೆಮೊರಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿರುವ ನಮೂನೆಗಳು. ಇವು ಸ್ಥಳೀಯವಾಗಿವೆ ಮತ್ತು ಇನ್ನೂ ಇಲಾಖೆಗೆ ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ.'
                : 'Applications & grievances saved locally on this browser. These records remain on this device and are not official submissions.'}
            </p>
          </div>

          {/* Controls: Filter Pills + Table/Card View Toggle */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setDraftFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  border: draftFilter === 'all' ? '1px solid var(--gov-blue-primary)' : '1px solid var(--border-light)',
                  backgroundColor: draftFilter === 'all' ? 'var(--gov-blue-primary)' : 'var(--bg-body)',
                  color: draftFilter === 'all' ? '#ffffff' : 'var(--text-dark)',
                  cursor: 'pointer'
                }}
              >
                All ({drafts.length})
              </button>
              <button
                type="button"
                onClick={() => setDraftFilter('schemes')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  border: draftFilter === 'schemes' ? '1px solid var(--gov-blue-primary)' : '1px solid var(--border-light)',
                  backgroundColor: draftFilter === 'schemes' ? 'var(--gov-blue-primary)' : 'var(--bg-body)',
                  color: draftFilter === 'schemes' ? '#ffffff' : 'var(--text-dark)',
                  cursor: 'pointer'
                }}
              >
                Schemes ({schemeDrafts.length})
              </button>
              <button
                type="button"
                onClick={() => setDraftFilter('grievances')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  border: draftFilter === 'grievances' ? '1px solid var(--gov-blue-primary)' : '1px solid var(--border-light)',
                  backgroundColor: draftFilter === 'grievances' ? 'var(--gov-blue-primary)' : 'var(--bg-body)',
                  color: draftFilter === 'grievances' ? '#ffffff' : 'var(--text-dark)',
                  cursor: 'pointer'
                }}
              >
                Grievances ({grievanceDrafts.length})
              </button>
            </div>

            {/* View switcher: Table vs Cards (inspired by SPOT portal screenshot) */}
            <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                style={{
                  padding: '4px 8px',
                  background: viewFormat === 'table' ? 'var(--gov-blue-light)' : 'var(--bg-body)',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewFormat === 'table' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.76rem',
                  fontWeight: 600
                }}
                title="Table view (SPOT portal style)"
              >
                <TableIcon size={14} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('cards')}
                style={{
                  padding: '4px 8px',
                  background: viewFormat === 'cards' ? 'var(--gov-blue-light)' : 'var(--bg-body)',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewFormat === 'cards' ? 'var(--gov-blue-primary)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.76rem',
                  fontWeight: 600
                }}
                title="Card view"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drafts Content */}
        {isLoadingDrafts ? (
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading local drafts from browser storage...</p>
          </div>
        ) : visibleDrafts.length > 0 ? (
          <>
            {/* VIEW A: STRUCTURED TABLE VIEW (Inspired by Slovenian SPOT Portal Screenshot) */}
            {viewFormat === 'table' ? (
              <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border-medium)', color: 'var(--gov-blue-dark)' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>Local Draft ID</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>Scheme / Procedure Name</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>Applicant / Profile</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>Last Saved Date</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>Status</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDrafts.map((draft) => {
                      const isGrievance = draft.id === 'citizen-grievance' || draft.type === 'grievance';
                      const isExpanded = expandedDraftId === draft.id;
                      const applicantName = draft.formData?.applicantName || draft.formData?.complainantName || '—';
                      const locationInfo = draft.formData?.villagePanchayat
                        ? `${draft.formData.villagePanchayat}, ${draft.formData?.district || ''}`
                        : '—';

                      return (
                        <React.Fragment key={draft.id}>
                          <tr style={{
                            borderBottom: '1px solid var(--border-light)',
                            backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
                            transition: 'background 0.15s'
                          }}>
                            {/* Local ID */}
                            <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--gov-blue-dark)', fontSize: '0.8rem' }}>
                              {draft.id}
                            </td>

                            {/* Procedure / Scheme Name */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--gov-blue-dark)' }}>
                                {draft.serviceTitle}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: isGrievance ? '#b45309' : 'var(--gov-blue-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                {isGrievance ? 'Citizen Grievance' : (draft.department || 'Karnataka Welfare')}
                              </span>
                            </td>

                            {/* Applicant / Location */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600 }}>{applicantName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{locationInfo}</div>
                            </td>

                            {/* Timestamp */}
                            <td style={{ padding: '12px 14px', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                              {formatTimestamp(draft.updatedAt || draft.createdAt)}
                            </td>

                            {/* Status (Strict truth: Saved locally — not submitted) */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                              }}>
                                ● Draft (Local Only)
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedDraftId(isExpanded ? null : draft.id)}
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                                  title="Inspect Application Status Lifecycle"
                                >
                                  {isExpanded ? 'Hide Lifecycle' : 'Lifecycle'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditDraft(draft)}
                                  className="btn btn-primary"
                                  style={{ fontSize: '0.76rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Edit3 size={13} />
                                  <span>Resume</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(draft.id, draft.serviceTitle)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid #fecaca',
                                    color: '#b91c1c',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.76rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete draft"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded row: Shows ApplicationStatusLifecycle for this draft */}
                          {isExpanded && (
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-medium)' }}>
                              <td colSpan={6} style={{ padding: '14px 20px' }}>
                                <ApplicationStatusLifecycle
                                  currentStatus="draft"
                                  timestamps={{
                                    draftSavedAt: draft.updatedAt || draft.createdAt
                                  }}
                                  isLocalOnly={true}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VIEW B: RESPONSIVE CARDS VIEW */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {visibleDrafts.map((draft) => {
                  const isGrievance = draft.id === 'citizen-grievance' || draft.type === 'grievance';
                  const isExpanded = expandedDraftId === draft.id;

                  return (
                    <div key={draft.id} className="card" style={{ display: 'flex', flexDirection: 'column', borderLeft: isGrievance ? '4px solid #f59e0b' : '4px solid var(--gov-blue-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: isGrievance ? '#b45309' : 'var(--gov-blue-primary)' }}>
                            {isGrievance ? 'Citizen Grievance' : 'Scheme Application Draft'}
                          </span>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginTop: '2px' }}>
                            {draft.serviceTitle}
                          </h3>
                        </div>

                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          whiteSpace: 'nowrap'
                        }}>
                          ● Saved locally — not submitted
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span>Local ID: <code style={{ backgroundColor: 'var(--bg-body)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, color: 'var(--gov-blue-dark)' }}>{draft.id}</code></span>
                        <span>Last updated: <strong>{formatTimestamp(draft.updatedAt || draft.createdAt)}</strong></span>
                      </div>

                      <div style={{
                        backgroundColor: 'var(--bg-body)',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        lineHeight: '1.5',
                        marginBottom: '12px',
                        color: 'var(--text-dark)'
                      }}>
                        <div><strong>Applicant / Complainant:</strong> {draft.formData?.applicantName || draft.formData?.complainantName || 'Not entered yet'}</div>
                        <div><strong>Panchayat / Location:</strong> {draft.formData?.villagePanchayat || 'Not entered yet'}</div>
                        {draft.formData?.district && <div><strong>District:</strong> {draft.formData.district}</div>}
                      </div>

                      {isExpanded && (
                        <div style={{ marginBottom: '12px' }}>
                          <ApplicationStatusLifecycle
                            currentStatus="draft"
                            timestamps={{ draftSavedAt: draft.updatedAt || draft.createdAt }}
                            isLocalOnly={true}
                            compact={true}
                          />
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setExpandedDraftId(isExpanded ? null : draft.id)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                        >
                          {isExpanded ? 'Hide Lifecycle' : 'View Lifecycle'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(draft.id, draft.serviceTitle)}
                          style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleEditDraft(draft)}
                          style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Edit3 size={13} />
                          <span>Resume Draft</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '16px' }}>
            <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              No Saved Drafts on this Device
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 16px' }}>
              When you open and fill an application or grievance form, your progress is automatically saved to your browser so you never lose entered information.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/services" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Explore Services & Start a Draft</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/grievance" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                <span>File a Grievance</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          AREA 2: OFFICIAL APPLICATION TRACKING (SERVER TRACKING)
          ========================================================================= */}
      <section aria-labelledby="submitted-apps-heading">
        {/* Section Header */}
        <div style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-light)',
          borderLeft: '4px solid #16a34a',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={22} color="#16a34a" />
            <h2 id="submitted-apps-heading" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-blue-dark)', margin: 0 }}>
              {isKannada ? 'ಅಧಿಕೃತ ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ (Official Application Tracking)' : 'Official Application Tracking (Server Confirmed)'}
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0 }}>
            Query departmental review statuses, verified application reference numbers, and scrutiny officer decisions confirmed by the government backend server.
          </p>
        </div>

        {/* Lookup Search Form */}
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <form onSubmit={handleServerSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter Official Reference Number (e.g. KAR-2026-00142 or JS/2026/8941)..."
                value={searchRefNumber}
                onChange={(e) => setSearchRefNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  fontSize: '0.88rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSearchingServer || !searchRefNumber.trim()}
              style={{ fontSize: '0.85rem', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isSearchingServer ? 'spin-animation' : ''} />
              <span>{isSearchingServer ? 'Querying Server...' : 'Track Application'}</span>
            </button>
          </form>

          {/* Search Feedback / Disclaimers */}
          {searchFeedback && (
            <div style={{
              marginTop: '14px',
              padding: '12px 14px',
              backgroundColor: searchFeedback.type === 'offline' ? '#fffbeb' : '#eff6ff',
              borderLeft: searchFeedback.type === 'offline' ? '4px solid #f59e0b' : '4px solid #2563eb',
              borderRadius: '4px',
              fontSize: '0.82rem',
              color: searchFeedback.type === 'offline' ? '#92400e' : '#1e40af',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              {searchFeedback.type === 'offline' ? (
                <WifiOff size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <strong>{searchFeedback.type === 'offline' ? 'Connection Notice:' : 'Server Notice:'}</strong> {searchFeedback.message}
              </div>
            </div>
          )}
        </div>

        {/* Searched Record Display (If server returns confirmed application) */}
        {searchedRecord ? (
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #16a34a', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gov-blue-primary)', textTransform: 'uppercase' }}>
                  {searchedRecord.department || 'Karnataka Government Department'}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginTop: '2px' }}>
                  {searchedRecord.schemeTitle || searchedRecord.title}
                </h3>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Ref: <strong style={{ color: 'var(--gov-blue-dark)' }}>{searchedRecord.referenceNumber}</strong>
              </div>
            </div>

            {/* Lifecycle representation of confirmed server status */}
            <ApplicationStatusLifecycle
              currentStatus={searchedRecord.status || 'submitted'}
              referenceNumber={searchedRecord.referenceNumber}
              timestamps={{
                submittedAt: searchedRecord.submittedAt,
                underReviewAt: searchedRecord.underReviewAt,
                decisionAt: searchedRecord.decisionAt
              }}
              remarks={searchedRecord.remarks}
              isLocalOnly={false}
            />
          </div>
        ) : (
          /* Honest "Not Connected Yet" explanation when no server query has been made or backend not yet implemented */
          <div className="card" style={{ padding: '24px 20px', borderLeft: '4px solid var(--border-medium)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Shield size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '4px' }}>
                  Official Tracking Engine: Not Connected Yet
                </h4>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                  The backend server API for authoritative departmental queue tracking and officer scrutiny has not been connected to a production database yet. Once activated, verified departmental acknowledgments (e.g. <code>KAR-2026-XXXXX</code>) and real-time review status history will appear here.
                </p>

                {/* Status Lifecycle Preview illustrating the architecture */}
                <div style={{ marginTop: '12px' }}>
                  <ApplicationStatusLifecycle
                    currentStatus="draft"
                    isLocalOnly={true}
                    compact={true}
                  />
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-body)',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  marginTop: '12px'
                }}>
                  <strong>Architectural Rule:</strong> ArivuNet strictly separates offline device drafts from verified server submissions. We do not display fabricated queue positions, fake approval statuses, or mocked application numbers.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Edit Modal from Tracking Page */}
      {activeDraftService && (
        <DraftFormModal
          service={activeDraftService}
          onClose={() => setActiveDraftService(null)}
          onDraftChanged={() => loadDrafts()}
        />
      )}
    </div>
  );
}
