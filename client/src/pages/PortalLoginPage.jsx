import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Building2,
  ShieldCheck,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const DEPARTMENTS = [
  'Department of Agriculture',
  'Department of Energy (Bescom/Cesc/Hescom/Gescom/Mescom)',
  'Department of Women and Child Development',
  'Department of Food, Civil Supplies & Consumer Affairs',
  'Department of Revenue',
  'Department of Social Welfare',
  'Rajiv Gandhi Housing Corporation / Housing Department'
];

export default function PortalLoginPage() {
  const { role: routeRole } = useParams();
  const navigate = useNavigate();
  const { loginCitizen, loginOfficial, loginAdmin, currentUser } = useAuth();
  const { isKannada } = useLanguage();

  // Normalize selected role tab from URL param: 'user' -> 'citizen'
  const initialRole = routeRole === 'official' ? 'official' : routeRole === 'admin' ? 'admin' : 'citizen';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  useEffect(() => {
    if (routeRole === 'official') setSelectedRole('official');
    else if (routeRole === 'admin') setSelectedRole('admin');
    else if (routeRole === 'user' || routeRole === 'citizen') setSelectedRole('citizen');
  }, [routeRole]);

  // Citizen form state
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenPanchayat, setCitizenPanchayat] = useState('');

  // Official form state
  const [staffId, setStaffId] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');

  // Handle Citizen login
  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    loginCitizen({
      fullName: citizenName || 'Rural Citizen',
      phone: citizenPhone,
      villagePanchayat: citizenPanchayat || 'Rural Panchayat'
    });
    navigate('/portal/citizen');
  };

  // Handle Official login
  const handleOfficialSubmit = (e) => {
    e.preventDefault();
    loginOfficial({
      staffId: staffId || 'KAR-AGRI-042',
      department: department,
      officerName: officerName || 'Assistant Agricultural Officer'
    });
    navigate('/portal/official');
  };

  // Handle Admin login
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    loginAdmin({
      username: adminUsername || 'Governance Administrator'
    });
    navigate('/portal/admin');
  };

  return (
    <div className="gov-page-container" style={{ maxWidth: '900px', margin: '30px auto', padding: '0 16px' }}>
      {/* Portal Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          backgroundColor: '#eff6ff',
          borderRadius: '999px',
          color: 'var(--gov-blue-primary, #0284c7)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '10px'
        }}>
          <ShieldCheck size={16} /> ArivuNet Role-Based Access Framework
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gov-blue-dark, #0f172a)', margin: '0 0 8px 0' }}>
          {isKannada ? 'ಪೋರ್ಟಲ್ ಲಾಗಿನ್ ಮತ್ತು ಪ್ರವೇಶ' : 'Portal Sign In & Role Selection'}
        </h1>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          {isKannada
            ? 'ನಾಗರಿಕರು, ಪರಿಶೀಲನಾ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ವ್ಯವಸ್ಥಾ ನಿರ್ವಾಹಕರಿಗೆ ಪ್ರತ್ಯೇಕ ಕೆಲಸದ ಸ್ಥಳಗಳನ್ನು ಒದಗಿಸಲಾಗಿದೆ.'
            : 'Select your operational role below. ArivuNet establishes clear separation between public citizens, departmental scrutiny officers, and administrators.'}
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        {/* Tab 1: Citizen */}
        <button
          type="button"
          onClick={() => {
            setSelectedRole('citizen');
            navigate('/login/user');
          }}
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: selectedRole === 'citizen' ? '2px solid var(--gov-blue-primary, #0284c7)' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'citizen' ? '#f0f9ff' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'citizen' ? 'var(--gov-blue-primary, #0284c7)' : '#f1f5f9',
              color: selectedRole === 'citizen' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>
                {isKannada ? 'ನಾಗರಿಕ ಪ್ರವೇಶ' : 'Citizen / User'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Public Service Portal</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            Personalized scheme discovery, offline drafts, and grievance submission.
          </p>
        </button>

        {/* Tab 2: Government Official */}
        <button
          type="button"
          onClick={() => {
            setSelectedRole('official');
            navigate('/login/official');
          }}
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: selectedRole === 'official' ? '2px solid #059669' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'official' ? '#ecfdf5' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'official' ? '#059669' : '#f1f5f9',
              color: selectedRole === 'official' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>
                {isKannada ? 'ಇಲಾಖಾ ಅಧಿಕಾರಿ' : 'Government Official'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Desk Scrutiny & Review</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            Review submitted forms, verify declarations, and manage department status workflows.
          </p>
        </button>

        {/* Tab 3: Administrator */}
        <button
          type="button"
          onClick={() => {
            setSelectedRole('admin');
            navigate('/login/admin');
          }}
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: selectedRole === 'admin' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'admin' ? '#f5f3ff' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'admin' ? '#7c3aed' : '#f1f5f9',
              color: selectedRole === 'admin' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>
                {isKannada ? 'ವ್ಯವಸ್ಥಾ ನಿರ್ವಾಹಕ' : 'Administrator'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Governance & Audit</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            Scheme metadata governance, system health metrics, and audit log inspection.
          </p>
        </button>
      </div>

      {/* Login Card for Selected Role */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '28px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        {/* ROLE 1: CITIZEN */}
        {selectedRole === 'citizen' && (
          <form onSubmit={handleCitizenSubmit}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={22} color="var(--gov-blue-primary, #0284c7)" />
                {isKannada ? 'ನಾಗರಿಕ ಸೇವಾ ಪ್ರವೇಶ' : 'Citizen / Public User Sign In'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {isKannada
                  ? 'ಯಾವುದೇ ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಆಫ್‌ಲೈನ್ ಕರಡುಗಳು ಮತ್ತು ಶಿಫಾರಸುಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
                  : 'No account password required for public scheme discovery. Enter your basic details to personalize your portal workspace and manage saved drafts on this device.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Full Name (ಪೂರ್ಣ ಹೆಸರು) <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Gowda"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mobile Number (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ) <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9845012345"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Gram Panchayat / Taluk (ಗ್ರಾಮ ಪಂಚಾಯತಿ / ತಾಲೂಕು)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bilikere Gram Panchayat, Hunsur Taluk"
                  value={citizenPanchayat}
                  onChange={(e) => setCitizenPanchayat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#059669' }}>
                <CheckCircle2 size={16} /> Local device storage active (IndexedDB)
              </div>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: 'var(--gov-blue-primary, #0284c7)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Continue to Citizen Portal</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ROLE 2: OFFICIAL */}
        {selectedRole === 'official' && (
          <form onSubmit={handleOfficialSubmit}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={22} color="#059669" />
                {isKannada ? 'ಸರ್ಕಾರಿ ಅಧಿಕಾರಿ ಪರಿಶೀಲನಾ ಲಾಗಿನ್' : 'Government Official Scrutiny Portal Sign In'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {isKannada
                  ? 'ಇಲಾಖಾ ಅರ್ಜಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ಸಿಬ್ಬಂದಿ ಗುರುತು ಮತ್ತು ಇಲಾಖೆಯನ್ನು ನಮೂದಿಸಿ.'
                  : 'For authorized department personnel conducting application desk scrutiny, verification, and remarks entry.'}
              </p>
            </div>

            {/* Prototype Security Notice */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderLeft: '4px solid #f59e0b',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: '#92400e',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                <AlertCircle size={15} /> Backend Authentication Notice
              </div>
              Official server-side token authentication (`/api/auth/official`) is currently pending deployment. This established session activates the official desk scrutiny interface for workflow demonstration and department-specific review.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Official Staff ID (ಸಿಬ್ಬಂದಿ ಸಂಖ್ಯೆ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KAR-AGRI-104"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Officer Name (ಅಧಿಕಾರಿಯ ಹೆಸರು) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Lakshmi Bai, Scrutiny Officer"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Assigned Government Department (ನಿಯೋಜಿತ ಇಲಾಖೆ) *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  The scrutiny desk will display applications specifically routed to this department.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <Lock size={15} /> Departmental audit trail active
              </div>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Access Department Scrutiny Desk</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ROLE 3: ADMIN */}
        {selectedRole === 'admin' && (
          <form onSubmit={handleAdminSubmit}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#7c3aed" />
                {isKannada ? 'ವ್ಯವಸ್ಥಾ ನಿರ್ವಾಹಕ ಲಾಗಿನ್' : 'Platform Administrator Sign In'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {isKannada
                  ? 'ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಪರಿಶೀಲನೆ, ಸಿಸ್ಟಂ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್‌ಗಳನ್ನು ನೋಡಲು ಪ್ರವೇಶಿಸಿ.'
                  : 'For platform governance, verified scheme catalogue maintenance, and system health oversight.'}
              </p>
            </div>

            {/* Prototype Security Notice */}
            <div style={{
              backgroundColor: '#faf5ff',
              border: '1px solid #f3e8ff',
              borderLeft: '4px solid #7c3aed',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: '#581c87',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                <Info size={15} /> Safe Administration Console
              </div>
              Database credentials and unrestricted SQL controls are strictly prohibited in the client UI. Administrative actions display verified catalogue metadata and server health metrics.
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Administrator Username / Email *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin.governance@arivunet.internal"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <Lock size={15} /> Role-Based Access Control (RBAC)
              </div>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Access Administrator Portal</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Architecture Footnote */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px 20px',
        fontSize: '0.82rem',
        color: '#64748b',
        lineHeight: 1.55
      }}>
        <strong style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>
          ArivuNet Information Security & Integrity Principles:
        </strong>
        No user passwords or private tokens are stored in the browser's persistent storage. Client-side route isolation separates citizen, scrutiny, and administrative views. Real-world transactional sanctioning will require signed JWT tokens validated against Neon PostgreSQL once backend authentication endpoints are deployed.
      </div>
    </div>
  );
}
