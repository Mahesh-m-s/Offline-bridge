import React from 'react';
import { CheckSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function EligibilityPage() {
  return (
    <div className="eligibility-page">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Scheme Eligibility Assistant
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Discover government welfare programs suited to your family's profile without waiting at a government office.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '36px 20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <CheckSquare size={32} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
          Offline Rule-Based Questionnaire
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
          The rule-based eligibility evaluation engine is scheduled for <strong>Milestone 11</strong>.
          It will run 100% inside your browser using cached scheme parameters — requiring zero active internet connection.
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
          <Sparkles size={16} color="var(--primary)" />
          <span>Coming in Milestone 11</span>
        </div>
      </div>
    </div>
  );
}
