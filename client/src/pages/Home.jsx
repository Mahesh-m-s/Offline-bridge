import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { triggerSyncNow } from '../sync/syncEngine';
import { useTranslation } from 'react-i18next';
import {
  WifiOff, CloudUpload, Sparkles, ArrowRight,
  CreditCard, Tractor, GraduationCap, FileCheck,
  ShieldCheck, RefreshCw, Users, PlayCircle,
  Search, X, CheckCircle2, ChevronRight, Zap
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
        <text x="305" y="258" fontSize="7" fill="#007C89" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">OFFLINEBRIDGE</text>
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
        <text x="65" y="138" fontSize="8.5" fill="#102A43" fontWeight="700" fontFamily="sans-serif">"Services for</text>
        <text x="65" y="151" fontSize="8.5" fill="#102A43" fontWeight="700" fontFamily="sans-serif">every community"</text>
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

function HeroCarousel() {
  const slides = [
    ['Fill when you can connect', 'Your draft is stored on this device as you complete it.'],
    ['Keep working through signal loss', 'Continue service forms even when the network drops away.'],
    ['Sync when you are ready', 'Queued applications are sent securely when the service is reachable.']
  ];
  const [active, setActive] = useState(0);
  const [lowData, setLowData] = useState(localStorage.getItem('offlinebridge_low_data') === 'true');
  useEffect(() => {
    const onLowData = (event) => setLowData(event.detail.enabled);
    window.addEventListener('offlinebridge:low-data', onLowData);
    return () => window.removeEventListener('offlinebridge:low-data', onLowData);
  }, []);
  useEffect(() => {
    if (lowData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive((index) => (index + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [lowData]);
  const move = (direction) => setActive((index) => (index + direction + slides.length) % slides.length);
  return <div className="hero-carousel" aria-label="OfflineBridge highlights">
    <HeroVisual />
    <div className="hero-carousel-caption" aria-live="polite"><button onClick={() => move(-1)} aria-label="Previous highlight">‹</button>
      <div><b>{slides[active][0]}</b><span>{slides[active][1]}</span></div>
      <button onClick={() => move(1)} aria-label="Next highlight">›</button>
    </div>
    <div className="hero-carousel-dots" aria-label="Choose highlight">{slides.map((slide, index) => <button key={slide[0]} aria-label={`Show highlight ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div>
  </div>;
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Quick Eligibility Tool state
  const [quickRole, setQuickRole] = useState('Farmer');
  const [quickIncome, setQuickIncome] = useState('low');
  
  // Interactive Tracker state
  const [trackerQuery, setTrackerQuery] = useState('');
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(false);

  const pendingSubmissionsCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('pending').count(), [], 0
  );
  const pendingGrievancesCount = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('pending').count(), [], 0
  );
  const totalPending = (pendingSubmissionsCount || 0) + (pendingGrievancesCount || 0);

  const handleManualSyncClick = async () => {
    setIsManualSyncing(true);
    try {
      await triggerSyncNow();
      setSyncFeedback(true);
      setTimeout(() => setSyncFeedback(false), 3000);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackerQuery.trim()) return;
    navigate(`/tracker?ref=${encodeURIComponent(trackerQuery.trim())}`);
  };

  const getQuickEligibilityResult = () => {
    if (quickRole === 'Farmer') {
      return {
        count: quickIncome === 'high' ? 1 : 2,
        schemes: ['PM-Kisan Samman Nidhi', 'Kisan Credit Card (KCC)'],
        benefit: '₹6,000/yr Direct Support + Subsidized Crop Credit',
        link: '/services/pm_kisan'
      };
    }
    if (quickRole === 'Student') {
      return {
        count: 2,
        schemes: ['Post-Matric Rural Youth Scholarship', 'Rural Girl Child Higher Education Grant'],
        benefit: 'Tuition Fee Waiver + ₹50,000 Education Grant',
        link: '/services/post_matric_scholarship'
      };
    }
    if (quickRole === 'Senior') {
      return {
        count: 1,
        schemes: ['National Old Age Pension Scheme'],
        benefit: '₹1,500 Monthly Pension Direct to Bank',
        link: '/schemes'
      };
    }
    return {
      count: 2,
      schemes: ['Caste & Income Certificate', 'PMAY (Gramin) Housing Support'],
      benefit: 'Gram Panchayat Digital Certificate Delivery + Housing Aid',
      link: '/services/caste_income_certificate'
    };
  };

  const quickResult = getQuickEligibilityResult();

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

  const filteredServices = featuredServices.filter((service) => {
    const matchesTab = activeTab === 'All' || service.category.toLowerCase().includes(activeTab.toLowerCase());
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
                  padding: '0.35rem 0.85rem', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.85)', border: '1.5px solid #BAE6FD',
                  fontSize: '0.75rem', fontWeight: 800, color: '#0369A1',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(2,132,199,0.1)'
                }}>
                  <ShieldCheck style={{ width: '14px', height: '14px', color: '#0284C7' }} />
                  {t('home.eyebrow')}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.35rem 0.85rem', borderRadius: '999px',
                  background: '#ECFDF5', border: '1.5px solid #A7F3D0',
                  fontSize: '0.75rem', fontWeight: 800, color: '#065F46',
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  Empowering Citizens —
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
                fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.03em',
                lineHeight: 1.12, marginBottom: '1.25rem'
              }}>
                {t('home.title')}
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--navy-400)',
                lineHeight: 1.75, marginBottom: '2rem', maxWidth: '490px'
              }}>
                {t('home.description')}
              </p>

              {/* Standout CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/services" className="ob-btn-primary pulse-cta">
                  <span>{t('home.browse')}</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </Link>
                <Link to="/eligibility" className="ob-btn-secondary">
                  <Sparkles style={{ width: '18px', height: '18px', color: '#FF7700' }} />
                  <span>{t('home.eligibility')}</span>
                </Link>
              </div>

              {/* Pending Sync Notice */}
              {totalPending > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '0.75rem', padding: '0.875rem 1.125rem',
                  background: '#FFFBEB', border: '1.5px solid #FCD34D',
                  borderRadius: '14px', marginBottom: '1.75rem',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <CloudUpload style={{ width: '20px', height: '20px', color: '#D97706', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
                      {totalPending} submission(s) saved locally, waiting to sync.
                    </p>
                  </div>
                  <Link to="/tracker" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D97706', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    Open Tracker →
                  </Link>
                </div>
              )}

              {/* Feature pills row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                {[
                  { icon: WifiOff, label: 'Works 100% Offline' },
                  { icon: RefreshCw, label: 'Auto Background Sync' },
                  { icon: ShieldCheck, label: 'Device Encrypted' },
                  { icon: Users, label: 'Kannada & English' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.85rem', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(203,213,225,0.7)',
                    fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-700)',
                    backdropFilter: 'blur(6px)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
                  }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#0284C7' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          INTERACTIVE CONSOLE STRIP (Storage & Manual Sync)
          ════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '80rem', margin: '-1rem auto 1.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '16px',
          padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', flexWrap: 'wrap', boxShadow: '0 4px 18px rgba(15,23,42,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3rem 0.75rem', borderRadius: '999px', background: '#ECFDF5',
              border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.75rem', fontWeight: 800
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Storage: Ready
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--navy-700)', fontWeight: 600 }}>
              4 Official Service Forms Cached in Local Device Memory (IndexedDB)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {syncFeedback && (
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', animation: 'fadeIn 0.2s ease' }}>
                ✓ Sync engine triggered!
              </span>
            )}
            <button
              onClick={handleManualSyncClick}
              disabled={isManualSyncing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF', border: 'none', fontSize: '0.8rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw style={{ width: '13px', height: '13px', animation: isManualSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isManualSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          INTERACTIVE FEATURE 1: 30-SECOND QUICK ELIGIBILITY FINDER
          ════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '80rem', margin: '0 auto 2.5rem', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 50%, #FFF7ED 100%)',
          border: '2px solid #FDBA74', borderRadius: '24px',
          padding: '2rem', boxShadow: '0 10px 30px rgba(255,85,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EA580C', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                <Zap style={{ width: '14px', height: '14px' }} />
                Interactive Instant Matcher
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Check Your Eligibility in 15 Seconds
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--navy-400)', marginTop: '0.2rem' }}>
                Pick your profile below to see which state & national welfare schemes you qualify for immediately.
              </p>
            </div>
            <Link to="/eligibility" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.84rem', fontWeight: 800, color: '#EA580C',
              textDecoration: 'none', background: '#FFF7ED', padding: '0.5rem 1rem',
              borderRadius: '10px', border: '1px solid #FDBA74'
            }}>
              Full Calculator Form <ChevronRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            {/* Interactive Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  1. Select Citizen Profile
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'Farmer', label: '🌾 Farmer / Kissan' },
                    { id: 'Student', label: '🎓 Rural Student' },
                    { id: 'Senior', label: '🧓 Senior Citizen (60+)' },
                    { id: 'Resident', label: '🏡 Rural Resident' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setQuickRole(role.id)}
                      style={{
                        padding: '0.7rem 0.85rem', borderRadius: '12px',
                        fontSize: '0.82rem', fontWeight: quickRole === role.id ? 800 : 600,
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease',
                        border: quickRole === role.id ? '2px solid #FF5500' : '1.5px solid #CBD5E1',
                        background: quickRole === role.id ? '#FFF7ED' : '#FFFFFF',
                        color: quickRole === role.id ? '#C2410C' : 'var(--navy-700)',
                        boxShadow: quickRole === role.id ? '0 4px 12px rgba(255,85,0,0.15)' : 'none'
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  2. Household Annual Income
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'low', label: '< ₹1.5 Lakhs' },
                    { id: 'mid', label: '₹1.5L - ₹3L' },
                    { id: 'high', label: '> ₹3 Lakhs' }
                  ].map((inc) => (
                    <button
                      key={inc.id}
                      type="button"
                      onClick={() => setQuickIncome(inc.id)}
                      style={{
                        padding: '0.65rem 0.5rem', borderRadius: '12px',
                        fontSize: '0.78rem', fontWeight: quickIncome === inc.id ? 800 : 600,
                        textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
                        border: quickIncome === inc.id ? '2px solid #0284C7' : '1.5px solid #CBD5E1',
                        background: quickIncome === inc.id ? '#F0F9FF' : '#FFFFFF',
                        color: quickIncome === inc.id ? '#0369A1' : 'var(--navy-700)',
                        boxShadow: quickIncome === inc.id ? '0 4px 12px rgba(2,132,199,0.15)' : 'none'
                      }}
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Result Card */}
            <div style={{
              background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 6px 20px rgba(15,23,42,0.05)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                    background: '#ECFDF5', border: '1px solid #A7F3D0',
                    color: '#065F46', fontSize: '0.75rem', fontWeight: 800
                  }}>
                    <CheckCircle2 style={{ width: '13px', height: '13px', color: '#10B981' }} />
                    Eligible: {quickResult.count} Schemes
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--navy-300)', fontWeight: 700 }}>
                    Instant Recommendation
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  {quickResult.schemes.join(' & ')}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#047857', fontWeight: 700, marginBottom: '0.75rem' }}>
                  🎁 Benefit: {quickResult.benefit}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--navy-400)', lineHeight: 1.5 }}>
                  Based on your entered profile ({quickRole}, {quickIncome === 'low' ? '< ₹1.5L' : quickIncome === 'mid' ? '₹1.5L - ₹3L' : '> ₹3L'}). No identity documents required for preliminary check.
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to={quickResult.link} className="ob-btn-primary" style={{ flex: 1, minHeight: '44px', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                  Apply Now Offline <ArrowRight style={{ width: '15px', height: '15px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURED SERVICES WITH INTERACTIVE TABS & SEARCH
          ════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 0 3rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 className="ob-section-title">Citizen Services Directory</h2>
              <p className="ob-section-subtitle">
                Fill, validate, and store applications locally. Auto-syncs to Gram Panchayat & District servers.
              </p>
            </div>
            <Link to="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', fontWeight: 800, color: '#0284C7',
              textDecoration: 'none', whiteSpace: 'nowrap'
            }}>
              View Full Directory <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>

          {/* Interactive Filter Bar & Live Search */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem',
            padding: '0.875rem 1rem', background: '#F8FAFC', borderRadius: '16px',
            border: '1.5px solid #E2E8F0'
          }}>
            {/* Category Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: 'All Services (4)' },
                { id: 'Agriculture', label: '🌾 Agriculture (2)' },
                { id: 'Education', label: '🎓 Education (1)' },
                { id: 'Revenue', label: '📋 Revenue (1)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '10px',
                    fontSize: '0.82rem', fontWeight: activeTab === tab.id ? 800 : 600,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    border: activeTab === tab.id ? '1.5px solid #FF5500' : '1.5px solid #CBD5E1',
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #FF5500 0%, #FF7700 100%)' : '#FFFFFF',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--navy-700)',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255,85,0,0.3)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
              <Search style={{ width: '16px', height: '16px', color: '#64748B', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Filter services by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', height: '40px', paddingLeft: '36px', paddingRight: searchQuery ? '36px' : '12px',
                  borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem',
                  color: 'var(--navy-900)', background: '#FFFFFF', outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredServices.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
              <p style={{ fontWeight: 700, color: 'var(--navy-700)', marginBottom: '0.5rem' }}>No services match your search or filter.</p>
              <button
                onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                  background: 'var(--blue-500)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {filteredServices.map((service) => {
                const Icon = service.icon;
                const { cls, iconCls } = getCatStyle(service.category);
                return (
                  <div key={service.id} className="ob-service-card">
                    <div className={`ob-service-card__icon-wrap ${iconCls}`}>
                      <Icon style={{ width: '26px', height: '26px' }} />
                    </div>
                    <span className={`ob-service-card__category ${cls}`} style={{
                      display: 'inline-block', padding: '3px 9px', borderRadius: '6px',
                      border: '1px solid', marginBottom: '0.5rem', width: 'fit-content'
                    }}>
                      {service.category.toUpperCase()}
                    </span>
                    <h3 className="ob-service-card__title">{service.title}</h3>
                    <p className="ob-service-card__desc">{service.description}</p>
                    <div className="ob-service-card__footer">
                      <span className="ob-offline-badge">
                        <span className="ob-offline-dot" />
                        Offline Form Ready
                      </span>
                      <Link to={`/services/${service.id}`} className="ob-card-arrow-btn" aria-label={`Apply for ${service.title}`}>
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          INTERACTIVE FEATURE 2: INSTANT APPLICATION TRACKER WIDGET
          ════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '80rem', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
          border: '1.5px solid #BAE6FD', borderRadius: '24px',
          padding: '2.25rem', boxShadow: '0 8px 24px rgba(2,132,199,0.08)'
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 0.8rem', borderRadius: '999px',
              background: '#FFFFFF', border: '1px solid #7DD3FC',
              fontSize: '0.75rem', fontWeight: 800, color: '#0369A1', marginBottom: '0.75rem'
            }}>
              <Search style={{ width: '13px', height: '13px' }} />
              Live Application Tracking
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Track Your Application or Grievance
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--navy-400)', marginBottom: '1.5rem' }}>
              Check the status of your submitted forms, Gram Panchayat approvals, or grievance redressals.
            </p>

            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Enter Reference No. (e.g. OB-DEMO-S-000001)"
                value={trackerQuery}
                onChange={(e) => setTrackerQuery(e.target.value)}
                style={{
                  flex: '1 1 280px', maxWidth: '420px', height: '50px',
                  padding: '0 1.25rem', borderRadius: '12px',
                  border: '2px solid #CBD5E1', fontSize: '0.9rem',
                  outline: 'none', background: '#FFFFFF', color: 'var(--navy-900)', fontWeight: 600
                }}
              />
              <button
                type="submit"
                className="ob-btn-primary"
                style={{ minHeight: '50px', padding: '0 1.75rem' }}
              >
                Track Status <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Quick Demo Queries:</span>
              <button
                type="button"
                onClick={() => setTrackerQuery('OB-DEMO-S-000001')}
                style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BAE6FD', cursor: 'pointer' }}
              >
                OB-DEMO-S-000001 (Approved)
              </button>
              <button
                type="button"
                onClick={() => setTrackerQuery('OB-DEMO-G-000001')}
                style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BAE6FD', cursor: 'pointer' }}
              >
                OB-DEMO-G-000001 (Grievance)
              </button>
            </div>
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
          BOTTOM CTA BAND WITH STANDOUT BUTTONS
          ════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0F2D37 100%)',
        padding: '4rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Ambient glow spots */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,85,0,0.18) 0%, rgba(2,132,199,0.15) 60%, transparent 80%)',
          pointerEvents: 'none', filter: 'blur(35px)'
        }} />

        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.85rem', borderRadius: '999px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#FDBA74', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '1rem'
          }}>
            <Zap style={{ width: '13px', height: '13px' }} />
            Zero Connectivity Barrier
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            Ready to Access Essential Rural Services?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginBottom: '2.25rem', lineHeight: 1.7 }}>
            Complete your applications offline today. Data is preserved safely on this device and synced whenever connectivity resumes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services" className="ob-btn-primary pulse-cta" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
              <span>Browse All Services</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <Link to="/eligibility" className="ob-btn-secondary" style={{
              background: 'rgba(255,255,255,0.12)', color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.3)', minHeight: '52px', padding: '1rem 2rem'
            }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#FDBA74' }} />
              <span>Check Eligibility</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
