import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ExternalLink,
  Layers,
  Home as HomeIcon,
  ShoppingBag,
  FileText,
  FileCheck,
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SCHEMES_CATALOGUE, getCatalogueSchemeById } from '../data/schemesCatalogue';
import { getAllDrafts } from '../offline/draftStorage';
import DraftFormModal from '../components/DraftFormModal';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { isKannada, t } = useLanguage();
  const navigate = useNavigate();

  // Hero slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  // Selected category in left sidebar (defaults to 'all' to show all sector cards, or citizen category)
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Saved draft IDs from IndexedDB
  const [savedDraftIds, setSavedDraftIds] = useState(new Set());
  // Active modal scheme for direct drafting from homepage
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  // Scheme/service slides
  const slides = [
    {
      id: 'agriculture-support',
      title: 'Agriculture Support — Raitha Siri & Seed Subsidies',
      titleKn: 'ಕೃಷಿ ಸಹಾಯ — ರೈತ ಸಿರಿ ಮತ್ತು ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ',
      desc: 'Subsidised seasonal crop seeds, millet cultivation allowances, and direct farmer welfare support with complete offline application readiness.',
      descKn: 'ಅಧಿಸೂಚಿತ ಬೆಳೆಗಳಿಗೆ ಪ್ರಮಾಣೀಕೃತ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ ಹಾಗೂ ಆಫ್‌ಲೈನ್ ನಮೂನೆ ಸೌಲಭ್ಯ.',
      actionText: 'Explore Schemes',
      actionTextKn: 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ',
      actionLink: '/services',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #064e3b, #1e3a8a)'
    },
    {
      id: 'education-scholarships',
      title: 'Education & Scholarships — SSP & Yuva Nidhi',
      titleKn: 'ಶಿಕ್ಷಣ ಮತ್ತು ಯುವಜನ ಕಲ್ಯಾಣ — SSP ಮತ್ತು ಯುವ ನಿಧಿ',
      desc: 'Post-matric educational grants, Vidyasiri fee reimbursement, and graduate unemployment allowances for eligible youth across Karnataka.',
      descKn: 'ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ, ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಪದವೀಧರ ಯುವಕರಿಗೆ ಮಾಸಿಕ ಭತ್ಯೆ.',
      actionText: 'Check Eligibility',
      actionTextKn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ',
      actionLink: '/eligibility',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #1e1b4b, #1d4ed8)'
    },
    {
      id: 'pensions-welfare',
      title: 'Pensions & Social Welfare — Sandhya Suraksha',
      titleKn: 'ಪಿಂಚಣಿ ಮತ್ತು ಸಾಮಾಜಿಕ ಭದ್ರತೆ — ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ',
      desc: 'Monthly financial assistance and subsistence allowances for elderly citizens, destitute widows, and rural persons with disability.',
      descKn: 'ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ, ಅಂಗವಿಕಲರಿಗೆ ಮತ್ತು ವಿಧವೆಯರಿಗೆ ಮಾಸಿಕ ₹1,200 ಸಾಮಾಜಿಕ ಭದ್ರತಾ ಪಿಂಚಣಿ.',
      actionText: 'Explore Schemes',
      actionTextKn: 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ',
      actionLink: '/services',
      image: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #701a75, #831843)'
    },
    {
      id: 'rural-housing',
      title: 'Rural Housing Assistance — Basava Vasathi Yojana',
      titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ ನೆರವು — ಬಸವ ವಸತಿ ಯೋಜನೆ',
      desc: 'Capital grants under Basava Vasathi and rural housing schemes for constructing permanent, disaster-resilient houses for rural BPL families.',
      descKn: 'ಗ್ರಾಮೀಣ ವಸತಿ ರಹಿತ ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳಿಗೆ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ₹1.20 ಲಕ್ಷ ಅನುದಾನ.',
      actionText: 'Explore Schemes',
      actionTextKn: 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ',
      actionLink: '/services',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
      fallbackBg: 'linear-gradient(135deg, #854d0e, #78350f)'
    }
  ];

  // Refresh saved drafts from IndexedDB
  const refreshDrafts = async () => {
    try {
      const drafts = await getAllDrafts();
      const ids = new Set(drafts.map((d) => d.serviceId || d.id));
      setSavedDraftIds(ids);
    } catch (err) {
      console.warn('Failed to load drafts on HomePage:', err);
    }
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  // Auto-advance hero slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Left sidebar category definitions matching user screenshot & requirements
  const categories = [
    { id: 'all', title: 'All Services / ಎಲ್ಲಾ ಸೇವೆಗಳು', sub: 'Complete Catalogue', icon: Layers },
    { id: 'farmer', title: 'Farmer / ರೈತ', sub: 'Seed, Crop, Subsidy', icon: Sprout },
    { id: 'citizen', title: 'Citizen / ನಾಗರಿಕ', sub: 'Ration, Pension, Guarantee', icon: Users },
    { id: 'housing', title: 'Rural Housing / ವಸತಿ', sub: 'Basava Vasathi, Pucca Home', icon: HomeIcon },
    { id: 'food', title: 'Food & Supplies / ಆಹಾರ', sub: 'Ahara, BPL Ration Card', icon: ShoppingBag },
    { id: 'student', title: 'Youth & Student / ಯುವಜನ', sub: 'Scholarships, Yuva Nidhi', icon: GraduationCap },
    { id: 'health', title: 'Health Services / ಆರೋಗ್ಯ', sub: 'Arogya, PHC Services', icon: HeartPulse },
    { id: 'business', title: 'Business / MSME / ಉದ್ಯಮಿ', sub: 'Artisans, Micro Subsidy', icon: Briefcase },
    { id: 'it_services', title: 'IT Services / ಐಟಿ ಸೇವೆ', sub: 'DigiLocker, Kaveri', icon: Monitor }
  ];

  // Exact 6 taxonomy cards matching reference layout
  const sectorCards = [
    {
      id: 'card-1',
      schemeId: 'agri-seed-subsidy',
      title: 'AGRICULTURE & HORTICULTURE',
      titleKn: 'ಕೃಷಿ ಮತ್ತು ತೋಟಗಾರಿಕೆ',
      subtitle: 'Raitha Siri, Seed Subsidies, FRUITS & Micro-Irrigation',
      subtitleKn: 'ರೈತ ಸಿರಿ, ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ, ಫ್ರೂಟ್ಸ್ ಮತ್ತು ನೀರಾವರಿ',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80',
      link: '/services?category=farmer'
    },
    {
      id: 'card-2',
      schemeId: 'rural-housing-assist',
      title: 'RURAL HOUSING & WELFARE',
      titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ ಮತ್ತು ಕಲ್ಯಾಣ',
      subtitle: 'Basava Vasathi Yojana, Dr. B.R. Ambedkar Rural Pucca Homes',
      subtitleKn: 'ಬಸವ ವಸತಿ ಯೋಜನೆ, ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
      link: '/services?category=housing'
    },
    {
      id: 'card-3',
      schemeId: 'ssp-scholarship',
      title: 'HIGHER EDUCATION & SCHOLARSHIPS',
      titleKn: 'ಉನ್ನತ ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ',
      subtitle: 'SSP Post-Matric, Vidyasiri, and Yuva Nidhi Grant Schemes',
      subtitleKn: 'SSP ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಯುವ ನಿಧಿ ಯೋಜನೆ',
      badge: 'Instant Rule Check',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
      link: '/eligibility'
    },
    {
      id: 'card-4',
      schemeId: 'arogya-karnataka',
      title: 'PUBLIC HEALTH & AYUSHMAN',
      titleKn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಚಿಕಿತ್ಸೆ',
      subtitle: 'Arogya Karnataka (SAST), Cashless Treatment Cover up to ₹5 Lakh',
      subtitleKn: 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ, ನಗದು ರಹಿತ ಚಿಕಿತ್ಸಾ ಭದ್ರತೆ',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80',
      link: '/services?category=health'
    },
    {
      id: 'card-5',
      schemeId: 'msme-artisan-subsidy',
      title: 'RURAL INDUSTRIES & KHADI',
      titleKn: 'ಗ್ರಾಮೀಣ ಉದ್ದಿಮೆ ಮತ್ತು ಕರಕುಶಲ',
      subtitle: 'Support for MSME, local artisans, and rural cottage enterprises',
      subtitleKn: 'ಕರಕುಶಲ ಕರ್ಮಿಗಳು ಮತ್ತು ಕಿರು ಉದ್ಯಮಗಳಿಗೆ ಬಂಡವಾಳ ಸಹಾಯಧನ',
      badge: 'Offline-Ready Form',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80',
      link: '/services?category=business'
    },
    {
      id: 'card-6',
      schemeId: null,
      title: 'JANASPANDANA GRIEVANCE DESK',
      titleKn: 'ಜನಸ್ಪಂದನ ಸಾರ್ವಜನಿಕ ದೂರು ವಿಭಾಗ',
      subtitle: 'Report local water shortages, ration irregularities, or road issues',
      subtitleKn: 'ಕುಡಿಯುವ ನೀರು, ಪಡಿತರ ವ್ಯತ್ಯಯ, ರಸ್ತೆ ಸಮಸ್ಯೆಗಳ ಆಫ್‌ಲೈನ್ ದೂರು ಸಲ್ಲಿಕೆ',
      badge: 'Offline Filing & Sync',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=700&q=80',
      link: '/grievance'
    }
  ];

  // Filtered schemes when a specific category is active
  const filteredSchemes = selectedCategory === 'all'
    ? []
    : SCHEMES_CATALOGUE.filter((s) => s.category === selectedCategory);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="home-portal-view">
      {/* 1. HERO SECTION WITH WIDE CAROUSEL */}
      <section className="hero-slider-section" aria-label="Rural Schemes and Digital Services Carousel">
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

          {/* Slide Caption */}
          <div className="hero-caption hero-caption-full">
            <h1 className="hero-heritage-title">
              {t(slides[currentSlide].title, slides[currentSlide].titleKn)}
            </h1>
            <p className="hero-portal-desc">
              {t(slides[currentSlide].desc, slides[currentSlide].descKn)}
            </p>
            <div className="hero-badge-row" style={{ alignItems: 'center' }}>
              <Link to={slides[currentSlide].actionLink} className="btn-hero-action">
                <span>{t(slides[currentSlide].actionText, slides[currentSlide].actionTextKn)}</span>
                <ArrowRightIcon size={14} />
              </Link>
              <span className="hero-chip">
                <WifiOff size={14} /> {isKannada ? '100% ಆಫ್‌ಲೈನ್ ಸಕ್ರಿಯ' : '100% Offline-First Enabled'}
              </span>
              <span className="hero-chip" style={{ backgroundColor: '#0284c7', borderColor: '#38bdf8' }}>
                <ShieldCheck size={14} /> {isKannada ? 'ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ ರಕ್ಷಣೆ' : 'Local Draft Preservation'}
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

      {/* 2. MARQUEE ANNOUNCEMENTS TICKER */}
      <div className="gov-ticker-bar" role="region" aria-label="Official Announcements">
        <div className="ticker-label">
          <AlertTriangle size={15} />
          <span>{isKannada ? 'ಸೂಚನೆಗಳು' : 'Announcements'}</span>
        </div>
        <div className="ticker-marquee-wrap">
          <span className="ticker-marquee-text">
            📢 <strong>ArivuNet (ಅರಿವುನೆಟ್):</strong> {isKannada
              ? 'ರೈತ ಸಿರಿ, ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ, ಗೃಹಲಕ್ಷ್ಮಿ, ಯುವ ನಿಧಿ ಮತ್ತು ಪಡಿತರ ಚೀಟಿ ಸೇವೆಗಳನ್ನು ಅಂತರ್ಜಾಲವಿಲ್ಲದೆಯೂ ಭರ್ತಿ ಮಾಡಿ ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಮಾಡಬಹುದು. ಸಂಪರ್ಕ ದೊರೆತಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.'
              : 'Citizen service applications, seed subsidies, and grievance submissions can now be filled 100% offline. Stored data auto-syncs securely once internet connectivity resumes.'} | 🌾 {isKannada ? 'ಕುಟುಂಬ ಅರ್ಹತಾ ನಿಯಮಗಳನ್ನು ಕಚೇರಿಗೆ ತೆರಳದೆ ಪರಿಶೀಲಿಸಿ.' : 'Check scheme eligibility under Kutumba rules without visiting government offices.'}
          </span>
        </div>
      </div>

      {/* 2B. PROMINENT CITIZEN FEATURE: FIND SCHEMES FOR ME */}
      <div style={{
        maxWidth: '1360px',
        margin: '16px auto 0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #bfdbfe',
          borderLeft: '5px solid var(--gov-blue-primary, #0284c7)',
          borderRadius: '8px',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: 'var(--gov-blue-primary, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={22} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gov-blue-dark, #0f172a)', margin: 0 }}>
                {isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ (Find Schemes for Me)' : 'Find Schemes for Me'}
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: '#475569' }}>
                {isKannada
                  ? 'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯ ಬಗ್ಗೆ ನಮಗೆ ತಿಳಿಸಿ. ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಸರಿಹೊಂದುವ ಸೇವೆಗಳು ಮತ್ತು ಯೋಜನೆಗಳನ್ನು ಅರಿವುನೆಟ್ ನಿಮಗೆ ತೋರಿಸುತ್ತದೆ.'
                  : 'Tell us a little about your situation. ArivuNet will help you discover services and schemes that may fit your needs.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              to="/finder"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: 'var(--gov-blue-primary, #0284c7)',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
              }}
            >
              <span>{isKannada ? 'ಪ್ರಶ್ನಾವಳಿ ಪ್ರಾರಂಭಿಸಿ' : 'Start Discovery Questionnaire'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 3-COLUMN PORTAL BODY GRID */}
      <div className="portal-main-container">
        <div className="portal-grid-3col">
          {/* Left Column: Citizen Categories Sidebar (NOW FULLY FUNCTIONAL) */}
          <aside className="citizen-category-sidebar" aria-label="Citizen Categories">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-blue-dark)', letterSpacing: '0.04em' }}>
                {isKannada ? 'ನಾಗರಿಕ ವರ್ಗಗಳು' : 'Citizen Categories'}
              </h3>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    fontSize: '0.72rem',
                    color: '#0284c7',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isKannada ? 'ಎಲ್ಲವನ್ನೂ ತೋರಿಸು' : 'Show All'}
                </button>
              )}
            </div>

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

          {/* Center Column: Filtered Schemes or Core Sector Cards */}
          <main className="portal-center-content">
            {/* Section Header with Filter State */}
            <div className="section-title-bar">
              <div>
                <h2>
                  <BookOpen size={20} color="var(--gov-blue-primary)" />
                  <span>
                    {selectedCategory === 'all'
                      ? (isKannada ? 'ಪ್ರಮುಖ ಗ್ರಾಮೀಣ ವಲಯಗಳು ಮತ್ತು ಸೇವೆಗಳು' : 'Key Rural Sectors & Digital Services')
                      : `${activeCategoryObj?.title || 'Selected Category'}`}
                  </span>
                </h2>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {selectedCategory === 'all'
                    ? (isKannada ? 'ಎಲ್ಲಾ 6 ಪ್ರಮುಖ ವಲಯಗಳು (ಆಫ್‌ಲೈನ್ ಸಕ್ರಿಯ)' : 'Showing all 6 core services (Offline-Ready)')
                    : `${filteredSchemes.length} ${filteredSchemes.length === 1 ? 'verified service' : 'verified services'} available`}
                </span>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedCategory('all')}
                  style={{ fontSize: '0.78rem', padding: '4px 10px', minHeight: '32px' }}
                >
                  <XCircle size={14} />
                  <span>{isKannada ? 'ಎಲ್ಲಾ ವಲಯಗಳನ್ನು ತೋರಿಸು' : 'Clear Filter (Show All)'}</span>
                </button>
              )}
            </div>

            {/* Active Filter Notification Pill */}
            {selectedCategory !== 'all' && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '14px',
                fontSize: '0.82rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>
                  Filtering by: <strong>{activeCategoryObj?.title}</strong>. Selecting another category in the left sidebar updates results immediately.
                </span>
                <Link to={`/services?category=${selectedCategory}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
                  View in Full Catalogue →
                </Link>
              </div>
            )}

            {/* VIEW A: CATEGORY FILTERED SCHEME CARDS */}
            {selectedCategory !== 'all' ? (
              filteredSchemes.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  {filteredSchemes.map((scheme) => {
                    const hasDraft = savedDraftIds.has(scheme.id);

                    return (
                      <div key={scheme.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gov-blue-primary)', textTransform: 'uppercase' }}>
                            {t(scheme.department, scheme.departmentKn)}
                          </span>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {hasDraft && (
                              <span className="draft-saved-pill">
                                <FileCheck size={11} />
                                <span>{isKannada ? 'ಡ್ರಾಫ್ಟ್ ಸೇವ್ ಆಗಿದೆ' : 'Draft Saved'}</span>
                              </span>
                            )}
                            <span className="feature-pill" style={{ color: 'var(--gov-green)', backgroundColor: 'var(--gov-green-light)' }}>
                              <WifiOff size={11} /> {isKannada ? 'ಆಫ್‌ಲೈನ್ ರೆಡಿ' : 'Offline Form'}
                            </span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '6px' }}>
                          {t(scheme.title, scheme.titleKn)}
                        </h3>

                        <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', lineHeight: '1.45', marginBottom: '12px', flex: 1 }}>
                          {t(scheme.shortDesc, scheme.shortDescKn)}
                        </p>

                        <div style={{
                          backgroundColor: 'var(--bg-body)',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginBottom: '14px'
                        }}>
                          <strong>{isKannada ? 'ಅರ್ಹತೆ:' : 'Eligibility:'}</strong> {scheme.eligibilityCriteria[0]}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setActiveModalScheme(scheme)}
                            style={{ flex: 1, fontSize: '0.82rem', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <FileText size={15} />
                            <span>{hasDraft ? (isKannada ? 'ಡ್ರಾಫ್ಟ್ ಮುಂದುವರಿಸಿ' : 'Resume Saved Draft') : (isKannada ? 'ಆಫ್‌ಲೈನ್ ಅರ್ಜಿ ತೆರೆಯಿರಿ' : 'Open Application Draft')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Helpful Empty State */
                <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '16px' }}>
                  <XCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                    No schemes found in this category
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto 16px' }}>
                    There are currently no offline-ready schemes under this category in the local catalogue.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setSelectedCategory('all')}
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    View All Categories
                  </button>
                </div>
              )
            ) : (
              /* VIEW B: ALL CATEGORIES (PRESERVES EXACT 6 SECTOR CARDS) */
              <div className="sector-cards-grid">
                {sectorCards.map((card) => {
                  const hasDraft = card.schemeId && savedDraftIds.has(card.schemeId);

                  return (
                    <div
                      key={card.id}
                      className="sector-photo-card"
                      onClick={() => {
                        if (card.schemeId) {
                          const fullScheme = getCatalogueSchemeById(card.schemeId);
                          if (fullScheme) {
                            setActiveModalScheme(fullScheme);
                            return;
                          }
                        }
                        navigate(card.link);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${card.title}`}
                      style={{ cursor: 'pointer' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (card.schemeId) {
                            const fullScheme = getCatalogueSchemeById(card.schemeId);
                            if (fullScheme) {
                              setActiveModalScheme(fullScheme);
                              return;
                            }
                          }
                          navigate(card.link);
                        }
                      }}
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
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className="sector-badge">
                            <WifiOff size={12} /> {card.badge}
                          </span>
                          {hasDraft && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: '#fbbf24',
                              color: '#78350f',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FileCheck size={10} /> Draft Saved
                            </span>
                          )}
                        </div>
                        <h3 className="sector-card-title">{t(card.title, card.titleKn)}</h3>
                        <p className="sector-card-subtitle">{t(card.subtitle, card.subtitleKn)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Architecture Highlights Card */}
            <div className="card" style={{ marginTop: '8px', borderLeft: '4px solid #6b21a8', backgroundColor: 'var(--surface-card)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#06b6d4" />
                <span>ArivuNet Synopsis & Technology Architecture</span>
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-subtle)', lineHeight: '1.5', marginBottom: '12px' }}>
                ArivuNet addresses connectivity drops for rural applicants. Built with <strong>React + Vite + Workbox Service Workers</strong>, <strong>Browser IndexedDB Layer</strong> for continuous draft preservation, and structured scheme-specific field definitions with verified Karnataka government requirements.
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
              {isKannada ? 'ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು' : 'Government Quick Portals'}
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
            <Link to="/services?category=it_services" className="gov-portal-badge-card" title="Kaveri 2.0 - Property & Land Records">
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

      {/* Direct Application Draft Modal */}
      {activeModalScheme && (
        <DraftFormModal
          service={activeModalScheme}
          onClose={() => setActiveModalScheme(null)}
          onDraftChanged={() => refreshDrafts()}
        />
      )}
    </div>
  );
}
