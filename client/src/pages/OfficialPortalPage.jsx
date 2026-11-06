import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  UserCheck
} from 'lucide-react';

// Representative Department Scrutiny Applications (for Desk Scrutiny Demonstration)
const INITIAL_APPLICATIONS = [
  {
    id: 'KAR-2026-AGRI-8821',
    schemeId: 'krishi-samruddhi',
    schemeTitle: 'Krishi Samruddhi Yojana (ಕೃಷಿ ಸಮೃದ್ಧಿ ಯೋಜನೆ)',
    department: 'Department of Agriculture',
    applicantName: 'Basavaraju M.',
    applicantPhone: '98451-XXXXX',
    district: 'Mysuru',
    taluk: 'Hunsur',
    submittedAt: '2026-10-12T10:30:00Z',
    status: 'Submitted',
    cropType: 'Ragi & Pulses',
    landHolding: '2.4 Acres (Marginal Farmer)',
    declaredAnnualIncome: '₹75,000',
    documents: [
      { name: 'RTC / Pahani Land Record', verified: true, docRef: 'RTC-2026-HUN-901' },
      { name: 'Aadhaar Card (Seeded)', verified: true, docRef: 'UID-XXXX-XXXX-4412' },
      { name: 'Small/Marginal Farmer Certificate', verified: false, docRef: 'Pending physical stamp' }
    ],
    history: [
      { timestamp: '2026-10-12T10:30:00Z', actor: 'Citizen (Online)', action: 'Application Submitted', remarks: 'Self-declaration and land documents uploaded.' }
    ]
  },
  {
    id: 'KAR-2026-AGRI-9104',
    schemeId: 'pm-kusum-b',
    schemeTitle: 'PM-KUSUM Component B — Solar Irrigation Pumps',
    department: 'Department of Agriculture',
    applicantName: 'Kaveramma Chennappa',
    applicantPhone: '94480-XXXXX',
    district: 'Mandya',
    taluk: 'Pandavapura',
    submittedAt: '2026-10-09T14:15:00Z',
    status: 'Under Review',
    cropType: 'Sugarcane & Paddy',
    landHolding: '4.1 Acres',
    declaredAnnualIncome: '₹1,20,000',
    documents: [
      { name: 'RTC / Pahani Land Record', verified: true, docRef: 'RTC-2026-PAN-331' },
      { name: 'Borewell Yield Certificate', verified: true, docRef: 'GW-2026-4421' },
      { name: 'Electricity Utility Non-Connection Certificate', verified: true, docRef: 'CESC-NOC-99' }
    ],
    history: [
      { timestamp: '2026-10-09T14:15:00Z', actor: 'Citizen (Online)', action: 'Application Submitted', remarks: 'Uploaded borewell survey and NOC.' },
      { timestamp: '2026-10-11T11:00:00Z', actor: 'KAR-OFF-001 (Scrutiny Officer)', action: 'Moved to Under Review', remarks: 'Awaiting site inspection from Junior Engineer.' }
    ]
  },
  {
    id: 'KAR-2026-ENRG-4019',
    schemeId: 'gruha-jyothi',
    schemeTitle: 'Gruha Jyothi Scheme (ಗೃಹ ಜ್ಯೋತಿ ಯೋಜನೆ)',
    department: 'Department of Energy (Bescom/Cesc/Hescom/Gescom/Mescom)',
    applicantName: 'Shivarudraiah B.',
    applicantPhone: '97401-XXXXX',
    district: 'Hassan',
    taluk: 'Channarayapatna',
    submittedAt: '2026-10-05T09:00:00Z',
    status: 'Approved',
    cropType: 'N/A (Domestic Consumer)',
    landHolding: 'Residential (Account ID: CESC-7741029)',
    declaredAnnualIncome: '₹95,000',
    documents: [
      { name: 'Electricity Consumer Bill (Recent)', verified: true, docRef: 'CESC-2026-SEP-BILL' },
      { name: 'Aadhaar Card Linked to RR Number', verified: true, docRef: 'UID-XXXX-XXXX-8821' }
    ],
    history: [
      { timestamp: '2026-10-05T09:00:00Z', actor: 'Citizen (Online)', action: 'Application Submitted', remarks: 'Linked RR Number with Consumer Aadhaar.' },
      { timestamp: '2026-10-06T15:30:00Z', actor: 'KAR-OFF-088 (CESC Officer)', action: 'Moved to Under Review', remarks: 'Verified 12-month historical consumption average (78 units).' },
      { timestamp: '2026-10-07T12:00:00Z', actor: 'KAR-OFF-088 (CESC Officer)', action: 'Application Sanctioned', remarks: 'Sanction Order: GJ/2026/HAS/4412. Zero-bill benefit active.' }
    ]
  },
  {
    id: 'KAR-2026-WCD-1192',
    schemeId: 'gruha-lakshmi',
    schemeTitle: 'Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ)',
    department: 'Department of Women and Child Development',
    applicantName: 'Parvathamma W/o Mahadevappa',
    applicantPhone: '99002-XXXXX',
    district: 'Mysuru',
    taluk: 'Nanjangud',
    submittedAt: '2026-10-14T16:20:00Z',
    status: 'Submitted',
    cropType: 'N/A (Woman Head of Family)',
    landHolding: 'BPL Ration Card Holder',
    declaredAnnualIncome: '₹60,000',
    documents: [
      { name: 'Antyodaya / BPL Ration Card', verified: true, docRef: 'RC-BPL-2026-NAN-09' },
      { name: 'Bank Passbook (Aadhaar Seeded)', verified: true, docRef: 'KGB-AC-889102' }
    ],
    history: [
      { timestamp: '2026-10-14T16:20:00Z', actor: 'Citizen (Grama One Desk)', action: 'Application Submitted', remarks: 'Applied via Grama One center with BPL card.' }
    ]
  }
];

