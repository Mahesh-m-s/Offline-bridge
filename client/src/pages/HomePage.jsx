import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Wifi,
  WifiOff,
  Sprout,
  Briefcase,
  Users,
  Monitor,
  HeartPulse,
  GraduationCap,
  Home as HomeIcon,
  ShoppingBag,
  Layers,
  FileCheck,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Building2,
  FileBadge,
  Award,
  Database,
  Compass,
  PhoneCall,
  Check
} from 'lucide-react';
import { SCHEMES_CATALOGUE, getCatalogueSchemeById } from '../data/schemesCatalogue';
import { getAllDrafts } from '../offline/draftStorage';
import { fetchSchemeStats } from '../api/schemes';
import DraftFormModal from '../components/DraftFormModal';
import { useLanguage } from '../context/LanguageContext';
import { isOnline, setupNetworkListeners } from '../registerServiceWorker';

export default function HomePage() {
  const { isKannada, t } = useLanguage();
  const navigate = useNavigate();

  // Network connectivity state
  const [online, setOnline] = useState(isOnline());

  // Search input state in Hero
  const [heroSearch, setHeroSearch] = useState('');

  // Selected category in category selector
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Saved draft IDs from local IndexedDB
  const [savedDraftIds, setSavedDraftIds] = useState(new Set());

  // Active modal scheme for direct application drafting
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  // Live database statistics
  const [stats, setStats] = useState({
    totalRecords: 1060,
    byServiceType: {
      scheme: 350,
      service: 667,
      certificate: 36,
      welfare_benefit: 7
    },
    byCategory: {}
  });

  // Listen to network status changes
  useEffect(() => {
    const cleanup = setupNetworkListeners((status) => {
      setOnline(status);
    });
    return cleanup;
  }, []);

  // Refresh saved drafts from IndexedDB
  const refreshDrafts = useCallback(async () => {
    try {
      const drafts = await getAllDrafts();
      const ids = new Set((drafts || []).map((d) => d.serviceId || d.id));
      setSavedDraftIds(ids);
    } catch (err) {
      console.warn('Failed to load drafts on HomePage:', err);
    }
  }, []);

  // Fetch live stats from PostgreSQL API
  useEffect(() => {
    refreshDrafts();
    let isMounted = true;
    async function loadLiveStats() {
      try {
        const res = await fetchSchemeStats();
        if (res.success && res.data && isMounted) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Unable to load live stats from server:', err);
      }
    }
    loadLiveStats();
    return () => { isMounted = false; };
  }, [refreshDrafts]);

  // Handle Hero search submit
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/services?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/services');
    }
  };

  // 8 High-Impact DPI Sector Cards with verified metadata and live counts
  const sectorCategories = [
    {
      id: 'farmer',
      title: 'Farmer & Agriculture',
      titleKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
      count: stats.byCategory?.farmer || 24,
      desc: 'Raitha Siri, seed subsidies, FRUITS registration, PM-KUSUM & micro-irrigation.',
      descKn: 'ರೈತ ಸಿರಿ, ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ, ಫ್ರೂಟ್ಸ್ ನೋಂದಣಿ ಮತ್ತು ಹನಿ ನೀರಾವರಿ.',
      icon: Sprout,
      color: '#16834A',
      bgColor: '#F0FDF4',
      badge: 'Sakala Guaranteed'
    },
    {
      id: 'citizen',
      title: 'Citizen & Social Welfare',
      titleKn: 'ನಾಗರಿಕ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣ',
      count: stats.byCategory?.citizen || 18,
      desc: 'Sandhya Suraksha, Gruha Lakshmi, disability allowances, pensions & widow welfare.',
      descKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ, ಗೃಹಲಕ್ಷ್ಮಿ, ಮಾಸಾಶನ ಮತ್ತು ವಿಧವಾ ವೇತನ ಯೋಜನೆಗಳು.',
      icon: Users,
      color: '#1556A0',
      bgColor: '#EFF6FF',
      badge: 'Direct Benefit'
    },
    {
      id: 'housing',
      title: 'Rural Housing',
      titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ',
      count: stats.byCategory?.housing || 12,
      desc: 'Basava Vasathi, Dr. B.R. Ambedkar Rural Pucca Homes & site allotment grants.',
      descKn: 'ಬಸವ ವಸತಿ ಯೋಜನೆ, ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಮತ್ತು ನಿವೇಶನ ಮಂಜೂರಾತಿ.',
      icon: HomeIcon,
      color: '#D99016',
      bgColor: '#FEFCE8',
      badge: 'Gram Panchayat'
    },
    {
      id: 'food',
      title: 'Food & Civil Supplies',
      titleKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು',
      count: stats.byCategory?.food || 14,
      desc: 'Annabhagya, BPL/AAY ration card issuance, member additions & Fair Price shops.',
      descKn: 'ಅನ್ನಭಾಗ್ಯ, ಬಿಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ, ಸದಸ್ಯರ ಸೇರ್ಪಡೆ ಮತ್ತು ನ್ಯಾಯಬೆಲೆ ಅಂಗಡಿ ಸೇವೆ.',
      icon: ShoppingBag,
      color: '#EA580C',
      bgColor: '#FFF7ED',
      badge: 'Biometric Ready'
    },
    {
      id: 'student',
      title: 'Youth & Education',
      titleKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ',
      count: stats.byCategory?.student || 16,
      desc: 'SSP Post-Matric, Vidyasiri fee concessions, hostel admissions & Yuva Nidhi.',
      descKn: 'SSP ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ, ವಿದ್ಯಾಸಿರಿ ಶುಲ್ಕ ವಿನಾಯಿತಿ ಮತ್ತು ಯುವ ನಿಧಿ.',
      icon: GraduationCap,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      badge: 'Direct Bank Transfer'
    },
    {
      id: 'health',
      title: 'Health & Medical',
      titleKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು',
      count: stats.byCategory?.health || 10,
      desc: 'Arogya Karnataka, Ayushman Bharat cashless care, maternity benefits & PHCs.',
      descKn: 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ, ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ₹5 ಲಕ್ಷ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ತಾಯಿ ಮಗು ಕಲ್ಯಾಣ.',
      icon: HeartPulse,
      color: '#E11D48',
      bgColor: '#FFF1F2',
      badge: 'Hospital Network'
    },
    {
      id: 'business',
      title: 'MSME & Rural Enterprise',
      titleKn: 'ಉದ್ಯಮ ಮತ್ತು ಕೈಗಾರಿಕೆ',
      count: stats.byCategory?.business || 12,
      desc: 'Cottage artisan loans, Khadi subsidies, PM Vishwakarma & micro-credit.',
      descKn: 'ಕರಕುಶಲ ಕರ್ಮಿಗಳ ಸಾಲ, ಖಾದಿ ಸಹಾಯಧನ, ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಬೆಂಬಲ.',
      icon: Briefcase,
      color: '#0891B2',
      bgColor: '#ECFEFF',
      badge: 'Margin Subsidy'
    },
    {
      id: 'it_services',
      title: 'Revenue & Certificates',
      titleKn: 'ಕಂದಾಯ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ',
      count: stats.byCategory?.it_services || 36,
      desc: 'Caste & Income certificates, RTC Pahani land records, Kaveri 2.0 & Nada Kacheri.',
      descKn: 'ಜಾತಿ, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ, ಆರ್‌ಟಿಸಿ ಪಹಣಿ, ಕಾವೇರಿ 2.0 ನೋಂದಣಿ ಮತ್ತು ನಾಡ ಕಚೇರಿ ಸೇವೆ.',
      icon: Monitor,
      color: '#4B5563',
      bgColor: '#F3F4F6',
      badge: 'Digitally Signed'
    }
  ];

  // Top Verified Schemes for Quick Application / Drafting
  const featuredSchemes = [
    {
      id: 'agri-seed-subsidy',
      title: 'Raitha Siri & Seasonal Crop Seed Subsidy',
      titleKn: 'ರೈತ ಸಿರಿ ಮತ್ತು ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ ಯೋಜನೆ',
      department: 'Department of Agriculture, Govt. of Karnataka',
      departmentKn: 'ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
      category: 'farmer',
      serviceType: 'scheme',
      serviceCode: 'AGR001',
      slaDays: 7,
      benefitSummary: '50% subsidy on certified seeds up to ₹10,000/ha direct into bank account via DBT.',
      benefitSummaryKn: 'ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳಿಗೆ ಶೇ.50 ರಷ್ಟು ಸಹಾಯಧನ, ಗರಿಷ್ಠ ₹10,000/ಹೆಕ್ಟೇರ್ ಡಿಬಿಟಿ ಮೂಲಕ.',
      eligibility: 'Resident Karnataka farmers owning agricultural land with active FRUITS FID.'
    },
    {
      id: 'sandhya-suraksha',
      title: 'Sandhya Suraksha Social Pension Scheme',
      titleKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಸಾಮಾಜಿಕ ಪಿಂಚಣಿ ಯೋಜನೆ',
      department: 'Directorate of Social Security and Pensions',
      departmentKn: 'ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ',
      category: 'citizen',
      serviceType: 'welfare_benefit',
      serviceCode: 'REV004',
      slaDays: 30,
      benefitSummary: 'Monthly financial assistance of ₹1,200 deposited directly into savings account.',
      benefitSummaryKn: 'ಅರ್ಹ ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,200 ನೇರ ಸಾಮಾಜಿಕ ಪಿಂಚಣಿ.',
      eligibility: 'Karnataka residents aged 65 or above with annual family income under ₹32,000.'
    },
    {
      id: 'ssp-scholarship',
      title: 'SSP Post-Matric Scholarship & Vidyasiri',
      titleKn: 'SSP ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ವಿದ್ಯಾಸಿರಿ',
      department: 'Department of Social Welfare & Backward Classes',
      departmentKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ',
      category: 'student',
      serviceType: 'scheme',
      serviceCode: 'SWD001',
      slaDays: 21,
      benefitSummary: 'Full tuition fee reimbursement + monthly maintenance allowance up to ₹1,500/month.',
      benefitSummaryKn: 'ಸಂಪೂರ್ಣ ಬೋಧನಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಮಾಸಿಕ ನಿರ್ವಹಣಾ ಭತ್ಯೆ.',
      eligibility: 'SC/ST/OBC students pursuing PUC, Diploma, ITI, Degree or PG with Kutumba ID.'
    },
    {
      id: 'caste-income-cert',
      title: 'Statutory Caste & Income Certificate (Form-F)',
      titleKn: 'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (ನಮೂನೆ-ಎಫ್)',
      department: 'Department of Revenue (Nada Kacheri / Atalji Janasnehi)',
      departmentKn: 'ಕಂದಾಯ ಇಲಾಖೆ (ನಾಡ ಕಚೇರಿ / ಅಟಲ್‌ಜೀ ಜನಸ್ನೇಹಿ)',
      category: 'it_services',
      serviceType: 'certificate',
      serviceCode: 'REV001',
      slaDays: 15,
      benefitSummary: 'Legally certified digitally signed document with QR code validity for 5 years.',
      benefitSummaryKn: '5 ವರ್ಷಗಳ ಮಾನ್ಯತೆಯುಳ್ಳ ಡಿಜಿಟಲ್ ಸಹಿ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಹಿತ ಪ್ರಮಾಣಪತ್ರ.',
      eligibility: 'All bonafide permanent residents of Karnataka requiring reservation or benefits.'
    },
    {
      id: 'gruha-lakshmi',
      title: 'Gruha Lakshmi Direct Cash Assistance Scheme',
      titleKn: 'ಗೃಹಲಕ್ಷ್ಮಿ ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಯೋಜನೆ',
      department: 'Department of Women & Child Development',
      departmentKn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ',
      category: 'citizen',
      serviceType: 'welfare_benefit',
      serviceCode: 'WCD001',
      slaDays: 14,
      benefitSummary: 'Monthly guaranteed financial grant of ₹2,000 for female head of household.',
      benefitSummaryKn: 'ಕುಟುಂಬದ ಯಜಮಾನಿ ಮಹಿಳೆಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಖಾತರಿಗೆ ನಗದು ಜಮೆ.',
      eligibility: 'Women named as head of family in Karnataka BPL/AAY/APL ration cards (non-taxpayers).'
    },
    {
      id: 'rural-housing-assist',
      title: 'Basava Vasathi Yojana — Rural Pucca Housing',
      titleKn: 'ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ವಸತಿ ನಿರ್ಮಾಣ',
      department: 'Rajiv Gandhi Housing Corporation Ltd.',
      departmentKn: 'ರಾಜೀವ್ ಗಾಂಧಿ ಗ್ರಾಮೀಣ ವಸತಿ ನಿಗಮ ನಿಯಮಿತ',
      category: 'housing',
      serviceType: 'scheme',
      serviceCode: 'HOU001',
      slaDays: 45,
      benefitSummary: 'Subsidy grant of ₹1.20 Lakh released in 4 geo-tagged construction stages.',
      benefitSummaryKn: '₹1.20 ಲಕ್ಷ ಸಹಾಯಧನ ಜಿಯೋ-ಟ್ಯಾಗ್ ಮಾಡಿದ 4 ಹಂತಗಳಲ್ಲಿ ನೇರ ಖಾತೆಗೆ.',
      eligibility: 'Rural homeless BPL families possessing registered site with Hakku Patra.'
    }
  ];

  // Official Digital Public Infrastructure Links
  const officialPortals = [
    {
      name: 'Seva Sindhu',
      nameKn: 'ಸೇವಾ ಸಿಂಧು',
      sub: 'One-stop portal for Karnataka citizen delivery',
      url: 'https://sevasindhu.karnataka.gov.in',
      tag: 'Citizen Services'
    },
    {
      name: 'Sakala Mission',
      nameKn: 'ಸಕಾಲ ಮಿಷನ್',
      sub: 'Guaranteed time-bound service delivery with penalties',
      url: 'http://sakala.kar.nic.in',
      tag: 'Legal Right'
    },
    {
      name: 'Nada Kacheri (AJKS)',
      nameKn: 'ನಾಡ ಕಚೇರಿ',
      sub: 'Atalji Janasnehi Kendra for Revenue Certificates',
      url: 'https://nadakacheri.karnataka.gov.in',
      tag: 'Certificates'
    },
    {
      name: 'FRUITS Portal',
      nameKn: 'ಫ್ರೂಟ್ಸ್ ಪೋರ್ಟಲ್',
      sub: 'Farmer Registration and Beneficiary Identification',
      url: 'https://fruits.karnataka.gov.in',
      tag: 'Farmer DB'
    },
    {
      name: 'SSP Karnataka',
      nameKn: 'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ',
      sub: 'State Scholarship Portal for Post-Matric & Pre-Matric',
      url: 'https://ssp.postmatric.karnataka.gov.in',
      tag: 'Scholarships'
    },
    {
      name: 'Kaveri 2.0',
      nameKn: 'ಕಾವೇರಿ ೨.೦',
      sub: 'Online property valuation & document registration',
      url: 'https://kaveri.karnataka.gov.in',
      tag: 'Property / Land'
    },
    {
      name: 'Ahara Karnataka',
      nameKn: 'ಆಹಾರ ಇಲಾಖೆ',
      sub: 'Food & Civil Supplies BPL/AAY Ration management',
      url: 'https://ahara.kar.nic.in',
      tag: 'Food Security'
    },
    {
      name: 'DigiLocker India',
      nameKn: 'ಡಿಜಿಲಾಕರ್',
      sub: 'Digital Public Infrastructure for authentic documents',
      url: 'https://www.digilocker.gov.in',
      tag: 'National DPI'
    }
  ];

  return (
    <div className="home-portal-view" style={{ backgroundColor: 'var(--color-bg, #F5F7FA)', minHeight: '100vh', paddingBottom: '48px' }}>
      
      {/* 1. HERO SECTION: Clean SaaS + Indian DPI Aesthetic */}
      <section style={{
        background: 'linear-gradient(135deg, #102F56 0%, #1556A0 65%, #1B4070 100%)',
        color: '#FFFFFF',
        padding: '36px 16px 44px',
        borderBottom: '4px solid #D99016',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Soft background grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            {/* Left Column: Heading, Value Prop, Search & CTAs */}
            <div>
              {/* Official DPI Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginBottom: '16px',
                color: '#FEF08A'
              }}>
                <span>🇮🇳</span>
                <span>{isKannada ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಮೂಲಸೌಕರ್ಯ' : 'Official Digital Public Infrastructure · Karnataka'}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <WifiOff size={13} /> {isKannada ? '೧೦೦% ಆಫ್‌ಲೈನ್ ಸಕ್ರಿಯ' : '100% Offline-First'}
                </span>
              </div>

              {/* Primary Headline */}
              <h1 style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: '#FFFFFF',
                margin: '0 0 14px 0',
                letterSpacing: '-0.02em'
              }}>
                {isKannada
                  ? 'ಗ್ರಾಮೀಣ ನಾಗರಿಕರಿಗೆ ನಿರಂತರ, ಖಾತರಿಯ ಸರ್ಕಾರಿ ಸೇವೆಗಳು.'
                  : 'Guaranteed Government Services. Zero Dropouts. Even Offline.'}
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
                lineHeight: 1.55,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 24px 0',
                maxWidth: '620px'
              }}>
                {isKannada
                  ? 'ಕರ್ನಾಟಕದ ೧,೦೬೦+ ಅಧಿಕೃತ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳನ್ನು ಅಂತರ್ಜಾಲವಿಲ್ಲದೆಯೂ ಸುಲಭವಾಗಿ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಅರ್ಜಿಯ ಮಾಹಿತಿಯು ಸ್ಥಳೀಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.'
                  : 'Access 1,060+ verified Karnataka welfare schemes, statutory certificates, and citizen services. Fill applications without internet, preserve drafts in IndexedDB, and auto-sync securely once connected.'}
              </p>

              {/* Hero Search Bar */}
              <form onSubmit={handleHeroSearch} style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '5px 6px',
                boxShadow: '0 8px 24px rgba(16, 47, 86, 0.25)',
                maxWidth: '560px',
                marginBottom: '20px'
              }}>
                <div style={{ padding: '0 10px', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder={isKannada ? 'ಯೋಜನೆ ಅಥವಾ ಸೇವೆಯನ್ನು ಹುಡುಕಿ (ಉದಾ: ರೈತ ಸಿರಿ, ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ)...' : 'Search schemes, services or certificates (e.g. Raitha Siri, Caste Certificate)...'}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#172B45',
                    padding: '8px 4px',
                    fontFamily: 'inherit'
                  }}
                  aria-label="Search schemes and services"
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#1556A0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#102F56'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1556A0'}
                >
                  <span>{isKannada ? 'ಹುಡುಕಿ' : 'Search'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* CTA Button Group */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <Link
                  to="/services"
                  style={{
                    backgroundColor: '#D99016',
                    color: '#102F56',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(217, 144, 22, 0.4)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Layers size={18} />
                  <span>{isKannada ? '೧,೦೬೦+ ಸೇವೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'Explore All 1,060+ Schemes'}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/finder"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    padding: '11px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(6px)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <Sparkles size={17} color="#FEF08A" />
                  <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆ ಹುಡುಕಿ' : 'Find Schemes for Me'}</span>
                </Link>

                <Link
                  to="/eligibility"
                  style={{
                    color: '#E0F2FE',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px'
                  }}
                >
                  <span>{isKannada ? 'ಕುಟುಂಬ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check Kutumba Rules →'}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Offline/Online DPI Assurance Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              color: '#172B45',
              boxShadow: '0 16px 36px rgba(16, 47, 86, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              maxWidth: '460px',
              marginLeft: 'auto'
            }}>
              {/* Real-time Network Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: online ? '#16834A' : '#D99016',
                    boxShadow: online ? '0 0 0 3px rgba(22, 131, 74, 0.2)' : '0 0 0 3px rgba(217, 144, 22, 0.2)'
                  }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: online ? '#16834A' : '#D99016' }}>
                    {online
                      ? (isKannada ? 'ಆನ್‌ಲೈನ್ — ನೇರ ಡಿಜಿಟಲ್ ಸಂಪರ್ಕ' : 'Online — Direct Central API')
                      : (isKannada ? 'ಆಫ್‌ಲೈನ್ — ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ ಮೋಡ್' : 'Offline — Local IndexedDB Engine')}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  PWA Ready
                </span>
              </div>

              {/* Live Metric Counters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '18px'
              }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#102F56', lineHeight: 1.1 }}>
                    {stats.totalRecords ? stats.totalRecords.toLocaleString() : '1,060'}
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>
                    {isKannada ? 'ಒಟ್ಟು ಯೋಜನೆ ಮತ್ತು ಸೇವೆಗಳು' : 'Total Verified Schemes'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16834A', lineHeight: 1.1 }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#16834A', marginTop: '4px' }}>
                    {isKannada ? 'ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ ರಕ್ಷಣೆ' : 'Offline Draft Preservation'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1556A0', lineHeight: 1.1 }}>
                    31
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1556A0', marginTop: '4px' }}>
                    {isKannada ? 'ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಗಳು' : 'Karnataka Districts Covered'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FEFCE8', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D99016', lineHeight: 1.1 }}>
                    15 {isKannada ? 'ದಿನಗಳು' : 'Days'}
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#92400E', marginTop: '4px' }}>
                    {isKannada ? 'ಸಕಾಲ ಗರಿಷ್ಠ ಗಡುವು' : 'Avg. Sakala SLA Delivery'}
                  </div>
                </div>
              </div>

              {/* Service Types Breakdown Badges */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#475569',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <span><strong>{stats.byServiceType?.scheme || 350}</strong> {isKannada ? 'ಯೋಜನೆಗಳು' : 'Schemes'}</span>
                <span>•</span>
                <span><strong>{stats.byServiceType?.service || 667}</strong> {isKannada ? 'ಸೇವೆಗಳು' : 'Services'}</span>
                <span>•</span>
                <span><strong>{stats.byServiceType?.certificate || 36}</strong> {isKannada ? 'ಪ್ರಮಾಣಪತ್ರ' : 'Certs'}</span>
                <span>•</span>
                <span><strong>{stats.byServiceType?.welfare_benefit || 7}</strong> {isKannada ? 'ಮಾಸಾಶನ' : 'Benefits'}</span>
              </div>

              {/* Quick Action Button to Track or View Drafts */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  to="/tracking"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    backgroundColor: '#102F56',
                    color: '#FFFFFF',
                    padding: '10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FileCheck size={15} />
                  <span>{isKannada ? 'ನನ್ನ ಅರ್ಜಿಗಳು / ಡ್ರಾಫ್ಟ್‌ಗಳು' : 'My Drafts & Tracking'}</span>
                </Link>

                <Link
                  to="/grievance"
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#F1F5F9',
                    color: '#172B45',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    border: '1px solid #CBD5E1'
                  }}
                  title="Janaspandana Grievance Desk"
                >
                  {isKannada ? 'ಜನಸ್ಪಂದನ' : 'Grievance'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL ANNOUNCEMENTS TICKER */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '8px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#DCFCE7',
            color: '#16834A',
            padding: '3px 10px',
            borderRadius: '4px',
            fontSize: '0.76rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            <CheckCircle2 size={13} />
            <span>{isKannada ? 'ಅಧಿಕೃತ ಸೂಚನೆ' : 'Live Ticker'}</span>
          </div>

          <div style={{
            fontSize: '0.84rem',
            color: '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isKannada
              ? '📢 ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್: ರೈತ ಸಿರಿ, ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ, ಗೃಹಲಕ್ಷ್ಮಿ ಮತ್ತು ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಅರ್ಜಿಗಳನ್ನು ಅಂತರ್ಜಾಲವಿಲ್ಲದೆಯೂ ಸಂಪೂರ್ಣವಾಗಿ ಭರ್ತಿ ಮಾಡಬಹುದು. ಸಂಪರ್ಕ ಮರುಸ್ಥಾಪನೆಗೊಂಡಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.'
              : '📢 OfflineBridge: Applications for Raitha Siri, Sandhya Suraksha, Gruha Lakshmi, and Statutory Caste/Income Certificates can be completed 100% offline. Local drafts auto-sync securely once connection is restored.'}
          </div>

          <Link
            to="/services"
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1556A0',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isKannada ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' : 'View All'}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 3. 8-SECTOR DIGITAL PUBLIC INFRASTRUCTURE CATEGORIES */}
      <section style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1556A0',
              letterSpacing: '0.06em',
              marginBottom: '4px'
            }}>
              {isKannada ? 'ವಲಯವಾರು ಸೇವೆಗಳು' : 'Sector Taxonomy'}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#102F56',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {isKannada ? '೮ ಪ್ರಮುಖ ಸಾರ್ವಜನಿಕ ಸೇವಾ ವಲಯಗಳು' : '8 Core Citizen Service Sectors'}
            </h2>
          </div>

          <Link
            to="/services"
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#1556A0',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isKannada ? '೧,೦೬೦+ ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ' : 'Browse All 1,060+ Items'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Responsive Sector Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {sectorCategories.map((sector) => {
            const IconComponent = sector.icon;

            return (
              <Link
                key={sector.id}
                to={`/services?category=${sector.id}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 47, 86, 0.08)';
                  e.currentTarget.style.borderColor = sector.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 47, 86, 0.04)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: sector.bgColor,
                    color: sector.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={24} />
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: sector.color,
                    backgroundColor: sector.bgColor,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${sector.bgColor}`
                  }}>
                    {sector.badge}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.08rem',
                  fontWeight: 700,
                  color: '#102F56',
                  margin: '0 0 6px 0',
                  lineHeight: 1.3
                }}>
                  {t(sector.title, sector.titleKn)}
                </h3>

                <p style={{
                  fontSize: '0.84rem',
                  color: '#64748B',
                  lineHeight: 1.5,
                  margin: '0 0 16px 0',
                  flex: 1
                }}>
                  {t(sector.desc, sector.descKn)}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1556A0'
                }}>
                  <span>{sector.count} {isKannada ? 'ಸೇವೆಗಳು' : 'Services'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    {isKannada ? 'ತೆರೆಯಿರಿ' : 'Open'} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED SCHEMES & DIRECT APPLICATION DRAFTING */}
      <section style={{ maxWidth: '1280px', margin: '40px auto 0', padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1556A0',
              letterSpacing: '0.06em',
              marginBottom: '4px'
            }}>
              {isKannada ? 'ಪ್ರಮುಖ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು' : 'High Priority Citizen Schemes'}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#102F56',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {isKannada ? 'ಅಧಿಕೃತ ಯೋಜನೆಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಅರ್ಜಿಗಳು' : 'Featured Schemes & Instant Offline Drafting'}
            </h2>
          </div>

          <Link
            to="/services"
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#1556A0',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isKannada ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಪಟ್ಟಿ' : 'View Full Catalogue'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* 3-Column Grid for Featured Schemes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {featuredSchemes.map((scheme) => {
            const hasDraft = savedDraftIds.has(scheme.id);

            return (
              <div
                key={scheme.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 47, 86, 0.08)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 47, 86, 0.04)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Header: Service Code + SLA + Draft indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: '#EFF6FF',
                      color: '#1556A0',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      {scheme.serviceCode}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#FEFCE8',
                      color: '#92400E',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={11} /> SLA: {scheme.slaDays} {isKannada ? 'ದಿನಗಳು' : 'Days'}
                    </span>
                  </div>

                  {hasDraft && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#16834A',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FileCheck size={12} /> {isKannada ? 'ಡ್ರಾಫ್ಟ್ ಇದೆ' : 'Draft Saved'}
                    </span>
                  )}
                </div>

                {/* Scheme Title */}
                <h3 style={{
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: '#102F56',
                  lineHeight: 1.35,
                  margin: '0 0 6px 0'
                }}>
                  {t(scheme.title, scheme.titleKn)}
                </h3>

                {/* Department */}
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#64748B',
                  marginBottom: '12px'
                }}>
                  {t(scheme.department, scheme.departmentKn)}
                </div>

                {/* Benefit Summary Box */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '14px',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  color: '#334155',
                  borderLeft: '3px solid #1556A0'
                }}>
                  <strong style={{ color: '#102F56' }}>{isKannada ? 'ಪ್ರಯೋಜನ:' : 'Benefit:'}</strong>{' '}
                  {t(scheme.benefitSummary, scheme.benefitSummaryKn)}
                </div>

                {/* Action Buttons: Modal Draft + Details */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const full = getCatalogueSchemeById(scheme.id);
                      if (full) {
                        setActiveModalScheme(full);
                      } else {
                        navigate(`/services?search=${encodeURIComponent(scheme.title)}`);
                      }
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: hasDraft ? '#16834A' : '#1556A0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(16, 47, 86, 0.12)'
                    }}
                  >
                    <FileText size={15} />
                    <span>
                      {hasDraft
                        ? (isKannada ? 'ಡ್ರಾಫ್ಟ್ ಮುಂದುವರಿಸಿ' : 'Resume Saved Draft')
                        : (isKannada ? 'ಆಫ್‌ಲೈನ್ ಅರ್ಜಿ ಭರ್ತಿ ಮಾಡಿ' : 'Open Application Draft')}
                    </span>
                  </button>

                  <Link
                    to={`/services?search=${encodeURIComponent(scheme.title)}`}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#102F56',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="View Full Scheme Details"
                  >
                    {isKannada ? 'ವಿವರ' : 'Details'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE OFFLINE-FIRST ARCHITECTURE STRIP */}
      <section style={{ maxWidth: '1280px', margin: '44px auto 0', padding: '0 16px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px 28px',
          boxShadow: '0 4px 16px rgba(16, 47, 86, 0.05)'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#1556A0',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <ShieldCheck size={15} />
              <span>{isKannada ? 'ಗ್ರಾಮೀಣ ಕನೆಕ್ಟಿವಿಟಿ ತಂತ್ರಜ್ಞಾನ' : 'Zero-Dropout Architecture'}</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#102F56', margin: '0 0 8px 0' }}>
              {isKannada ? 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ನಿಮ್ಮ ಅರ್ಜಿ ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ?' : 'How OfflineBridge Works Without Active Internet'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              {isKannada
                ? 'ಗ್ರಾಮೀಣ ನೆಟ್‌ವರ್ಕ್ ಕಡಿತಗೊಂಡಾಗ ಅರ್ಜಿ ರದ್ದಾಗದಂತೆ ಸ್ಥಳೀಯ ಬ್ರೌಸರ್ ಡ್ರಾಫ್ಟ್ ಎಂಜಿನ್ ಮತ್ತು ಹಿನ್ನೆಲೆ ಸಿಂಕ್ ತಂತ್ರಜ್ಞಾನ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.'
                : 'Built with modern PWA Service Workers and client-side IndexedDB preservation to protect rural citizens from connectivity drops.'}
            </p>
          </div>

          {/* 3-Step Architecture Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Step 1 */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1556A0',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#102F56', marginBottom: '8px' }}>
                {isKannada ? '೧. ಸಂಪೂರ್ಣ ಆಫ್‌ಲೈನ್ ಬ್ರೌಸಿಂಗ್' : '1. Cache-First PWA Loading'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isKannada
                  ? '೧,೦೬೦+ ಯೋಜನೆಗಳ ನಿಯಮಗಳು, ದಾಖಲೆಗಳ ಪಟ್ಟಿ ಮತ್ತು ನಮೂನೆಗಳು ಬ್ರೌಸರ್ ಸಂಗ್ರಹದಲ್ಲಿದ್ದು ತಕ್ಷಣ ತೆರೆಯುತ್ತವೆ.'
                  : 'Schemes catalogue, eligibility matrices, and application schemas are stored on-device via Service Worker for instant offline access.'}
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#16834A',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#102F56', marginBottom: '8px' }}>
                {isKannada ? '೨. ತತ್‌ಕ್ಷಣದ IndexedDB ಡ್ರಾಫ್ಟ್' : '2. Real-Time Keystroke Drafts'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isKannada
                  ? 'ನೀವು ನಮೂದಿಸುವ ಪ್ರತಿಯೊಂದು ಅಕ್ಷರವೂ ಬ್ರೌಸರ್‌ನ IndexedDB ಯಲ್ಲಿ ಸೇವ್ ಆಗುತ್ತದೆ. ಬ್ಯಾಟರಿ ಅಥವಾ ಸಿಗ್ನಲ್ ಕಡಿತಗೊಂಡರೂ ಮಾಹಿತಿ ಕಳೆದುಹೋಗುವುದಿಲ್ಲ.'
                  : 'Every keystroke is auto-saved locally into browser IndexedDB. Closing the tab or losing power retains 100% of the applicant details.'}
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#D99016',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#102F56', marginBottom: '8px' }}>
                {isKannada ? '೩. ಸುರಕ್ಷಿತ ಸ್ವಯಂಚಾಲಿತ ಸಿಂಕ್' : '3. Guaranteed Zero-Loss Sync'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isKannada
                  ? 'ಮೊಬೈಲ್ ನೆಟ್‌ವರ್ಕ್ ದೊರೆತ ಕೂಡಲೇ ಡ್ರಾಫ್ಟ್‌ಗಳು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸರ್ವರ್‌ಗೆ ರವಾನೆಯಾಗಿ ಅಧಿಕೃತ Sakala GSC ಅರ್ಜಿ ಸಂಖ್ಯೆ ಪಡೆಯುತ್ತವೆ.'
                  : 'As soon as 2G/3G/4G connectivity resumes, background sync transmits drafts to PostgreSQL and mints official Sakala tracking numbers.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OFFICIAL KARNATAKA GOVERNMENT ECOSYSTEM PORTALS */}
      <section style={{ maxWidth: '1280px', margin: '40px auto 0', padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1556A0',
              letterSpacing: '0.06em',
              marginBottom: '4px'
            }}>
              {isKannada ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳ ಸಂಪರ್ಕ' : 'State & Central DPI Hub'}
            </div>
            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#102F56',
              margin: 0
            }}>
              {isKannada ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಪ್ರಮುಖ ಡಿಜಿಟಲ್ ಪೋರ್ಟಲ್‌ಗಳು' : 'Karnataka Official Digital Portals'}
            </h2>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            {isKannada ? 'ನೇರ ಅಧಿಕೃತ ಲಿಂಕ್‌ಗಳು' : 'Verified Authoritative Sources'}
          </span>
        </div>

        {/* 4-Column Grid for Official Portals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {officialPortals.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(16, 47, 86, 0.04)',
                transition: 'border-color 0.15s ease, transform 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1556A0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#EFF6FF',
                  color: '#1556A0',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {portal.tag}
                </span>
                <ExternalLink size={14} color="#94A3B8" />
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#102F56', margin: '0 0 4px 0' }}>
                {t(portal.name, portal.nameKn)}
              </h4>

              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.4, flex: 1 }}>
                {portal.sub}
              </p>
            </a>
          ))}
        </div>
      </section>

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
