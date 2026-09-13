import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ServiceList from './pages/ServiceList';
import ServiceForm from './pages/ServiceForm';
import EligibilityAssistant from './pages/EligibilityAssistant';
import ApplicationTracker from './pages/ApplicationTracker';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceTracker from './pages/GrievanceTracker';
import Login from './pages/Login';

import { initializeDbSeed } from './db/db';
import { initSyncEngine } from './sync/syncEngine';

export default function App() {
  useEffect(() => {
    // Seed offline form templates into Dexie on startup
    initializeDbSeed();

    // Register background sync engine event listeners (online/offline)
    initSyncEngine();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/:serviceType" element={<ServiceForm />} />
        <Route path="/eligibility" element={<EligibilityAssistant />} />
        <Route path="/tracker" element={<ApplicationTracker />} />
        <Route path="/grievance" element={<GrievanceForm />} />
        <Route path="/grievances/track" element={<GrievanceTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
