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
  LogOut,
  Menu,
  ChevronRight,
  Info
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHelplinesModal, setShowHelplinesModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearchModal(false);
  }, [location.pathname]);

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
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. COMPACT TOP UTILITY BAR (Navy) */}
      <div className="ob-top-utility-bar" role="region" aria-label="Portal utility bar">
        <div className="ob-utility-container">
          {/* Left: Language Toggle & Accessibility */}
          <div className="ob-utility-left">
            <button
              type="button"
              className="ob-util-btn ob-lang-pill"
              onClick={toggleLanguage}
              aria-label="Toggle language between English and Kannada"
              title="Switch language"
            >
              <span className="ob-lang-indicator" />
              <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>

            <div className="ob-font-resizer" role="group" aria-label="Font size controls">
              <button
                type="button"
                className={`ob-font-btn ${fontScale === 0.9 ? 'active' : ''}`}
                onClick={() => changeFontSize(0.9)}
                title="Small text"
              >
                A-
              </button>
              <button
                type="button"
                className={`ob-font-btn ${fontScale === 1 ? 'active' : ''}`}
                onClick={() => changeFontSize(1)}
                title="Normal text"
              >
                A
              </button>
              <button
                type="button"
                className={`ob-font-btn ${fontScale === 1.15 ? 'active' : ''}`}
                onClick={() => changeFontSize(1.15)}
                title="Large text"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              className="ob-util-btn ob-icon-btn"
              onClick={toggleDarkMode}
              title="Toggle Dark / Light Mode"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>

          {/* Right: Helplines, Live Status & Weather */}
          <div className="ob-utility-right">
            <button
              type="button"
              className="ob-util-link-btn"
              onClick={() => setShowHelplinesModal(true)}
            >
              <PhoneCall size={12} />
              <span>{isKannada ? 'ಸಹಾಯವಾಣಿ 1902' : 'Helplines 1902'}</span>
            </button>

            <div className="ob-weather-badge" title="Live weather in Mysuru, Karnataka">
              <CloudSun size={12} />
              <span>Mysuru 26°C</span>
            </div>

            {/* Online/Offline Live Status Pill */}
            <div
              className={`ob-status-pill ${online ? 'online' : 'offline'}`}
              role="status"
              aria-live="polite"
              title={online ? 'Online: Connected to Government Sync Server' : 'Offline: Local IndexedDB saves drafts automatically'}
            >
              <span className="ob-status-dot" />
              {online ? (
                <>
                  <Wifi size={12} />
                  <span>{isKannada ? 'ಆನ್‌ಲೈನ್' : 'ONLINE'}</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} />
                  <span>{isKannada ? 'ಆಫ್‌ಲೈನ್' : 'OFFLINE'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND NAVIGATION HEADER (Clean White / Navy Accent) */}
      <header className="ob-main-header" role="banner">
        <div className="ob-nav-container">
          {/* Brand Logo & Title */}
          <Link to="/" className="ob-brand-group" aria-label="OfflineBridge Home">
            <img
              src="/icons/offlinebridge-logo.svg"
              alt="OfflineBridge Logo"
              className="ob-brand-logo"
            />
            <div className="ob-brand-text">
              <div className="ob-brand-title">
                <span>OfflineBridge</span>
                <span className="ob-brand-badge">{isKannada ? 'ಕರ್ನಾಟಕ' : 'KA'}</span>
              </div>
              <div className="ob-brand-subtitle">
                {isKannada
                  ? 'ಗ್ರಾಮೀಣ ಡಿಜಿಟಲ್ ನಾಗರಿಕ ಸೇವೆಗಳ ಪೋರ್ಟಲ್'
                  : 'Rural Digital Government Services Platform'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="ob-desktop-nav" aria-label="Main Navigation">
            <Link to="/" className={`ob-nav-link ${isActive('/') ? 'active' : ''}`}>
              <Home size={15} />
              <span>{isKannada ? 'ಮುಖಪುಟ' : 'Home'}</span>
            </Link>

            <Link to="/services" className={`ob-nav-link ${isActive('/services') ? 'active' : ''}`}>
              <Landmark size={15} />
              <span>{isKannada ? 'ಯೋಜನೆಗಳು & ಸೇವೆಗಳು' : 'Schemes & Services'}</span>
            </Link>

            <Link to="/finder" className={`ob-nav-link ${isActive('/finder') ? 'active' : ''}`}>
              <Sparkles size={15} color="#D99016" />
              <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆಗಳು' : 'Find Schemes'}</span>
            </Link>

            <Link to="/grievance" className={`ob-nav-link ${isActive('/grievance') ? 'active' : ''}`}>
              <AlertTriangle size={15} />
              <span>{isKannada ? 'ದೂರುಗಳು' : 'Grievances'}</span>
            </Link>

            <Link to="/tracking" className={`ob-nav-link ${isActive('/tracking') ? 'active' : ''}`}>
              <Clock size={15} />
              <span>{isKannada ? 'ಟ್ರ್ಯಾಕಿಂಗ್' : 'Tracking'}</span>
            </Link>

            <button
              type="button"
              className="ob-nav-link ob-modal-trigger"
              onClick={() => setShowAboutModal(true)}
            >
              <Info size={15} />
              <span>{isKannada ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us'}</span>
            </button>
          </nav>

          {/* Header Action Tools */}
          <div className="ob-header-actions">
            {/* Search Quick Button */}
            <button
              type="button"
              className="ob-search-trigger-btn"
              onClick={() => setShowSearchModal(true)}
              aria-label="Search schemes and services"
              title="Search portal"
            >
              <Search size={15} />
              <span className="ob-search-kbd">Ctrl+K</span>
            </button>

            {/* Auth Session / Sign In Button */}
            {isAuthenticated ? (
              <div className="ob-user-menu">
                <Link
                  to={userRole === 'citizen' ? '/portal/citizen' : userRole === 'official' ? '/portal/official' : '/portal/admin'}
                  className="ob-user-badge"
                  title={`Active session: ${currentUser?.name || userRole}. Click to open workspace.`}
                >
                  <User size={14} />
                  <span className="ob-user-name">{currentUser?.name?.split(' ')[0] || userRole} Desk</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="ob-logout-btn"
                  title="Sign out of current workspace"
                  aria-label="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="ob-signin-btn">
                <LogIn size={14} />
                <span>{isKannada ? 'ಲಾಗಿನ್' : 'Sign In'}</span>
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className="ob-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Global Offline Banner if Network Disconnected */}
        {!online && (
          <div className="ob-offline-banner" role="alert">
            <div className="ob-offline-banner-content">
              <WifiOff size={15} />
              <span>
                {isKannada
                  ? 'ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಸ್ಥಳೀಯ IndexedDB ಯಲ್ಲಿ ಕರಡುಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಸಬಹುದು. ಸಂಪರ್ಕ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತದೆ.'
                  : 'Offline Mode Active: Service forms and applications can be drafted locally without internet. All submissions queue safely and auto-sync on reconnect.'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* 3. MOBILE SLIDE-IN NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="ob-mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="ob-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ob-drawer-header">
              <div className="ob-brand-group">
                <img src="/icons/offlinebridge-logo.svg" alt="OfflineBridge" style={{ width: '32px', height: '32px' }} />
                <div>
                  <div className="ob-brand-title">OfflineBridge</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Rural Digital Services</div>
                </div>
              </div>
              <button
                type="button"
                className="ob-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Search Input */}
            <form onSubmit={handleSearch} className="ob-drawer-search">
              <Search size={15} className="ob-drawer-search-icon" />
              <input
                type="text"
                placeholder={isKannada ? 'ಯೋಜನೆಗಳು ಅಥವಾ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ...' : 'Search 1,000+ schemes & services...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ob-drawer-search-input"
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="ob-drawer-nav">
              <Link to="/" className={`ob-drawer-link ${isActive('/') ? 'active' : ''}`}>
                <Home size={18} />
                <span>{isKannada ? 'ಮುಖಪುಟ' : 'Home'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <Link to="/services" className={`ob-drawer-link ${isActive('/services') ? 'active' : ''}`}>
                <Landmark size={18} />
                <span>{isKannada ? 'ಯೋಜನೆಗಳು & ಸೇವೆಗಳು' : 'Schemes & Services'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <Link to="/finder" className={`ob-drawer-link ${isActive('/finder') ? 'active' : ''}`}>
                <Sparkles size={18} color="#D99016" />
                <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆಗಳು' : 'Find Schemes'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <Link to="/eligibility" className={`ob-drawer-link ${isActive('/eligibility') ? 'active' : ''}`}>
                <CheckCircle2 size={18} />
                <span>{isKannada ? 'ಅರ್ಹತಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Check Eligibility'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <Link to="/grievance" className={`ob-drawer-link ${isActive('/grievance') ? 'active' : ''}`}>
                <AlertTriangle size={18} />
                <span>{isKannada ? 'ದೂರುಗಳು' : 'Grievances'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <Link to="/tracking" className={`ob-drawer-link ${isActive('/tracking') ? 'active' : ''}`}>
                <Clock size={18} />
                <span>{isKannada ? 'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Tracking'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </Link>

              <button
                type="button"
                className="ob-drawer-link"
                onClick={() => { setShowAboutModal(true); setMobileMenuOpen(false); }}
              >
                <Info size={18} />
                <span>{isKannada ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </button>

              <button
                type="button"
                className="ob-drawer-link"
                onClick={() => { setShowHelplinesModal(true); setMobileMenuOpen(false); }}
              >
                <PhoneCall size={18} />
                <span>{isKannada ? 'ಸಹಾಯವಾಣಿ' : 'Helplines'}</span>
                <ChevronRight size={15} className="ob-drawer-arrow" />
              </button>
            </nav>

            {/* Mobile Footer Actions */}
            <div className="ob-drawer-footer">
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to={userRole === 'citizen' ? '/portal/citizen' : userRole === 'official' ? '/portal/official' : '/portal/admin'}
                    className="ob-btn-primary"
                    style={{ textAlign: 'center', justifyContent: 'center' }}
                  >
                    <User size={15} />
                    <span>Open {userRole} Workspace</span>
                  </Link>
                  <button type="button" onClick={logout} className="ob-btn-outline" style={{ justifyContent: 'center' }}>
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="ob-btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                  <LogIn size={15} />
                  <span>{isKannada ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign In / Workspace'}</span>
                </Link>
              )}

              <div className="ob-drawer-util-row">
                <button type="button" className="ob-util-btn" onClick={toggleLanguage} style={{ flex: 1 }}>
                  <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
                </button>
                <div className={`ob-status-pill ${online ? 'online' : 'offline'}`} style={{ flex: 1, justifyContent: 'center' }}>
                  <span className="ob-status-dot" />
                  <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: SEARCH QUICK MODAL */}
      {showSearchModal && (
        <div className="ob-modal-overlay" onClick={() => setShowSearchModal(false)} role="dialog" aria-modal="true">
          <div className="ob-modal-panel ob-search-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="ob-search-dialog-form">
              <Search size={18} className="ob-search-dialog-icon" />
              <input
                type="text"
                autoFocus
                placeholder={isKannada ? 'ಯೋಜನೆಗಳು, ಸೇವೆಗಳು, ಇಲಾಖೆಗಳು ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search across 1,000+ schemes, certificates, departments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ob-search-dialog-input"
              />
              <button type="button" className="ob-modal-close-icon" onClick={() => setShowSearchModal(false)}>
                <X size={18} />
              </button>
            </form>
            <div className="ob-search-dialog-hints">
              <span className="ob-hint-title">{isKannada ? 'ಜನಪ್ರಿಯ ಹುಡುಕಾಟಗಳು:' : 'Quick shortcuts:'}</span>
              <div className="ob-hint-pills">
                <button type="button" onClick={() => { setSearchQuery('Kisan'); navigate('/services?search=Kisan'); setShowSearchModal(false); }}>PM-KISAN</button>
                <button type="button" onClick={() => { setSearchQuery('Caste'); navigate('/services?search=Caste'); setShowSearchModal(false); }}>Caste & Income</button>
                <button type="button" onClick={() => { setSearchQuery('Ration'); navigate('/services?search=Ration'); setShowSearchModal(false); }}>Ration Card</button>
                <button type="button" onClick={() => { setSearchQuery('Electricity'); navigate('/services?search=Electricity'); setShowSearchModal(false); }}>Gruha Jyothi</button>
                <button type="button" onClick={() => { setSearchQuery('Scholarship'); navigate('/services?search=Scholarship'); setShowSearchModal(false); }}>SSP Scholarship</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: OFFICIAL HELPLINES */}
      {showHelplinesModal && (
        <div className="ob-modal-overlay" onClick={() => setShowHelplinesModal(false)} role="dialog" aria-modal="true">
          <div className="ob-modal-panel ob-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div className="ob-modal-title">
                <PhoneCall size={18} color="var(--color-primary-blue)" />
                <span>{isKannada ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಸಹಾಯವಾಣಿಗಳು' : 'Karnataka Government Helplines'}</span>
              </div>
              <button
                type="button"
                className="ob-modal-close-icon"
                onClick={() => setShowHelplinesModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="ob-modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                {isKannada
                  ? 'ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು ಮತ್ತು ತುರ್ತು ನೆರವಿಗಾಗಿ ಅಧಿಕೃತ ಟೋಲ್-ಫ್ರೀ ಸಂಖ್ಯೆಗಳು:'
                  : 'Direct official toll-free telephone helplines for citizen grievances and public services:'}
              </p>

              <div className="ob-helpline-list">
                <div className="ob-helpline-card">
                  <div>
                    <h5>Janaspandana (Citizen Grievance Redressal)</h5>
                    <p>Public grievances and officer accountability</p>
                  </div>
                  <a href="tel:1902" className="ob-tel-btn">
                    <PhoneCall size={13} /> 1902
                  </a>
                </div>

                <div className="ob-helpline-card">
                  <div>
                    <h5>Sakala Citizen Services Guarantee</h5>
                    <p>Enquire about timely delivery of statutory certificates</p>
                  </div>
                  <a href="tel:08044554455" className="ob-tel-btn">
                    <PhoneCall size={13} /> 080-44554455
                  </a>
                </div>

                <div className="ob-helpline-card">
                  <div>
                    <h5>Kisan Call Centre (Agriculture Advisory)</h5>
                    <p>Crop loss, seed subsidies, and weather guidance</p>
                  </div>
                  <a href="tel:18001801551" className="ob-tel-btn">
                    <PhoneCall size={13} /> 1800-180-1551
                  </a>
                </div>

                <div className="ob-helpline-card">
                  <div>
                    <h5>Unified Emergency Services (Police / Fire / Ambulance)</h5>
                    <p>24x7 ERSS emergency response</p>
                  </div>
                  <a href="tel:112" className="ob-tel-btn">
                    <PhoneCall size={13} /> 112
                  </a>
                </div>

                <div className="ob-helpline-card">
                  <div>
                    <h5>Women Helpline (Domestic Support & Shelter)</h5>
                    <p>Santwana 24x7 emergency crisis support</p>
                  </div>
                  <a href="tel:1091" className="ob-tel-btn">
                    <PhoneCall size={13} /> 1091
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: ABOUT US */}
      {showAboutModal && (
        <div className="ob-modal-overlay" onClick={() => setShowAboutModal(false)} role="dialog" aria-modal="true">
          <div className="ob-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ob-modal-header">
              <div className="ob-modal-title">
                <Building2 size={18} color="var(--color-primary-navy)" />
                <span>About OfflineBridge</span>
              </div>
              <button
                type="button"
                className="ob-modal-close-icon"
                onClick={() => setShowAboutModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="ob-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <img src="/icons/offlinebridge-logo.svg" alt="OfflineBridge" style={{ width: '44px', height: '44px' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                    OfflineBridge
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-primary-blue)', fontWeight: 600 }}>
                    Know Your Rights. Access Your Services.
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                <strong>OfflineBridge</strong> is an offline-first public service portal and digital inclusion platform designed for citizens across rural Karnataka. It provides transparent government scheme discovery, reliable application drafting, and civic grievance tracking even in regions facing zero or intermittent internet connectivity.
              </p>

              <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontWeight: 800, margin: '0 0 10px 0', color: 'var(--color-primary-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="var(--color-primary-blue)" /> Key Architectural Pillars
                </h5>
                <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                  <li><strong>Zero Data-Loss Guarantee:</strong> Form entries and draft inputs persist in local IndexedDB, surviving reloads and sudden network disconnects.</li>
                  <li><strong>Transparent Eligibility Discovery:</strong> Rule-based entitlement calculator evaluates eligibility offline without cloud dependencies.</li>
                  <li><strong>Authoritative Information:</strong> Over 1,060 officially scheduled citizen services and welfare schemes referenced from Seva Sindhu, Sakala, Nada Kacheri, and MyScheme.</li>
                </ul>
              </div>

              <div style={{
                backgroundColor: '#EFF6FF',
                borderLeft: '4px solid var(--color-primary-blue)',
                padding: '12px 14px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: '#1E40AF',
                lineHeight: 1.5,
                marginBottom: '16px'
              }}>
                <strong>Public Advisory:</strong> OfflineBridge is an independent public digital service platform. Displaying a service does not constitute official departmental sanction. Final approvals are executed through authorized government systems.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/services" className="ob-btn-primary" onClick={() => setShowAboutModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  <span>Explore 1,060+ Services</span>
                </Link>
                <Link to="/eligibility" className="ob-btn-outline" onClick={() => setShowAboutModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  <span>Check Eligibility</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
