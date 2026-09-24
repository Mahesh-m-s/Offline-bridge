import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  WifiOff, CloudUpload, Sparkles, ArrowRight,
  CreditCard, Tractor, GraduationCap, FileCheck,
  ShieldCheck, RefreshCw, Users, PlayCircle
} from 'lucide-react';

/* ── Hero Visual SVG (inline, no external images) ──────────── */
function HeroVisual() {
  return (
    <div style={{
      position: 'relative', flex: 1, maxWidth: '520px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '340px'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 60% 50%, rgba(0,175,193,0.10) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: '480px', height: 'auto', filter: 'drop-shadow(0 8px 32px rgba(0,175,193,0.12))' }}>

        {/* Background landscape */}
        <ellipse cx="240" cy="310" rx="230" ry="50" fill="#EBF9FB" opacity="0.6"/>
        {/* Hills */}
        <path d="M0 280 Q80 220 160 250 Q240 200 320 240 Q400 210 480 250 L480 360 L0 360Z" fill="#D0F4F8" opacity="0.5"/>
        <path d="M0 300 Q100 260 200 280 Q300 260 480 290 L480 360 L0 360Z" fill="#A1E9F2" opacity="0.3"/>
        {/* Fields */}
        <path d="M40 320 Q100 300 200 310 Q300 305 440 315 L440 360 L40 360Z" fill="#DCFCE7" opacity="0.7"/>

        {/* Sun / warm light */}
        <circle cx="380" cy="70" r="45" fill="#FEF3C7" opacity="0.6"/>
        <circle cx="380" cy="70" r="30" fill="#FDE68A" opacity="0.5"/>
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <line key={i}
            x1={380 + Math.cos(angle * Math.PI/180) * 35}
            y1={70  + Math.sin(angle * Math.PI/180) * 35}
            x2={380 + Math.cos(angle * Math.PI/180) * 52}
            y2={70  + Math.sin(angle * Math.PI/180) * 52}
            stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        ))}

        {/* Palm trees */}
        <rect x="390" y="200" width="6" height="100" rx="3" fill="#A7D7A0"/>
        <ellipse cx="393" cy="195" rx="20" ry="14" fill="#4ADE80" opacity="0.7"/>
        <ellipse cx="378" cy="205" rx="14" ry="9" fill="#4ADE80" opacity="0.6" transform="rotate(-20 378 205)"/>
        <ellipse cx="410" cy="205" rx="14" ry="9" fill="#4ADE80" opacity="0.6" transform="rotate(20 410 205)"/>

        <rect x="55" y="220" width="5" height="90" rx="2.5" fill="#A7D7A0"/>
        <ellipse cx="57" cy="216" rx="16" ry="11" fill="#4ADE80" opacity="0.6"/>
        <ellipse cx="44" cy="224" rx="11" ry="7" fill="#4ADE80" opacity="0.5" transform="rotate(-15 44 224)"/>

        {/* Farmer figure */}
        {/* Body */}
        <rect x="175" y="185" width="38" height="90" rx="8" fill="#E0D5C5"/>
        {/* Shirt */}
        <rect x="178" y="200" width="32" height="55" rx="6" fill="#F5F0E8"/>
        {/* Head */}
        <circle cx="194" cy="175" r="22" fill="#D4A88C"/>
        {/* Turban */}
        <path d="M172 168 Q194 145 216 168 Q210 155 194 152 Q178 155 172 168Z" fill="#FFFFFF" opacity="0.95"/>
        <path d="M173 165 Q194 148 215 165" stroke="#E0D5C5" strokeWidth="1.5" fill="none"/>
        {/* Face details */}
        <circle cx="188" cy="176" r="2" fill="#8B5E3C"/>
        <circle cx="200" cy="176" r="2" fill="#8B5E3C"/>
        <path d="M188 185 Q194 190 200 185" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Arm holding phone */}
        <path d="M213 225 Q235 215 238 235" stroke="#D4A88C" strokeWidth="10" strokeLinecap="round" fill="none"/>
        {/* Phone */}
        <rect x="230" y="218" width="26" height="44" rx="5" fill="#1F2937"/>
        <rect x="232" y="221" width="22" height="36" rx="3" fill="#00AFC1" opacity="0.9"/>
        {/* Phone screen content */}
        <rect x="235" y="224" width="16" height="3" rx="1.5" fill="white" opacity="0.9"/>
        <rect x="235" y="230" width="12" height="2" rx="1" fill="white" opacity="0.6"/>
        <rect x="235" y="235" width="14" height="2" rx="1" fill="white" opacity="0.6"/>
        <circle cx="243" cy="246" r="5" fill="white" opacity="0.3"/>
        <path d="M240 246 L246 243 L246 249Z" fill="white" opacity="0.9"/>

        {/* Connectivity lines from phone */}
        <g opacity="0.7">
          <line x1="256" y1="232" x2="295" y2="195" stroke="#00AFC1" strokeWidth="1.5" strokeDasharray="4 3"/>
          <line x1="256" y1="240" x2="310" y2="260" stroke="#007C89" strokeWidth="1.5" strokeDasharray="4 3"/>
          <line x1="256" y1="245" x2="285" y2="280" stroke="#16C7D8" strokeWidth="1" strokeDasharray="3 3"/>
        </g>

        {/* Floating UI cards */}
        {/* Card 1: Sync status */}
        <rect x="290" y="165" width="120" height="52" rx="10" fill="white" stroke="#B0E6ED" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,175,193,0.14))' }}/>
        <circle cx="308" cy="186" r="7" fill="#DCFCE7"/>
        <circle cx="308" cy="186" r="4" fill="#16A34A"/>
        <rect x="320" y="179" width="55" height="5" rx="2.5" fill="#102A43" opacity="0.8"/>
        <rect x="320" y="188" width="40" height="3.5" rx="1.75" fill="#526B7A" opacity="0.5"/>
        <rect x="320" y="197" width="52" height="3" rx="1.5" fill="#00AFC1" opacity="0.4"/>

        {/* Card 2: India map hint */}
        <rect x="295" y="240" width="115" height="64" rx="10" fill="white" stroke="#B0E6ED" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,175,193,0.12))' }}/>
        <text x="305" y="258" fontSize="7" fill="#007C89" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">DIGITAL INDIA</text>
        {/* Mini India outline (simplified) */}
        <path d="M320 263 Q340 260 355 265 Q365 270 362 280 Q358 290 345 295 Q330 298 318 290 Q310 280 320 263Z"
          fill="#E8FAFC" stroke="#00AFC1" strokeWidth="1.2"/>
        <circle cx="340" cy="276" r="3.5" fill="#00AFC1" opacity="0.7"/>
        <circle cx="340" cy="276" r="7" fill="none" stroke="#00AFC1" strokeWidth="0.8" opacity="0.4"/>
        <text x="305" y="300" fontSize="6" fill="#526B7A" fontFamily="sans-serif">Services Beyond Networks</text>

        {/* Floating sync dot indicators */}
        <circle cx="270" cy="150" r="5" fill="#16A34A" opacity="0.8"/>
        <circle cx="270" cy="150" r="9" fill="none" stroke="#16A34A" strokeWidth="1" opacity="0.3"/>
        <circle cx="130" cy="200" r="4" fill="#00AFC1" opacity="0.6"/>
        <circle cx="130" cy="200" r="8" fill="none" stroke="#00AFC1" strokeWidth="1" opacity="0.3"/>

        {/* Quote bubble */}
        <rect x="50" y="120" width="140" height="44" rx="12" fill="white" stroke="#B0E6ED" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,175,193,0.10))' }}/>
        <text x="65" y="138" fontSize="8.5" fill="#102A43" fontWeight="700" fontFamily="sans-serif">"Digital India,</text>
        <text x="65" y="151" fontSize="8.5" fill="#102A43" fontWeight="700" fontFamily="sans-serif">for every village"</text>
      </svg>

      {/* Floating stat cards overlay */}
      <div style={{
        position: 'absolute', top: '8%', left: '0',
        background: 'white', borderRadius: '12px',
        border: '1.5px solid var(--border-cyan)',
        padding: '0.625rem 0.875rem',
        boxShadow: '0 4px 16px rgba(0,175,193,0.14)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        animation: 'fadeIn 0.6s ease 0.3s both'
      }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck style={{ width: '16px', height: '16px', color: '#16A34A' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--navy-900)', lineHeight: 1.2 }}>Works Offline</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--navy-300)', lineHeight: 1.2 }}>No internet needed</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '10%', right: '0',
        background: 'white', borderRadius: '12px',
        border: '1.5px solid var(--border-cyan)',
        padding: '0.625rem 0.875rem',
        boxShadow: '0 4px 16px rgba(0,175,193,0.14)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        animation: 'fadeIn 0.6s ease 0.5s both'
      }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--cyan-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw style={{ width: '15px', height: '15px', color: 'var(--cyan-500)' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--navy-900)', lineHeight: 1.2 }}>Auto Sync</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--navy-300)', lineHeight: 1.2 }}>When back online</div>
        </div>
      </div>
    </div>
  );
}

