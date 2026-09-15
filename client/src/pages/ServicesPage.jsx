import React from 'react';
import { FileText, CheckCircle2, WifiOff, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      id: 'agri-seed-subsidy',
      title: 'Farmer Seed & Fertilizer Subsidy',
      dept: 'Department of Agriculture',
      desc: 'Financial support for small and marginal farmers purchasing certified seasonal crop seeds.',
      offlineReady: true
    },
    {
      id: 'old-age-pension',
      title: 'Senior Citizen Pension Scheme',
      dept: 'Social Welfare Department',
      desc: 'Monthly financial assistance for rural citizens aged 60 and above below the poverty line.',
      offlineReady: true
    },
    {
      id: 'rural-housing-assist',
      title: 'Rural Pucca Housing Grant',
      dept: 'Rural Development Authority',
      desc: 'Assistance for constructing permanent houses for families without pucca accommodation.',
      offlineReady: true
    },
    {
      id: 'ration-card-update',
      title: 'Ration Card Correction & Addition',
      dept: 'Food & Civil Supplies',
      desc: 'Add family members or correct address and head-of-household details on your ration card.',
      offlineReady: true
    }
  ];

  return (
    <div className="services-page">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Available Government Services
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          All forms listed below can be opened, filled, and saved locally even if you do not have an internet connection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {services.map((svc) => (
          <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {svc.dept}
              </span>
              {svc.offlineReady && (
                <span className="feature-pill" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)' }}>
                  <WifiOff size={12} /> Cached Offline
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              {svc.title}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>
              {svc.desc}
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => alert(`Service form "${svc.title}" will be activated in Milestone 5 (Form Engine).`)}
              style={{ width: '100%' }}
            >
              <FileText size={18} />
              <span>Open Application</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
