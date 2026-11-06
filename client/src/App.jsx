import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import ArivuNetChatbot from './components/ArivuNetChatbot';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import SchemeFinderPage from './pages/SchemeFinderPage';
import EligibilityPage from './pages/EligibilityPage';
import TrackingPage from './pages/TrackingPage';
import GrievancePage from './pages/GrievancePage';
import PortalLoginPage from './pages/PortalLoginPage';
import CitizenPortalPage from './pages/CitizenPortalPage';
import OfficialPortalPage from './pages/OfficialPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';

export default function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/finder" element={<SchemeFinderPage />} />
            <Route path="/eligibility" element={<EligibilityPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/grievance" element={<GrievancePage />} />
            
            {/* Role Authentication & Portals */}
            <Route path="/login" element={<PortalLoginPage />} />
            <Route path="/login/:role" element={<PortalLoginPage />} />
            
            <Route
              path="/portal/citizen"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenPortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/official"
              element={
                <ProtectedRoute allowedRoles={['official']}>
                  <OfficialPortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPortalPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

      {/* PWA Install Promotion Banner */}
      <InstallPrompt />

      {/* Grounded RAG AI Assistant */}
      <ArivuNetChatbot />

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
              <img src="/icons/arivunet-logo.svg" alt="ArivuNet Logo" style={{ width: '38px', height: '38px' }} />
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800 }}>ArivuNet (ಅರಿವುನೆಟ್)</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rural Digital Services Platform — Karnataka</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              ArivuNet provides uninterrupted government service delivery, scheme discovery, and grievance tracking for citizens under unstable connectivity conditions.
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
              Architecture & Inclusion
            </h5>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>PWA Engine:</strong> Service Workers with Offline Pre-caching</p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>Draft Storage:</strong> Local Browser IndexedDB Layer</p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}><strong>Accessibility:</strong> High-Contrast, Font Rescaling, Bilingual</p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
              Designed for resilient rural access across Karnataka's 31 districts and 6,000+ Gram Panchayats.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '0.76rem',
          color: '#94a3b8',
          lineHeight: '1.5'
        }}>
          ArivuNet (ಅರಿವುನೆಟ್) is an independent, offline-first public service portal and digital inclusion initiative. Not an official portal of the Government of Karnataka. Public scheme information referenced from authorized department sources.
        </div>
      </footer>
    </div>
  </AuthProvider>
  );
}

