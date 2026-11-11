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
import { getMyApplicationsApi } from '../api/applications';
import { getMyGrievancesApi } from '../api/grievances';
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
  ArrowRight,
  Layers,
  Phone,
  MapPin,
  RefreshCw,
  Send
} from 'lucide-react';

export default function CitizenPortalPage() {
  const { currentUser, logout } = useAuth();
  const { isKannada } = useLanguage();
  const navigate = useNavigate();

  // Active view tab: 'submissions' | 'drafts' | 'bookmarks'
  const [activeTab, setActiveTab] = useState('submissions');

  const [drafts, setDrafts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [serverApps, setServerApps] = useState([]);
  const [serverGrievances, setServerGrievances] = useState([]);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Load all citizen portal data
  const loadData = async () => {
    try {
      const allDrafts = await getAllDrafts();
      setDrafts(allDrafts || []);

      const bookmarks = getBookmarkedSchemeIds();
      setBookmarkedIds(bookmarks);

      const prefs = localStorage.getItem('arivunet_finder_preferences');
      if (prefs) {
        setSavedPreferences(JSON.parse(prefs));
      }

      // Fetch live submissions from PostgreSQL
      setIsLoadingServer(true);
      const [appRes, grvRes] = await Promise.all([
        getMyApplicationsApi().catch(() => ({ success: false })),
        getMyGrievancesApi().catch(() => ({ success: false }))
      ]);

      if (appRes.success && Array.isArray(appRes.data)) {
        setServerApps(appRes.data);
      }
      if (grvRes.success && Array.isArray(grvRes.data)) {
        setServerGrievances(grvRes.data);
      }
    } catch (err) {
      console.error('Error loading citizen portal data:', err);
    } finally {
      setIsLoadingServer(false);
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

  const handleLogout = () => {
    logout();
    navigate('/');
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

  const bookmarkedSchemes = SCHEMES_CATALOGUE.filter((s) => bookmarkedIds.includes(s.id));

  return (
    <div className="gov-page-container" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 16px' }}>
      
      {/* Citizen Welcome Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(16, 47, 86, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            color: '#1556A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#102F56', margin: 0 }}>
                {currentUser?.name || 'Citizen User'}
              </h1>
              <span style={{
                backgroundColor: '#DCFCE7',
                color: '#16834A',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700
              }}>
                Verified Citizen
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              {currentUser?.villagePanchayat ? `${currentUser.villagePanchayat} • ` : ''}
              {currentUser?.phone ? `Mobile: ${currentUser.phone}` : 'Offline-first Public Service Access'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/finder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#1556A0',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Sparkles size={16} color="#FEF08A" /> Find Schemes for Me
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
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

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '24px',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'submissions' ? '3px solid #1556A0' : 'none',
            fontWeight: activeTab === 'submissions' ? 800 : 600,
            color: activeTab === 'submissions' ? '#1556A0' : '#64748B',
            cursor: 'pointer',
            fontSize: '0.94rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={17} />
          <span>Server Submissions ({serverApps.length + serverGrievances.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drafts')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'drafts' ? '3px solid #1556A0' : 'none',
            fontWeight: activeTab === 'drafts' ? 800 : 600,
            color: activeTab === 'drafts' ? '#1556A0' : '#64748B',
            cursor: 'pointer',
            fontSize: '0.94rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileEdit size={17} />
          <span>Local Device Drafts ({drafts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookmarks' ? '3px solid #1556A0' : 'none',
            fontWeight: activeTab === 'bookmarks' ? 800 : 600,
            color: activeTab === 'bookmarks' ? '#1556A0' : '#64748B',
            cursor: 'pointer',
            fontSize: '0.94rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bookmark size={17} />
          <span>Bookmarked Schemes ({bookmarkedSchemes.length})</span>
        </button>
      </div>

      {/* TAB 1: SERVER SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#102F56', margin: 0 }}>
              Official Applications & Grievances in PostgreSQL
            </h2>
            <button
              type="button"
              onClick={loadData}
              style={{
                fontSize: '0.8rem',
                color: '#1556A0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <RefreshCw size={13} className={isLoadingServer ? 'spin-animate' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>

          {isLoadingServer ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
              <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 8px' }} />
              <p>Querying verified database records...</p>
            </div>
          ) : serverApps.length === 0 && serverGrievances.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#102F56' }}>
                No Submitted Applications in Server Yet
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem' }}>
                You have not submitted an official application to the government server yet. Open any scheme draft and click "Submit to Government Server".
              </p>
              <Link
                to="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: '#1556A0',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700
                }}
              >
                Browse 1,060+ Verified Schemes
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Applications */}
              {serverApps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #16834A',
                    borderRadius: '10px',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1556A0', textTransform: 'uppercase' }}>
                      {app.scheme_department || 'Government Department'}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: app.status === 'approved' ? '#DCFCE7' : app.status === 'rejected' ? '#FEE2E2' : '#EFF6FF',
                      color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991B1B' : '#1E40AF',
                      textTransform: 'capitalize'
                    }}>
                      ● {app.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#102F56', margin: '0 0 6px 0' }}>
                    {app.scheme_title}
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                    Reference ID: <code style={{ color: '#102F56', fontWeight: 700 }}>{app.id}</code>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Submitted: {formatTimestamp(app.created_at)}</span>
                    <Link
                      to={`/tracking?ref=${encodeURIComponent(app.id)}`}
                      style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1556A0', textDecoration: 'none' }}
                    >
                      Track Progress →
                    </Link>
                  </div>
                </div>
              ))}

              {/* Grievances */}
              {serverGrievances.map((grv) => (
                <div
                  key={grv.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #D99016',
                    borderRadius: '10px',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D99016', textTransform: 'uppercase' }}>
                      Civic Grievance ({grv.category})
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: grv.status === 'resolved' ? '#DCFCE7' : '#EFF6FF',
                      color: grv.status === 'resolved' ? '#166534' : '#1E40AF',
                      textTransform: 'capitalize'
                    }}>
                      ● {grv.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#102F56', margin: '0 0 6px 0' }}>
                    {grv.description?.slice(0, 70)}...
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                    Janaspandana ID: <code style={{ color: '#102F56', fontWeight: 700 }}>{grv.id}</code>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Registered: {formatTimestamp(grv.created_at)}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {grv.village_panchayat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOCAL DEVICE DRAFTS */}
      {activeTab === 'drafts' && (
        <div>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.84rem',
            color: '#64748b',
            lineHeight: 1.45,
            marginBottom: '16px'
          }}>
            <Info size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Drafts are saved locally on this device in browser IndexedDB. They remain intact without internet. When online, click "Resume Draft" to submit them directly to the department.
          </div>

          {drafts.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <FileEdit size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#102F56' }}>
                No Application Drafts on this Device
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem' }}>
                Browse schemes or start a questionnaire to prepare offline-ready application forms.
              </p>
              <Link
                to="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: '#1556A0',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700
                }}
              >
                Browse Schemes
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {drafts.map((d) => (
                <div
                  key={d.id || d.serviceId}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(16, 47, 86, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#102F56', margin: 0 }}>
                      {d.serviceTitle || d.schemeTitle || d.serviceId}
                    </h3>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1556A0', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Draft
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '12px' }}>
                    Last saved: {formatTimestamp(d.updatedAt || d.savedAt)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(d.id || d.serviceId, d.serviceTitle)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #FECACA',
                        color: '#B91C1C',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                    <Link
                      to={`/services?search=${encodeURIComponent(d.serviceTitle || '')}`}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#1556A0',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      Resume Draft
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarkedSchemes.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Bookmark size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#102F56' }}>
                No Bookmarked Schemes Yet
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem' }}>
                Bookmark important schemes while browsing to keep them easily accessible here.
              </p>
              <Link
                to="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: '#1556A0',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700
                }}
              >
                Explore Schemes
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {bookmarkedSchemes.map((s) => (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px'
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#102F56', margin: '0 0 6px 0' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 12px 0' }}>
                    {s.department}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(s.id)}
                      style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      Remove Bookmark
                    </button>
                    <Link
                      to={`/services?search=${encodeURIComponent(s.title)}`}
                      style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1556A0', textDecoration: 'none' }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
