import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrackingPage() {
  return (
    <div className="tracking-page">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          My Applications & Submissions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review the status of your submitted applications and offline sync queue.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '36px 20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#e0e7ff',
          color: '#4338ca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Clock size={32} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
          Application Tracking Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
          Real-time submission status tracking (Pending Sync, Under Review, Approved, Rejected) with offline cache persistence will be connected in <strong>Milestone 10 & 12</strong>.
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
          <CheckCircle2 size={16} color="var(--primary)" />
          <span>Scheduled for Milestone 10 & 12</span>
        </div>
      </div>
    </div>
  );
}
