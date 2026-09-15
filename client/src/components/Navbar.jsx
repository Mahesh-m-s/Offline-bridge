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
  Users
} from 'lucide-react';
import { isOnline, setupNetworkListeners } from '../registerServiceWorker';

export default function Navbar() {
  const [online, setOnline] = useState(isOnline());
  const [isKannada, setIsKannada] = useState(false);
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
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 1. TOP UTILITY HEADER (Dark Blue) */}
      <div className="gov-top-header" role="region" aria-label="Karnataka Government Utility Bar">
        <div className="gov-top-container">
          {/* Left: Language Toggle & CM Portal */}
          <div className="top-left-actions">
            <button
              type="button"
              className="btn-lang-toggle"
              onClick={() => setIsKannada(!isKannada)}
              aria-label="Toggle Kannada Language"
            >
              {isKannada ? 'English' : 'ಕನ್ನಡ'}
            </button>

            <a
              href="https://cm.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cm-portal"
              title="Click to visit Chief Minister Portal"
            >
              <span>{isKannada ? 'ಮುಖ್ಯಮಂತ್ರಿಗಳ ಪೋರ್ಟಲ್' : 'Click here to visit CM Portal'}</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
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
          {/* Rural Connect Logo & Title */}
          <Link to="/" className="gov-brand-left" aria-label="Rural Connect Home">
            <img
              src="/icons/rural-connect-logo.svg"
              alt="Rural Connect Logo"
              className="gov-emblem-img"
            />
            <div className="gov-brand-text">
              <span className="gov-karnataka-title" style={{ color: 'var(--gov-green)', letterSpacing: '0.05em' }}>
                {isKannada ? 'ರೂರಲ್ ಕನೆಕ್ಟ್' : 'RURAL CONNECT'}
              </span>
              <span className="gov-portal-name" style={{ fontSize: '0.98rem', fontWeight: 800 }}>
                {isKannada
                  ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ — ಗ್ರಾಮೀಣ ಸಮುದಾಯಗಳಿಗೆ ನಿರಂತರ ಡಿಜಿಟಲ್ ಪ್ರವೇಶ'
                  : 'OfflineBridge — Seamless Digital Access for Rural Communities'}
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
              <span>{isKannada ? 'ಸಹಾಯವಾಣಿ' : 'HELPLINE NUMBERS'}</span>
            </button>
          </nav>

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
                <span>About OfflineBridge — Rural Digital Services</span>
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
                <img src="/icons/karnataka-emblem.svg" alt="Emblem" style={{ width: '48px', height: '48px' }} />
                <div>
                  <h4 style={{ fontWeight: 800, color: 'var(--gov-blue-dark)' }}>
                    Dept. of Rural Development & Panchayat Raj
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Offline-First Citizen Service Delivery Initiative
                  </p>
                </div>
              </div>

              <p style={{ marginBottom: '14px', fontSize: '0.92rem', lineHeight: '1.6' }}>
                <strong>OfflineBridge</strong> is an offline-first Progressive Web App designed specifically for rural citizens in low-connectivity areas. It eliminates data loss during network dropouts by caching form schemas via <strong>Service Worker / Workbox</strong>, storing user drafts in <strong>IndexedDB (Dexie)</strong>, and orchestrating reliable background synchronization with a <strong>Node.js + PostgreSQL</strong> backend upon reconnection.
              </p>

              <div style={{ backgroundColor: 'var(--bg-body)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--gov-blue-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} /> Academic Project Credentials (Batch D4)
                </h5>
                <p style={{ fontSize: '0.85rem' }}><strong>Institution:</strong> The National Institute of Engineering (NIE), Mysuru</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Department:</strong> Information Science and Engineering (ISE)</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Faculty Guide:</strong> Dr. S Kuzhalvaimozhi</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  <strong>Student Team:</strong> Abhishek G.P, Mahesh M.S, Rajesh N, S M Shrivathsa Nonavinakere
                </p>
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
