import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
const Home = lazy(() => import('./pages/Home'));
const ServiceList = lazy(() => import('./pages/ServiceList'));
const ServiceForm = lazy(() => import('./pages/ServiceForm'));
const EligibilityAssistant = lazy(() => import('./pages/EligibilityAssistant'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker'));
const GrievanceForm = lazy(() => import('./pages/GrievanceForm'));
const GrievanceTracker = lazy(() => import('./pages/GrievanceTracker'));
const Login = lazy(() => import('./pages/Login'));
const About = lazy(() => import('./pages/About'));
const Helpline = lazy(() => import('./pages/Helpline'));

import { initializeDbSeed, refreshCatalog } from './db/db';
import { initSyncEngine } from './sync/syncEngine';
import RouteErrorBoundary from './components/RouteErrorBoundary';

export default function App() {
  useEffect(() => {
    // Seed offline form templates into Dexie on startup
    initializeDbSeed();
    if (navigator.onLine) refreshCatalog().catch(() => {});
    const online = () => refreshCatalog().catch(() => {});
    window.addEventListener('online', online);

    // Register background sync engine event listeners (online/offline)
    initSyncEngine();
    return () => window.removeEventListener('online', online);
  }, []);

  return (
    <Layout>
      <RouteErrorBoundary><Suspense fallback={<div className="page-loading" role="status">Loading service…</div>}><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/schemes" element={<EligibilityAssistant />} />
        <Route path="/services/:serviceType" element={<ServiceForm />} />
        <Route path="/eligibility" element={<EligibilityAssistant />} />
        <Route path="/tracker" element={<ApplicationTracker />} />
        <Route path="/grievance" element={<GrievanceForm />} />
        <Route path="/grievances/track" element={<GrievanceTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/helpline" element={<Helpline />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></Suspense></RouteErrorBoundary>
    </Layout>
  );
}
