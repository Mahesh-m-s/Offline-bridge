import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ArrowRightIcon,
  ShieldCheck,
  WifiOff,
  Sprout,
  Briefcase,
  Users,
  Monitor,
  HeartPulse,
  Compass,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  // Hero slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  // Selected category in left sidebar
  const [selectedCategory, setSelectedCategory] = useState('farmer');

  const slides = [
    {
      title: 'Lalbagh Botanical Garden Glasshouse, Bengaluru',
      desc: 'Historic botanical landmark — symbolizing Karnataka’s horticultural heritage and rural-urban connection.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #1e3a8a, #065f46)'
    },
    {
      title: 'Mysore Palace (Amba Vilas), Mysuru',
      desc: 'Seat of the historic Kingdom of Mysore — celebrated worldwide for architectural splendor and cultural heritage.',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f4460f78?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #831843, #78350f)'
    },
    {
      title: 'Stone Chariot at Vijaya Vittala Temple, Hampi',
      desc: 'UNESCO World Heritage monument showcasing the pinnacle of historical craft and endurance.',
      image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #9a3412, #451a03)'
    },
    {
      title: 'Jog Falls, Western Ghats, Shivamogga',
      desc: 'Magnificent plunge waterfall in Karnataka powering sustainable renewable energy across the state.',
      image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #064e3b, #0c4a6e)'
    }
  ];

  // Auto-advance hero slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Left sidebar category definitions
  const categories = [
    { id: 'farmer', title: 'Farmer / ರೈತ', sub: 'Seed, Crop, Subsidy', icon: Sprout },
    { id: 'businessman', title: 'Businessman / ಉದ್ಯಮಿ', sub: 'Trade, MSME, KVIC', icon: Briefcase },
    { id: 'citizen', title: 'Citizen / ನಾಗರಿಕ', sub: 'Ration, Pension, Housing', icon: Users },
    { id: 'it_services', title: 'IT Services / ಐಟಿ ಸೇವೆ', sub: 'DigiLocker, Kaveri', icon: Monitor },
    { id: 'health', title: 'Health Services / ಆರೋಗ್ಯ', sub: 'Arogya, PHC Services', icon: HeartPulse },
    { id: 'tourist', title: 'Tourist / ಪ್ರವಾಸಿ', sub: 'Heritage, Forest Pass', icon: Compass },
    { id: 'student', title: 'Youth & Student / ಯುವಜನ', sub: 'Scholarships, Yuva Nidhi', icon: GraduationCap }
  ];

  // Exact 6 taxonomy cards requested
  const sectorCards = [
    {
      id: 'card-1',
      title: 'AGRICULTURE & HORTICULTURE',
      subtitle: 'PM-Kisan, Raitha Siri, Micro-Irrigation & Seed Subsidies',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80',
      link: '/services'
    },
    {
      id: 'card-2',
      title: 'RURAL HOUSING & WELFARE',
      subtitle: 'Basava Vasathi Yojana, Dr. B.R. Ambedkar Rural Pucca Homes',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
      link: '/services'
    },
    {
      id: 'card-3',
      title: 'HIGHER EDUCATION & SCHOLARSHIPS',
      subtitle: 'SSP Post-Matric, Vidyasiri, and Technical Grant Schemes',
      badge: 'Instant Rule Check',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
      link: '/eligibility'
    },
    {
      id: 'card-4',
      title: 'PUBLIC HEALTH & AYUSHMAN',
      subtitle: 'Arogya Karnataka, Mother & Child Rural Care Subsidies',
      badge: 'Track Beneficiary',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80',
      link: '/tracking'
    },
    {
      id: 'card-5',
      title: 'RURAL INDUSTRIES & KHADI',
      subtitle: 'Support for MSME, local artisans, and rural enterprise',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80',
      link: '/services'
    },
    {
      id: 'card-6',
      title: 'JANASPANDANA GRIEVANCE DESK',
      subtitle: 'Report local water shortages, ration irregularities, or road issues',
      badge: 'Offline Filing & Sync',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=700&q=80',
      link: '/grievance'
    }
  ];

  return (
    <div className="home-portal-view">
      {/* HERO SECTION WITH WIDE CAROUSEL (RIGHT PROFILE PANEL REMOVED) */}
      <section className="hero-slider-section" aria-label="Karnataka State Heritage Slider">
        <div className="hero-slide-wrap">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="hero-slide-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.style.background = slides[currentSlide].fallbackBg;
            }}
          />

          <div className="hero-gradient-overlay" />

          {/* Slider Controls */}
          <button
            type="button"
            className="slider-arrow-btn prev"
            onClick={prevSlide}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="slider-arrow-btn next"
            onClick={nextSlide}
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Caption - Full Width Layout */}
          <div className="hero-caption hero-caption-full">
            <h1 className="hero-heritage-title">{slides[currentSlide].title}</h1>
            <p className="hero-portal-desc">{slides[currentSlide].desc}</p>
            <div className="hero-badge-row">
              <span className="hero-chip">
                <WifiOff size={14} /> 100% Offline-First Enabled
              </span>
              <span className="hero-chip" style={{ backgroundColor: '#0284c7', borderColor: '#38bdf8' }}>
                <ShieldCheck size={14} /> Zero Data Loss Guarantee
              </span>
            </div>
          </div>

          {/* Slider Pagination Dots */}
          <div className="slider-dots" role="tablist">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE ANNOUNCEMENTS TICKER */}
      <div className="gov-ticker-bar" role="region" aria-label="Official Announcements">
        <div className="ticker-label">
          <AlertTriangle size={15} />
          <span>Announcements</span>
        </div>
        <div className="ticker-marquee-wrap">
          <span className="ticker-marquee-text">
            📢 <strong>Rural Connect & OfflineBridge:</strong> Citizen service applications, seed subsidies, and grievance submissions can now be filled 100% offline. Stored data auto-syncs securely once internet connectivity resumes. | 🌾 Check scheme eligibility under <strong>Kutumba</strong> rules without visiting government offices.
          </span>
        </div>
      </div>

      {/* 3-COLUMN PORTAL BODY GRID */}
      <div className="portal-main-container">
        <div className="portal-grid-3col">
          {/* Left Column: Citizen Categories Sidebar */}
          <aside className="citizen-category-sidebar" aria-label="Citizen Categories">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-blue-dark)', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Citizen Categories
            </h3>

            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`category-bubble-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedCategory(cat.id); }}
                >
                  <div className="category-left-wrap">
                    <div className="category-icon-bubble">
                      <IconComp size={22} />
                    </div>
                    <div className="category-title-group">
                      <h4>{cat.title}</h4>
                      <span>{cat.sub}</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className="category-arrow-icon"
                    style={{ transform: isSelected ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  />
                </div>
              );
            })}
          </aside>

          {/* Center Column: 2-Column Grid of 6 Professional Sector Cards */}
          <main className="portal-center-content">
            <div className="section-title-bar">
              <h2>
                <BookOpen size={20} color="var(--gov-blue-primary)" />
                <span>Key Rural Sectors & Digital Services</span>
              </h2>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Showing all 6 core services (Offline-Ready)
              </span>
            </div>

            {/* 2-Column Grid with Dark Gradient Overlays & Top-Left Green Badges */}
            <div className="sector-cards-grid">
              {sectorCards.map((card) => (
                <Link
                  key={card.id}
                  to={card.link}
                  className="sector-photo-card"
                  aria-label={`Open ${card.title}`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="sector-card-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, #092c57, #15803d)';
                    }}
                  />
                  <div className="sector-card-overlay">
                    <span className="sector-badge">
                      <WifiOff size={12} /> {card.badge}
                    </span>
                    <h3 className="sector-card-title">{card.title}</h3>
                    <p className="sector-card-subtitle">{card.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Architecture Highlights Card */}
            <div className="card" style={{ marginTop: '8px', borderLeft: '4px solid var(--gov-blue-primary)', backgroundColor: 'var(--surface-card)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--gov-green)" />
                <span>OfflineBridge Synopsis & Technology Architecture</span>
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-subtle)', lineHeight: '1.5', marginBottom: '12px' }}>
                OfflineBridge addresses connectivity drops for rural applicants. Built with <strong>React + Vite + Workbox Service Workers</strong>, <strong>Dexie.js IndexedDB</strong> for continuous draft preservation, and <strong>Node.js + PostgreSQL</strong> for idempotent sync queuing.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/services" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}>
                  <span>Fill Offline Forms</span>
                  <ArrowRightIcon size={14} />
                </Link>
                <Link to="/eligibility" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}>
                  <span>Check Scheme Eligibility</span>
                </Link>
                <Link to="/tracking" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}>
                  <span>Track My Applications</span>
                </Link>
              </div>
            </div>
          </main>

          {/* Right Column: Government Quick-Link Badges */}
          <aside className="gov-portals-sidebar" aria-label="Official Rural Portals">
            <h3 className="portal-sidebar-heading">
              Government Quick Portals
            </h3>

            {/* Sakala */}
            <Link to="/services" className="gov-portal-badge-card" title="Sakala - Guarantee of Services to Citizens">
              <div className="badge-brand-group">
                <div className="badge-logo-box sakala">ಸ</div>
                <div className="badge-text-group">
                  <h5>Sakala Services</h5>
                  <p>Guaranteed Timebound Delivery</p>
                </div>
              </div>
              <span className="badge-action-pill">Open</span>
            </Link>

            {/* Janaspandana */}
            <Link to="/grievance" className="gov-portal-badge-card" title="Janaspandana - Citizen Grievance Redressal">
              <div className="badge-brand-group">
                <div className="badge-logo-box janaspandana">ಜ</div>
                <div className="badge-text-group">
                  <h5>Janaspandana</h5>
                  <p>Public Grievance Portal</p>
                </div>
              </div>
              <span className="badge-action-pill">Grievance</span>
            </Link>

            {/* Seva Sindhu */}
            <Link to="/services" className="gov-portal-badge-card" title="Seva Sindhu - One-Stop Digital Citizen Delivery">
              <div className="badge-brand-group">
                <div className="badge-logo-box sevasindhu">ಸೇ</div>
                <div className="badge-text-group">
                  <h5>Seva Sindhu</h5>
                  <p>100+ Citizen Services</p>
                </div>
              </div>
              <span className="badge-action-pill">Apply</span>
            </Link>

            {/* Kutumba */}
            <Link to="/eligibility" className="gov-portal-badge-card" title="Kutumba - Entitlement Management System">
              <div className="badge-brand-group">
                <div className="badge-logo-box kutumba">ಕು</div>
                <div className="badge-text-group">
                  <h5>Kutumba System</h5>
                  <p>Social Entitlement & Rules</p>
                </div>
              </div>
              <span className="badge-action-pill">Check</span>
            </Link>

            {/* DigiLocker */}
            <a
              href="https://www.digilocker.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-portal-badge-card"
              title="DigiLocker Document Wallet"
            >
              <div className="badge-brand-group">
                <div className="badge-logo-box digilocker">DL</div>
                <div className="badge-text-group">
                  <h5>DigiLocker</h5>
                  <p>Digital Certificate Storage</p>
                </div>
              </div>
              <span className="badge-action-pill" style={{ backgroundColor: '#2563eb' }}>
                <ExternalLink size={12} />
              </span>
            </a>

            {/* Kaveri 2.0 */}
            <Link to="/services" className="gov-portal-badge-card" title="Kaveri 2.0 - Property & Land Records">
              <div className="badge-brand-group">
                <div className="badge-logo-box kaveri">ಕಾವೇ</div>
                <div className="badge-text-group">
                  <h5>Kaveri 2.0</h5>
                  <p>Land Records & Valuation</p>
                </div>
              </div>
              <span className="badge-action-pill" style={{ backgroundColor: '#d97706' }}>Explore</span>
            </Link>

            {/* Mahiti Kanaja */}
            <a
              href="https://mahitikanaja.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-portal-badge-card"
              title="Mahiti Kanaja Public Data"
            >
              <div className="badge-brand-group">
                <div className="badge-logo-box" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>ಮಾ</div>
                <div className="badge-text-group">
                  <h5>Mahiti Kanaja</h5>
                  <p>Open Government Data</p>
                </div>
              </div>
              <span className="badge-action-pill" style={{ backgroundColor: '#0d9488' }}>
                <ExternalLink size={12} />
              </span>
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
