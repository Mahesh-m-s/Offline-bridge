import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Shield,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SCHEMES_CATALOGUE } from '../data/schemesCatalogue';
import DraftFormModal from '../components/DraftFormModal';
import { useLanguage } from '../context/LanguageContext';

export default function EligibilityPage() {
  const { isKannada, t } = useLanguage();

  // Profile questionnaire state
  const [profile, setProfile] = useState({
    ageGroup: '',
    occupation: '',
    location: '',
    rationCard: '',
    incomeRange: '',
    landholding: '',
    studentStatus: '',
    familyRole: ''
  });

  // State to track if evaluation was calculated
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [activeTab, setActiveTab] = useState('likely'); // 'likely' | 'verification' | 'not_eligible' | 'all'
  const [validationError, setValidationError] = useState('');
  const [selectedSchemeForDraft, setSelectedSchemeForDraft] = useState(null);

  // Handle questionnaire change
  const handleAnswer = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  // Rule-based eligibility matching engine
  const evaluateEligibility = (e) => {
    e.preventDefault();

    // Ensure at least basic demographic answers are provided
    if (!profile.ageGroup || !profile.occupation || !profile.location || !profile.incomeRange) {
      setValidationError(
        isKannada
          ? 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ವಯಸ್ಸು, ವೃತ್ತಿ, ವಾಸಸ್ಥಳ ಮತ್ತು ಆದಾಯದ ವಿವರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ'
          : 'Please answer the core questions (Age, Occupation, Location, and Income Range) to calculate matches.'
      );
      return;
    }

    setHasEvaluated(true);
    setActiveTab('likely');
  };

  const resetForm = () => {
    setProfile({
      ageGroup: '',
      occupation: '',
      location: '',
      rationCard: '',
      incomeRange: '',
      landholding: '',
      studentStatus: '',
      familyRole: ''
    });
    setHasEvaluated(false);
    setValidationError('');
  };

  // Evaluate single scheme rules
  const evaluateScheme = (scheme) => {
    const satisfied = [];
    const unmet = [];
    const unknown = [];

    const isKarnatakaRural = profile.location === 'rural_karnataka';
    const isKarnatakaUrban = profile.location === 'urban_karnataka';
    const isOutsideKarnataka = profile.location === 'outside_karnataka';

    // 1. Residency Rule
    if (scheme.eligibilityRules.karnatakaResidentOnly) {
      if (isOutsideKarnataka) {
        unmet.push('Requires permanent domicile / residency in Karnataka.');
      } else {
        satisfied.push('Karnataka residency confirmed.');
      }
    }

    // 2. Rural Location Rule (e.g. Basava Vasathi Housing)
    if (scheme.eligibilityRules.requiresRural) {
      if (isKarnatakaRural) {
        satisfied.push('Rural Gram Panchayat resident requirement met.');
      } else {
        unmet.push('Scheme is exclusive to rural Gram Panchayat residents.');
      }
    }

    // 3. Age Rules
    if (scheme.eligibilityRules.minAge) {
      if (scheme.eligibilityRules.minAge >= 65) {
        if (profile.ageGroup === '65_plus') {
          satisfied.push('Age requirement: 65 years or above satisfied.');
        } else if (profile.ageGroup === '60_64') {
          unmet.push('Requires minimum age of 65 years (Selected: 60-64 years).');
        } else {
          unmet.push(`Requires minimum age of 65 years (Selected age group is below 65).`);
        }
      } else if (scheme.eligibilityRules.minAge === 18) {
        if (profile.ageGroup === 'under_18') {
          unmet.push('Must be at least 18 years of age.');
        } else {
          satisfied.push('Minimum age requirement (18+) met.');
        }
      }
    }

    if (scheme.eligibilityRules.maxAge) {
      if (profile.ageGroup === '60_64' || profile.ageGroup === '65_plus') {
        unmet.push(`Maximum age ceiling exceeded (Scheme capped at ${scheme.eligibilityRules.maxAge} years).`);
      } else {
        satisfied.push('Within statutory age ceiling.');
      }
    }

    // 4. Income Ceiling Rules
    if (scheme.eligibilityRules.maxIncome) {
      const ceiling = scheme.eligibilityRules.maxIncome;

      if (ceiling <= 32000) {
        if (profile.incomeRange === 'below_32k') {
          satisfied.push(`Annual income verified below ₹32,000 threshold.`);
        } else {
          unmet.push(`Annual household income exceeds maximum ceiling (₹32,000 limit).`);
        }
      } else if (ceiling <= 100000) {
        if (profile.incomeRange === 'below_32k' || profile.incomeRange === '32k_to_1lakh') {
          satisfied.push(`Annual income satisfies scheme limit (under ₹1.0 Lakh).`);
        } else {
          unmet.push(`Annual household income exceeds ₹1.0 Lakh ceiling.`);
        }
      } else if (ceiling <= 200000) {
        if (profile.incomeRange === 'above_2.5lakh' || profile.incomeRange === '2lakh_to_2.5lakh') {
          unmet.push(`Annual household income exceeds ₹2.0 Lakh ceiling.`);
        } else {
          satisfied.push(`Annual income satisfies scheme limit (under ₹2.0 Lakh).`);
        }
      } else if (ceiling <= 250000) {
        if (profile.incomeRange === 'above_2.5lakh') {
          unmet.push(`Annual household income exceeds ₹2.5 Lakh ceiling.`);
        } else {
          satisfied.push(`Annual income satisfies scheme limit (under ₹2.5 Lakh).`);
        }
      }
    }

    // 5. Ration Card Rules (BPL / PHH)
    if (scheme.eligibilityRules.requiresBpl) {
      if (profile.rationCard === 'bpl_antyodaya') {
        satisfied.push('Active BPL / Priority Household (PHH) card requirement met.');
      } else {
        unmet.push('Requires an active BPL or Antyodaya (PHH/AAY) Ration Card.');
      }
    }

    // 6. Agricultural Land Rules
    if (scheme.eligibilityRules.requiresLand) {
      if (profile.landholding === 'small_marginal' || profile.landholding === 'medium_large' || profile.occupation === 'farmer') {
        satisfied.push('Agricultural landholding profile satisfied.');
        unknown.push('FRUITS Farmer Registration (FID) & RTC Pahani record status to be verified.');
      } else {
        unmet.push('Requires cultivable agricultural land registered under FRUITS.');
      }
    }

    // 7. Student Rules
    if (scheme.eligibilityRules.requiresStudent) {
      if (profile.studentStatus === 'currently_student' || profile.occupation === 'student') {
        satisfied.push('Post-matric student enrollment verified.');
        unknown.push('College bonafide admission and SATS e-Attestation record to be verified.');
      } else {
        unmet.push('Requires active enrollment in a post-matric recognized institution.');
      }
    }

    // 8. Youth Unemployment Rules (Yuva Nidhi)
    if (scheme.eligibilityRules.requiresUnemployed) {
      if (profile.studentStatus === 'graduated_unemployed') {
        satisfied.push('Graduated candidate seeking employment verified.');
        unknown.push('180-day post-result completion period & non-employment declaration to be verified.');
      } else {
        unmet.push('Exclusive to graduated degree/diploma holders who completed studies and are seeking employment.');
      }
    }

    // 9. Female Head of Family (Gruha Lakshmi)
    if (scheme.eligibilityRules.requiresFemaleHead) {
      if (profile.familyRole === 'female_head') {
        satisfied.push('Designated woman head of household role confirmed.');
        unknown.push('NPCI Aadhaar mapping on bank account & non-taxpayer declaration to be verified.');
      } else {
        unmet.push('Must be designated as the woman head of household on the ration card.');
      }
    }

    // Determine status bucket
    let status = 'likely';
    if (unmet.length > 0) {
      status = 'not_eligible';
    } else if (unknown.length > 0) {
      status = 'verification_needed';
    }

    return {
      scheme,
      status,
      satisfied,
      unmet,
      unknown
    };
  };

  // Evaluated results
  const evaluatedResults = SCHEMES_CATALOGUE.map((scheme) => evaluateScheme(scheme));

  const likelySchemes = evaluatedResults.filter((r) => r.status === 'likely');
  const verificationSchemes = evaluatedResults.filter((r) => r.status === 'verification_needed');
  const notEligibleSchemes = evaluatedResults.filter((r) => r.status === 'not_eligible');

  const visibleResults = activeTab === 'likely'
    ? likelySchemes
    : activeTab === 'verification'
    ? verificationSchemes
    : activeTab === 'not_eligible'
    ? notEligibleSchemes
    : evaluatedResults;

  return (
    <div className="eligibility-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title & Introduction */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', color: 'var(--gov-blue-dark)' }}>
          {isKannada ? 'ಯೋಜನಾ ಅರ್ಹತಾ ಸಹಾಯಕ' : 'Scheme Eligibility Assistant (Kutumba Engine)'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {isKannada
            ? 'ನಿಮ್ಮ ಕುಟುಂಬದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಮತ್ತು ನೀವು ಅರ್ಹರಾಗಿರುವ ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿ.'
            : 'Answer a few profile questions to discover matching Karnataka welfare programs without visiting a government office. Evaluated 100% locally inside your browser.'}
        </p>
      </div>

      {/* Advisory Notice */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderLeft: '4px solid #0284c7',
        padding: '12px 16px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: '#0369a1',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <Shield size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Privacy & Statutory Advisory:</strong> This tool performs a rule-based discovery evaluation and does not submit sensitive personal identifiers to any external server. <em>This is an informational guidance service and does not constitute guaranteed government sanction or approval. Final entitlement is determined by the competent department upon official document verification.</em>
        </div>
      </div>

      {/* QUESTIONNAIRE CARD */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={20} color="var(--gov-blue-primary)" />
          <span>{isKannada ? 'ಕುಟುಂಬ ವಿವರಗಳ ಪ್ರಶ್ನಾವಳಿ' : 'Citizen Profile Questionnaire'}</span>
        </h3>

        {validationError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '0.84rem',
            marginBottom: '16px'
          }}>
            {validationError}
          </div>
        )}

        <form onSubmit={evaluateEligibility}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* 1. Age Group */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                1. Age Group <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={profile.ageGroup}
                onChange={(e) => handleAnswer('ageGroup', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Age Group --</option>
                <option value="under_18">Under 18 Years (Minor)</option>
                <option value="18_25">18 – 25 Years (Youth / Student)</option>
                <option value="26_59">26 – 59 Years (Working Adult)</option>
                <option value="60_64">60 – 64 Years (Elderly)</option>
                <option value="65_plus">65 Years & Above (Senior Citizen)</option>
              </select>
            </div>

            {/* 2. Primary Occupation / Beneficiary Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                2. Primary Profile / Occupation <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={profile.occupation}
                onChange={(e) => handleAnswer('occupation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Profile --</option>
                <option value="farmer">Farmer / Cultivator (ಕೃಷಿಕ / ರೈತ)</option>
                <option value="student">Student / College Enrolled (ವಿದ್ಯಾರ್ಥಿ)</option>
                <option value="artisan_business">Rural Artisan / Small Business / MSME (ಕುಶಲಕರ್ಮಿ)</option>
                <option value="senior">Senior Citizen / Destitute (ಹಿರಿಯ ನಾಗರಿಕ)</option>
                <option value="rural_citizen">General Citizen / Rural Resident (ನಾಗರಿಕ)</option>
              </select>
            </div>

            {/* 3. Location / Residency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                3. Resident Location <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={profile.location}
                onChange={(e) => handleAnswer('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Location --</option>
                <option value="rural_karnataka">Rural Gram Panchayat in Karnataka</option>
                <option value="urban_karnataka">Urban Municipality / Corporation in Karnataka</option>
                <option value="outside_karnataka">Resident Outside Karnataka</option>
              </select>
            </div>

            {/* 4. Annual Household Income */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                4. Combined Family Annual Income <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={profile.incomeRange}
                onChange={(e) => handleAnswer('incomeRange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Income Range --</option>
                <option value="below_32k">Below ₹32,000 / year (Destitute / Very Low Income)</option>
                <option value="32k_to_1lakh">₹32,001 to ₹1,00,000 / year</option>
                <option value="1lakh_to_2lakh">₹1,00,001 to ₹2,00,000 / year</option>
                <option value="2lakh_to_2.5lakh">₹2,00,001 to ₹2,50,000 / year</option>
                <option value="above_2.5lakh">Above ₹2,50,000 / year</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* 5. Ration Card Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                5. Karnataka Ration Card Category
              </label>
              <select
                value={profile.rationCard}
                onChange={(e) => handleAnswer('rationCard', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Ration Card --</option>
                <option value="bpl_antyodaya">BPL / Antyodaya (PHH / AAY Yellow Card)</option>
                <option value="apl">APL Card (Non-Priority / White Card)</option>
                <option value="none">No Ration Card / Not Applied</option>
              </select>
            </div>

            {/* 6. Agricultural Landholding */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                6. Agricultural Land Ownership
              </label>
              <select
                value={profile.landholding}
                onChange={(e) => handleAnswer('landholding', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Landholding --</option>
                <option value="landless">Landless / No Agricultural Land</option>
                <option value="small_marginal">Small / Marginal Farmer (Less than 5 Acres)</option>
                <option value="medium_large">Medium or Large Farmer (More than 5 Acres)</option>
              </select>
            </div>

            {/* 7. Education / Youth Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                7. Education / Student Status
              </label>
              <select
                value={profile.studentStatus}
                onChange={(e) => handleAnswer('studentStatus', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Education Status --</option>
                <option value="currently_student">Currently Enrolled in Post-Matric College / ITI</option>
                <option value="graduated_unemployed">Graduated Degree / Diploma (Seeking Job / Unemployed)</option>
                <option value="neither">Neither of the Above</option>
              </select>
            </div>

            {/* 8. Family Role */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                8. Head of Household Status
              </label>
              <select
                value={profile.familyRole}
                onChange={(e) => handleAnswer('familyRole', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.86rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="">-- Select Role --</option>
                <option value="female_head">Woman Head of Household (as in Ration Card)</option>
                <option value="female_member">Woman Family Member</option>
                <option value="male_head">Male Head of Household</option>
                <option value="male_member">Male Family Member</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>{isKannada ? 'ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Check Eligible Schemes'}</span>
            </button>

            {hasEvaluated && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
                style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={15} />
                <span>Reset Answers</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RESULTS DISPLAY */}
      {hasEvaluated ? (
        <div style={{ marginBottom: '32px' }}>
          {/* Results Summary Bar */}
          <div style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-light)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gov-blue-dark)' }}>
                Rule-Based Eligibility Evaluation Results
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Evaluated all <strong>{SCHEMES_CATALOGUE.length}</strong> verified Karnataka welfare schemes against your answers.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                ● {likelySchemes.length} Potential Match
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                ● {verificationSchemes.length} More Information Needed
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                ● {notEligibleSchemes.length} May Not Meet Listed Criteria
              </span>
            </div>
          </div>

          {/* Result Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('likely')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: activeTab === 'likely' ? '1px solid #16a34a' : '1px solid var(--border-light)',
                backgroundColor: activeTab === 'likely' ? '#f0fdf4' : 'var(--bg-body)',
                color: activeTab === 'likely' ? '#166534' : 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              Potential Match ({likelySchemes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: activeTab === 'verification' ? '1px solid #d97706' : '1px solid var(--border-light)',
                backgroundColor: activeTab === 'verification' ? '#fffbeb' : 'var(--bg-body)',
                color: activeTab === 'verification' ? '#92400e' : 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              More Information Needed ({verificationSchemes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('not_eligible')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: activeTab === 'not_eligible' ? '1px solid #dc2626' : '1px solid var(--border-light)',
                backgroundColor: activeTab === 'not_eligible' ? '#fef2f2' : 'var(--bg-body)',
                color: activeTab === 'not_eligible' ? '#991b1b' : 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              May Not Meet Listed Criteria ({notEligibleSchemes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: activeTab === 'all' ? '1px solid var(--gov-blue-primary)' : '1px solid var(--border-light)',
                backgroundColor: activeTab === 'all' ? 'var(--gov-blue-light)' : 'var(--bg-body)',
                color: activeTab === 'all' ? 'var(--gov-blue-primary)' : 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              All Evaluated ({evaluatedResults.length})
            </button>
          </div>

          {/* Schemes Results List */}
          {visibleResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {visibleResults.map(({ scheme, status, satisfied, unmet, unknown }) => {
                const isLikely = status === 'likely';
                const isVerif = status === 'verification_needed';
                const isUnmet = status === 'not_eligible';

                return (
                  <div
                    key={scheme.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: isLikely ? '4px solid #16a34a' : isVerif ? '4px solid #d97706' : '4px solid #dc2626'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gov-blue-primary)', textTransform: 'uppercase' }}>
                        {t(scheme.department, scheme.departmentKn)}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: isLikely ? '#dcfce7' : isVerif ? '#fef3c7' : '#fee2e2',
                        color: isLikely ? '#15803d' : isVerif ? '#b45309' : '#b91c1c'
                      }}>
                        {isLikely ? '✓ Potential Match' : isVerif ? '⚠ More Info Needed' : '✕ May Not Meet Listed Criteria'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--gov-blue-dark)', marginBottom: '6px' }}>
                      {t(scheme.title, scheme.titleKn)}
                    </h3>

                    <p style={{ color: 'var(--text-subtle)', fontSize: '0.84rem', lineHeight: '1.45', marginBottom: '12px' }}>
                      {t(scheme.shortDesc, scheme.shortDescKn)}
                    </p>

                    {/* Criteria Evaluation Breakdown */}
                    <div style={{ backgroundColor: 'var(--bg-body)', padding: '10px 12px', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '14px', flex: 1 }}>
                      {/* Satisfied Conditions */}
                      {satisfied.length > 0 && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} color="#16a34a" /> Conditions Met:
                          </strong>
                          <ul style={{ paddingLeft: '16px', color: 'var(--text-dark)', marginTop: '2px' }}>
                            {satisfied.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Unmet Conditions */}
                      {unmet.length > 0 && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={13} color="#dc2626" /> Unmet Criteria:
                          </strong>
                          <ul style={{ paddingLeft: '16px', color: '#991b1b', marginTop: '2px' }}>
                            {unmet.map((u, idx) => (
                              <li key={idx}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Unknown / To Be Verified */}
                      {unknown.length > 0 && (
                        <div>
                          <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HelpCircle size={13} color="#d97706" /> Information to Verify:
                          </strong>
                          <ul style={{ paddingLeft: '16px', color: '#92400e', marginTop: '2px' }}>
                            {unknown.map((k, idx) => (
                              <li key={idx}>{k}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      {isLikely || isVerif ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setSelectedSchemeForDraft(scheme)}
                          style={{ flex: 1, fontSize: '0.82rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <FileText size={15} />
                          <span>Fill Application Draft</span>
                        </button>
                      ) : null}

                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>Official Portal</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No schemes fall under the selected tab. Try selecting "All Evaluated" to see the complete evaluation.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Pre-Evaluation Guidance */
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', borderLeft: '4px solid var(--gov-blue-primary)' }}>
          <Sparkles size={36} color="var(--gov-blue-primary)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            Ready to Evaluate Scheme Entitlements
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '520px', margin: '0 auto' }}>
            Fill in the questionnaire above and click <strong>"Check Eligible Schemes"</strong>. The system will match your profile against verified Karnataka government scheme rules (income ceilings, age requirements, rural residency, and landholding conditions) completely offline.
          </p>
        </div>
      )}

      {/* Application Form Modal if citizen initiates draft from discovery */}
      {selectedSchemeForDraft && (
        <DraftFormModal
          service={selectedSchemeForDraft}
          onClose={() => setSelectedSchemeForDraft(null)}
        />
      )}
    </div>
  );
}
