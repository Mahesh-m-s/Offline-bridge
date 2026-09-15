import React from 'react';
import { AlertTriangle, Send, Shield } from 'lucide-react';

export default function GrievancePage() {
  return (
    <div className="grievance-page">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          File a Citizen Grievance
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Submit complaints regarding local civic issues, ration delays, or scheme benefit holdups even when offline.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '36px 20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
          Offline Grievance Lodging
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
          Offline grievance submission, automatic draft protection, and background sync queuing will be implemented in <strong>Milestone 12</strong>.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-main)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <Shield size={16} color="var(--primary)" />
          <span>Scheduled for Milestone 12</span>
        </div>
      </div>
    </div>
  );
}
