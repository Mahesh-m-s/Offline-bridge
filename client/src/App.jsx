import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

      {/* Complete Karnataka DPI & SaaS Footer */}
      <Footer />
    </div>
  </AuthProvider>
  );
}

