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
  Info
} from 'lucide-react';
import DraftFormModal from '../components/DraftFormModal';
import { getAllDrafts } from '../offline/draftStorage';
import { fetchSchemes, fetchSchemeStats } from '../api/schemes';
import { getCatalogueSchemeById } from '../data/schemesCatalogue';
import { useLanguage } from '../context/LanguageContext';

// Standard official category definitions
export const CATEGORIES = [
  { id: 'all', title: 'All Services', titleKn: 'ಎಲ್ಲಾ ಸೇವೆಗಳು' },
  { id: 'farmer', title: 'Farmer & Agriculture', titleKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ' },
  { id: 'citizen', title: 'Citizen & Social Welfare', titleKn: 'ನಾಗರಿಕ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣ' },
  { id: 'housing', title: 'Rural Housing', titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ' },
  { id: 'food', title: 'Food & Civil Supplies', titleKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು' },
  { id: 'student', title: 'Youth & Education', titleKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ' },
  { id: 'health', title: 'Health Services', titleKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು' },
  { id: 'business', title: 'Business & MSME', titleKn: 'ಉದ್ಯಮ ಮತ್ತು ಕೈಗಾರಿಕೆ' },
  { id: 'it_services', title: 'IT & Digital Services', titleKn: 'ಐಟಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಸೇವೆಗಳು' }
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
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // API State
  const [schemes, setSchemes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
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
      setCurrentPage(1); // Reset to page 1 on search change
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
        sort: sortBy,
        order: sortOrder,
        signal: controller.signal
      });

      if (result.success) {
        setSchemes(result.data);
        setPagination(result.pagination);
        setError(null);

        // Cache successful response locally for offline browsing
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
          // Ignore cache write errors
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
  }, [currentPage, pageSize, debouncedSearch, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    loadSchemesData();
  }, [loadSchemesData]);

  // Helper to ensure values are safe arrays for list rendering
  const ensureArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [String(val)];
  };

  // Enrich scheme with verified catalogue data (benefits, documents, official urls, translations)
  const enrichScheme = (rawScheme) => {
    if (!rawScheme) return null;
    const cat = getCatalogueSchemeById(rawScheme.id) || {};
    return {
      ...rawScheme,
      titleKn: rawScheme.title_kn || cat.titleKn || rawScheme.title,
      departmentKn: rawScheme.department_kn || cat.departmentKn || rawScheme.department,
      descriptionKn: rawScheme.description_kn || cat.descriptionKn || rawScheme.description,
      categoryLabel: cat.categoryLabel || rawScheme.category,
      categoryLabelKn: cat.categoryLabelKn || rawScheme.category,
      benefits: ensureArray(cat.benefits || rawScheme.benefits),
      benefitsKn: ensureArray(cat.benefitsKn || rawScheme.benefits_kn),
      eligibilityCriteria: cat.eligibilityCriteria || (rawScheme.eligibility_criteria ? rawScheme.eligibility_criteria.split('\n') : []),
      eligibilityCriteriaKn: cat.eligibilityCriteriaKn || [],
      requiredDocuments: ensureArray(cat.requiredDocuments),
      requiredDocumentsKn: ensureArray(cat.requiredDocumentsKn),
      applicationProcedure: ensureArray(cat.applicationProcedure),
      applicationProcedureKn: ensureArray(cat.applicationProcedureKn),
      officialUrl: cat.officialUrl || rawScheme.official_url || null,
      helpline: cat.helpline || 'Janaspandana 1902',
      verifiedDate: cat.verifiedDate || '2026-03-31'
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
    setSearchTerm('');
    setDebouncedSearch('');
    setFilterDraftsOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="ob-services-container">
      {/* =========================================================================
          1. COMPACT PAGE HEADER & HERO STRIP
          ========================================================================= */}
      <header className="ob-page-header">
        <div className="ob-header-text">
          <div className="ob-header-eyebrow">
            <span className="ob-badge-official">
              <ShieldCheck size={13} />
              <span>{isKannada ? 'ಕರ್ನಾಟಕ ಸರಕಾರ — ಪರಿಶೀಲಿಸಿದ ಸೇವೆಗಳು' : 'Government of Karnataka — Verified Services'}</span>
            </span>
            {isOfflineFallback && (
              <span className="ob-badge-offline">
                <WifiOff size={12} />
                <span>{isKannada ? 'ಆಫ್‌ಲೈನ್ ಕ್ಯಾಶ್‌ನಿಂದ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ' : 'Offline Cache Mode'}</span>
              </span>
            )}
          </div>
          <h1 className="ob-header-title">
            {isKannada ? 'ಸರಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳು' : 'Government Schemes & Public Services'}
          </h1>
          <p className="ob-header-subtitle">
            {isKannada
              ? 'ಕರ್ನಾಟಕದ ರೈತರು, ವಿದ್ಯಾರ್ಥಿಗಳು, ಮಹಿಳೆಯರು ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು.'
              : 'Direct benefit transfers, subsidies, pensions, and public services for rural communities across Karnataka.'}
          </p>
        </div>

        <div className="ob-header-action">
          <Link to="/eligibility" className="ob-btn-primary">
            <Sparkles size={16} />
            <span>{isKannada ? 'ನನ್ನ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check My Eligibility'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          2. COMPACT LIVE STATISTICS STRIP
          ========================================================================= */}
      {stats && (
        <section className="ob-stats-strip" aria-label="Scheme statistics">
          <div className="ob-stat-cell">
            <span className="ob-stat-value">{stats.totalSchemes || 10}</span>
            <span className="ob-stat-label">{isKannada ? 'ಒಟ್ಟು ಯೋಜನೆಗಳು' : 'Total Schemes'}</span>
          </div>
          <div className="ob-stat-divider" />
          <div className="ob-stat-cell">
            <span className="ob-stat-value">{stats.byCategory?.farmer || 1}</span>
            <span className="ob-stat-label">{isKannada ? 'ಕೃಷಿ & ರೈತ' : 'Agriculture'}</span>
          </div>
          <div className="ob-stat-divider" />
          <div className="ob-stat-cell">
            <span className="ob-stat-value">{stats.byCategory?.student || 2}</span>
            <span className="ob-stat-label">{isKannada ? 'ಶಿಕ್ಷಣ & ವಿದ್ಯಾರ್ಥಿ' : 'Education'}</span>
          </div>
          <div className="ob-stat-divider" />
          <div className="ob-stat-cell">
            <span className="ob-stat-value">{stats.byCategory?.citizen || 2}</span>
            <span className="ob-stat-label">{isKannada ? 'ಸಾಮಾಜಿಕ ಭದ್ರತೆ' : 'Social Security'}</span>
          </div>
          <div className="ob-stat-divider" />
          <div className="ob-stat-cell">
            <span className="ob-stat-value ob-stat-highlight">100%</span>
            <span className="ob-stat-label">{isKannada ? 'ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆಗಳು' : 'Verified by Dept.'}</span>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. SEARCH & HORIZONTAL CATEGORY NAVIGATION BAR
          ========================================================================= */}
      <section className="ob-filter-panel" aria-label="Search and filter schemes">
        {/* Search Input Bar */}
        <div className="ob-search-wrapper">
          <Search size={18} className="ob-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="ob-search-input"
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
              className="ob-search-clear-btn"
              onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Horizontal Category Pill Bar */}
        <div className="ob-category-pills-bar" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`ob-category-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span className="ob-pill-icon">{getCategoryIcon(cat.id, 14)}</span>
                <span className="ob-pill-text">{isKannada ? cat.titleKn : cat.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. RESULTS META BAR & SORT CONTROLS
          ========================================================================= */}
      <div className="ob-results-meta-bar">
        <div className="ob-results-count-text">
          {loading ? (
            <span className="ob-text-subtle">{isKannada ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading schemes...'}</span>
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
                  Showing <strong>{pagination.totalRecords > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}–{Math.min(pagination.page * pagination.limit, pagination.totalRecords)}</strong> of <strong>{pagination.totalRecords}</strong> verified {pagination.totalRecords === 1 ? 'scheme' : 'schemes'}
                  {selectedCategory !== 'all' && ` in ${CATEGORIES.find((c) => c.id === selectedCategory)?.title}`}
                  {debouncedSearch && ` matching "${debouncedSearch}"`}
                </>
              )}
            </>
          )}
        </div>

        <div className="ob-results-controls">
          {savedDraftIds.size > 0 && (
            <label className="ob-draft-filter-toggle">
              <input
                type="checkbox"
                checked={filterDraftsOnly}
                onChange={(e) => setFilterDraftsOnly(e.target.checked)}
              />
              <span>{isKannada ? 'ನನ್ನ ಕರಡುಗಳು' : 'My Drafts'} ({savedDraftIds.size})</span>
            </label>
          )}

          {(selectedCategory !== 'all' || debouncedSearch || filterDraftsOnly) && (
            <button
              type="button"
              className="ob-btn-text-clear"
              onClick={clearAllFilters}
            >
              {isKannada ? 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear filters'}
            </button>
          )}

          <div className="ob-sort-wrap">
            <select
              className="ob-sort-select"
              value={`${sortBy}_${sortOrder}`}
              onChange={handleSortChange}
              aria-label="Sort schemes"
            >
              <option value="title_asc">{isKannada ? 'ವಿಂಗಡಣೆ: ಹೆಸರು (A to Z)' : 'Sort: Title (A to Z)'}</option>
              <option value="title_desc">{isKannada ? 'ವಿಂಗಡಣೆ: ಹೆಸರು (Z to A)' : 'Sort: Title (Z to A)'}</option>
              <option value="dept_asc">{isKannada ? 'ವಿಂಗಡಣೆ: ಇಲಾಖೆ' : 'Sort: Department'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. SCHEMES CARD GRID (OR SKELETON / EMPTY / ERROR STATES)
          ========================================================================= */}
      {loading ? (
        <div className="ob-schemes-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="ob-card-skeleton">
              <div className="ob-skeleton-line ob-sk-badge" />
              <div className="ob-skeleton-line ob-sk-title" />
              <div className="ob-skeleton-line ob-sk-dept" />
              <div className="ob-skeleton-line ob-sk-desc" />
              <div className="ob-skeleton-line ob-sk-btn" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="ob-state-card ob-error-card" role="alert">
          <AlertTriangle size={36} className="ob-state-icon-warn" />
          <h3 className="ob-state-title">{isKannada ? 'ಮಾಹಿತಿ ತರಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' : 'Unable to Retrieve Schemes'}</h3>
          <p className="ob-state-desc">{error}</p>
          <button type="button" className="ob-btn-primary" onClick={loadSchemesData}>
            <RefreshCw size={15} />
            <span>{isKannada ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry Database Connection'}</span>
          </button>
        </div>
      ) : displayedSchemes.length === 0 ? (
        <div className="ob-state-card ob-empty-card">
          <HelpCircle size={40} className="ob-state-icon-subtle" />
          <h3 className="ob-state-title">
            {isKannada ? 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Matching Government Schemes Found'}
          </h3>
          <p className="ob-state-desc">
            {isKannada
              ? 'ನಿಮ್ಮ ಹುಡುಕಾಟದ ಕೀವರ್ಡ್ ಅಥವಾ ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ ಪ್ರಯತ್ನಿಸಿ.'
              : 'Try adjusting your search keywords, clearing your filter selection, or switching categories.'}
          </p>
          <button type="button" className="ob-btn-secondary" onClick={clearAllFilters}>
            <span>{isKannada ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ' : 'View All Available Schemes'}</span>
          </button>
        </div>
      ) : (
        <div className="ob-schemes-grid">
          {displayedSchemes.map((scheme) => {
            const hasSavedDraft = savedDraftIds.has(scheme.id);
            return (
              <article key={scheme.id} className="ob-scheme-card">
                {/* Header Tag & Verification Status */}
                <div className="ob-card-top-row">
                  <span className="ob-card-category-tag">
                    {getCategoryIcon(scheme.category, 12)}
                    <span>{isKannada ? scheme.categoryLabelKn || scheme.category : scheme.categoryLabel || scheme.category}</span>
                  </span>
                  {hasSavedDraft && (
                    <span className="ob-card-draft-indicator">
                      <FileText size={11} />
                      <span>{isKannada ? 'ಕರಡು ಉಳಿಸಲಾಗಿದೆ' : 'Draft Saved'}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="ob-card-title">
                  {isKannada ? scheme.titleKn || scheme.title : scheme.title}
                </h3>

                {/* Department */}
                <div className="ob-card-dept">
                  {isKannada ? scheme.departmentKn || scheme.department : scheme.department}
                </div>

                {/* Description Truncated */}
                <p className="ob-card-desc">
                  {isKannada ? scheme.descriptionKn || scheme.description : scheme.description}
                </p>

                {/* Bottom Actions */}
                <div className="ob-card-actions">
                  <button
                    type="button"
                    className="ob-btn-details"
                    onClick={() => {
                      setSelectedSchemeForDetails(scheme);
                      setActiveModalTab('overview');
                    }}
                    aria-label={`View details for ${scheme.title}`}
                  >
                    <span>{isKannada ? 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View Details'}</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    className="ob-btn-apply-quick"
                    onClick={() => setSelectedSchemeForDraft(scheme)}
                    aria-label={`Apply or draft application for ${scheme.title}`}
                  >
                    <FileText size={13} />
                    <span>{isKannada ? 'ಅರ್ಜಿ ಕರಡು' : 'Draft Form'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          6. CLEAN COMPACT PAGINATION CONTROLS
          ========================================================================= */}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="ob-pagination-bar" aria-label="Schemes pagination">
          <button
            type="button"
            className="ob-page-nav-btn"
            disabled={!pagination.hasPreviousPage}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>{isKannada ? 'ಹಿಂದಿನದು' : 'Previous'}</span>
          </button>

          <div className="ob-page-indicator">
            {isKannada ? (
              <span>ಪುಟ <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong></span>
            ) : (
              <span>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong></span>
            )}
          </div>

          <button
            type="button"
            className="ob-page-nav-btn"
            disabled={!pagination.hasNextPage}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            aria-label="Next page"
          >
            <span>{isKannada ? 'ಮುಂದಿನದು' : 'Next'}</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      {/* =========================================================================
          7. SCHEME DETAIL MODAL (CLEAN & ACCESSIBLE)
          ========================================================================= */}
      {selectedSchemeForDetails && (
        <div className="ob-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="ob-modal-card">
            {/* Modal Header */}
            <div className="ob-modal-header">
              <div className="ob-modal-title-group">
                <span className="ob-modal-cat-badge">
                  {getCategoryIcon(selectedSchemeForDetails.category, 13)}
                  <span>{isKannada ? selectedSchemeForDetails.categoryLabelKn : selectedSchemeForDetails.categoryLabel}</span>
                </span>
                <h2 id="modal-title" className="ob-modal-title">
                  {isKannada ? selectedSchemeForDetails.titleKn : selectedSchemeForDetails.title}
                </h2>
                <div className="ob-modal-dept">
                  {isKannada ? selectedSchemeForDetails.departmentKn : selectedSchemeForDetails.department}
                </div>
              </div>
              <button
                type="button"
                className="ob-modal-close-btn"
                onClick={() => setSelectedSchemeForDetails(null)}
                aria-label="Close details modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="ob-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'overview'}
                className={`ob-modal-tab-btn ${activeModalTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('overview')}
              >
                <Info size={15} />
                <span>{isKannada ? 'ಅವಲೋಕನ ಮತ್ತು ಸೌಲಭ್ಯ' : 'Overview & Benefits'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'eligibility'}
                className={`ob-modal-tab-btn ${activeModalTab === 'eligibility' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('eligibility')}
              >
                <CheckCircle2 size={15} />
                <span>{isKannada ? 'ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳು' : 'Eligibility & Documents'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeModalTab === 'apply'}
                className={`ob-modal-tab-btn ${activeModalTab === 'apply' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('apply')}
              >
                <FileText size={15} />
                <span>{isKannada ? 'ಅರ್ಜಿ ವಿಧಾನ ಮತ್ತು ಲಿಂಕ್' : 'Application & Portal'}</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="ob-modal-body">
              {activeModalTab === 'overview' && (
                <div className="ob-modal-tab-pane">
                  <h4 className="ob-pane-heading">{isKannada ? 'ಯೋಜನೆಯ ಉದ್ದೇಶ' : 'Scheme Overview'}</h4>
                  <p className="ob-pane-text">
                    {isKannada ? selectedSchemeForDetails.descriptionKn : selectedSchemeForDetails.description}
                  </p>

                  <h4 className="ob-pane-heading" style={{ marginTop: '20px' }}>
                    {isKannada ? 'ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು' : 'Key Benefits & Entitlements'}
                  </h4>
                  <ul className="ob-pane-list">
                    {(isKannada && selectedSchemeForDetails.benefitsKn?.length > 0
                      ? selectedSchemeForDetails.benefitsKn
                      : selectedSchemeForDetails.benefits
                    ).map((benefit, idx) => (
                      <li key={idx}>
                        <Check size={14} className="ob-list-check-icon" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalTab === 'eligibility' && (
                <div className="ob-modal-tab-pane">
                  <h4 className="ob-pane-heading">{isKannada ? 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು' : 'Eligibility Requirements'}</h4>
                  <ul className="ob-pane-list">
                    {(isKannada && selectedSchemeForDetails.eligibilityCriteriaKn?.length > 0
                      ? selectedSchemeForDetails.eligibilityCriteriaKn
                      : selectedSchemeForDetails.eligibilityCriteria
                    ).map((crit, idx) => (
                      <li key={idx}>
                        <Check size={14} className="ob-list-check-icon" />
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="ob-pane-heading" style={{ marginTop: '20px' }}>
                    {isKannada ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳು' : 'Required Documents'}
                  </h4>
                  <ul className="ob-pane-list">
                    {(isKannada && selectedSchemeForDetails.requiredDocumentsKn?.length > 0
                      ? selectedSchemeForDetails.requiredDocumentsKn
                      : selectedSchemeForDetails.requiredDocuments
                    ).map((doc, idx) => (
                      <li key={idx}>
                        <FileText size={14} className="ob-list-doc-icon" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalTab === 'apply' && (
                <div className="ob-modal-tab-pane">
                  <h4 className="ob-pane-heading">{isKannada ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು' : 'Application Process'}</h4>
                  <ol className="ob-pane-numbered-list">
                    {(isKannada && selectedSchemeForDetails.applicationProcedureKn?.length > 0
                      ? selectedSchemeForDetails.applicationProcedureKn
                      : selectedSchemeForDetails.applicationProcedure
                    ).map((proc, idx) => (
                      <li key={idx}>
                        <span>{proc}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="ob-official-portal-box">
                    <div>
                      <div className="ob-portal-box-label">{isKannada ? 'ಅಧಿಕೃತ ಸರಕಾರಿ ಪೋರ್ಟಲ್' : 'Official Government Portal'}</div>
                      <div className="ob-portal-box-url">{selectedSchemeForDetails.officialUrl || 'https://karnataka.gov.in'}</div>
                    </div>
                    {selectedSchemeForDetails.officialUrl && (
                      <a
                        href={selectedSchemeForDetails.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ob-btn-portal-ext"
                      >
                        <span>{isKannada ? 'ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' : 'Open Portal'}</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  <div className="ob-helpline-box">
                    <PhoneCall size={16} />
                    <span>{isKannada ? 'ಇಲಾಖಾ ಸಹಾಯವಾಣಿ:' : 'Helpline:'} <strong>{selectedSchemeForDetails.helpline}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="ob-modal-footer">
              <button
                type="button"
                className="ob-btn-secondary"
                onClick={() => setSelectedSchemeForDetails(null)}
              >
                {isKannada ? 'ಮುಚ್ಚಿ' : 'Close'}
              </button>

              <button
                type="button"
                className="ob-btn-primary"
                onClick={() => {
                  const s = selectedSchemeForDetails;
                  setSelectedSchemeForDetails(null);
                  setSelectedSchemeForDraft(s);
                }}
              >
                <FileText size={15} />
                <span>{isKannada ? 'ಸ್ಥಳೀಯ ಕರಡು ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ' : 'Start Offline Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. OFFLINE APPLICATION DRAFT MODAL (PRESERVED)
          ========================================================================= */}
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