/* ── Category Colors ────────────────────────────────────────── */
const CATEGORIES = {
  Agriculture:         { cls: 'ob-cat-agriculture',      iconCls: 'ob-cat-agriculture-icon' },
  Education:           { cls: 'ob-cat-education',        iconCls: 'ob-cat-education-icon' },
  'Revenue & Panchayat':{ cls: 'ob-cat-revenue',         iconCls: 'ob-cat-revenue-icon' },
  Welfare:             { cls: 'ob-cat-welfare',          iconCls: 'ob-cat-welfare-icon' },
};
function getCatStyle(cat) {
  return CATEGORIES[cat] || CATEGORIES['Welfare'];
}

/* ── Main Component ─────────────────────────────────────────── */
export default function Home() {
  const pendingSubmissionsCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('pending').count(), [], 0
  );
  const pendingGrievancesCount = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('pending').count(), [], 0
  );
  const totalPending = (pendingSubmissionsCount || 0) + (pendingGrievancesCount || 0);

  const featuredServices = [
    {
      id: 'kisan_credit',
      title: 'Kisan Credit Card (KCC)',
      category: 'Agriculture',
      icon: CreditCard,
      description: 'Subsidized crop credit & agriculture term loans for small, marginal, and tenant farmers.'
    },
    {
      id: 'pm_kisan',
      title: 'PM-Kisan Samman Nidhi',
      category: 'Agriculture',
      icon: Tractor,
      description: 'Direct income support of ₹6,000 / year in three installments for landholding farmer families.'
    },
    {
      id: 'post_matric_scholarship',
      title: 'Post-Matric Rural Scholarship',
      category: 'Education',
      icon: GraduationCap,
      description: 'Financial assistance for rural students covering tuition, hostel allowances and more.'
    },
    {
      id: 'caste_income_certificate',
      title: 'Caste & Income Certificate',
      category: 'Revenue & Panchayat',
      icon: FileCheck,
      description: 'Apply for official revenue certificates with Gram Panchayat pickup or digital delivery.'
    }
  ];

  const pillars = [
    {
      icon: WifiOff,
      iconBg: '#DCFCE7', iconColor: '#15803D',
      title: 'Zero Data Loss',
      desc: 'Data is stored securely on your device as you type. Submissions are never lost if the network drops.'
    },
    {
      icon: Sparkles,
      iconBg: 'var(--cyan-50)', iconColor: 'var(--cyan-700)',
      title: 'Scheme Eligibility Check',
      desc: 'Answer 4 questions about land, income, and category to see which government schemes you qualify for.'
    },
    {
      icon: Users,
      iconBg: '#FEF3C7', iconColor: '#B45309',
      title: 'Grievance Redressal',
      desc: 'Register civic, ration, electricity, or water supply issues. Auto-synced to authorities when connected.'
    }
  ];

  return (
    <div>
      {/* ════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════ */}
      <section className="ob-hero">
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>

            {/* Left: Text Content */}
            <div style={{ flex: '1 1 380px', maxWidth: '560px' }}>
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: 'var(--cyan-50)', border: '1.5px solid var(--border-cyan)',
                  fontSize: '0.6875rem', fontWeight: 800, color: 'var(--cyan-700)',
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  Bridging Distances
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: '#ECFDF5', border: '1.5px solid #A7F3D0',
                  fontSize: '0.6875rem', fontWeight: 800, color: '#065F46',
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  Empowering Citizens —
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.03em',
                lineHeight: 1.12, marginBottom: '1.25rem'
              }}>
                Government Services,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--cyan-500) 0%, var(--cyan-700) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Closer to You
                </span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', color: 'var(--navy-400)',
                lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px'
              }}>
                Access and apply for essential government services even in low-network areas.
                Fill forms offline, save securely, and sync automatically when connectivity returns.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '2.5rem' }}>
                <Link to="/services" className="ob-btn-primary">
                  Browse Services
                  <ArrowRight style={{ width: '17px', height: '17px' }} />
                </Link>
                <Link to="/eligibility" className="ob-btn-secondary">
                  <PlayCircle style={{ width: '17px', height: '17px', color: 'var(--cyan-500)' }} />
                  How It Works
                </Link>
              </div>

              {/* Pending Sync Notice */}
              {totalPending > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '0.75rem', padding: '0.875rem 1rem',
                  background: 'var(--amber-50)', border: '1.5px solid #FCD34D',
                  borderRadius: '12px', marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <CloudUpload style={{ width: '18px', height: '18px', color: '#F59E0B', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400E' }}>
                      {totalPending} submission(s) saved locally, waiting to sync.
                    </p>
                  </div>
                  <Link to="/tracker" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    Open Tracker →
                  </Link>
                </div>
              )}

              {/* Feature pills row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                {[
                  { icon: WifiOff, label: 'Works Offline' },
                  { icon: RefreshCw, label: 'Auto Sync' },
                  { icon: ShieldCheck, label: 'Secure & Private' },
                  { icon: Users, label: 'For Every Citizen' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.35rem 0.75rem', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--border-default)',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy-700)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Icon style={{ width: '13px', height: '13px', color: 'var(--cyan-500)' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURED SERVICES
          ════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 0', background: '#FFFFFF', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 className="ob-section-title">Featured Citizen Services</h2>
              <p className="ob-section-subtitle">
                Most accessed schemes and services. Available offline for your convenience.
              </p>
            </div>
            <Link to="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', fontWeight: 700, color: 'var(--cyan-500)',
              textDecoration: 'none', whiteSpace: 'nowrap'
            }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              View All Services
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {featuredServices.map((service) => {
              const Icon = service.icon;
              const { cls, iconCls } = getCatStyle(service.category);
              return (
                <div key={service.id} className="ob-service-card">
                  <div className={`ob-service-card__icon-wrap ${iconCls}`}>
                    <Icon style={{ width: '24px', height: '24px' }} />
                  </div>
                  <span className={`ob-service-card__category ${cls}`} style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                    border: '1px solid', marginBottom: '0.5rem'
                  }}>
                    {service.category.toUpperCase()}
                  </span>
                  <h3 className="ob-service-card__title">{service.title}</h3>
                  <p className="ob-service-card__desc">{service.description}</p>
                  <div className="ob-service-card__footer">
                    <span className="ob-offline-badge">
                      <span className="ob-offline-dot" />
                      Available Offline
                    </span>
                    <Link to={`/services/${service.id}`} className="ob-card-arrow-btn" aria-label={`Apply for ${service.title}`}>
                      <ArrowRight style={{ width: '15px', height: '15px' }} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          3 CORE PILLARS
          ════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-app)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="ob-section-title">Why OfflineBridge?</h2>
            <p className="ob-section-subtitle" style={{ margin: '0.5rem auto 0', maxWidth: '520px' }}>
              Built for rural citizens who can't always rely on internet connectivity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="ob-stat-card">
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: p.iconColor }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--navy-400)', lineHeight: 1.7 }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BOTTOM CTA BAND
          ════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, var(--cyan-500) 0%, var(--cyan-700) 100%)',
        padding: '3rem 1.5rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Ready to access government services?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.65 }}>
            Start your application today — even without internet. Your data stays safe on this device.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', borderRadius: '12px', background: '#FFFFFF',
              color: 'var(--cyan-700)', fontWeight: 800, fontSize: '0.9375rem',
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              transition: 'transform 0.12s ease, box-shadow 0.12s ease'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'; }}
            >
              Browse All Services <ArrowRight style={{ width: '17px', height: '17px' }} />
            </Link>
            <Link to="/eligibility" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1.75rem', borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
              fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.35)',
              transition: 'background 0.12s ease'
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
              Check Eligibility
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
