import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  Landmark,
  AlertTriangle,
  Clock,
  PhoneCall,
  Search,
  CloudSun,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  ExternalLink,
  X,
  Shield,
  FileCheck,
  Building2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isOnline, setupNetworkListeners } from '../registerServiceWorker';

export default function Navbar() {
  const [online, setOnline] = useState(isOnline());
  const { isKannada, toggleLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, userRole, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelplinesModal, setShowHelplinesModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Network listeners
  useEffect(() => {
    const cleanup = setupNetworkListeners((status) => {
      setOnline(status);
    });
    return cleanup;
  }, []);

  // Handle font size scaling (A-, A, A+)
  const changeFontSize = (scale) => {
    setFontScale(scale);
    document.documentElement.style.setProperty('--font-scale', scale);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return next;
    });
  };

  // Search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 1. TOP UTILITY HEADER (Dark Blue) */}
      <div className="gov-top-header" role="region" aria-label="Karnataka Government Utility Bar">
        <div className="gov-top-container">
          {/* Left: Language Toggle (CM Portal link removed as requested) */}
          <div className="top-left-actions">
            <button
              type="button"
              className="btn-lang-toggle"
              onClick={toggleLanguage}
              aria-label="Toggle Kannada Language"
              title="Switch between English and Kannada"
            >
              {isKannada ? 'English' : 'ಕನ್ನಡ'}
            </button>
          </div>

          {/* Right: Accessibility, Search, Weather */}
          <div className="top-right-actions">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleDarkMode}
              title="Toggle Dark / Light Mode"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Font Sizers A- A A+ */}
            <div className="font-resizer-group" role="group" aria-label="Font size controls">
              <button
                type="button"
                className={`font-resizer-btn ${fontScale === 0.9 ? 'active' : ''}`}
                onClick={() => changeFontSize(0.9)}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                className={`font-resizer-btn ${fontScale === 1 ? 'active' : ''}`}
                onClick={() => changeFontSize(1)}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                type="button"
                className={`font-resizer-btn ${fontScale === 1.15 ? 'active' : ''}`}
                onClick={() => changeFontSize(1.15)}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="top-search-form" role="search">
              <input
                type="text"
                placeholder={isKannada ? 'ಹುಡುಕಿ...' : 'Search portal...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="top-search-input"
                aria-label="Search services"
              />
              <button type="submit" className="top-search-btn" aria-label="Search">
                <Search size={14} />
                <span>{isKannada ? 'ಹುಡುಕು' : 'Search'}</span>
              </button>
            </form>

            {/* Weather Widget */}
            <div className="weather-widget" title="Live Weather in Mysuru, Karnataka">
              <CloudSun size={16} />
              <span>Mysuru, IN 26°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND NAVBAR (Clean White with Emblem) */}
      <header className="gov-brand-navbar" role="banner">
        <div className="gov-brand-container">
          {/* ArivuNet Brand Logo & Title */}
          <Link to="/" className="gov-brand-left" aria-label="ArivuNet Home">
            <img
              src="/icons/arivunet-logo.svg"
              alt="ArivuNet Logo"
              className="gov-emblem-img"
            />
            <div className="gov-brand-text">
              <span className="gov-karnataka-title" style={{ color: '#4c1d95', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 40%, #0284c7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900
                }}>
                  {isKannada ? 'ಅರಿವುನೆಟ್ (ArivuNet)' : 'ArivuNet (ಅರಿವುನೆಟ್)'}
                </span>
              </span>
              <span className="gov-portal-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                {isKannada
                  ? 'ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ. ನಿಮ್ಮ ಸೇವೆಗಳನ್ನು ಪಡೆಯಿರಿ.'
                  : 'Know Your Rights. Access Your Services.'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="gov-nav-links" aria-label="Main Government Navigation">
            <Link to="/" className={`gov-nav-item ${isActive('/') ? 'active' : ''}`}>
              <Home size={18} aria-hidden="true" />
              <span>{isKannada ? 'ಮುಖಪುಟ' : 'HOME'}</span>
            </Link>

            <button
              type="button"
              className="gov-nav-item"
              onClick={() => setShowAboutModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <User size={18} aria-hidden="true" />
              <span>{isKannada ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'ABOUT US'}</span>
            </button>

            <Link to="/services" className={`gov-nav-item ${isActive('/services') ? 'active' : ''}`}>
              <Landmark size={18} aria-hidden="true" />
              <span>{isKannada ? 'ಯೋಜನೆಗಳು' : 'SCHEMES & SERVICES'}</span>
            </Link>

            <Link to="/finder" className={`gov-nav-item ${isActive('/finder') ? 'active' : ''}`}>
              <Sparkles size={18} aria-hidden="true" color="#f59e0b" />
              <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆಗಳು' : 'FIND SCHEMES'}</span>
            </Link>

            <Link to="/grievance" className={`gov-nav-item ${isActive('/grievance') ? 'active' : ''}`}>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{isKannada ? 'ದೂರುಗಳು' : 'GRIEVANCES'}</span>
            </Link>

            <Link to="/tracking" className={`gov-nav-item ${isActive('/tracking') ? 'active' : ''}`}>
              <Clock size={18} aria-hidden="true" />
              <span>{isKannada ? 'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕಿಂಗ್' : 'TRACKING'}</span>
            </Link>

            <button
              type="button"
              className="gov-nav-item"
              onClick={() => setShowHelplinesModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <PhoneCall size={18} aria-hidden="true" />
              <span>{isKannada ? 'ಸಹಾಯವಾಣಿ' : 'HELPLINES'}</span>
            </button>
          </nav>

          {/* User / Portal Role Action & Network Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to={userRole === 'citizen' ? '/portal/citizen' : userRole === 'official' ? '/portal/official' : '/portal/admin'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    backgroundColor: userRole === 'citizen' ? '#f0f9ff' : userRole === 'official' ? '#ecfdf5' : '#f5f3ff',
                    border: `1px solid ${userRole === 'citizen' ? '#bae6fd' : userRole === 'official' ? '#a7f3d0' : '#ddd6fe'}`,
                    color: userRole === 'citizen' ? '#0369a1' : userRole === 'official' ? '#047857' : '#6d28d9',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  title={`Active session: ${currentUser?.name || userRole}. Click to open workspace.`}
                >
                  <User size={13} />
                  <span style={{ textTransform: 'capitalize' }}>{userRole} Desk</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out of current workspace"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--gov-blue-primary, #0284c7)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <LogIn size={13} />
                <span>{isKannada ? 'ಲಾಗಿನ್' : 'Sign In'}</span>
              </Link>
            )}

            {/* Offline/Online Network Indicator Badge */}
            <div
              className={`gov-network-pill ${online ? 'online' : 'offline'}`}
              role="status"
              aria-live="polite"
              title={online ? 'Online: System connected to Government Sync Server' : 'Offline: Saving drafts and submissions safely in local IndexedDB'}
            >
              <span className="pulse-circle" aria-hidden="true" />
              {online ? (
                <>
                  <Wifi size={15} />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff size={15} />
                  <span>OFFLINE MODE</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Alert Bar if Network Disconnected */}
        {!online && (
          <div className="offline-notice-bar" role="alert">
            <WifiOff size={18} aria-hidden="true" />
            <span>
              {isKannada
                ? 'ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಎಲ್ಲಾ ನಮೂನೆಗಳು ಮತ್ತು ಅರ್ಜಿಗಳು ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹವಾಗುತ್ತವೆ ಮತ್ತು ಸಂಪರ್ಕ ಬಂದಾಗ ತಂತಾನೇ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಆಗುತ್ತವೆ.'
                : 'Offline Mode Active: Service forms and applications can be filled without internet. All submissions are queued locally and will auto-sync upon reconnection.'}
            </span>
          </div>
        )}
      </header>

      {/* HELPLINE NUMBERS MODAL */}
      {showHelplinesModal && (
        <div className="modal-overlay" onClick={() => setShowHelplinesModal(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <PhoneCall size={20} />
                <span>Karnataka Government Rural Helplines</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowHelplinesModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                Direct emergency and citizen service telephone helplines across Karnataka state:
              </p>

              <div className="helpline-item">
                <div>
                  <h5>Janaspandana (Citizen Grievance Redressal)</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Toll-Free Public Complaint Registration</p>
                </div>
                <a href="tel:1902" className="helpline-num-btn">
                  <PhoneCall size={14} /> 1902
                </a>
              </div>

              <div className="helpline-item">
                <div>
                  <h5>Sakala Citizen Services Guarantee</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enquire about timely delivery of government certificates</p>
                </div>
                <a href="tel:08044554455" className="helpline-num-btn">
                  <PhoneCall size={14} /> 080-44554455
                </a>
              </div>

              <div className="helpline-item">
                <div>
                  <h5>Kisan Call Centre (Agriculture Assistance)</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crop advisory, seed subsidies, and weather updates</p>
                </div>
                <a href="tel:18001801551" className="helpline-num-btn">
                  <PhoneCall size={14} /> 1800-180-1551
                </a>
              </div>

              <div className="helpline-item">
                <div>
                  <h5>Karnataka State Emergency & Disaster Helpline</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monsoon flood and emergency response</p>
                </div>
                <a href="tel:1077" className="helpline-num-btn">
                  <PhoneCall size={14} /> 1077
                </a>
              </div>

              <div className="helpline-item">
                <div>
                  <h5>Unified Emergency Services (Police / Fire / Ambulance)</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ERSS 24x7 helpline</p>
                </div>
                <a href="tel:112" className="helpline-num-btn">
                  <PhoneCall size={14} /> 112
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT US MODAL (Project & Synopsis Details) */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Building2 size={20} />
                <span>About ArivuNet — Rural Digital Services</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAboutModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src="/icons/arivunet-logo.svg" alt="ArivuNet Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <div>
                  <h4 style={{ fontWeight: 800, color: '#4c1d95' }}>
                    ArivuNet (ಅರಿವುನೆಟ್)
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                    Know Your Rights. Access Your Services.
                  </p>
                </div>
              </div>

              <p style={{ marginBottom: '14px', fontSize: '0.92rem', lineHeight: '1.6' }}>
                <strong>ArivuNet</strong> (<em>Arivu</em> means knowledge or awareness in Kannada) is an offline-first public service portal and digital inclusion initiative designed for citizens across rural Karnataka. It ensures reliable government scheme discovery, preparation of service applications, and civic grievance tracking even in remote areas facing zero or intermittent mobile network connectivity.
              </p>

              <div style={{ backgroundColor: 'var(--bg-body)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--gov-blue-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="var(--gov-blue-primary)" /> Key Architectural Pillars
                </h5>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', lineHeight: '1.6', color: 'var(--text-subtle)' }}>
                  <li><strong>Zero Data-Loss Guarantee:</strong> Form entries and draft inputs persist in the browser's local IndexedDB, surviving page reloads and sudden network disconnects.</li>
                  <li><strong>Transparent Eligibility Discovery:</strong> Rule-based entitlement calculator evaluates criteria offline without requiring account passwords or cloud roundtrips.</li>
                  <li><strong>Authoritative Information:</strong> Scheme specifications, eligibility rules, and required documents are referenced from published Karnataka portals (Seva Sindhu, Ahara, FRUITS, and Nadakacheri).</li>
                </ul>
              </div>

              {/* Public Advisory & Independence Notice */}
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #0284c7',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: '#0369a1',
                lineHeight: '1.45',
                marginBottom: '16px'
              }}>
                <strong>Public Notice:</strong> ArivuNet is an independent digital empowerment initiative and is not an official government portal. Displaying a scheme in ArivuNet does not constitute official departmental sanction. Final application submissions and approvals are executed through authorized Karnataka government department systems.
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/services" className="btn btn-primary" onClick={() => setShowAboutModal(false)} style={{ flex: 1 }}>
                  <span>Explore Services</span>
                </Link>
                <Link to="/eligibility" className="btn btn-outline" onClick={() => setShowAboutModal(false)} style={{ flex: 1 }}>
                  <span>Scheme Eligibility</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
