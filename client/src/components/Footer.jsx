import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  PhoneCall,
  ExternalLink,
  Wifi,
  WifiOff,
  Layers,
  FileText,
  AlertTriangle,
  Clock,
  Home,
  CheckCircle2,
  Lock,
  ArrowUp,
  X,
  Sparkles,
  Info,
  Building2,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isOnline } from '../registerServiceWorker';

export default function Footer() {
  const { isKannada, t } = useLanguage();
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'accessibility' | 'architecture'
  const online = isOnline();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="ob-footer" role="contentinfo" aria-label="Portal Footer">
        <div className="ob-footer-main">
          <div className="ob-footer-grid">
            {/* Column 1: Brand & Purpose */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <img
                  src="/icons/offlinebridge-logo.svg"
                  alt="OfflineBridge Logo"
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                />
                <div>
                  <h4 className="ob-footer-brand-title">
                    <span>OfflineBridge</span>
                    <span style={{
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #FDE68A'
                    }}>
                      {isKannada ? 'ಕರ್ನಾಟಕ' : 'KA'}
                    </span>
                  </h4>
                  <p className="ob-footer-brand-subtitle">
                    {isKannada
                      ? 'ಗ್ರಾಮೀಣ ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಸೇವಾ ವೇದಿಕೆ'
                      : 'Rural Digital Public Services Platform · Karnataka'}
                  </p>
                </div>
              </div>

              <p className="ob-footer-desc">
                {isKannada
                  ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ಗ್ರಾಮೀಣ ಕರ್ನಾಟಕದ ನಾಗರಿಕರಿಗೆ ಅಂತರ್ಜಾಲವಿಲ್ಲದೆಯೂ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಅನ್ವೇಷಣೆ, ಸ್ಥಳೀಯ ಅರ್ಜಿ ಕರಡು ಸಲ್ಲಿಕೆ ಮತ್ತು ಸಕಾಲ ಟ್ರ್ಯಾಕಿಂಗ್ ಒದಗಿಸುತ್ತದೆ. ಯಾವುದೇ ಮಾಹಿತಿ ನಷ್ಟವಿಲ್ಲದೆ ಸಂಪರ್ಕ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತದೆ.'
                  : 'OfflineBridge empowers rural citizens with guaranteed access to 1,060+ verified Karnataka welfare schemes, local application draft preservation, and Sakala tracking under intermittent network connectivity.'}
              </p>

              <div className="ob-footer-badges">
                <span className="ob-footer-badge green">
                  {online ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span>{online ? 'Central API Synchronized' : 'Offline Mode Active'}</span>
                </span>
                <span className="ob-footer-badge">
                  <Shield size={12} />
                  <span>100% Client-Side IndexedDB</span>
                </span>
              </div>
            </div>

            {/* Column 2: Core Platform Navigation */}
            <div>
              <h5 className="ob-footer-col-title">
                <Layers size={14} color="#fef08a" />
                <span>{isKannada ? 'ಮುಖ್ಯ ಲಿಂಕ್‌ಗಳು' : 'Core Navigation'}</span>
              </h5>
              <ul className="ob-footer-links">
                <li>
                  <Link to="/" className="ob-footer-link">
                    <Home size={13} color="#38bdf8" />
                    <span>{isKannada ? 'ಮುಖಪುಟ' : 'Home Portal'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="ob-footer-link">
                    <Layers size={13} color="#38bdf8" />
                    <span>{isKannada ? '೧,೦೬೦+ ಯೋಜನೆಗಳು & ಸೇವೆಗಳು' : '1,060+ Schemes & Services'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/finder" className="ob-footer-link">
                    <Sparkles size={13} color="#38bdf8" />
                    <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆ ಹುಡುಕಿ' : 'Find Schemes for Me'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/eligibility" className="ob-footer-link">
                    <CheckCircle2 size={13} color="#38bdf8" />
                    <span>{isKannada ? 'ಕುಟುಂಬ ಅರ್ಹತಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Eligibility Calculator'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tracking" className="ob-footer-link">
                    <Clock size={13} color="#38bdf8" />
                    <span>{isKannada ? 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕಿಂಗ್ & ಡ್ರಾಫ್ಟ್‌ಗಳು' : 'Application Tracking & Drafts'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/grievance" className="ob-footer-link">
                    <AlertTriangle size={13} color="#38bdf8" />
                    <span>{isKannada ? 'ಜನಸ್ಪಂದನ ದೂರು ನೋಂದಣಿ' : 'Janaspandana Grievance Desk'}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="ob-footer-link" style={{ color: '#fef08a', fontWeight: 700 }}>
                    <Shield size={13} color="#fef08a" />
                    <span>{isKannada ? 'ಅಧಿಕೃತ ಇಲಾಖಾ / ನಾಗರಿಕ ಲಾಗಿನ್' : 'Official & Citizen Workspace'}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Important Government Portals */}
            <div>
              <h5 className="ob-footer-col-title">
                <Building2 size={14} color="#fef08a" />
                <span>{isKannada ? 'ಅಧಿಕೃತ ಸರಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು' : 'Karnataka Portals'}</span>
              </h5>
              <ul className="ob-footer-links">
                <li>
                  <a href="https://karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Karnataka State Portal</span>
                  </a>
                </li>
                <li>
                  <a href="https://sevasindhu.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Seva Sindhu Citizen Services</span>
                  </a>
                </li>
                <li>
                  <a href="http://sakala.kar.nic.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Sakala Guaranteed Services</span>
                  </a>
                </li>
                <li>
                  <a href="https://janaspandana.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Janaspandana Grievance</span>
                  </a>
                </li>
                <li>
                  <a href="https://ahara.kar.nic.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Ahara Food & Ration (FCS)</span>
                  </a>
                </li>
                <li>
                  <a href="https://bhoomi.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Bhoomi Land Records (RTC)</span>
                  </a>
                </li>
                <li>
                  <a href="https://nadakacheri.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>Nadakacheri Revenue Services</span>
                  </a>
                </li>
                <li>
                  <a href="https://ssp.postmatric.karnataka.gov.in" target="_blank" rel="noopener noreferrer" className="ob-footer-link">
                    <ExternalLink size={12} color="#94a3b8" />
                    <span>State Scholarship Portal (SSP)</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Help, Support & Helplines */}
            <div>
              <h5 className="ob-footer-col-title">
                <PhoneCall size={14} color="#fef08a" />
                <span>{isKannada ? 'ಸಹಾಯವಾಣಿಗಳು & ಬೆಂಬಲ' : 'Help & Support Desk'}</span>
              </h5>

              <div className="ob-helpline-grid">
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Janaspandana (Grievances):</span>
                  <a href="tel:1902" className="ob-helpline-number">1902</a>
                </div>
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Sakala Services Helpline:</span>
                  <a href="tel:08044554455" className="ob-helpline-number">080-44554455</a>
                </div>
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Kisan Farmer Call Centre:</span>
                  <a href="tel:18001801551" className="ob-helpline-number">1800-180-1551</a>
                </div>
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Ahara Ration Supply:</span>
                  <a href="tel:1967" className="ob-helpline-number">1967 / 1800-425-9339</a>
                </div>
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Women Helpline:</span>
                  <a href="tel:1091" className="ob-helpline-number">1091 / 181</a>
                </div>
                <div className="ob-helpline-pill">
                  <span className="ob-helpline-name">Emergency Response:</span>
                  <a href="tel:112" className="ob-helpline-number">112</a>
                </div>
              </div>

              <p className="ob-footer-coverage-note">
                {isKannada
                  ? 'ಕರ್ನಾಟಕದ ೩೧ ಜಿಲ್ಲೆಗಳು, ೨೪೦+ ತಾಲೂಕುಗಳು ಮತ್ತು ೬,೦೦೦+ ಗ್ರಾಮ ಪಂಚಾಯಿತಿಗಳ ನಾಗರಿಕರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಸಮೀಪದ ಗ್ರಾಮ ಒನ್ (Grama One) ಅಥವಾ ಬಾಪೂಜಿ ಸೇವಾ ಕೇಂದ್ರಗಳಲ್ಲಿಯೂ ಸಹಾಯ ಪಡೆಯಬಹುದು.'
                  : 'Engineered for all 31 Karnataka districts, 240+ taluks, and 6,000+ Gram Panchayats. Offline assistance also available at local Grama One and Bapuji Seva Kendras.'}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Legal & Regulatory Bottom Bar */}
        <div className="ob-footer-bottom">
          <div className="ob-footer-bottom-container">
            <div className="ob-footer-legal-links">
              <span>© {new Date().getFullYear()} OfflineBridge</span>
              <span>·</span>
              <button
                type="button"
                className="ob-footer-modal-trigger"
                onClick={() => setActiveModal('privacy')}
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button
                type="button"
                className="ob-footer-modal-trigger"
                onClick={() => setActiveModal('terms')}
              >
                Terms of Use
              </button>
              <span>·</span>
              <button
                type="button"
                className="ob-footer-modal-trigger"
                onClick={() => setActiveModal('accessibility')}
              >
                Accessibility Statement
              </button>
              <span>·</span>
              <button
                type="button"
                className="ob-footer-modal-trigger"
                onClick={() => setActiveModal('architecture')}
              >
                Offline Architecture
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Bilingual Portal (English & ಕನ್ನಡ)
              </span>
              <button
                type="button"
                className="ob-back-to-top"
                onClick={scrollToTop}
                title="Scroll back to top"
                aria-label="Scroll back to top"
              >
                <ArrowUp size={13} />
                <span>Top</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE LEGAL & REGULATORY MODALS
          ========================================================================= */}
      {activeModal && (
        <div
          className="ob-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="ob-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(16, 47, 86, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#1556A0" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#102F56', margin: 0 }}>
                  {activeModal === 'privacy' && 'OfflineBridge Privacy Policy & Data Sovereignty'}
                  {activeModal === 'terms' && 'Terms of Use & Citizen Charter (Sakala Act)'}
                  {activeModal === 'accessibility' && 'Accessibility Statement & Standards Compliance'}
                  {activeModal === 'architecture' && 'Offline-First Technical Architecture & Guarantees'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.65 }}>
              {activeModal === 'privacy' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    1. Zero-Telemetry Local Draft Storage
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    When filling scheme applications or civic grievances without internet, form data is saved <strong>strictly inside your browser's IndexedDB storage</strong> on this device. Unsubmitted drafts are never transmitted, analyzed, or shared with third parties.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    2. Cryptographic Security & Passwords
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    User passwords are encrypted with bcrypt (10 salt rounds) on the backend before insertion into PostgreSQL. Citizen sessions utilize short-lived JSON Web Tokens (JWT) stored exclusively in isolated sessionStorage, automatically invalidated upon logout.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    3. Role-Based Data Isolation (RBAC)
                  </h4>
                  <p style={{ marginBottom: '0' }}>
                    Citizens may only view applications associated with their verified account. Departmental scrutiny officers and administrators are bound by Karnataka e-Governance confidentiality standards and audit logging.
                  </p>
                </div>
              )}

              {activeModal === 'terms' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    1. Statutory Truthfulness & Declarations
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    Submitting government applications requires accurate self-declaration of age, caste/category, income, landholding, and family details. False declarations are subject to penalties under statutory Karnataka departmental acts.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    2. Karnataka Sakala Guarantee of Services Act (2011)
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    Services submitted through verified departmental gateways carry guaranteed time-bound delivery under the Karnataka Sakala Services Act. If services are delayed beyond prescribed limits, citizens retain the statutory right to appeal via Janaspandana helpline 1902.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    3. Non-Commercial Public Good
                  </h4>
                  <p style={{ marginBottom: '0' }}>
                    OfflineBridge is provided free of cost as a public inclusion platform. No fees or commissions are levied for scheme discovery, draft saving, or grievance registration.
                  </p>
                </div>
              )}

              {activeModal === 'accessibility' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    1. Bilingual Localization (English & Kannada)
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    All user interfaces, labels, error notices, scheme details, and AI recommendations are natively available in English and Kannada (ಕನ್ನಡ) with dynamic instant switching.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    2. Font Resizing & High Contrast
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    The utility bar offers instant font scaling (<code>A-</code>, <code>A</code>, <code>A+</code>) and dark mode contrast toggles for optimal readability across rural mobile screens and bright sunlight conditions.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    3. WCAG 2.1 AA Compliance
                  </h4>
                  <p style={{ marginBottom: '0' }}>
                    Interactive controls include clear keyboard focus rings, semantic landmark elements (<code>nav</code>, <code>main</code>, <code>footer</code>, <code>section</code>), and ARIA attributes for screen reader accessibility.
                  </p>
                </div>
              )}

              {activeModal === 'architecture' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    1. Service Worker & Application Shell Caching
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    OfflineBridge leverages a production Service Worker (Workbox precaching) that stores the application shell, stylesheet tokens, icons, and schemes catalogue offline. You can launch and use the app with zero internet.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    2. Idempotent Background Synchronization
                  </h4>
                  <p style={{ marginBottom: '14px' }}>
                    Applications filed offline receive unique client submission identifiers (e.g. <code>APP-...</code>). When connectivity is restored, the sync bridge automatically transmits queued submissions to PostgreSQL without duplicate records.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102F56', marginBottom: '6px' }}>
                    3. Grounded Retrieval-Augmented Generation (RAG)
                  </h4>
                  <p style={{ marginBottom: '0' }}>
                    The AI Assistant searches verified PostgreSQL scheme knowledge vectors via pgvector. Answers cite official source URLs and helpline numbers, preventing fabricated eligibility advice.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#F8FAFC'
            }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveModal(null)}
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
