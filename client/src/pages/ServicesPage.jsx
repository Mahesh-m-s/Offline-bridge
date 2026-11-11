import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle,
  HelpCircle,
  FileText,
  CheckCircle2,
  Sprout,
  Users,
  Home,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Monitor,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  WifiOff,
  Check,
  ShieldCheck,
  PhoneCall,
  Info,
  Clock,
  Award
} from 'lucide-react';
import DraftFormModal from '../components/DraftFormModal';
import { getAllDrafts } from '../offline/draftStorage';
import { fetchSchemes, fetchSchemeStats } from '../api/schemes';
import { getCatalogueSchemeById } from '../data/schemesCatalogue';
import { useLanguage } from '../context/LanguageContext';

// Standard official category definitions
export const CATEGORIES = [
  { id: 'all', title: 'All Categories', titleKn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು' },
  { id: 'farmer', title: 'Farmer & Agriculture', titleKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ' },
  { id: 'citizen', title: 'Citizen & Social Welfare', titleKn: 'ನಾಗರಿಕ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣ' },
  { id: 'housing', title: 'Rural Housing', titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ' },
  { id: 'food', title: 'Food & Civil Supplies', titleKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು' },
  { id: 'student', title: 'Youth & Education', titleKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ' },
  { id: 'health', title: 'Health Services', titleKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು' },
  { id: 'business', title: 'Business & MSME', titleKn: 'ಉದ್ಯಮ ಮತ್ತು ಕೈಗಾರಿಕೆ' },
  { id: 'it_services', title: 'IT & Digital Services', titleKn: 'ಐಟಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಸೇವೆಗಳು' }
];

// Service Types definitions
export const SERVICE_TYPES = [
  { id: 'all', label: 'All Items', labelKn: 'ಎಲ್ಲಾ ಸೇವೆಗಳು', countKey: 'totalRecords' },
  { id: 'scheme', label: 'Welfare Schemes', labelKn: 'ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು', countKey: 'scheme' },
  { id: 'service', label: 'Citizen Services', labelKn: 'ನಾಗರಿಕ ಸೇವೆಗಳು', countKey: 'service' },
  { id: 'certificate', label: 'Statutory Certificates', labelKn: 'ಕಂದಾಯ ಪ್ರಮಾಣಪತ್ರ', countKey: 'certificate' },
  { id: 'welfare_benefit', label: 'Social Benefits', labelKn: 'ಸಾಮಾಜಿಕ ಮಾಸಾಶನ', countKey: 'welfare_benefit' }
];

function getCategoryIcon(catId, size = 15) {
  switch (catId) {
    case 'farmer': return <Sprout size={size} />;
    case 'citizen': return <Users size={size} />;
    case 'housing': return <Home size={size} />;
    case 'food': return <ShoppingBag size={size} />;
    case 'student': return <GraduationCap size={size} />;
    case 'health': return <HeartPulse size={size} />;
    case 'business': return <Briefcase size={size} />;
    case 'it_services': return <Monitor size={size} />;
    case 'all':
    default: return <Layers size={size} />;
  }
}

const OFFLINE_CACHE_KEY = 'offlinebridge_cached_schemes_page';

export default function ServicesPage() {
  const { isKannada, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialCategory = searchParams.get('category') || 'all';
  const initialServiceType = searchParams.get('service_type') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedServiceType, setSelectedServiceType] = useState(initialServiceType);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(18);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // API State
  const [schemes, setSchemes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Modal and draft state
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [selectedSchemeForDraft, setSelectedSchemeForDraft] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('overview'); // 'overview' | 'eligibility' | 'apply'
  const [savedDraftIds, setSavedDraftIds] = useState(new Set());
  const [filterDraftsOnly, setFilterDraftsOnly] = useState(false);

  const abortControllerRef = useRef(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync category change to reset page
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Sync service type change
  const handleServiceTypeChange = (typeId) => {
    setSelectedServiceType(typeId);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (typeId === 'all') {
      newParams.delete('service_type');
    } else {
      newParams.set('service_type', typeId);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Sync sort change
  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'title_asc') {
      setSortBy('title');
      setSortOrder('asc');
    } else if (val === 'title_desc') {
      setSortBy('title');
      setSortOrder('desc');
    } else if (val === 'dept_asc') {
      setSortBy('department');
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Load saved draft IDs from local IndexedDB storage
  const loadDraftIds = useCallback(async () => {
    try {
      const drafts = await getAllDrafts();
      const ids = new Set((drafts || []).map((d) => d.serviceId || d.id));
      setSavedDraftIds(ids);
    } catch {
      // Ignore draft read errors
    }
  }, []);

  useEffect(() => {
    loadDraftIds();
  }, [loadDraftIds]);

  // Load live statistics from backend PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      const res = await fetchSchemeStats();
      if (res.success && isMounted) {
        setStats(res.data);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  // Main data fetch from PostgreSQL via Express API
  const loadSchemesData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setIsOfflineFallback(false);

    try {
      const result = await fetchSchemes({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        category: selectedCategory,
        service_type: selectedServiceType,
        sort: sortBy,
        order: sortOrder,
        signal: controller.signal
      });

      if (result.success) {
        setSchemes(result.data);
        setPagination(result.pagination);
        setError(null);

        try {
          localStorage.setItem(
            OFFLINE_CACHE_KEY,
            JSON.stringify({
              schemes: result.data,
              pagination: result.pagination,
              cachedAt: Date.now()
            })
          );
        } catch {
          // Ignore cache errors
        }
      } else {
        // Attempt reading from local offline cache
        try {
          const cachedRaw = localStorage.getItem(OFFLINE_CACHE_KEY);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && Array.isArray(cached.schemes)) {
              setSchemes(cached.schemes);
              setPagination(cached.pagination || {
                page: 1,
                limit: cached.schemes.length,
                totalRecords: cached.schemes.length,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false
              });
              setIsOfflineFallback(true);
              setError(null);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Ignore cache parse errors
        }

        setError(result.error?.message || 'Unable to load government schemes from database.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Network connection error. Failed to reach the OfflineBridge server.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, selectedServiceType, sortBy, sortOrder]);

  useEffect(() => {
    loadSchemesData();
  }, [loadSchemesData]);

  const ensureArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [String(val)];
  };

  const enrichScheme = (rawScheme) => {
    if (!rawScheme) return null;
    const cat = getCatalogueSchemeById(rawScheme.id) || {};
    return {
      ...rawScheme,
      serviceCode: rawScheme.service_code || cat.serviceCode || rawScheme.id?.toUpperCase().slice(0, 6) || 'SCH001',
      serviceType: rawScheme.service_type || cat.serviceType || 'scheme',
      slaDays: rawScheme.sla_days || cat.slaDays || 15,
      titleKn: rawScheme.title_kn || cat.titleKn || rawScheme.title,
      departmentKn: rawScheme.department_kn || cat.departmentKn || rawScheme.department,
      descriptionKn: rawScheme.description_kn || cat.descriptionKn || rawScheme.description,
      categoryLabel: cat.categoryLabel || rawScheme.category,
      categoryLabelKn: cat.categoryLabelKn || rawScheme.category,
      benefits: ensureArray(rawScheme.benefits || cat.benefits),
      benefitsKn: ensureArray(rawScheme.benefits_kn || cat.benefitsKn),
      eligibilityCriteria: cat.eligibilityCriteria || (rawScheme.eligibility_criteria ? rawScheme.eligibility_criteria.split('\n') : []),
      eligibilityCriteriaKn: cat.eligibilityCriteriaKn || [],
      requiredDocuments: ensureArray(cat.requiredDocuments || rawScheme.required_documents),
      requiredDocumentsKn: ensureArray(cat.requiredDocumentsKn),
      applicationProcedure: ensureArray(cat.applicationProcedure || rawScheme.application_procedure),
      applicationProcedureKn: ensureArray(cat.applicationProcedureKn),
      officialUrl: rawScheme.official_url || cat.officialUrl || null,
      helpline: cat.helpline || 'Janaspandana 1902',
      verificationStatus: rawScheme.verification_status || 'verified'
    };
  };

  const displayedSchemes = useMemo(() => {
    let list = schemes.map(enrichScheme);
    if (filterDraftsOnly) {
      list = list.filter((s) => savedDraftIds.has(s.id));
    }
    return list;
  }, [schemes, filterDraftsOnly, savedDraftIds]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedServiceType('all');
    setSearchTerm('');
    setDebouncedSearch('');
    setFilterDraftsOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="ob-services-container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* 1. COMPACT PAGE HEADER & HERO STRIP */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px 28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(16, 47, 86, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#1556A0',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: '1px solid #BFDBFE'
            }}>
              <ShieldCheck size={14} />
              <span>{isKannada ? 'ಕರ್ನಾಟಕ ಸರಕಾರ — ಅಧಿಕೃತ ಮಾಹಿತಿ ಭಂಡಾರ' : 'Government of Karnataka — Authoritative Catalogue'}</span>
            </span>
            {isOfflineFallback && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                <WifiOff size={13} />
                <span>{isKannada ? 'ಸ್ಥಳೀಯ ಆಫ್‌ಲೈನ್ ಕ್ಯಾಶ್' : 'Offline Cache Mode'}</span>
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#102F56', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            {isKannada ? 'ಸರಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು' : 'Government Schemes, Services & Certificates'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748B', lineHeight: 1.5 }}>
            {isKannada
              ? 'ಕರ್ನಾಟಕದ ರೈತರು, ವಿದ್ಯಾರ್ಥಿಗಳು, ಮಹಿಳೆಯರು ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ೧,೦೬೦+ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಮತ್ತು ಸೇವೆಗಳು.'
              : 'Direct benefit transfers, subsidies, pensions, and statutory revenue certificates with guaranteed Sakala SLAs and offline-first drafting.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/finder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#1556A0',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(21, 86, 160, 0.25)'
            }}
          >
            <Sparkles size={16} color="#FEF08A" />
            <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆ ಹುಡುಕಿ' : 'Find Schemes for Me'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* 2. COMPACT LIVE STATISTICS STRIP */}
      {stats && (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }} aria-label="Scheme statistics">
          <div style={{ backgroundColor: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#102F56' }}>
              {stats.totalRecords || stats.totalSchemes || 1060}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              {isKannada ? 'ಒಟ್ಟು ಪರಿಶೀಲಿಸಿದ ಸೇವೆಗಳು' : 'Total Verified Records'}
            </div>
          </div>

          <div style={{ backgroundColor: '#F0FDF4', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16834A' }}>
              {stats.byServiceType?.scheme || 350}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16834A', fontWeight: 600 }}>
              {isKannada ? 'ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು' : 'Welfare Schemes'}
            </div>
          </div>

          <div style={{ backgroundColor: '#EFF6FF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1556A0' }}>
              {stats.byServiceType?.service || 667}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#1556A0', fontWeight: 600 }}>
              {isKannada ? 'ನಾಗರಿಕ ಸೇವೆಗಳು' : 'Citizen Delivery Services'}
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFCE8', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FEF08A' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D99016' }}>
              {stats.byServiceType?.certificate || 36}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
              {isKannada ? 'ಕಂದಾಯ ಪ್ರಮಾಣಪತ್ರಗಳು' : 'Statutory Certificates'}
            </div>
          </div>

          <div style={{ backgroundColor: '#F5F3FF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED' }}>
              {stats.byServiceType?.welfare_benefit || 7}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6D28D9', fontWeight: 600 }}>
              {isKannada ? 'ಸಾಮಾಜಿಕ ಮಾಸಾಶನ' : 'Welfare Benefits'}
            </div>
          </div>
        </section>
      )}

      {/* 3. SERVICE TYPE SEGMENTED FILTER STRIP */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px'
      }}>
        {SERVICE_TYPES.map((st) => {
          const isSelected = selectedServiceType === st.id;
          const count = st.id === 'all'
            ? (stats?.totalRecords || 1060)
            : (stats?.byServiceType?.[st.countKey] || 0);

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleServiceTypeChange(st.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isSelected ? 800 : 600,
                backgroundColor: isSelected ? '#102F56' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1px solid #102F56' : '1px solid #CBD5E1',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isKannada ? st.labelKn : st.label}</span>
              <span style={{
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#64748B',
                fontSize: '0.74rem',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. SEARCH & CATEGORY FILTER BAR */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px'
      }} aria-label="Search and filter schemes">
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '4px 12px',
          marginBottom: '14px'
        }}>
          <Search size={18} color="#64748B" />
          <input
            type="text"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              padding: '8px 10px',
              fontSize: '0.92rem',
              color: '#172B45',
              fontFamily: 'inherit'
            }}
            placeholder={
              isKannada
                ? 'ಯೋಜನೆಯ ಹೆಸರು, ಇಲಾಖೆ, ಸೌಲಭ್ಯ ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ...'
                : 'Search schemes by title, department, benefit, or keyword...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search schemes"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Horizontal Category Pill Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }} role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  color: isSelected ? '#1556A0' : '#475569',
                  border: isSelected ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{getCategoryIcon(cat.id, 13)}</span>
                <span>{isKannada ? cat.titleKn : cat.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. RESULTS META BAR & SORT CONTROLS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <div style={{ fontSize: '0.88rem', color: '#475569' }}>
          {loading ? (
            <span style={{ color: '#64748B' }}>{isKannada ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading verified schemes...'}</span>
          ) : (
            <>
              {isKannada ? (
                <>
                  ಒಟ್ಟು <strong>{pagination.totalRecords}</strong> ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿವೆ
                  {selectedCategory !== 'all' && ` (${CATEGORIES.find((c) => c.id === selectedCategory)?.titleKn})`}
                  {debouncedSearch && ` — "${debouncedSearch}"`}
                </>
              ) : (
                <>
                  Showing <strong>{pagination.totalRecords > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}–{Math.min(pagination.page * pagination.limit, pagination.totalRecords)}</strong> of <strong>{pagination.totalRecords}</strong> verified {pagination.totalRecords === 1 ? 'record' : 'records'}
                  {selectedCategory !== 'all' && ` in ${CATEGORIES.find((c) => c.id === selectedCategory)?.title}`}
                  {debouncedSearch && ` matching "${debouncedSearch}"`}
                </>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {savedDraftIds.size > 0 && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#102F56', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterDraftsOnly}
                onChange={(e) => setFilterDraftsOnly(e.target.checked)}
              />
              <span>{isKannada ? 'ನನ್ನ ಕರಡುಗಳು' : 'My Local Drafts'} ({savedDraftIds.size})</span>
            </label>
          )}

          {(selectedCategory !== 'all' || selectedServiceType !== 'all' || debouncedSearch || filterDraftsOnly) && (
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#1556A0',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isKannada ? 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear filters'}
            </button>
          )}

          <div>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={handleSortChange}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                color: '#172B45',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
              aria-label="Sort schemes"
            >
              <option value="title_asc">{isKannada ? 'ವಿಂಗಡಣೆ: ಹೆಸರು (A to Z)' : 'Sort: Title (A to Z)'}</option>
              <option value="title_desc">{isKannada ? 'ವಿಂಗಡಣೆ: ಹೆಸರು (Z to A)' : 'Sort: Title (Z to A)'}</option>
              <option value="dept_asc">{isKannada ? 'ವಿಂಗಡಣೆ: ಇಲಾಖೆ' : 'Sort: Department'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. SCHEMES CARD GRID */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', height: '220px' }}>
              <div style={{ height: '18px', width: '40%', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '24px', width: '85%', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '14px', width: '60%', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '16px' }} />
              <div style={{ height: '48px', width: '100%', backgroundColor: '#F8FAFC', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '36px 20px',
          textAlign: 'center',
          color: '#B91C1C'
        }}>
          <AlertTriangle size={36} style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0' }}>{isKannada ? 'ಮಾಹಿತಿ ತರಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' : 'Unable to Retrieve Schemes'}</h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 16px 0' }}>{error}</p>
          <button
            type="button"
            onClick={loadSchemesData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1556A0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} />
            <span>{isKannada ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry Database Connection'}</span>
          </button>
        </div>
      ) : displayedSchemes.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '48px 20px',
          textAlign: 'center',
          color: '#64748B'
        }}>
          <HelpCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#102F56', margin: '0 0 8px 0' }}>
            {isKannada ? 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Matching Government Schemes Found'}
          </h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 18px 0' }}>
            {isKannada
              ? 'ನಿಮ್ಮ ಹುಡುಕಾಟದ ಕೀವರ್ಡ್ ಅಥವಾ ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ ಪ್ರಯತ್ನಿಸಿ.'
              : 'Try adjusting your search keywords, clearing your filter selection, or switching categories.'}
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1556A0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isKannada ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ' : 'View All Available Schemes'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px'
        }}>
          {displayedSchemes.map((scheme) => {
            const hasSavedDraft = savedDraftIds.has(scheme.id);
            return (
              <article
                key={scheme.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(16, 47, 86, 0.03)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 47, 86, 0.08)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(16, 47, 86, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Header Tag, SLA & Draft Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: '#EFF6FF',
                      color: '#1556A0',
                      padding: '3px 7px',
                      borderRadius: '4px'
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
                      gap: '3px'
                    }}>
                      <Clock size={11} /> SLA: {scheme.slaDays}d
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {hasSavedDraft && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#DCFCE7',
                        color: '#16834A',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <FileText size={11} /> {isKannada ? 'ಕರಡು ಇದೆ' : 'Draft Saved'}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#64748B',
                      backgroundColor: '#F1F5F9',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {scheme.serviceType}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  color: '#102F56',
                  lineHeight: 1.35,
                  margin: '0 0 6px 0'
                }}>
                  {isKannada ? scheme.titleKn || scheme.title : scheme.title}
                </h3>

                {/* Department */}
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#64748B',
                  marginBottom: '10px'
                }}>
                  {isKannada ? scheme.departmentKn || scheme.department : scheme.department}
                </div>

                {/* Description Truncated */}
                <p style={{
                  fontSize: '0.84rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: '0 0 16px 0',
                  flex: 1
                }}>
                  {isKannada ? scheme.descriptionKn || scheme.description : scheme.description}
                </p>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchemeForDetails(scheme);
                      setActiveModalTab('overview');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      color: '#102F56',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    aria-label={`View details for ${scheme.title}`}
                  >
                    <span>{isKannada ? 'ವಿವರ' : 'Details'}</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSchemeForDraft(scheme)}
                    style={{
                      flex: 1.2,
                      backgroundColor: hasSavedDraft ? '#16834A' : '#1556A0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                    aria-label={`Apply or draft application for ${scheme.title}`}
                  >
                    <FileText size={13} />
                    <span>{hasSavedDraft ? (isKannada ? 'ಕರಡು ತೆರೆಯಿರಿ' : 'Open Draft') : (isKannada ? 'ಅರ್ಜಿ ಕರಡು' : 'Draft Form')}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 7. CLEAN COMPACT PAGINATION CONTROLS */}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '32px'
        }} aria-label="Schemes pagination">
          <button
            type="button"
            disabled={!pagination.hasPreviousPage}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: pagination.hasPreviousPage ? '#FFFFFF' : '#F8FAFC',
              color: pagination.hasPreviousPage ? '#102F56' : '#94A3B8',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: pagination.hasPreviousPage ? 'pointer' : 'not-allowed'
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>{isKannada ? 'ಹಿಂದಿನದು' : 'Previous'}</span>
          </button>

          <div style={{ fontSize: '0.88rem', color: '#475569' }}>
            {isKannada ? (
              <span>ಪುಟ <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong></span>
            ) : (
              <span>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong></span>
            )}
          </div>

          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: pagination.hasNextPage ? '#FFFFFF' : '#F8FAFC',
              color: pagination.hasNextPage ? '#102F56' : '#94A3B8',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed'
            }}
            aria-label="Next page"
          >
            <span>{isKannada ? 'ಮುಂದಿನದು' : 'Next'}</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      {/* 8. SCHEME DETAIL MODAL */}
      {selectedSchemeForDetails && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 47, 86, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(16, 47, 86, 0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#EFF6FF', color: '#1556A0', padding: '2px 8px', borderRadius: '4px' }}>
                    {selectedSchemeForDetails.serviceCode}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#FEFCE8', color: '#92400E', padding: '2px 8px', borderRadius: '4px' }}>
                    SLA: {selectedSchemeForDetails.slaDays} Days
                  </span>
                </div>
                <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#102F56', margin: '0 0 4px 0' }}>
                  {isKannada ? selectedSchemeForDetails.titleKn : selectedSchemeForDetails.title}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                  {isKannada ? selectedSchemeForDetails.departmentKn : selectedSchemeForDetails.department}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSchemeForDetails(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
                aria-label="Close details modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 24px'
            }} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'overview'}
                onClick={() => setActiveModalTab('overview')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeModalTab === 'overview' ? '3px solid #1556A0' : 'none',
                  fontWeight: activeModalTab === 'overview' ? 800 : 600,
                  color: activeModalTab === 'overview' ? '#1556A0' : '#64748B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem'
                }}
              >
                <Info size={15} />
                <span>{isKannada ? 'ಅವಲೋಕನ ಮತ್ತು ಸೌಲಭ್ಯ' : 'Overview & Benefits'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'eligibility'}
                onClick={() => setActiveModalTab('eligibility')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeModalTab === 'eligibility' ? '3px solid #1556A0' : 'none',
                  fontWeight: activeModalTab === 'eligibility' ? 800 : 600,
                  color: activeModalTab === 'eligibility' ? '#1556A0' : '#64748B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem'
                }}
              >
                <CheckCircle2 size={15} />
                <span>{isKannada ? 'ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳು' : 'Eligibility & Documents'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'apply'}
                onClick={() => setActiveModalTab('apply')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeModalTab === 'apply' ? '3px solid #1556A0' : 'none',
                  fontWeight: activeModalTab === 'apply' ? 800 : 600,
                  color: activeModalTab === 'apply' ? '#1556A0' : '#64748B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem'
                }}
              >
                <FileText size={15} />
                <span>{isKannada ? 'ಅರ್ಜಿ ವಿಧಾನ ಮತ್ತು ಪೋರ್ಟಲ್' : 'Application & Portal'}</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {activeModalTab === 'overview' && (
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#102F56', margin: '0 0 8px 0' }}>
                    {isKannada ? 'ಯೋಜನೆಯ ಉದ್ದೇಶ' : 'Scheme Description'}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    {isKannada ? selectedSchemeForDetails.descriptionKn : selectedSchemeForDetails.description}
                  </p>

                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#102F56', margin: '0 0 10px 0' }}>
                    {isKannada ? 'ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು' : 'Key Entitlements & Benefits'}
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    {(isKannada && selectedSchemeForDetails.benefitsKn?.length > 0
                      ? selectedSchemeForDetails.benefitsKn
                      : selectedSchemeForDetails.benefits
                    ).map((benefit, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalTab === 'eligibility' && (
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#102F56', margin: '0 0 10px 0' }}>
                    {isKannada ? 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು' : 'Eligibility Requirements'}
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    {(isKannada && selectedSchemeForDetails.eligibilityCriteriaKn?.length > 0
                      ? selectedSchemeForDetails.eligibilityCriteriaKn
                      : selectedSchemeForDetails.eligibilityCriteria
                    ).map((crit, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{crit}</li>
                    ))}
                  </ul>

                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#102F56', margin: '0 0 10px 0' }}>
                    {isKannada ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳು' : 'Mandatory Documents Checklist'}
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    {(isKannada && selectedSchemeForDetails.requiredDocumentsKn?.length > 0
                      ? selectedSchemeForDetails.requiredDocumentsKn
                      : selectedSchemeForDetails.requiredDocuments
                    ).map((doc, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalTab === 'apply' && (
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#102F56', margin: '0 0 10px 0' }}>
                    {isKannada ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು' : 'Application Procedure'}
                  </h4>
                  <ol style={{ paddingLeft: '20px', margin: '0 0 20px 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    {(isKannada && selectedSchemeForDetails.applicationProcedureKn?.length > 0
                      ? selectedSchemeForDetails.applicationProcedureKn
                      : selectedSchemeForDetails.applicationProcedure
                    ).map((proc, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{proc}</li>
                    ))}
                  </ol>

                  {selectedSchemeForDetails.officialUrl && (
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1556A0', textTransform: 'uppercase' }}>
                          {isKannada ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಿಂಕ್' : 'Official Government Portal'}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#1E40AF', wordBreak: 'break-all' }}>
                          {selectedSchemeForDetails.officialUrl}
                        </div>
                      </div>

                      <a
                        href={selectedSchemeForDetails.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          backgroundColor: '#1556A0',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}
                      >
                        <span>{isKannada ? 'ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' : 'Open Portal'}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748B' }}>
                    <PhoneCall size={16} />
                    <span>{isKannada ? 'ಇಲಾಖಾ ಸಹಾಯವಾಣಿ:' : 'Department Helpline:'} <strong>{selectedSchemeForDetails.helpline}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setSelectedSchemeForDetails(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isKannada ? 'ಮುಚ್ಚಿ' : 'Close'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = selectedSchemeForDetails;
                  setSelectedSchemeForDetails(null);
                  setSelectedSchemeForDraft(s);
                }}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#1556A0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={15} />
                <span>{isKannada ? 'ಆಫ್‌ಲೈನ್ ಅರ್ಜಿ ಭರ್ತಿ ಮಾಡಿ' : 'Start Application Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. OFFLINE APPLICATION DRAFT MODAL */}
      {selectedSchemeForDraft && (
        <DraftFormModal
          service={selectedSchemeForDraft}
          onClose={() => {
            setSelectedSchemeForDraft(null);
            loadDraftIds();
          }}
        />
      )}
    </div>
  );
}
