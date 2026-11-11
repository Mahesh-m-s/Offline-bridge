import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Sprout,
  GraduationCap,
  Users,
  Home as HomeIcon,
  HeartPulse,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Shield,
  FileText,
  ExternalLink,
  PhoneCall,
  Paperclip,
  X,
  BookOpen,
  Bot,
  Send,
  RefreshCw,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { SCHEMES_CATALOGUE, KARNATAKA_DISTRICTS } from '../data/schemesCatalogue';
import DraftFormModal from '../components/DraftFormModal';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/apiClient';

export default function SchemeFinderPage() {
  const { isKannada, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Wizard Steps: 1 (Choose Sector) -> 2 (Sector Questionnaire) -> 3 (Results & Guidance)
  const [step, setStep] = useState(1);
  const initialSector = searchParams.get('sector') || '';
  const [selectedSector, setSelectedSector] = useState(initialSector);

  // Sector-specific answers state
  const [answers, setAnswers] = useState({
    // Agriculture
    isFarmer: '',
    agriGoal: '', // 'subsidies' | 'crop_health'
    cropType: '',
    landSize: '',
    irrigationType: '',
    fruitsStatus: '',
    district: '',
    // Crop Health Guidance (Outcome B)
    affectedCrop: '',
    symptoms: '',
    duration: '',
    cropPhoto: null,

    // Education
    educationLevel: '',
    studentCategory: '',
    studentIncome: '',
    karnatakaDomicile: '',
    isGraduatedUnemployed: '',

    // Social Welfare / Pensions
    ageGroup: '',
    familyRole: '',
    welfareIncome: '',
    taxPayer: '',

    // Housing
    housingArea: '',
    dwellingType: '',
    ownsPlotWithHakkuPatra: '',
    rationCardType: '',

    // Health
    healthRationCard: '',
    treatmentCareType: '',

    // Business
    artisanType: '',
    businessAge: '',
    projectBudget: ''
  });

  const [validationError, setValidationError] = useState('');
  const [selectedSchemeForDraft, setSelectedSchemeForDraft] = useState(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);

  // Discovery Mode: 'questionnaire' | 'rag_assistant'
  const [activeMode, setActiveMode] = useState(searchParams.get('mode') === 'ai' ? 'rag_assistant' : 'questionnaire');

  // Grounded RAG Assistant State
  const [ragQuery, setRagQuery] = useState('');
  const [ragMessages, setRagMessages] = useState([]);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [ragError, setRagError] = useState(null);
  const [ragConversationId, setRagConversationId] = useState(null);

  const handleAskRag = async (queryText = null) => {
    const textToSend = (queryText || ragQuery).trim();
    if (!textToSend || isRagLoading) return;

    setRagError(null);
    setRagQuery('');

    const userMsg = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setRagMessages((prev) => [...prev, userMsg]);
    setIsRagLoading(true);

    try {
      const res = await apiClient.post('/api/rag/chat', {
        question: textToSend,
        language: isKannada ? 'kn' : 'en',
        conversationId: ragConversationId
      });

      if (res.success && res.data) {
        if (res.data.conversationId) setRagConversationId(res.data.conversationId);
        setRagMessages((prev) => [
          ...prev,
          {
            id: 'ai-' + Date.now(),
            sender: 'assistant',
            text: res.data.answer,
            sources: res.data.sources || [],
            confidence: res.data.confidence || 'high',
            timestamp: new Date()
          }
        ]);
      } else {
        const errorMsg = res.error?.message || (isKannada
          ? 'ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Unable to retrieve grounded scheme advice. Please try again.');
        setRagError(errorMsg);
        setRagMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'assistant',
            isError: true,
            text: errorMsg,
            sources: [],
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      const netMsg = isKannada
        ? 'ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ.'
        : 'Network or server connection error. Please try again.';
      setRagError(netMsg);
      setRagMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          isError: true,
          text: netMsg,
          sources: [],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsRagLoading(false);
    }
  };

  // If URL has sector, advance to step 2 automatically
  useEffect(() => {
    if (initialSector && ['farmer', 'student', 'citizen', 'housing', 'health', 'business', 'other'].includes(initialSector)) {
      setSelectedSector(initialSector);
      setStep(2);
    }
  }, [initialSector]);

  // Handle answer change
  const handleAnswer = (key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
    setValidationError('');
  };

  const handleSectorSelect = (sectorId) => {
    setSelectedSector(sectorId);
    setSearchParams({ sector: sectorId });
    setStep(2);
  };

  const handleBackToSectors = () => {
    setStep(1);
    setValidationError('');
  };

  const handleReset = () => {
    setAnswers({
      isFarmer: '',
      agriGoal: '',
      cropType: '',
      landSize: '',
      irrigationType: '',
      fruitsStatus: '',
      district: '',
      affectedCrop: '',
      symptoms: '',
      duration: '',
      cropPhoto: null,
      educationLevel: '',
      studentCategory: '',
      studentIncome: '',
      karnatakaDomicile: '',
      isGraduatedUnemployed: '',
      ageGroup: '',
      familyRole: '',
      welfareIncome: '',
      taxPayer: '',
      housingArea: '',
      dwellingType: '',
      ownsPlotWithHakkuPatra: '',
      rationCardType: '',
      healthRationCard: '',
      treatmentCareType: '',
      artisanType: '',
      businessAge: '',
      projectBudget: ''
    });
    setStep(1);
    setSelectedSector('');
    setSearchParams({});
    setValidationError('');
  };

  const handleEvaluate = (e) => {
    if (e) e.preventDefault();

    // Check if basic sector questions are answered
    if (selectedSector === 'farmer' && !answers.agriGoal) {
      setValidationError(isKannada ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಅಗತ್ಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.' : 'Please select your primary agricultural need (Subsidies or Crop Guidance).');
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 7 Sector Definitions
  const sectors = [
    {
      id: 'farmer',
      title: 'Agriculture & Farmers',
      titleKn: 'ಕೃಷಿ ಮತ್ತು ರೈತರು',
      desc: 'Seed subsidies, millet grants, FRUITS registration, and crop pest guidance.',
      descKn: 'ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ, ರಸಗೊಬ್ಬರ, ಫ್ರೂಟ್ಸ್ ಐಡಿ ಮತ್ತು ಬೆಳೆ ರೋಗ ಮಾರ್ಗದರ್ಶನ.',
      icon: Sprout,
      color: '#16a34a',
      bgColor: '#f0fdf4'
    },
    {
      id: 'student',
      title: 'Education & Scholarships',
      titleKn: 'ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ',
      desc: 'Post-matric SSP scholarships, fee reimbursements, and Yuva Nidhi graduate stipend.',
      descKn: 'ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ, ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಯುವ ನಿಧಿ ಭತ್ಯೆ.',
      icon: GraduationCap,
      color: '#2563eb',
      bgColor: '#eff6ff'
    },
    {
      id: 'citizen',
      title: 'Social Welfare & Pensions',
      titleKn: 'ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಪಿಂಚಣಿ',
      desc: 'Sandhya Suraksha elderly pension and Gruha Lakshmi monthly DBT for women heads.',
      descKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಹಿರಿಯರ ಪಿಂಚಣಿ ಮತ್ತು ಗೃಹಲಕ್ಷ್ಮಿ ಮಾಸಿಕ ₹2,000 ನೆರವು.',
      icon: Users,
      color: '#9333ea',
      bgColor: '#faf5ff'
    },
    {
      id: 'housing',
      title: 'Housing & Basic Services',
      titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ',
      desc: 'Basava Vasathi Yojana and rural pucca housing construction grants.',
      descKn: 'ಬಸವ ವಸತಿ ಯೋಜನೆ ಮತ್ತು ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ₹1.20 ಲಕ್ಷ ಅನುದಾನ.',
      icon: HomeIcon,
      color: '#d97706',
      bgColor: '#fffbeb'
    },
    {
      id: 'health',
      title: 'Health & Family Welfare',
      titleKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು',
      desc: 'Arogya Karnataka cashless secondary and tertiary hospitalization cover.',
      descKn: 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸಾ ಭದ್ರತೆ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಸೇವೆಗಳು.',
      icon: HeartPulse,
      color: '#dc2626',
      bgColor: '#fef2f2'
    },
    {
      id: 'business',
      title: 'Business & Artisans',
      titleKn: 'ಉದ್ದಿಮೆ ಮತ್ತು ಕುಶಲಕರ್ಮಿಗಳು',
      desc: 'Margin-money subsidy and tools loan for traditional artisans and micro-units.',
      descKn: 'ಕುಶಲಕರ್ಮಿಗಳು, ಗ್ರಾಮೀಣ ಉದ್ದಿಮೆದಾರರಿಗೆ ₹2 ಲಕ್ಷದವರೆಗೆ ಬಂಡವಾಳ ಸಹಾಯಧನ.',
      icon: Briefcase,
      color: '#0d9488',
      bgColor: '#f0fdfa'
    },
    {
      id: 'other',
      title: 'Other Public Services',
      titleKn: 'ಇತರ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು',
      desc: 'Property encumbrance certificates (Kaveri 2.0) and ration card corrections.',
      descKn: 'ಕಾವೇರಿ ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಸೇವೆಗಳು.',
      icon: Layers,
      color: '#475569',
      bgColor: '#f8fafc'
    }
  ];

  // ============================================================================
  // EVALUATION ENGINE (Maps sector answers against verified catalogue rules)
  // ============================================================================
  const evaluateScheme = (scheme) => {
    const satisfied = [];
    const unmet = [];
    const unknown = [];

    // 1. Agriculture Evaluation
    if (selectedSector === 'farmer') {
      if (scheme.category !== 'farmer') {
        unmet.push('Scheme does not fall under Agriculture & Farmer Assistance.');
      } else {
        if (answers.isFarmer === 'no') {
          unmet.push('Applicant is not managing cultivable agricultural land.');
        } else {
          satisfied.push('Agricultural farming profile confirmed.');
        }

        if (answers.landSize === 'large') {
          unmet.push('Scheme is statutory-restricted to small and marginal farmers (under 5 acres).');
        } else if (answers.landSize === 'marginal' || answers.landSize === 'small') {
          satisfied.push('Landholding meets small/marginal criteria (under 5 acres).');
        }

        if (answers.fruitsStatus === 'registered') {
          satisfied.push('Active FRUITS Farmer ID (FID) on record.');
        } else if (answers.fruitsStatus === 'not_registered') {
          unknown.push('Requires mandatory registration in Karnataka FRUITS portal at RSK.');
        }

        if (answers.cropType) {
          satisfied.push(`Target seasonal crop specified (${answers.cropType}).`);
        }
      }
    }

    // 2. Education Evaluation
    if (selectedSector === 'student') {
      if (scheme.category !== 'student') {
        unmet.push('Scheme does not fall under Education & Student grants.');
      } else {
        if (scheme.id === 'yuva-nidhi') {
          if (answers.educationLevel === 'graduate_unemployed') {
            satisfied.push('Graduated degree/diploma holder seeking employment.');
            unknown.push('180-day completion period since results to be verified.');
          } else {
            unmet.push('Yuva Nidhi is exclusive to graduated degree/diploma holders seeking employment.');
          }
        } else if (scheme.id === 'ssp-scholarship') {
          if (answers.educationLevel === 'graduate_unemployed') {
            unmet.push('SSP Post-Matric requires active enrollment in an ongoing college course.');
          } else if (answers.educationLevel) {
            satisfied.push('Enrolled in recognized post-matric course.');
            if (answers.studentIncome === 'above_2.5lakh') {
              unmet.push('Annual family income exceeds scholarship statutory ceiling (₹2.5 Lakh).');
            } else if (answers.studentIncome) {
              satisfied.push('Family income within prescribed scholarship limit.');
            }
            unknown.push('College admission fee receipt and e-Attestation record to be submitted.');
          }
        }
      }
    }

    // 3. Social Welfare / Pensions Evaluation
    if (selectedSector === 'citizen') {
      if (scheme.category !== 'citizen') {
        unmet.push('Scheme does not fall under Social Welfare.');
      } else {
        if (scheme.id === 'old-age-pension') {
          if (answers.ageGroup === '65_plus') {
            satisfied.push('Age requirement: 65 years or above satisfied.');
          } else if (answers.ageGroup) {
            unmet.push('Sandhya Suraksha requires minimum age of 65 years.');
          }

          if (answers.welfareIncome === 'above_1lakh') {
            unmet.push('Annual household income exceeds statutory pension limit (₹32,000/year).');
          } else if (answers.welfareIncome === 'below_32k') {
            satisfied.push('Annual income verified below ₹32,000 ceiling.');
          }
        } else if (scheme.id === 'gruha-lakshmi') {
          if (answers.familyRole === 'woman_head') {
            satisfied.push('Designated woman head of household role confirmed.');
          } else {
            unmet.push('Gruha Lakshmi requires applicant to be the designated woman head on ration card.');
          }

          if (answers.taxPayer === 'yes') {
            unmet.push('Applicants or spouses paying Income Tax or filing GST are excluded.');
          } else if (answers.taxPayer === 'no') {
            satisfied.push('Non-taxpayer declaration satisfied.');
          }
        }
      }
    }

    // 4. Housing Evaluation
    if (selectedSector === 'housing') {
      if (scheme.category !== 'housing') {
        unmet.push('Scheme does not fall under Rural Housing grants.');
      } else {
        if (answers.housingArea === 'rural') {
          satisfied.push('Rural Gram Panchayat resident requirement met.');
        } else if (answers.housingArea === 'urban') {
          unmet.push('Basava Vasathi Yojana is exclusive to rural Gram Panchayat areas.');
        }

        if (answers.ownsPlotWithHakkuPatra === 'yes') {
          satisfied.push('Possesses residential site / Hakku Patra for house construction.');
        } else if (answers.ownsPlotWithHakkuPatra === 'no') {
          unknown.push('Site allotment or ancestral plot title extract (Form 9 & 11) must be verified.');
        }

        if (answers.rationCardType === 'bpl') {
          satisfied.push('Priority BPL Ration Card requirement satisfied.');
        } else if (answers.rationCardType === 'apl') {
          unmet.push('Basava Vasathi requires an active BPL or Antyodaya ration card.');
        }
      }
    }

    // 5. Health Evaluation
    if (selectedSector === 'health') {
      if (scheme.category !== 'health') {
        unmet.push('Scheme does not fall under Public Healthcare.');
      } else {
        if (answers.healthRationCard === 'bpl') {
          satisfied.push('BPL Ration Cardholder: Eligible for 100% cashless treatment up to ₹5 Lakh.');
        } else if (answers.healthRationCard === 'apl') {
          satisfied.push('APL Cardholder: Eligible for subsidized co-payment packages (30%).');
        }
        unknown.push('Referral slip from Government PHC / Taluk Hospital required for tertiary care.');
      }
    }

    // 6. Business Evaluation
    if (selectedSector === 'business') {
      if (scheme.category !== 'business') {
        unmet.push('Scheme does not fall under Business & Artisans.');
      } else {
        if (answers.artisanType === 'artisan' || answers.artisanType === 'micro_unit') {
          satisfied.push('Traditional artisan / rural micro-enterprise profile verified.');
        }
        if (answers.businessAge === '18_55') {
          satisfied.push('Age falls within eligible statutory range (18 to 55 years).');
        } else if (answers.businessAge) {
          unmet.push('Applicant must be between 18 and 55 years of age.');
        }
      }
    }

    // 7. Other Services
    if (selectedSector === 'other') {
      if (scheme.category === 'it_services' || scheme.category === 'food') {
        satisfied.push('Civic public digital service available online 24x7.');
      } else {
        unknown.push('General public welfare service.');
      }
    }

    // Status Determination (Strict rule matching)
    let status = 'likely';
    if (unmet.length > 0) {
      status = 'not_eligible';
    } else if (unknown.length > 0) {
      status = 'verification_needed';
    }

    return { scheme, status, satisfied, unmet, unknown };
  };

  // Evaluate schemes matching selected sector
  const relevantCatalogue = selectedSector
    ? SCHEMES_CATALOGUE.filter((s) => selectedSector === 'other' || s.category === selectedSector)
    : SCHEMES_CATALOGUE;

  const evaluatedResults = relevantCatalogue.map((scheme) => evaluateScheme(scheme));
  const potentialMatches = evaluatedResults.filter((r) => r.status === 'likely');
  const moreInfoNeeded = evaluatedResults.filter((r) => r.status === 'verification_needed');
  const notEligible = evaluatedResults.filter((r) => r.status === 'not_eligible');

  return (
    <div className="scheme-finder-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Title & Introduction */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={24} color="var(--gov-blue-primary)" />
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--gov-blue-dark)' }}>
            {isKannada ? 'ನನಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' : 'Find Schemes for Me'}
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
          {isKannada
            ? 'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯ ಕುರಿತು ಸ್ವಲ್ಪ ಮಾಹಿತಿ ನೀಡಿ. ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಸರಿಹೊಂದುವ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ನೆರವಾಗುತ್ತದೆ.'
            : 'Tell us a little about your situation. OfflineBridge will help you discover services and schemes that may fit your needs.'}
        </p>
      </div>

      {/* Mode Switcher: Guided Questionnaire vs RAG AI Assistant */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#e2e8f0',
        padding: '4px',
        borderRadius: '10px',
        width: 'fit-content',
        marginBottom: '24px'
      }}>
        <button
          type="button"
          onClick={() => setActiveMode('questionnaire')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: activeMode === 'questionnaire' ? 800 : 600,
            backgroundColor: activeMode === 'questionnaire' ? '#ffffff' : 'transparent',
            color: activeMode === 'questionnaire' ? 'var(--color-primary-navy, #102F56)' : '#64748b',
            boxShadow: activeMode === 'questionnaire' ? '0 2px 6px rgba(16,47,86,0.1)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          <span>{isKannada ? 'ಮಾರ್ಗದರ್ಶಿ ಪ್ರಶ್ನಾವಳಿ' : 'Guided Questionnaire'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('rag_assistant')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: activeMode === 'rag_assistant' ? 800 : 600,
            backgroundColor: activeMode === 'rag_assistant' ? 'var(--color-primary-navy, #102F56)' : 'transparent',
            color: activeMode === 'rag_assistant' ? '#ffffff' : '#64748b',
            boxShadow: activeMode === 'rag_assistant' ? '0 2px 6px rgba(16,47,86,0.15)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={16} color={activeMode === 'rag_assistant' ? '#f59e0b' : '#64748b'} />
          <span>{isKannada ? 'AI ಯೋಜನೆ ಸಹಾಯಕ (RAG)' : 'AI Scheme Advisor (RAG)'}</span>
        </button>
      </div>

      {activeMode === 'questionnaire' && (
        <>
            {/* Wizard Step Progress Tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '6px',
        padding: '12px 20px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: step >= 1 ? 'var(--gov-blue-primary)' : '#e2e8f0',
            color: step >= 1 ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem'
          }}>1</span>
          <span style={{ fontSize: '0.84rem', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? 'var(--gov-blue-dark)' : 'var(--text-muted)' }}>
            {isKannada ? '1. ವಲಯ ಆಯ್ಕೆ' : '1. Select Sector'}
          </span>
        </div>

        <div style={{ width: '30px', height: '1px', backgroundColor: 'var(--border-medium)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: step >= 2 ? 'var(--gov-blue-primary)' : '#e2e8f0',
            color: step >= 2 ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem'
          }}>2</span>
          <span style={{ fontSize: '0.84rem', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? 'var(--gov-blue-dark)' : 'var(--text-muted)' }}>
            {isKannada ? '2. ಪ್ರಶ್ನಾವಳಿ' : '2. Questions'}
          </span>
        </div>

        <div style={{ width: '30px', height: '1px', backgroundColor: 'var(--border-medium)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: step >= 3 ? 'var(--gov-blue-primary)' : '#e2e8f0',
            color: step >= 3 ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem'
          }}>3</span>
          <span style={{ fontSize: '0.84rem', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? 'var(--gov-blue-dark)' : 'var(--text-muted)' }}>
            {isKannada ? '3. ಹೊಂದಿಕೆಯಾಗುವ ಫಲಿತಾಂಶಗಳು' : '3. Scheme Matches'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: SELECT SECTOR / NEED
          ========================================================================= */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '8px' }}>
            {isKannada ? 'ನಿಮಗೆ ಯಾವ ವಲಯದಲ್ಲಿ ಸಹಾಯ ಬೇಕು?' : 'Which sector or need best describes your situation?'}
          </h3>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.86rem', marginBottom: '18px' }}>
            Select one primary sector to answer only the questions relevant to you.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {sectors.map((sec) => {
              const IconComp = sec.icon;

              return (
                <div
                  key={sec.id}
                  className="card"
                  onClick={() => handleSectorSelect(sec.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSectorSelect(sec.id); }}
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: sec.bgColor,
                    color: sec.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <IconComp size={22} />
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '6px' }}>
                    {t(sec.title, sec.titleKn)}
                  </h4>

                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', lineHeight: '1.45', marginBottom: '14px', flex: 1 }}>
                    {t(sec.desc, sec.descKn)}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--gov-blue-primary)' }}>
                    <span>{isKannada ? 'ಪ್ರಶ್ನಾವಳಿ ಪ್ರಾರಂಭಿಸಿ' : 'Start Sector Questions'}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: SECTOR-SPECIFIC QUESTIONNAIRE
          ========================================================================= */}
      {step === 2 && (
        <div className="card" style={{ padding: '24px' }}>
          {/* Header with selected sector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-blue-primary)' }}>
                {isKannada ? 'ಆಯ್ಕೆ ಮಾಡಿದ ವಲಯ:' : 'Selected Sector:'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gov-blue-dark)', margin: '2px 0 0 0' }}>
                {sectors.find((s) => s.id === selectedSector)?.title}
              </h3>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleBackToSectors}
              style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <ArrowLeft size={13} />
              <span>Change Sector</span>
            </button>
          </div>

          {validationError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '16px' }}>
              {validationError}
            </div>
          )}

          <form onSubmit={handleEvaluate}>
            {/* SECTOR 1: AGRICULTURE & FARMERS */}
            {selectedSector === 'farmer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                    1. Do you farm or manage cultivable agricultural land? <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={answers.isFarmer}
                    onChange={(e) => handleAnswer('isFarmer', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-body)' }}
                  >
                    <option value="">-- Select --</option>
                    <option value="yes">Yes, I am an active farmer / landholder</option>
                    <option value="tenant">Yes, I am a tenant / sharecropper farmer</option>
                    <option value="no">No, I do not farm land</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                    2. What type of assistance are you seeking? <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={answers.agriGoal}
                    onChange={(e) => handleAnswer('agriGoal', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-body)' }}
                  >
                    <option value="">-- Select Primary Goal --</option>
                    <option value="subsidies">A. Apply for Government Subsidies & Certified Seeds (Raitha Siri, Millets)</option>
                    <option value="crop_health">B. Crop Health & Pest/Disease Guidance (Problem identification & next steps)</option>
                  </select>
                </div>

                {/* Subsidies sub-questions */}
                {answers.agriGoal === 'subsidies' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', backgroundColor: 'var(--bg-body)', padding: '14px', borderRadius: '6px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Landholding Size</label>
                      <select
                        value={answers.landSize}
                        onChange={(e) => handleAnswer('landSize', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                      >
                        <option value="">-- Select Landholding --</option>
                        <option value="marginal">Marginal Farmer (Less than 2.5 Acres)</option>
                        <option value="small">Small Farmer (2.5 to 5.0 Acres)</option>
                        <option value="large">Medium / Large Farmer (Over 5.0 Acres)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Target Crop</label>
                      <select
                        value={answers.cropType}
                        onChange={(e) => handleAnswer('cropType', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                      >
                        <option value="">-- Select Crop --</option>
                        <option value="millets">Ragi / Millets (Raitha Siri Eligible)</option>
                        <option value="paddy">Paddy / Rice</option>
                        <option value="pulses">Pulses / Oilseeds</option>
                        <option value="other">Other Horticulture</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>FRUITS FID Registration</label>
                      <select
                        value={answers.fruitsStatus}
                        onChange={(e) => handleAnswer('fruitsStatus', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                      >
                        <option value="">-- Select Status --</option>
                        <option value="registered">Already have 12-digit FRUITS FID</option>
                        <option value="not_registered">Not yet registered in FRUITS</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Outcome B: Crop Health Guidance sub-questions */}
                {answers.agriGoal === 'crop_health' && (
                  <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <AlertTriangle size={18} color="#d97706" />
                      <strong style={{ fontSize: '0.88rem', color: '#92400e' }}>
                        Agricultural Problem Guidance & Extension Protocol
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#92400e', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      Tell us about your crop issue. OfflineBridge will provide verified extension steps and contact points for Raitha Samparka Kendras. We do not invent chemical dosages or artificial diagnoses.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Affected Crop</label>
                        <input
                          type="text"
                          placeholder="e.g. Paddy, Ragi, Tomato, Maize"
                          value={answers.affectedCrop}
                          onChange={(e) => handleAnswer('affectedCrop', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Observed Symptoms</label>
                        <select
                          value={answers.symptoms}
                          onChange={(e) => handleAnswer('symptoms', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                        >
                          <option value="">-- Select Symptom --</option>
                          <option value="yellowing">Leaf yellowing / Chlorosis</option>
                          <option value="spots">Fungal brown/black leaf spots</option>
                          <option value="stem_borer">Stem borer holes / dead hearts</option>
                          <option value="wilting">Sudden plant wilting / root rot</option>
                          <option value="stunted">Stunted growth / poor tillering</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Issue Duration</label>
                        <select
                          value={answers.duration}
                          onChange={(e) => handleAnswer('duration', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                        >
                          <option value="">-- Select Duration --</option>
                          <option value="recent">Past 2-4 days (Early stage)</option>
                          <option value="week">1-2 weeks</option>
                          <option value="chronic">Over a month</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Photo Attachment */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                        Optional: Attach Crop Photo (Local observation only)
                      </label>
                      <label style={{
                        backgroundColor: '#ffffff',
                        border: '1px dashed var(--border-medium)',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--gov-blue-primary)'
                      }}>
                        <Paperclip size={14} />
                        <span>{answers.cropPhoto ? answers.cropPhoto.name : 'Select photo from device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAnswer('cropPhoto', { name: e.target.files[0].name });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTOR 2: EDUCATION & SCHOLARSHIPS */}
            {selectedSector === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Current Education Status</label>
                  <select
                    value={answers.educationLevel}
                    onChange={(e) => handleAnswer('educationLevel', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="post_matric">Currently Enrolled in PUC / Diploma / ITI</option>
                    <option value="degree">Currently Enrolled in Undergraduate Degree</option>
                    <option value="graduate_unemployed">Completed Degree/Diploma & Seeking Employment (Unemployed)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Family Annual Income</label>
                  <select
                    value={answers.studentIncome}
                    onChange={(e) => handleAnswer('studentIncome', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Income Range --</option>
                    <option value="below_1lakh">Below ₹1,00,000 / year</option>
                    <option value="1_to_2.5lakh">₹1,00,001 to ₹2,50,000 / year</option>
                    <option value="above_2.5lakh">Above ₹2,50,000 / year</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Resident Domicile in Karnataka</label>
                  <select
                    value={answers.karnatakaDomicile}
                    onChange={(e) => handleAnswer('karnatakaDomicile', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Domicile --</option>
                    <option value="yes">Yes, permanent resident (studied 6+ years in Karnataka)</option>
                    <option value="no">No, resident outside Karnataka</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTOR 3: SOCIAL WELFARE / PENSIONS */}
            {selectedSector === 'citizen' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Age Group</label>
                  <select
                    value={answers.ageGroup}
                    onChange={(e) => handleAnswer('ageGroup', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Age --</option>
                    <option value="under_60">Under 60 Years</option>
                    <option value="60_64">60 – 64 Years</option>
                    <option value="65_plus">65 Years & Above (Senior Citizen)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Household Head Role</label>
                  <select
                    value={answers.familyRole}
                    onChange={(e) => handleAnswer('familyRole', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="woman_head">Woman Head of Family (as listed on Ration Card)</option>
                    <option value="other">Other Adult Family Member</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Annual Household Income</label>
                  <select
                    value={answers.welfareIncome}
                    onChange={(e) => handleAnswer('welfareIncome', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Income --</option>
                    <option value="below_32k">Below ₹32,000 / year (Destitute / Low-Income)</option>
                    <option value="32k_to_1lakh">₹32,001 to ₹1,00,000 / year</option>
                    <option value="above_1lakh">Above ₹1,00,000 / year</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Do you or your spouse pay Income Tax / GST?</label>
                  <select
                    value={answers.taxPayer}
                    onChange={(e) => handleAnswer('taxPayer', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select --</option>
                    <option value="no">No, neither pays income tax nor files GST</option>
                    <option value="yes">Yes, tax payer</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTOR 4: HOUSING */}
            {selectedSector === 'housing' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Area of Residence</label>
                  <select
                    value={answers.housingArea}
                    onChange={(e) => handleAnswer('housingArea', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Area --</option>
                    <option value="rural">Rural Gram Panchayat in Karnataka</option>
                    <option value="urban">Urban Municipality / City</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Current Dwelling Condition</label>
                  <select
                    value={answers.dwellingType}
                    onChange={(e) => handleAnswer('dwellingType', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Condition --</option>
                    <option value="katcha">Katcha Mud / Thatched Hut</option>
                    <option value="homeless">Homeless / Temporary Sheet Shed</option>
                    <option value="pucca">Permanent Pucca House</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Owns Site with Hakku Patra?</label>
                  <select
                    value={answers.ownsPlotWithHakkuPatra}
                    onChange={(e) => handleAnswer('ownsPlotWithHakkuPatra', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select --</option>
                    <option value="yes">Yes, have site with GP Hakku Patra</option>
                    <option value="no">No, site is not yet allotted</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Ration Card Type</label>
                  <select
                    value={answers.rationCardType}
                    onChange={(e) => handleAnswer('rationCardType', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Card --</option>
                    <option value="bpl">BPL / Antyodaya (Yellow Card)</option>
                    <option value="apl">APL (White Card)</option>
                    <option value="none">No Ration Card</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTOR 5: HEALTH */}
            {selectedSector === 'health' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Ration Card Category</label>
                  <select
                    value={answers.healthRationCard}
                    onChange={(e) => handleAnswer('healthRationCard', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="bpl">BPL / Antyodaya (Eligible for 100% Cashless Treatment up to ₹5 Lakh)</option>
                    <option value="apl">APL Card (Eligible for 30% Package Subsidy)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Medical Care Required</label>
                  <select
                    value={answers.treatmentCareType}
                    onChange={(e) => handleAnswer('treatmentCareType', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Care Type --</option>
                    <option value="surgery">Hospitalization / Surgical Treatment</option>
                    <option value="general">Outpatient PHC Consultation</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTOR 6: BUSINESS & ARTISANS */}
            {selectedSector === 'business' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Artisan / Trade Category</label>
                  <select
                    value={answers.artisanType}
                    onChange={(e) => handleAnswer('artisanType', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Trade --</option>
                    <option value="artisan">Traditional Artisan (Potter, Carpenter, Weaver, Blacksmith)</option>
                    <option value="micro_unit">Small Rural Micro-Enterprise / Agro Processing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>Applicant Age</label>
                  <select
                    value={answers.businessAge}
                    onChange={(e) => handleAnswer('businessAge', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.86rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                  >
                    <option value="">-- Select Age --</option>
                    <option value="18_55">Between 18 and 55 Years</option>
                    <option value="other">Under 18 or Above 55</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTOR 7: OTHER SERVICES */}
            {selectedSector === 'other' && (
              <div style={{ backgroundColor: 'var(--bg-body)', padding: '16px', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-subtle)', margin: '0 0 10px 0' }}>
                  OfflineBridge provides offline preparation for Karnataka's key digital registries: <strong>Kaveri 2.0 Encumbrance Certificates</strong> and <strong>Food & Civil Supplies Ration Card Services</strong>. Click below to explore available services.
                </p>
              </div>
            )}

            {/* Buttons: Evaluate + Skip + Reset */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={15} />
                <span>{isKannada ? 'ಹೊಂದಿಕೆಯಾಗುವ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' : 'Find Matching Schemes'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleEvaluate}
                style={{ fontSize: '0.84rem', padding: '9px 16px' }}
              >
                <span>Skip Optional Questions</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReset}
                style={{ fontSize: '0.84rem', padding: '9px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b91c1c' }}
              >
                <RotateCcw size={13} />
                <span>Reset Answers</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          STEP 3: MATCHING RESULTS & GUIDANCE VIEW
          ========================================================================= */}
      {step === 3 && (
        <div>
          {/* Top Results Header with Summary */}
          <div style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-light)',
            padding: '16px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-blue-dark)', margin: '0 0 2px 0' }}>
                {isKannada ? 'ಯೋಜನಾ ಹೊಂದಾಣಿಕೆ ಫಲಿತಾಂಶಗಳು' : 'Your Matching Scheme Results'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Matched against verified statutory rules in the {sectors.find((s) => s.id === selectedSector)?.title} sector.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                ● {potentialMatches.length} Potential Match
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                ● {moreInfoNeeded.length} More Info Needed
              </span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(2)}
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
              >
                Edit Answers
              </button>
            </div>
          </div>

          {/* OUTCOME B: SPECIAL AGRICULTURAL EXTENSION GUIDANCE CARD */}
          {selectedSector === 'farmer' && answers.agriGoal === 'crop_health' && (
            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #16a34a', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <Sprout size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', margin: '0 0 4px 0' }}>
                    Agricultural Problem Guidance — Safe Extension Steps
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', margin: 0, lineHeight: '1.45' }}>
                    Based on your reported symptoms for <strong>{answers.affectedCrop || 'your crop'}</strong> ({answers.symptoms ? answers.symptoms.replace('_', ' ') : 'general issue'}):
                  </p>
                </div>
              </div>

              {/* Verified Agricultural Steps */}
              <div style={{ backgroundColor: 'var(--bg-body)', padding: '14px 16px', borderRadius: '6px', fontSize: '0.84rem', lineHeight: '1.6', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '6px' }}>
                  Recommended Immediate Observational Actions:
                </h5>
                <ul style={{ paddingLeft: '18px', color: 'var(--text-dark)', margin: '0 0 10px 0' }}>
                  <li><strong>Field Hygiene:</strong> Inspect under leaves for egg masses or larvae. Clip and safely bury severely infested shoots/leaves away from the field.</li>
                  <li><strong>Water & Drainage:</strong> Check soil moisture. Avoid waterlogging around root zones which accelerates bacterial wilt and root rot.</li>
                  <li><strong>Take a Fresh Specimen:</strong> Collect an infected leaf/stem sample in a clean plastic bag before visiting your agricultural extension office.</li>
                </ul>

                <h5 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
                  Certified Departmental Extension Resources:
                </h5>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href="tel:18001801551" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <PhoneCall size={14} color="#16a34a" />
                    <span>Kisan Call Centre (Toll-Free 1800-180-1551)</span>
                  </a>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    6 AM – 10 PM daily in Kannada
                  </span>
                </div>
              </div>

              {/* Safety Disclaimers */}
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: '#991b1b',
                lineHeight: '1.45'
              }}>
                <strong>Safety Disclaimer:</strong> OfflineBridge does not invent chemical pesticides, synthetic fertilizer dosages, or treatment schedules. Agricultural prescriptions must only be issued by an authorized Agriculture Officer at your local Raitha Samparka Kendra (RSK) or Krishi Vigyan Kendra (KVK).
              </div>
            </div>
          )}

          {/* OUTCOME A: MATCHING SCHEMES LIST */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {evaluatedResults.map(({ scheme, status, satisfied, unmet, unknown }) => {
              const isPotential = status === 'likely';
              const isInfoNeeded = status === 'verification_needed';
              const isNotEligible = status === 'not_eligible';

              return (
                <div
                  key={scheme.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderLeft: isPotential ? '4px solid #16a34a' : isInfoNeeded ? '4px solid #d97706' : '4px solid #dc2626'
                  }}
                >
                  {/* Status Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gov-blue-primary)', textTransform: 'uppercase' }}>
                      {t(scheme.department, scheme.departmentKn)}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: isPotential ? '#dcfce7' : isInfoNeeded ? '#fef3c7' : '#fee2e2',
                      color: isPotential ? '#15803d' : isInfoNeeded ? '#b45309' : '#b91c1c'
                    }}>
                      {isPotential ? '✓ Potential Match' : isInfoNeeded ? '⚠ More Info Needed' : '✕ May Not Meet Criteria'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '6px', lineHeight: '1.35' }}>
                    {t(scheme.title, scheme.titleKn)}
                  </h4>

                  {/* Purpose */}
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.84rem', lineHeight: '1.45', marginBottom: '12px' }}>
                    {t(scheme.shortDesc, scheme.shortDescKn)}
                  </p>

                  {/* Explanations Box */}
                  <div style={{ backgroundColor: 'var(--bg-body)', padding: '10px 12px', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '14px', flex: 1 }}>
                    {satisfied.length > 0 && (
                      <div style={{ marginBottom: '6px' }}>
                        <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} color="#16a34a" /> Requirements Met:
                        </strong>
                        <ul style={{ paddingLeft: '16px', color: 'var(--text-dark)', margin: '2px 0 0 0' }}>
                          {satisfied.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                    )}

                    {unknown.length > 0 && (
                      <div style={{ marginBottom: '6px' }}>
                        <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HelpCircle size={13} color="#d97706" /> Information to Verify:
                        </strong>
                        <ul style={{ paddingLeft: '16px', color: '#92400e', margin: '2px 0 0 0' }}>
                          {unknown.map((u, idx) => <li key={idx}>{u}</li>)}
                        </ul>
                      </div>
                    )}

                    {unmet.length > 0 && (
                      <div>
                        <strong style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={13} color="#dc2626" /> Unmet Listed Rule:
                        </strong>
                        <ul style={{ paddingLeft: '16px', color: '#991b1b', margin: '2px 0 0 0' }}>
                          {unmet.map((m, idx) => <li key={idx}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Link
                      to="/services"
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <BookOpen size={14} />
                      <span>Details</span>
                    </Link>

                    {isPotential || isInfoNeeded ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setSelectedSchemeForDraft(scheme)}
                        style={{ flex: 1, fontSize: '0.8rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <FileText size={14} />
                        <span>Prepare Draft</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Statutory Advisory Notice */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #0284c7',
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#0369a1',
            lineHeight: '1.5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '2px' }}>
              <Shield size={16} />
              <span>Privacy & Statutory Non-Sanction Advisory:</span>
            </div>
            <div>
              Evaluated 100% locally on this device using published government criteria. OfflineBridge never asks for Aadhaar numbers, passwords, or bank OTPs to discover schemes. <em>A potential match does not constitute official approval or guaranteed sanction. Official entitlement is determined solely by the competent department upon physical verification.</em>
            </div>
          </div>
        </div>
      )}

        </>
      )}

      {/* RAG AI SCHEME ADVISOR VIEW */}
      {activeMode === 'rag_assistant' && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--gov-blue-light, #ebf3fc)',
              color: 'var(--color-primary-blue, #1556A0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-navy, #102F56)', margin: 0 }}>
                {isKannada ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ಗ್ರೌಂಡೆಡ್ RAG ಯೋಜನೆ ಸಹಾಯಕ' : 'OfflineBridge Grounded RAG Scheme Advisor'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
                {isKannada
                  ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ದತ್ತಸಂಚಯ ಮತ್ತು ಇಲಾಖಾ ನಿಯಮಾವಳಿಗಳ ಆಧಾರದ ಮೇಲೆ ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿದ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.'
                  : 'Ask in plain English or Kannada. Answers are synthesized directly from verified Karnataka state portal sources with citations.'}
              </p>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
              {isKannada ? 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು (ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ):' : 'Suggested citizen questions (click to ask):'}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(isKannada ? [
                'ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ಸಣ್ಣ ರೈತರಿಗೆ ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ ಹೇಗೆ ಸಿಗುತ್ತದೆ?',
                'ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾರು ಅರ್ಹರು ಮತ್ತು ತಿಂಗಳಿಗೆ ಎಷ್ಟು ಹಣ ಸಿಗುತ್ತದೆ?',
                'ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ ಏನು?',
                'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಮಾಸಾಶನ ಪಡೆಯಲು ಆದಾಯ ಮಿತಿ ಎಷ್ಟು?',
                'ಬಸವ ವಸತಿ ಯೋಜನೆಗೆ ಹಕ್ಕು ಪತ್ರ ಕಡ್ಡಾಯವೇ?'
              ] : [
                'How can small farmers receive seed subsidy under Raitha Siri?',
                'Who is eligible for Gruha Lakshmi ₹2,000 monthly grant?',
                'What are the eligibility criteria for Yuva Nidhi allowance?',
                'What is the income ceiling for Sandhya Suraksha pension?',
                'Is Hakku Patra mandatory for Basava Vasathi rural housing?'
              ]).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskRag(prompt)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    color: '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Query Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAskRag(); }}
            style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}
          >
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder={isKannada
                ? 'ನಿಮ್ಮ ವಯಸ್ಸು, ಕೃಷಿ ಭೂಮಿ, ಆದಾಯ ಅಥವಾ ಅಗತ್ಯವಿರುವ ಯೋಜನೆಯನ್ನು ನಮೂದಿಸಿ...'
                : 'Describe your situation (e.g. "I am a 66-year-old widow with no family income in Mandya")...'}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isRagLoading || !ragQuery.trim()}
              className="btn btn-primary"
              style={{ padding: '0 24px', fontSize: '0.9rem' }}
            >
              {isRagLoading ? (
                <>
                  <RefreshCw size={16} className="spin-animate" />
                  <span>{isKannada ? 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : 'Consulting DB...'}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{isKannada ? 'ಕೇಳಿ' : 'Ask Advisor'}</span>
                </>
              )}
            </button>
          </form>

          {/* Conversation Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ragMessages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '36px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                <Sparkles size={28} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#102F56', margin: '0 0 6px 0' }}>
                  {isKannada ? 'ಯೋಜನಾ AI ಸಲಹೆಗಾರ ಸಿದ್ಧವಾಗಿದೆ' : 'AI Scheme Advisor Ready'}
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
                  {isKannada
                    ? 'ಮೇಲಿನ ಸೂಚಿತ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಅಗತ್ಯವನ್ನು ನಿಮ್ಮದೇ ಪದಗಳಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ.'
                    : 'Click one of the suggested prompts above or type your family background in your own words to discover eligible schemes with statutory rules.'}
                </p>
              </div>
            )}

            {ragMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.sender === 'user' ? '80%' : '100%',
                  width: msg.sender === 'assistant' ? '100%' : 'auto'
                }}
              >
                {msg.sender === 'user' ? (
                  <div style={{
                    backgroundColor: 'var(--color-primary-navy, #102F56)',
                    color: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '12px 12px 2px 12px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    lineHeight: 1.5
                  }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: msg.isError ? '#fef2f2' : '#f8fafc',
                    border: msg.isError ? '1px solid #fee2e2' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px 20px'
                  }}>
                    {/* Header: Bot badge + Confidence */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: '#1556A0',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Bot size={16} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#102F56' }}>
                          OfflineBridge AI
                        </span>
                      </div>
                      {!msg.isError && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#dcfce7',
                          color: '#16834a',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldCheck size={12} /> {isKannada ? 'ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Source-Grounded Response'}
                        </span>
                      )}
                    </div>

                    {/* Answer Body */}
                    <div style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: msg.isError ? '#991b1b' : '#1e293b',
                      whiteSpace: 'pre-wrap',
                      marginBottom: msg.sources?.length > 0 ? '14px' : '0'
                    }}>
                      {msg.text}
                    </div>

                    {/* Source Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '12px',
                        marginTop: '10px'
                      }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {isKannada ? 'ಅಧಿಕೃತ ಸರಕಾರಿ ಮೂಲಗಳು ಮತ್ತು ದಾಖಲೆಗಳು:' : 'Official Government Source Citations:'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.78rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={13} color="#1556A0" />
                                <span style={{ fontWeight: 700, color: '#102F56' }}>{src.documentTitle || 'Government Portal'}</span>
                                {src.department && (
                                  <span style={{ color: '#64748b' }}>({src.department})</span>
                                )}
                              </div>
                              {src.sourceUrl && (
                                <a
                                  href={src.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#1556A0',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textDecoration: 'none'
                                  }}
                                >
                                  <span>{isKannada ? 'ಮೂಲ ಪರಿಶೀಲಿಸಿ' : 'Verify'}</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Draft Modal */}
      {selectedSchemeForDraft && (
        <DraftFormModal
          service={selectedSchemeForDraft}
          onClose={() => setSelectedSchemeForDraft(null)}
        />
      )}
    </div>
  );
}
