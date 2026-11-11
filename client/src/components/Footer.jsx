import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  PhoneCall,
  ExternalLink,
  WifiOff,
  Layers,
  Heart,
  FileText,
  AlertTriangle,
  Clock,
  Home,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { isKannada, t } = useLanguage();

  return (
    <footer className="gov-footer" role="contentinfo" aria-label="Portal Footer" style={{
      backgroundColor: 'var(--color-primary-navy, #102F56)',
      color: '#e2e8f0',
      borderTop: '3px solid #D99016',
      marginTop: 'auto',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '36px 20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '32px'
      }}>
        {/* Column 1: Brand & Platform Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img
              src="/icons/offlinebridge-logo.svg"
              alt="OfflineBridge Logo"
              style={{ width: '42px', height: '42px' }}
            />
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                OfflineBridge
              </h4>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>
                {isKannada
                  ? 'ಗ್ರಾಮೀಣ ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಸೇವಾ ವೇದಿಕೆ'
                  : 'Rural Digital Public Services Platform · Karnataka'}
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.55', marginBottom: '14px' }}>
            {isKannada
              ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ಗ್ರಾಮೀಣ ಕರ್ನಾಟಕದ ನಾಗರಿಕರಿಗೆ ಅಂತರ್ಜಾಲವಿಲ್ಲದೆಯೂ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಅನ್ವೇಷಣೆ, ಸ್ಥಳೀಯ ಅರ್ಜಿ ಕರಡು ಸಲ್ಲಿಕೆ ಮತ್ತು ಸಕಾಲ ಟ್ರ್ಯಾಕಿಂಗ್ ಒದಗಿಸುತ್ತದೆ.'
              : 'OfflineBridge provides uninterrupted government service delivery, scheme discovery, and grievance tracking for citizens under unstable rural connectivity conditions.'}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.76rem', color: '#fef08a' }}>
            <WifiOff size={13} />
            <span>{isKannada ? '೧೦೦% ಸ್ಥಳೀಯ ಬ್ರೌಸರ್ ಸಂಗ್ರಹ' : '100% Offline-Ready Architecture'}</span>
          </div>
        </div>

        {/* Column 2: Core Platform Navigation */}
        <div>
          <h5 style={{
            color: '#fef08a',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isKannada ? 'ಮುಖ್ಯ ಲಿಂಕ್‌ಗಳು' : 'Core Navigation'}
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, fontSize: '0.82rem' }}>
            <li>
              <Link to="/" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <Home size={14} color="#38bdf8" />
                <span>{isKannada ? 'ಮುಖಪುಟ' : 'Home Portal'}</span>
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <Layers size={14} color="#38bdf8" />
                <span>{isKannada ? '೧,೦೬೦+ ಯೋಜನೆಗಳು & ಸೇವೆಗಳು' : '1,060+ Schemes & Services'}</span>
              </Link>
            </li>
            <li>
              <Link to="/finder" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <FileText size={14} color="#38bdf8" />
                <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆ ಹುಡುಕಿ' : 'Find Schemes for Me'}</span>
              </Link>
            </li>
            <li>
              <Link to="/eligibility" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <CheckCircle2 size={14} color="#38bdf8" />
                <span>{isKannada ? 'ಕುಟುಂಬ ಅರ್ಹತಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Eligibility Calculator'}</span>
              </Link>
            </li>
            <li>
              <Link to="/tracking" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <Clock size={14} color="#38bdf8" />
                <span>{isKannada ? 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕಿಂಗ್ & ಡ್ರಾಫ್ಟ್‌ಗಳು' : 'Application Tracking & Drafts'}</span>
              </Link>
            </li>
            <li>
              <Link to="/grievance" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <AlertTriangle size={14} color="#38bdf8" />
                <span>{isKannada ? 'ಜನಸ್ಪಂದನ ದೂರು ನೋಂದಣಿ' : 'Grievance Redressal (1902)'}</span>
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#fef08a', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 700 }}>
                <Shield size={14} color="#fef08a" />
                <span>{isKannada ? 'ಅಧಿಕೃತ ಇಲಾಖಾ ಲಾಗಿನ್' : 'Official / Citizen Workspace'}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Official State & National Portals */}
        <div>
          <h5 style={{
            color: '#fef08a',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isKannada ? 'ಅಧಿಕೃತ ಸರಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು' : 'Government Portals'}
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, fontSize: '0.82rem' }}>
            <li>
              <a href="https://karnataka.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>Karnataka State Portal</span>
              </a>
            </li>
            <li>
              <a href="https://sevasindhu.karnataka.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>Seva Sindhu Citizen Services</span>
              </a>
            </li>
            <li>
              <a href="http://sakala.kar.nic.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>Sakala Guaranteed Services</span>
              </a>
            </li>
            <li>
              <a href="https://janaspandana.karnataka.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>Janaspandana Integrated Grievance</span>
              </a>
            </li>
            <li>
              <a href="https://fruits.karnataka.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>FRUITS Farmer Registration</span>
              </a>
            </li>
            <li>
              <a href="https://ssp.postmatric.karnataka.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={13} color="#94a3b8" />
                <span>State Scholarship Portal (SSP)</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Helplines & Architectural Assurance */}
        <div>
          <h5 style={{
            color: '#fef08a',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isKannada ? 'ಸಹಾಯವಾಣಿ ಮತ್ತು ಭದ್ರತೆ' : 'Helplines & Standards'}
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '4px' }}>
              <span style={{ color: '#cbd5e1' }}>Janaspandana:</span>
              <a href="tel:1902" style={{ color: '#38bdf8', fontWeight: 800, textDecoration: 'none' }}>1902</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '4px' }}>
              <span style={{ color: '#cbd5e1' }}>Kisan Call Centre:</span>
              <a href="tel:18001801551" style={{ color: '#38bdf8', fontWeight: 800, textDecoration: 'none' }}>1800-180-1551</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '4px' }}>
              <span style={{ color: '#cbd5e1' }}>Women Helpline:</span>
              <a href="tel:1091" style={{ color: '#38bdf8', fontWeight: 800, textDecoration: 'none' }}>1091</a>
            </div>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: '1.45', margin: 0 }}>
            {isKannada
              ? 'ಕರ್ನಾಟಕದ ೩೧ ಜಿಲ್ಲೆಗಳು ಮತ್ತು ೬,೦೦೦+ ಗ್ರಾಮ ಪಂಚಾಯಿತಿಗಳ ನಾಗರಿಕರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.'
              : 'Designed for resilient rural access across Karnataka\'s 31 districts and 6,000+ Gram Panchayats.'}
          </p>
        </div>
      </div>

      {/* Legal & Regulatory Bottom Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '16px 20px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#94a3b8',
        lineHeight: '1.6'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <strong>Public Notice & Regulatory Disclaimer:</strong> OfflineBridge is an independent, offline-first digital public inclusion initiative. It provides local draft preservation and direct guidance for citizen entitlements. It is not an official portal of the Government of Karnataka. Public scheme information and statutory rules are compiled from authorized department sources.
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#64748b' }}>
          © {new Date().getFullYear()} OfflineBridge · Digital Public Infrastructure Initiative · Bilingual (English & ಕನ್ನಡ)
        </div>
      </div>
    </footer>
  );
}

