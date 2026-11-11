import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { listApplicationsApi, updateApplicationStatusApi } from '../api/applications';
import { listGrievancesApi, updateGrievanceStatusApi } from '../api/grievances';
import {
  Building2,
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  FileText,
  Shield,
  Send,
  Calendar,
  UserCheck,
  RefreshCw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function OfficialPortalPage() {
  const { currentUser, logout } = useAuth();
  const { isKannada } = useLanguage();
  const navigate = useNavigate();

  // Active desk tab: 'applications' | 'grievances'
  const [activeDeskTab, setActiveDeskTab] = useState('applications');

  // Filter state
  const [filterDept, setFilterDept] = useState('All Departments');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Live database data
  const [applications, setApplications] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scrutiny Inspection Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [officialRemarks, setOfficialRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState(null);

  // Load live applications and grievances from PostgreSQL
  const loadOfficialQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appRes, grvRes] = await Promise.all([
        listApplicationsApi({ limit: 100 }),
        listGrievancesApi({ limit: 100 })
      ]);

      if (appRes.success && Array.isArray(appRes.data)) {
        setApplications(appRes.data);
      }
      if (grvRes.success && Array.isArray(grvRes.data)) {
        setGrievances(grvRes.data);
      }
    } catch (err) {
      setError('Unable to load departmental queues from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOfficialQueue();
  }, [loadOfficialQueue]);

  const handleLogout = () => {
    logout();
    navigate('/login/official');
  };

  // Filter applications by status and search query
  const filteredApps = applications.filter((app) => {
    if (filterStatus !== 'All' && app.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.id?.toLowerCase().includes(q) ||
        (app.applicant_name && app.applicant_name.toLowerCase().includes(q)) ||
        (app.scheme_title && app.scheme_title.toLowerCase().includes(q)) ||
        (app.village_panchayat && app.village_panchayat.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle Official Status Transition (Direct PostgreSQL update)
  const handleTransition = async (newStatus, actionName) => {
    if (!officialRemarks.trim() && (newStatus === 'rejected' || actionName.includes('Request'))) {
      alert('Official remarks are mandatory when requesting additional information or rejecting an application.');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await updateApplicationStatusApi(selectedApp.id, {
        status: newStatus,
        remarks: officialRemarks.trim() || `Application moved to ${newStatus} by scrutiny officer.`
      });

      if (res.success) {
        setActionSuccessNotice(`Application status successfully updated to "${newStatus}" in PostgreSQL!`);
        setSelectedApp(null);
        setOfficialRemarks('');
        await loadOfficialQueue();
        setTimeout(() => setActionSuccessNotice(null), 4000);
      } else {
        throw new Error(res.error?.message || 'Server rejected status update.');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
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

  return (
    <div className="gov-page-container" style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 16px' }}>
      
      {/* Official Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(16, 47, 86, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#16834A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            fontWeight: 800
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#102F56', margin: 0 }}>
                {currentUser?.name || 'Department Scrutiny Officer'}
              </h1>
              <span style={{
                backgroundColor: '#DCFCE7',
                color: '#16834A',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700
              }}>
                Role: Government Official
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              <strong>Jurisdiction:</strong> {currentUser?.villagePanchayat || 'Taluk Office, Karnataka'} • Mobile: {currentUser?.phone || 'Authorized'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadOfficialQueue}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#EFF6FF',
              color: '#1556A0',
              borderRadius: '6px',
              border: '1px solid #BFDBFE',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animate' : ''} />
            <span>Refresh Queue</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {actionSuccessNotice && (
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Desk Tabs: Applications vs Grievances */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '20px',
        gap: '10px'
      }}>
        <button
          type="button"
          onClick={() => setActiveDeskTab('applications')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeDeskTab === 'applications' ? '3px solid #16834A' : 'none',
            fontWeight: activeDeskTab === 'applications' ? 800 : 600,
            color: activeDeskTab === 'applications' ? '#16834A' : '#64748B',
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileCheck size={17} />
          <span>Application Scrutiny Queue ({applications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeskTab('grievances')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeDeskTab === 'grievances' ? '3px solid #16834A' : 'none',
            fontWeight: activeDeskTab === 'grievances' ? 800 : 600,
            color: activeDeskTab === 'grievances' ? '#16834A' : '#64748B',
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={17} />
          <span>Janaspandana Grievance Desk ({grievances.length})</span>
        </button>
      </div>

      {/* Scrutiny Controls & Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => {
            const count = applications.filter((a) => status === 'All' || a.status?.toLowerCase() === status).length;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: filterStatus === status ? '1px solid #16834A' : '1px solid #e2e8f0',
                  backgroundColor: filterStatus === status ? '#ecfdf5' : '#ffffff',
                  color: filterStatus === status ? '#065f46' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'capitalize'
                }}
              >
                <span>{status === 'approved' ? 'Sanctioned' : status.replace('_', ' ')}</span>
                <span style={{
                  backgroundColor: filterStatus === status ? '#16834A' : '#f1f5f9',
                  color: filterStatus === status ? '#ffffff' : '#64748b',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontWeight: 700
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by ID, applicant, or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 12px 7px 32px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                minWidth: '220px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Scrutiny Queue */}
      {activeDeskTab === 'applications' ? (
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 8px' }} />
            <p>Loading application scrutiny queue...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <FileCheck size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: '#102F56' }}>
              No applications match this filter
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              Incoming citizen applications submitted online or synced via offline bridge will appear here in real-time.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Application ID</th>
                  <th style={{ padding: '12px 16px' }}>Scheme / Service</th>
                  <th style={{ padding: '12px 16px' }}>Applicant</th>
                  <th style={{ padding: '12px 16px' }}>Location</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Scrutiny Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#102F56' }}>
                      <code>{app.id?.slice(0, 8)}...</code>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#102F56' }}>{app.scheme_title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{app.scheme_department}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div><strong>{app.applicant_name || 'Citizen'}</strong></div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{app.applicant_phone || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {app.village_panchayat || 'Karnataka'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(app.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: app.status === 'approved' ? '#DCFCE7' : app.status === 'rejected' ? '#FEE2E2' : '#EFF6FF',
                        color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991B1B' : '#1E40AF',
                        textTransform: 'capitalize'
                      }}>
                        ● {app.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#1556A0',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Scrutinize →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Grievances Queue */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {grievances.map((grv) => (
            <div
              key={grv.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #D99016',
                padding: '18px',
                boxShadow: '0 2px 6px rgba(16, 47, 86, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#D99016', textTransform: 'uppercase' }}>
                  {grv.category}
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: grv.status === 'resolved' ? '#DCFCE7' : '#EFF6FF',
                  color: grv.status === 'resolved' ? '#166534' : '#1E40AF'
                }}>
                  {grv.status}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#102F56', margin: '0 0 6px 0' }}>
                {grv.description}
              </h4>

              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '6px' }}>
                Location: <strong>{grv.village_panchayat}</strong>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Complainant: {grv.complainant_name || 'Citizen'} • Phone: {grv.contact_phone || '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Scrutiny Drawer Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 47, 86, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }} role="dialog" aria-modal="true">
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(16, 47, 86, 0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1556A0', textTransform: 'uppercase' }}>
                  Desk Scrutiny Console
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#102F56', margin: '2px 0 0 0' }}>
                  {selectedApp.scheme_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: '18px',
                fontSize: '0.86rem',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '8px' }}>
                  <div><strong>Application ID:</strong> <code>{selectedApp.id}</code></div>
                  <div><strong>Submission Date:</strong> {formatTimestamp(selectedApp.created_at)}</div>
                  <div><strong>Applicant:</strong> {selectedApp.applicant_name || 'Citizen'}</div>
                  <div><strong>Phone:</strong> {selectedApp.applicant_phone || '—'}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Panchayat / Location:</strong> {selectedApp.village_panchayat}
                  </div>
                </div>

                {/* Form Data */}
                {selectedApp.form_data && Object.keys(selectedApp.form_data).length > 0 && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '10px' }}>
                    <strong>Applicant Form Data:</strong>
                    <pre style={{
                      marginTop: '6px',
                      backgroundColor: '#FFFFFF',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.78rem',
                      overflowX: 'auto'
                    }}>
                      {JSON.stringify(selectedApp.form_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Remarks Field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                  Official Scrutiny Remarks <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Record mandatory scrutiny findings, document verification details, or sanction remarks..."
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Status Decision Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleTransition('under_review', 'Moved to Under Review')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#1556A0',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.86rem'
                  }}
                >
                  Mark Under Review
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleTransition('rejected', 'Application Rejected')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.86rem'
                  }}
                >
                  Reject with Remarks
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleTransition('approved', 'Application Sanctioned')}
                  style={{
                    flex: 1.2,
                    padding: '10px',
                    backgroundColor: '#16834A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.86rem'
                  }}
                >
                  Sanction & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