export default function OfficialPortalPage() {
  const { currentUser, logout } = useAuth();
  const { isKannada } = useLanguage();
  const navigate = useNavigate();

  // Active department filter: defaults to logged in officer's assigned department
  const [filterDept, setFilterDept] = useState(currentUser?.department || 'Department of Agriculture');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  // Inspection Drawer Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [officialRemarks, setOfficialRemarks] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login/official');
  };

  // Filter applications by assigned department, status, and search query
  const filteredApps = applications.filter((app) => {
    // If not viewing "All Departments", match assigned department
    if (filterDept !== 'All Departments' && app.department !== filterDept) {
      return false;
    }
    // Filter by status tab
    if (filterStatus !== 'All' && app.status !== filterStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.id.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.schemeTitle.toLowerCase().includes(q) ||
        app.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Official Workflow Status Transitions (Prototype Scrutiny UI)
  const handleTransition = (newStatus, actionName) => {
    if (!officialRemarks.trim() && (newStatus === 'Rejected' || actionName.includes('Request'))) {
      alert('Official remarks are mandatory when requesting information or rejecting an application.');
      return;
    }

    const updatedApp = {
      ...selectedApp,
      status: newStatus,
      history: [
        ...selectedApp.history,
        {
          timestamp: new Date().toISOString(),
          actor: `${currentUser?.staffId || 'KAR-OFF-001'} (${currentUser?.name || 'Scrutiny Officer'})`,
          action: actionName,
          remarks: officialRemarks.trim() || `Application moved to ${newStatus} by scrutiny officer.`
        }
      ]
    };

    setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? updatedApp : a)));
    setSelectedApp(updatedApp);
    setOfficialRemarks('');
    setActionSuccessNotice(`Status updated to "${newStatus}". Note: Real server status persistence requires backend token authentication.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  return (
    <div className="gov-page-container" style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
      
      {/* Official Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
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
            color: '#059669',
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
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {currentUser?.name || 'Department Scrutiny Officer'}
              </h1>
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Staff ID: {currentUser?.staffId || 'KAR-AGRI-104'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              <strong>Assigned Department:</strong> {currentUser?.department || 'Department of Agriculture'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

      {/* Honest Prototype Notice */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7',
        borderLeft: '4px solid #f59e0b',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: '#92400e',
        lineHeight: 1.5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
          <AlertCircle size={16} /> Official Desk Scrutiny UI — Lifecycle & Verification Prototype
        </div>
        This console demonstrates the 4-stage government scrutiny workflow: <code>Submitted → Under Review → Approved / Rejected</code>. Status updates and remarks update the active session desk state. Live database commits will be authorized via server-side token authentication once the official review endpoint (<code>/api/official/applications/:id/status</code>) is deployed.
      </div>

      {/* Scrutiny Controls & Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
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
          {['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'].map((status) => {
            const count = applications.filter(a => {
              const deptMatch = filterDept === 'All Departments' || a.department === filterDept;
              return deptMatch && (status === 'All' || a.status === status);
            }).length;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: filterStatus === status ? '1px solid #059669' : '1px solid #e2e8f0',
                  backgroundColor: filterStatus === status ? '#ecfdf5' : '#ffffff',
                  color: filterStatus === status ? '#065f46' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{status === 'Approved' ? 'Sanctioned' : status}</span>
                <span style={{
                  backgroundColor: filterStatus === status ? '#059669' : '#f1f5f9',
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

        {/* Department Switcher & Search */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="Department of Agriculture">Dept: Agriculture</option>
            <option value="Department of Energy (Bescom/Cesc/Hescom/Gescom/Mescom)">Dept: Energy</option>
            <option value="Department of Women and Child Development">Dept: Women & Child Dev</option>
            <option value="All Departments">All Departments (Jurisdiction View)</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Ref ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 30px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                width: '180px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Applications Scrutiny Queue Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: '28px'
      }}>
        {filteredApps.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <FileCheck size={36} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No applications matching the selected criteria</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Check filter parameters or switch department view.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Application Ref</th>
                <th style={{ padding: '12px 16px' }}>Scheme Title</th>
                <th style={{ padding: '12px 16px' }}>Applicant & Location</th>
                <th style={{ padding: '12px 16px' }}>Date Submitted</th>
                <th style={{ padding: '12px 16px' }}>Current Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Scrutiny Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                let badgeStyle = { backgroundColor: '#f1f5f9', color: '#475569' };
                if (app.status === 'Submitted') badgeStyle = { backgroundColor: '#eff6ff', color: '#1d4ed8' };
                else if (app.status === 'Under Review') badgeStyle = { backgroundColor: '#fffbeb', color: '#b45309' };
                else if (app.status === 'Approved') badgeStyle = { backgroundColor: '#ecfdf5', color: '#047857' };
                else if (app.status === 'Rejected') badgeStyle = { backgroundColor: '#fef2f2', color: '#b91c1c' };

                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {app.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ display: 'block', color: '#1e293b' }}>{app.schemeTitle}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.department}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{app.applicantName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.taluk}, {app.district}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        ...badgeStyle,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {app.status === 'Approved' ? 'Sanctioned' : app.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} /> Scrutinize
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SCRUTINY INSPECTION DRAWER / MODAL */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                  Desk Scrutiny Dossier
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', color: '#0f172a' }}>
                  {selectedApp.id} — {selectedApp.applicantName}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedApp(null)}
                aria-label="Close scrutiny drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {actionSuccessNotice && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  color: '#065f46',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} /> {actionSuccessNotice}
                </div>
              )}

              {/* Status Banner */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Application Lifecycle Stage</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedApp.status === 'Approved' ? 'Sanctioned / Approved' : selectedApp.status}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Submitted: {new Date(selectedApp.submittedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Applicant & Criteria Declarations */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Applicant Declared Information
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  <div><strong>Applicant:</strong> {selectedApp.applicantName}</div>
                  <div><strong>Contact:</strong> {selectedApp.applicantPhone}</div>
                  <div><strong>District:</strong> {selectedApp.district}</div>
                  <div><strong>Taluk / Panchayat:</strong> {selectedApp.taluk}</div>
                  <div><strong>Holding / Category:</strong> {selectedApp.landHolding}</div>
                  <div><strong>Declared Income:</strong> {selectedApp.declaredAnnualIncome}</div>
                  {selectedApp.cropType && <div><strong>Cultivation / Crops:</strong> {selectedApp.cropType}</div>}
                </div>
              </div>

              {/* Documents Scrutiny Checklist */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Supporting Documents Checklist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedApp.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#64748b" />
                        <div>
                          <strong>{doc.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b' }}>
                            Ref: {doc.docRef}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: doc.verified ? '#059669' : '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {doc.verified ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {doc.verified ? 'Verified Document' : 'Pending Physical Verification'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Audit Trail */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Audit Trail & Status Progression
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #e2e8f0', paddingLeft: '12px' }}>
                  {selectedApp.history.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a' }}>
                        <span>{h.action}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                          • {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669' }}>Actor: {h.actor}</div>
                      <div style={{ color: '#64748b', marginTop: '2px' }}>Remarks: "{h.remarks}"</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Scrutiny Action Desk */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={18} /> Official Action & Scrutiny Remarks
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#15803d' }}>
                  Enter official findings, verification remarks, or deficiency queries below before updating status:
                </p>

                <textarea
                  rows={3}
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  placeholder="Enter scrutiny remarks, e.g.: 'Land survey report matched RTC. Field inspection verified irrigation requirement.'"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                    fontSize: '0.85rem',
                    marginBottom: '12px'
                  }}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedApp.status === 'Submitted' && (
                    <button
                      type="button"
                      onClick={() => handleTransition('Under Review', 'Initiated Desk Scrutiny')}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Move to Under Review
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleTransition('Under Review', 'Clarification Requested')}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Request Documents / Info
                  </button>

                  {selectedApp.status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => handleTransition('Approved', 'Sanctioned Scheme Benefit')}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Sanction / Approve Scheme
                    </button>
                  )}

                  {selectedApp.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => handleTransition('Rejected', 'Application Rejected')}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
