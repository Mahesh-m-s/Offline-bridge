import React, { useState, useEffect, useMemo } from 'react';
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
  FileCheck2,
  FolderX
} from 'lucide-react';
import DraftFormModal from '../components/DraftFormModal';
import { getAllDrafts } from '../offline/draftStorage';
import { SCHEMES_CATALOGUE, CATEGORIES, filterCatalogueSchemes } from '../data/schemesCatalogue';
import { useLanguage } from '../context/LanguageContext';

/**
 * Returns a tasteful visual category icon for the scheme card marker and filter pills.
 */
function getCategoryIcon(catId, size = 14) {
  switch (catId) {
    case 'farmer':
      return <Sprout size={size} />;
    case 'citizen':
      return <Users size={size} />;
    case 'housing':
      return <Home size={size} />;
    case 'food':
      return <ShoppingBag size={size} />;
    case 'student':
      return <GraduationCap size={size} />;
    case 'health':
      return <HeartPulse size={size} />;
    case 'business':
      return <Briefcase size={size} />;
    case 'it_services':
      return <Monitor size={size} />;
    case 'all':
    default:
      return <Layers size={size} />;
  }
}

export default function ServicesPage() {
  const { isKannada, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('title_asc');
  const [filterDraftsOnly, setFilterDraftsOnly] = useState(false);

  // Modal and draft storage state
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [selectedServiceForDraft, setSelectedServiceForDraft] = useState(null);
  const [modalTab, setModalTab] = useState('overview'); // 'overview' | 'eligibility' | 'apply'
  const [savedDraftIds, setSavedDraftIds] = useState(new Set());

  // Keep state in sync with URL parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('search');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  // Load saved draft IDs from local device storage (IndexedDB)
  const refreshStorageData = async () => {
    try {
      const drafts = await getAllDrafts();
      const ids = new Set((drafts || []).map((d) => d.serviceId || d.id));
      setSavedDraftIds(ids);
    } catch (err) {
      console.warn('[ArivuNet] Failed to load local draft metadata in ServicesPage:', err);
    }
  };

  useEffect(() => {
    refreshStorageData();
  }, []);

  // Filter schemes from authoritative catalogue
  const displayedSchemes = useMemo(() => {
    let list = filterCatalogueSchemes({
      category: selectedCategory,
      search: searchTerm,
      sort: sortBy
    });

    if (filterDraftsOnly) {
      list = list.filter((s) => savedDraftIds.has(s.id));
    }

    return list;
  }, [selectedCategory, searchTerm, sortBy, filterDraftsOnly, savedDraftIds]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setFilterDraftsOnly(false);
    setSearchParams({});
  };

  return (
    <div className="services-page-wrap">
      {/* =========================================================================
          SECTION A: CONCISE PAGE INTRODUCTION & PERSONALIZATION ACTION
          ========================================================================= */}
      <header className="services-hero-header">
        <div className="services-hero-content">
          <h1 className="services-hero-title">
            {isKannada
              ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು'
              : 'Government Schemes & Public Services'}
          </h1>
          <p className="services-hero-desc">
            {isKannada
              ? 'ನಿಮಗೆ ಸೂಕ್ತವಾದ ಸೇವೆಗಳು ಮತ್ತು ಸಹಾಯಧನಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ. ಅರ್ಹತಾ ಮಾನದಂಡಗಳನ್ನು ತಿಳಿದುಕೊಂಡು ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಅರ್ಜಿಯನ್ನು ತಯಾರಿಸಿ.'
              : 'Find services and assistance relevant to you. Explore eligibility requirements and prepare your application at your own pace.'}
          </p>
        </div>

        <div className="services-hero-action">
          <Link to="/eligibility" className="services-finder-cta-btn">
            <Sparkles size={16} />
            <span>{isKannada ? 'ನನಗಾಗಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' : 'Find Schemes for Me'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          SECTION B: SEARCH & CATEGORY NAVIGATION
          ========================================================================= */}
      <div className="services-navigation-card">
        {/* Prominent Search Field */}
        <div className="services-search-bar-wrap">
          <Search size={18} className="services-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="services-search-input"
            placeholder={
              isKannada
                ? 'ಯೋಜನೆಯ ಹೆಸರು, ಇಲಾಖೆ, ವಲಯ ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ...'
                : 'Search by scheme title, department, category, or keywords...'
            }
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search government schemes"
          />
          {searchTerm && (
            <button
              type="button"
              className="services-search-clear"
              onClick={() => handleSearchChange('')}
              title="Clear search text"
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Horizontal Category Navigation Tabs */}
        <nav className="services-categories-bar" aria-label="Scheme Categories Navigation">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`services-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
                aria-pressed={isActive}
              >
                {getCategoryIcon(cat.id, 14)}
                <span>{t(cat.title, cat.titleKn)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Results Status & Sorting Bar */}
      <div className="services-meta-status-bar">
        <div className="services-result-counter">
          {isKannada ? (
            <>
              ಒಟ್ಟು <strong>{displayedSchemes.length}</strong> ಯೋಜನೆಗಳು ಲಭ್ಯವಿದೆ
              {selectedCategory !== 'all' && ` (${CATEGORIES.find((c) => c.id === selectedCategory)?.titleKn || ''})`}
              {searchTerm && ` — "${searchTerm}"`}
            </>
          ) : (
            <>
              Showing <strong>{displayedSchemes.length}</strong> {displayedSchemes.length === 1 ? 'scheme' : 'schemes'}
              {selectedCategory !== 'all' && ` in ${CATEGORIES.find((c) => c.id === selectedCategory)?.title || ''}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </>
          )}
        </div>

        <div className="services-meta-actions">
          {savedDraftIds.size > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-subtle)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterDraftsOnly}
                onChange={(e) => setFilterDraftsOnly(e.target.checked)}
              />
              <span>{isKannada ? 'ನನ್ನ ಕರಡುಗಳು ಮಾತ್ರ' : 'My Local Drafts'} ({savedDraftIds.size})</span>
            </label>
          )}

          {(selectedCategory !== 'all' || searchTerm || filterDraftsOnly) && (
            <button
              type="button"
              className="services-clear-filters-link"
              onClick={clearAllFilters}
            >
              {isKannada ? 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear all filters'}
            </button>
          )}

          <select
            className="services-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort schemes list"
          >
            <option value="title_asc">{isKannada ? 'ಕ್ರಮ: ಹೆಸರು (A to Z)' : 'Sort: Title (A to Z)'}</option>
            <option value="title_desc">{isKannada ? 'ಕ್ರಮ: ಹೆಸರು (Z to A)' : 'Sort: Title (Z to A)'}</option>
            <option value="dept_asc">{isKannada ? 'ಕ್ರಮ: ಇಲಾಖೆ' : 'Sort: Department'}</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          SECTION C: NEW SCHEME CARDS GRID (STRICTLY 5 PERMITTED ELEMENTS)
          1. Small tasteful category icon / visual marker
          2. Scheme title, prominently displayed
          3. Short category label
          4. One brief purpose sentence
          5. One "View Details" action
          ========================================================================= */}
      {displayedSchemes.length > 0 ? (
        <div className="services-schemes-grid-new">
          {displayedSchemes.map((svc) => (
            <article key={svc.id} className="scheme-card-new">
              {/* 1. Small Tasteful Category Visual Marker & 3. Short Category Label */}
              <div className="scheme-card-header-marker">
                <span className="scheme-card-category-tag">
                  {getCategoryIcon(svc.category, 13)}
                  <span>{t(svc.categoryLabel, svc.categoryLabelKn)}</span>
                </span>
              </div>

              {/* 2. Scheme Title Prominently Displayed */}
              <h2 className="scheme-card-title-new">
                {t(svc.title, svc.titleKn)}
              </h2>

              {/* Department Context (Under Title) */}
              <div className="scheme-card-dept-label">
                {t(svc.department, svc.departmentKn)}
              </div>

              {/* 4. One Brief Purpose Sentence */}
              <p className="scheme-card-purpose-text">
                {t(svc.shortDesc, svc.shortDescKn)}
              </p>

              {/* 5. One "View Details" Action */}
              <div className="scheme-card-action-bar">
                <button
                  type="button"
                  className="btn-card-view-details"
                  onClick={() => {
                    setSelectedServiceForDetails(svc);
                    setModalTab('overview');
                  }}
                  aria-label={`View full details for ${svc.title}`}
                >
                  <BookOpen size={15} />
                  <span>{isKannada ? 'ವಿವರಗಳನ್ನು ನೋಡಿ' : 'View Details'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="services-empty-state-box">
          <FolderX size={44} className="services-empty-icon" />
          <h3 className="services-empty-heading">
            {isKannada ? 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Matching Schemes Found'}
          </h3>
          <p className="services-empty-text">
            {isKannada
              ? 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ವರ್ಗಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಸಕ್ರಿಯ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ನೋಡಲು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.'
              : 'We could not find any government schemes matching your search term or category. Try clearing your filters to explore the entire catalogue.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={clearAllFilters}
            style={{ fontSize: '0.88rem', padding: '10px 20px' }}
          >
            {isKannada ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ' : 'Reset Filters & View All'}
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION D: COMPREHENSIVE SCHEME DETAILS MODAL (ON CLICK ONLY)
          ========================================================================= */}
      {selectedServiceForDetails && (() => {
        const svc = selectedServiceForDetails;
        const hasDraft = savedDraftIds.has(svc.id);

        return (
          <div
            className="modal-overlay"
            onClick={() => setSelectedServiceForDetails(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheme-modal-title"
          >
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#93c5fd', letterSpacing: '0.04em' }}>
                    {t(svc.department, svc.departmentKn)}
                  </span>
                  <h3 id="scheme-modal-title" style={{ fontSize: '1.25rem', marginTop: '4px', lineHeight: '1.3' }}>
                    {t(svc.title, svc.titleKn)}
                  </h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedServiceForDetails(null)}
                  aria-label="Close details modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs for Easy Reading */}
              <nav className="scheme-details-tabs-nav" aria-label="Scheme details tabs">
                <button
                  type="button"
                  className={`scheme-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setModalTab('overview')}
                >
                  <BookOpen size={14} />
                  <span>{isKannada ? 'ಅವಲೋಕನ ಮತ್ತು ಪ್ರಯೋಜನಗಳು' : 'Overview & Benefits'}</span>
                </button>

                <button
                  type="button"
                  className={`scheme-tab-btn ${modalTab === 'eligibility' ? 'active' : ''}`}
                  onClick={() => setModalTab('eligibility')}
                >
                  <CheckCircle2 size={14} />
                  <span>{isKannada ? 'ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳು' : 'Eligibility & Documents'}</span>
                </button>

                <button
                  type="button"
                  className={`scheme-tab-btn ${modalTab === 'apply' ? 'active' : ''}`}
                  onClick={() => setModalTab('apply')}
                >
                  <FileText size={14} />
                  <span>{isKannada ? 'ಅರ್ಜಿ ವಿಧಾನ ಮತ್ತು ಲಿಂಕ್‌ಗಳು' : 'How to Apply & Links'}</span>
                </button>
              </nav>

              {/* Modal Body with Tab Content */}
              <div className="modal-body" style={{ padding: '0 24px 20px', overflowY: 'auto' }}>
                {/* TAB 1: OVERVIEW & BENEFITS */}
                {modalTab === 'overview' && (
                  <div>
                    <div className="scheme-detail-block-new">
                      <h4>
                        <BookOpen size={15} color="var(--gov-blue-primary)" />
                        <span>Description & Purpose</span>
                      </h4>
                      <p>{t(svc.shortDesc, svc.shortDescKn)}</p>
                    </div>

                    <div className="scheme-detail-block-new">
                      <h4>
                        <Users size={15} color="var(--gov-blue-primary)" />
                        <span>Target Beneficiaries</span>
                      </h4>
                      <p>{t(svc.intendedFor || svc.beneficiaries, svc.intendedForKn || svc.beneficiariesKn)}</p>
                    </div>

                    <div className="scheme-detail-block-new">
                      <h4>
                        <Sparkles size={15} color="#16a34a" />
                        <span>Verified Financial & Welfare Benefits</span>
                      </h4>
                      {svc.benefits ? (
                        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '10px 14px', borderRadius: '4px', color: '#166534', fontSize: '0.86rem' }}>
                          {t(svc.benefits, svc.benefitsKn)}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Specific benefit figures not currently published or verified.</p>
                      )}
                    </div>

                    <div className="scheme-detail-block-new">
                      <h4>
                        <Calendar size={15} color="var(--gov-blue-primary)" />
                        <span>Application Dates & Deadlines</span>
                      </h4>
                      <p>{t(svc.deadlines, svc.deadlinesKn)}</p>
                    </div>
                  </div>
                )}

                {/* TAB 2: ELIGIBILITY & DOCUMENTS */}
                {modalTab === 'eligibility' && (
                  <div>
                    <div className="scheme-detail-block-new">
                      <h4>
                        <CheckCircle2 size={15} color="var(--gov-blue-primary)" />
                        <span>Official Eligibility Criteria</span>
                      </h4>
                      {Array.isArray(svc.eligibilityCriteria) && svc.eligibilityCriteria.length > 0 ? (
                        <ul>
                          {svc.eligibilityCriteria.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Detailed criteria not currently published for this scheme.</p>
                      )}
                    </div>

                    <div className="scheme-detail-block-new">
                      <h4>
                        <FileCheck2 size={15} color="var(--gov-blue-primary)" />
                        <span>Mandatory Documents Checklist</span>
                      </h4>
                      {Array.isArray(svc.requiredDocuments) && svc.requiredDocuments.length > 0 ? (
                        <ul>
                          {svc.requiredDocuments.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Document list not currently published.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: APPLICATION PROCEDURE & OFFICIAL LINKS */}
                {modalTab === 'apply' && (
                  <div>
                    <div className="scheme-detail-block-new">
                      <h4>
                        <FileText size={15} color="var(--gov-blue-primary)" />
                        <span>Step-by-Step Application Procedure</span>
                      </h4>
                      {Array.isArray(svc.applicationProcedure) && svc.applicationProcedure.length > 0 ? (
                        <ol>
                          {svc.applicationProcedure.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Application steps not currently published.</p>
                      )}
                    </div>

                    <div className="scheme-detail-block-new">
                      <h4>
                        <ExternalLink size={15} color="var(--gov-blue-primary)" />
                        <span>Verified Government Department Portal</span>
                      </h4>
                      {svc.officialUrl ? (
                        <div style={{ marginTop: '8px' }}>
                          <a
                            href={svc.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                          >
                            <span>Visit Official Department Portal</span>
                            <ExternalLink size={14} />
                          </a>
                          <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Official URL: {svc.officialUrl}
                          </span>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Official web link is not currently available.</p>
                      )}
                    </div>

                    {/* Source Information & Verification Date */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 4px', marginBottom: '12px' }}>
                      <span>Source: {svc.sourceUrl || 'Official Department Notification'}</span>
                      {svc.lastVerified && <span> • Last verified: {svc.lastVerified}</span>}
                    </div>

                    {/* FAQs if present */}
                    {Array.isArray(svc.faqs) && svc.faqs.length > 0 && (
                      <div className="scheme-detail-block-new">
                        <h4>
                          <HelpCircle size={15} color="var(--gov-blue-primary)" />
                          <span>Frequently Asked Questions</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                          {svc.faqs.map((faq, idx) => (
                            <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'var(--surface-card)', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--gov-blue-dark)', marginBottom: '3px' }}>
                                Q: {t(faq.question, faq.questionKn)}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                                {t(faq.answer, faq.answerKn)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statutory Disclaimer */}
                    <div style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderLeft: '4px solid #f59e0b',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      lineHeight: '1.45',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} color="#d97706" />
                        <span>Public Notice:</span>
                      </div>
                      Displaying this scheme does not constitute official departmental sanction. Final application submissions and approvals are executed through authorized Karnataka government department systems.
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                padding: '16px 24px',
                borderTop: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)'
              }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedServiceForDetails(null);
                    navigate('/eligibility');
                  }}
                  style={{ fontSize: '0.84rem', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={15} color="var(--gov-blue-primary)" />
                  <span>{isKannada ? 'ನನ್ನ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check My Eligibility'}</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedServiceForDetails(null)}
                    style={{ fontSize: '0.84rem', padding: '9px 16px' }}
                  >
                    {isKannada ? 'ಮುಚ್ಚಿ' : 'Close'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const targetScheme = svc;
                      setSelectedServiceForDetails(null);
                      setSelectedServiceForDraft(targetScheme);
                    }}
                    style={{ fontSize: '0.84rem', padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={15} />
                    <span>{hasDraft ? (isKannada ? 'ಕರಡನ್ನು ಮುಂದುವರಿಸಿ' : 'Resume Draft') : (isKannada ? 'ಅರ್ಜಿ ನಮೂನೆ ಪ್ರಾರಂಭಿಸಿ' : 'Start Application Draft')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Scheme-Specific Offline Draft Form Modal */}
      {selectedServiceForDraft && (
        <DraftFormModal
          service={selectedServiceForDraft}
          onClose={() => setSelectedServiceForDraft(null)}
          onDraftChanged={() => refreshStorageData()}
        />
      )}
    </div>
  );
}
