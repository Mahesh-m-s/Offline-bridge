import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import EligibilityPage from './pages/EligibilityPage';
import TrackingPage from './pages/TrackingPage';
import GrievancePage from './pages/GrievancePage';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/eligibility" element={<EligibilityPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/grievance" element={<GrievancePage />} />
        </Routes>
      </main>

      {/* PWA Install Promotion Banner */}
      <InstallPrompt />

      {/* Authentic Karnataka Government Footer */}
      <footer className="gov-footer" style={{
        backgroundColor: 'var(--gov-blue-dark)',
        color: '#e2e8f0',
        borderTop: '3px solid #f59e0b',
        marginTop: 'auto',
        fontSize: '0.85rem'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '24px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src="/icons/karnataka-emblem.svg" alt="Emblem" style={{ width: '40px', height: '40px' }} />
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800 }}>GOVERNMENT OF KARNATAKA</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rural Development & Panchayat Raj Department</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              OfflineBridge provides uninterrupted government service delivery, scheme discovery, and grievance tracking for citizens under unstable connectivity conditions.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#fef08a', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
              Official Portals
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
              <li><a href="https://karnataka.gov.in" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>Karnataka State Portal</a></li>
              <li><a href="https://sevasindhu.karnataka.gov.in" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>Seva Sindhu Services</a></li>
              <li><a href="https://janaspandana.karnataka.gov.in" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>Janaspandana Grievance</a></li>
              <li><a href="https://mahitikanaja.karnataka.gov.in" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>Mahiti Kanaja Open Data</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#fef08a', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
              Project Information (Batch D4)
            </h5>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>Institution:</strong> The National Institute of Engineering, Mysuru</p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>Dept:</strong> Information Science and Engineering</p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>Guide:</strong> Dr. S Kuzhalvaimozhi</p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Abhishek G.P • Mahesh M.S • Rajesh N • S M Shrivathsa Nonavinakere
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          Website Content Managed by Rural Development & Panchayat Raj Dept., Govt. of Karnataka. Designed as an Offline-First Progressive Web App.
        </div>
      </footer>
    </div>
  );
}

