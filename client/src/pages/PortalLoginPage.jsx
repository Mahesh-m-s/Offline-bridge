import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Phone,
  UserPlus,
  LogIn,
  RefreshCw,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function PortalLoginPage() {
  const { role: routeRole } = useParams();
  const navigate = useNavigate();
  const { login, registerCitizen, isAuthenticated, currentUser } = useAuth();
  const { isKannada } = useLanguage();

  // Normalize selected role tab from URL param: 'user' -> 'citizen'
  const initialRole = routeRole === 'official' ? 'official' : routeRole === 'admin' ? 'admin' : 'citizen';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // For Citizen role: mode can be 'login' or 'register'
  const [citizenMode, setCitizenMode] = useState('login');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields
  const [fullName, setFullName] = useState('');
  const [villagePanchayat, setVillagePanchayat] = useState('');

  // UI feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize role tab with route
  useEffect(() => {
    if (routeRole === 'official') setSelectedRole('official');
    else if (routeRole === 'admin') setSelectedRole('admin');
    else if (routeRole === 'user' || routeRole === 'citizen') setSelectedRole('citizen');
    
    // Clear errors when switching tabs
    setErrorMessage('');
    setSuccessMessage('');
  }, [routeRole]);

  // If already authenticated and matches selected role, redirect to appropriate portal
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin') navigate('/portal/admin');
      else if (currentUser.role === 'official') navigate('/portal/official');
      else navigate('/portal/citizen');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Quick fill test credentials helper
  const handleQuickFill = (roleKey) => {
    setErrorMessage('');
    if (roleKey === 'admin') {
      setSelectedRole('admin');
      setIdentifier('9845100000');
      setPassword('Admin@123');
    } else if (roleKey === 'official') {
      setSelectedRole('official');
      setIdentifier('9845100001');
      setPassword('Official@123');
    } else if (roleKey === 'citizen') {
      setSelectedRole('citizen');
      setCitizenMode('login');
      setIdentifier('9845100003');
      setPassword('Citizen@123');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (selectedRole === 'citizen' && citizenMode === 'register') {
        // Validation for registration
        if (!fullName.trim() || fullName.trim().length < 2) {
          throw new Error(isKannada ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.' : 'Please enter your full legal name.');
        }
        if (!identifier.trim() || !/^[6-9]\d{9}$/.test(identifier.trim())) {
          throw new Error(isKannada ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please enter a valid 10-digit Indian mobile number.');
        }
        if (!password || password.length < 6) {
          throw new Error(isKannada ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.' : 'Password must be at least 6 characters long.');
        }

        const user = await registerCitizen({
          fullName,
          phone: identifier,
          password,
          villagePanchayat
        });

        setSuccessMessage(isKannada ? 'ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ...' : 'Registration successful! Entering citizen workspace...');
        setTimeout(() => navigate('/portal/citizen'), 800);
      } else {
        // Universal Login (Citizen, Official, Admin)
        if (!identifier.trim()) {
          throw new Error(isKannada ? 'ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಬಳಕೆದಾರ ಐಡಿ ನಮೂದಿಸಿ.' : 'Please enter your mobile number or ID.');
        }
        if (!password) {
          throw new Error(isKannada ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' : 'Please enter your password.');
        }

        const user = await login({
          identifier,
          password
        });

        setSuccessMessage(isKannada ? 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!' : 'Login successful! Redirecting...');
        
        setTimeout(() => {
          if (user.role === 'admin') navigate('/portal/admin');
          else if (user.role === 'official') navigate('/portal/official');
          else navigate('/portal/citizen');
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gov-page-container" style={{ maxWidth: '920px', margin: '30px auto', padding: '0 16px' }}>
      {/* Portal Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#eff6ff',
          borderRadius: '999px',
          color: 'var(--color-primary-blue, #1556A0)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '12px',
          border: '1px solid #bfdbfe'
        }}>
          <ShieldCheck size={16} /> Official Karnataka Single Sign-On (SSO) & DPI Portal
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-primary-navy, #102F56)', margin: '0 0 8px 0' }}>
          {isKannada ? 'ಪೋರ್ಟಲ್ ಅಧಿಕೃತ ಲಾಗಿನ್' : 'Official Government Portal Login'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          {isKannada
            ? 'ನಾಗರಿಕರು, ಪರಿಶೀಲನಾ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ವ್ಯವಸ್ಥಾ ನಿರ್ವಾಹಕರಿಗೆ ಸುರಕ್ಷಿತ, ಪಾಸ್‌ವರ್ಡ್-ರಕ್ಷಿತ ಪ್ರವೇಶ.'
            : 'Secure role-based access for citizens, department scrutiny officers, and administrators.'}
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
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
            borderRadius: '10px',
            border: selectedRole === 'citizen' ? '2px solid var(--color-primary-blue, #1556A0)' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'citizen' ? '#f0f9ff' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'citizen' ? 'var(--color-primary-blue, #1556A0)' : '#f1f5f9',
              color: selectedRole === 'citizen' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#102F56' }}>
                {isKannada ? 'ನಾಗರಿಕ ಪ್ರವೇಶ' : 'Citizen / User'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Public Beneficiary Portal</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            Direct scheme applications, local IndexedDB drafts, and personal grievance tracking.
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
            borderRadius: '10px',
            border: selectedRole === 'official' ? '2px solid var(--color-success, #16834A)' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'official' ? '#ecfdf5' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'official' ? '#16834A' : '#f1f5f9',
              color: selectedRole === 'official' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#102F56' }}>
                {isKannada ? 'ಇಲಾಖಾ ಅಧಿಕಾರಿ' : 'Department Official'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Desk Scrutiny & Sanction</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            Scrutinize incoming citizen applications, examine proof documents, and update Sakala statuses.
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
            borderRadius: '10px',
            border: selectedRole === 'admin' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
            backgroundColor: selectedRole === 'admin' ? '#f5f3ff' : '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: selectedRole === 'admin' ? '#7c3aed' : '#f1f5f9',
              color: selectedRole === 'admin' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#102F56' }}>
                {isKannada ? 'ವ್ಯವಸ್ಥಾ ನಿರ್ವಾಹಕ' : 'System Administrator'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Governance & Audit Logs</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
            System-wide audit trail inspection, user account oversight, and data ingestion pipeline control.
          </p>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(16, 47, 86, 0.06)',
        marginBottom: '24px'
      }}>
        {/* Error / Success Notifications */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Citizen Form Toggle (Sign In vs Register) */}
        {selectedRole === 'citizen' && (
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => {
                setCitizenMode('login');
                setErrorMessage('');
              }}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: citizenMode === 'login' ? '3px solid var(--color-primary-blue, #1556A0)' : 'none',
                fontWeight: citizenMode === 'login' ? 800 : 600,
                color: citizenMode === 'login' ? 'var(--color-primary-blue, #1556A0)' : '#64748B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.92rem'
              }}
            >
              <LogIn size={16} />
              <span>{isKannada ? 'ನಾಗರಿಕ ಲಾಗಿನ್' : 'Citizen Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCitizenMode('register');
                setErrorMessage('');
              }}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: citizenMode === 'register' ? '3px solid var(--color-primary-blue, #1556A0)' : 'none',
                fontWeight: citizenMode === 'register' ? 800 : 600,
                color: citizenMode === 'register' ? 'var(--color-primary-blue, #1556A0)' : '#64748B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.92rem'
              }}
            >
              <UserPlus size={16} />
              <span>{isKannada ? 'ಹೊಸ ನಾಗರಿಕ ನೋಂದಣಿ' : 'New Citizen Registration'}</span>
            </button>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          {selectedRole === 'citizen' && citizenMode === 'register' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#172B45', marginBottom: '6px' }}>
                Full Legal Name (ಪೂರ್ಣ ಹೆಸರು) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Basavaraju M."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#172B45', marginBottom: '6px' }}>
                {selectedRole === 'citizen' ? 'Mobile Number (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ)' : 'Mobile / Staff ID'} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'citizen' ? '10-digit mobile number' : 'e.g. 9845100001'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#172B45', marginBottom: '6px' }}>
                Account Password (ಪಾಸ್‌ವರ್ಡ್) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {selectedRole === 'citizen' && citizenMode === 'register' && (
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#172B45', marginBottom: '6px' }}>
                Gram Panchayat / Taluk (ಗ್ರಾಮ ಪಂಚಾಯತಿ / ತಾಲೂಕು)
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="e.g. Biligere Gram Panchayat, Nanjangud"
                  value={villagePanchayat}
                  onChange={(e) => setVillagePanchayat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#16834A' }}>
              <CheckCircle2 size={16} /> PostgreSQL Encrypted & Session Protected
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: selectedRole === 'official' ? '#16834A' : selectedRole === 'admin' ? '#7c3aed' : '#1556A0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(16, 47, 86, 0.15)'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spin-animate" />
                  <span>{isKannada ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'citizen' && citizenMode === 'register'
                      ? (isKannada ? 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ' : 'Complete Registration')
                      : (isKannada ? 'ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಿ' : 'Sign In to Portal')}
                  </span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Login Chips */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px dashed #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#D99016" />
            <strong>Demo Test Credentials:</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('citizen')}
              style={{
                fontSize: '0.78rem',
                backgroundColor: '#eff6ff',
                color: '#1556A0',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Citizen (9845100003)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('official')}
              style={{
                fontSize: '0.78rem',
                backgroundColor: '#ecfdf5',
                color: '#16834A',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Official (9845100001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                fontSize: '0.78rem',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Admin (9845100000)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
