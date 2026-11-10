import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  getAllDrafts,
  deleteDraft,
  getBookmarkedSchemeIds,
  toggleSchemeBookmark
} from '../offline/draftStorage';
import { SCHEMES_CATALOGUE } from '../data/schemesCatalogue';
import {
  User,
  Sparkles,
  FileEdit,
  Bookmark,
  Trash2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Info,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

export default function CitizenPortalPage() {
  const { currentUser, logout } = useAuth();
  const { isKannada } = useLanguage();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [savedPreferences, setSavedPreferences] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Load drafts, bookmarks, and preferences
  const loadData = async () => {
    try {
      const allDrafts = await getAllDrafts();
      setDrafts(allDrafts || []);

      const bookmarks = getBookmarkedSchemeIds();
      setBookmarkedIds(bookmarks);

      const prefs = localStorage.getItem('arivunet_finder_preferences');
      if (prefs) {
        setSavedPreferences(JSON.parse(prefs));
      } else {
        setSavedPreferences(null);
      }
    } catch (err) {
      console.error('Error loading citizen portal data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteDraft = async (serviceId, schemeTitle) => {
    if (window.confirm(`Are you sure you want to delete your draft for "${schemeTitle}"? This will remove locally saved form data from this device.`)) {
      try {
        await deleteDraft(serviceId);
        setNoticeMessage(`Draft for "${schemeTitle}" removed from local storage.`);
        setTimeout(() => setNoticeMessage(null), 3000);
        loadData();
      } catch (err) {
        console.error('Error deleting draft:', err);
      }
    }
  };

  const handleRemoveBookmark = (schemeId) => {
    toggleSchemeBookmark(schemeId);
    setBookmarkedIds(getBookmarkedSchemeIds());
  };

  const handleClearPreferences = () => {
    localStorage.removeItem('arivunet_finder_preferences');
    setSavedPreferences(null);
    setNoticeMessage('Saved personalized questionnaire preferences cleared.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const bookmarkedSchemes = SCHEMES_CATALOGUE.filter((s) => bookmarkedIds.includes(s.id));

  return (
    <div className="gov-page-container" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 16px' }}>
      {/* Citizen Welcome Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: 'var(--gov-blue-primary, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 800
          }}>
            <User size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {currentUser?.name || 'Citizen User'}
              </h1>
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Citizen Workspace
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {currentUser?.villagePanchayat ? `${currentUser.villagePanchayat} • ` : ''}
              {currentUser?.phone ? `Mobile: ${currentUser.phone}` : 'Offline-first Public Service Access'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            to="/finder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: 'var(--gov-blue-primary, #0284c7)',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Sparkles size={16} /> Find Schemes for Me
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '12px 16px',
          borderRadius: '6px',
          color: '#1e40af',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {noticeMessage}
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* COLUMN 1: LOCAL DRAFTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileEdit size={20} color="var(--gov-blue-primary, #0284c7)" />
              <span>{isKannada ? 'ನನ್ನ ಆಫ್‌ಲೈನ್ ಕರಡುಗಳು' : 'My Local Application Drafts'}</span>
              <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '999px', color: '#475569' }}>
                {drafts.length}
              </span>
            </h2>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#64748b',
            lineHeight: 1.45,
            marginBottom: '14px'
          }}>
            <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Drafts are saved locally on your device in IndexedDB. They remain intact offline. Once official backend submission is activated, you can transmit them for departmental processing.
          </div>

          {drafts.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '32px 16px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <FileEdit size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No application drafts on this device yet</p>
              <p style={{ margin: '4px 0 16px 0', fontSize: '0.8rem' }}>Browse schemes or use the questionnaire to start preparing an application.</p>
              <Link
                to="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: 'var(--gov-blue-primary, #0284c7)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                Browse Schemes Catalogue
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {drafts.map((d) => (
                <div
                  key={d.serviceId}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {d.schemeTitle || d.serviceId}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        Last saved: {new Date(d.savedAt).toLocaleDateString()} at {new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#0284c7' }}>
                        {Object.keys(d.formData || {}).length} field(s) saved in local draft
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link
                        to={`/services?scheme=${encodeURIComponent(d.serviceId)}`}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        Resume Draft
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d.serviceId, d.schemeTitle)}
                        title="Delete local draft"
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: BOOKMARKS & PREFERENCES */}
        <div>
          {/* Section: Bookmarked Schemes */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={20} color="#f59e0b" />
              <span>{isKannada ? 'ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ಯೋಜನೆಗಳು' : 'Bookmarked Schemes'}</span>
              <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '999px', color: '#475569' }}>
                {bookmarkedSchemes.length}
              </span>
            </h2>

            {bookmarkedSchemes.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '24px 16px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Bookmark size={28} style={{ margin: '0 auto 6px auto', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No bookmarked schemes yet.</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem' }}>Click the bookmark icon on any scheme card in the catalogue to save it here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookmarkedSchemes.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                        {isKannada && s.titleKn ? s.titleKn : s.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.department}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Link
                        to={`/services?scheme=${encodeURIComponent(s.id)}`}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f1f5f9',
                          color: '#0284c7',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(s.id)}
                        title="Remove bookmark"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Saved Questionnaire Preferences */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={18} color="#0284c7" />
                <span>Personalized Criteria Preferences</span>
              </h3>
              {savedPreferences && (
                <button
                  type="button"
                  onClick={handleClearPreferences}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Clear Saved
                </button>
              )}
            </div>

            {savedPreferences ? (
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Sector:</strong> <span style={{ textTransform: 'capitalize' }}>{savedPreferences.sectorId}</span>
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Saved Answers:</strong> {Object.keys(savedPreferences.answers || {}).length} criteria recorded on this device.
                </p>
                <Link
                  to="/finder"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--gov-blue-primary, #0284c7)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  Review or Update in Scheme Finder <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                No criteria saved yet. When you run "Find Schemes for Me", you can opt to remember your broad situation for faster future discovery.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Citizen Service Hub Quick Links */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
          Additional Citizen Operations
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <Link
            to="/tracking"
            style={{
              padding: '14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: 'inherit',
              backgroundColor: '#f8fafc'
            }}
          >
            <Clock size={20} color="#0284c7" />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Track Application Status</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Requires server-confirmed application acknowledgement number.</span>
            </div>
          </Link>

          <Link
            to="/grievance"
            style={{
              padding: '14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: 'inherit',
              backgroundColor: '#f8fafc'
            }}
          >
            <AlertTriangle size={20} color="#ea580c" />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Lodge Public Grievance</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Report delayed service delivery, water supply, or ration issues.</span>
            </div>
          </Link>

          <Link
            to="/services"
            style={{
              padding: '14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: 'inherit',
              backgroundColor: '#f8fafc'
            }}
          >
            <ExternalLink size={20} color="#16a34a" />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Karnataka State Services</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>10 verified schemes covering Agriculture, Energy, Ration, and Welfare.</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
