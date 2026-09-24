import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import schemesData from '../data/schemes.json';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  User,
  Zap
} from 'lucide-react';

export default function EligibilityAssistant() {
  const [answers, setAnswers] = useState({
    age: '',
    annualIncome: '',
    category: 'OBC',
    landOwnership: 'marginal',
    occupation: 'Farmer',
    gender: 'Male',
    isStudent: false,
    hasPuccaHouse: false
  });

  const [evaluated, setEvaluated] = useState(false);

  const updateAnswer = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const evaluateScheme = (scheme, userProfile) => {
    const rules = scheme.rules;
    const reasons = [];
    let isEligible = true;

    const userAge = Number(userProfile.age) || 0;
    const userIncome = Number(userProfile.annualIncome) || 0;

    if (rules.minAge !== undefined) {
      if (userAge < rules.minAge) {
        isEligible = false;
        reasons.push(`Minimum required age is ${rules.minAge} (You entered ${userAge})`);
      } else {
        reasons.push(`Age criterion met (>= ${rules.minAge})`);
      }
    }

    if (rules.maxAge !== undefined) {
      if (userAge > rules.maxAge) {
        isEligible = false;
        reasons.push(`Maximum permissible age is ${rules.maxAge} (You entered ${userAge})`);
      } else {
        reasons.push(`Age limit met (<= ${rules.maxAge})`);
      }
    }

    if (rules.maxIncome !== undefined) {
      if (userIncome > rules.maxIncome) {
        isEligible = false;
        reasons.push(`Income ceiling is ₹${rules.maxIncome.toLocaleString()} (Your income: ₹${userIncome.toLocaleString()})`);
      } else {
        reasons.push(`Income ceiling satisfied (Under ₹${rules.maxIncome.toLocaleString()})`);
      }
    }

    if (rules.allowedCategories && !rules.allowedCategories.includes('All')) {
      if (!rules.allowedCategories.includes(userProfile.category)) {
        isEligible = false;
        reasons.push(`Restricted to categories: ${rules.allowedCategories.join(', ')}`);
      } else {
        reasons.push(`Category '${userProfile.category}' qualifies`);
      }
    }

    if (rules.occupations && rules.occupations.length > 0) {
      if (!rules.occupations.includes(userProfile.occupation)) {
        isEligible = false;
        reasons.push(`Applicable to occupations: ${rules.occupations.join(', ')}`);
      } else {
        reasons.push(`Occupation '${userProfile.occupation}' qualifies`);
      }
    }

    if (rules.isStudent === true) {
      if (!userProfile.isStudent && userProfile.occupation !== 'Student') {
        isEligible = false;
        reasons.push(`Applicant must be an actively enrolled student`);
      } else {
        reasons.push(`Enrolled student status confirmed`);
      }
    }

    if (rules.isFemale === true) {
      if (userProfile.gender !== 'Female') {
        isEligible = false;
        reasons.push(`Exclusive grant for female applicants / girl child`);
      } else {
        reasons.push(`Gender requirement satisfied`);
      }
    }

    if (rules.maxLandAcres !== undefined) {
      if (userProfile.landOwnership === 'medium') {
        isEligible = false;
        reasons.push(`Requires small or marginal landholding (< 5 acres)`);
      } else {
        reasons.push(`Land size criterion satisfied`);
      }
    }

    return {
      scheme,
      isEligible,
      reasons
    };
  };

  const results = schemesData.map((scheme) => evaluateScheme(scheme, answers));
  const eligibleSchemes = results.filter((r) => r.isEligible);
  const otherSchemes = results.filter((r) => !r.isEligible);

  const applyPreset = (presetType) => {
    if (presetType === 'farmer') {
      setAnswers({
        age: '42',
        annualIncome: '120000',
        category: 'OBC',
        landOwnership: 'marginal',
        occupation: 'Farmer',
        gender: 'Male',
        isStudent: false,
        hasPuccaHouse: false
      });
    } else if (presetType === 'student') {
      setAnswers({
        age: '19',
        annualIncome: '160000',
        category: 'OBC',
        landOwnership: 'landless',
        occupation: 'Student',
        gender: 'Female',
        isStudent: true,
        hasPuccaHouse: true
      });
    } else if (presetType === 'elderly') {
      setAnswers({
        age: '67',
        annualIncome: '80000',
        category: 'General',
        landOwnership: 'landless',
        occupation: 'Other',
        gender: 'Male',
        isStudent: false,
        hasPuccaHouse: false
      });
    }
    setEvaluated(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#D1D5DB] pb-4 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-[#E6F5F6] text-[#007C83] border border-[#007C83]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offline Eligibility Calculator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
          Welfare Scheme Eligibility Assistant
        </h1>
        <p className="text-sm text-[#475569] max-w-2xl">
          Complete the questionnaire below to see which state and national schemes you qualify for. Evaluated instantly on this device without internet.
        </p>
      </div>

      {/* Preset Demo Profiles */}
      <div className="p-4 rounded-lg bg-white border border-[#CBD5E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <span className="text-xs font-bold text-[#172033]">
          Quick Test Profiles:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('farmer')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#EBF7F0] text-[#087443] border border-[#16A34A] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
          >
            Profile 1: Marginal Farmer (42y)
          </button>
          <button
            onClick={() => applyPreset('student')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
          >
            Profile 2: Rural Girl Student (19y)
          </button>
          <button
            onClick={() => applyPreset('elderly')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#D97706] hover:bg-[#FDE68A] transition-colors cursor-pointer"
          >
            Profile 3: Senior Citizen (67y)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Questionnaire Form */}
        <div className="lg:col-span-5 rounded-xl bg-white border-2 border-[#CBD5E1] p-6 sm:p-8 space-y-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#172033] border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[#087443]" />
            <span>Citizen Profile Questionnaire</span>
          </h2>

          <div className="space-y-4 text-sm">
            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Applicant Age (in Years)
              </label>
              <input
                type="number"
                min="10"
                max="110"
                placeholder="e.g. 35"
                value={answers.age}
                onChange={(e) => updateAnswer('age', e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443]"
              />
            </div>

            {/* Income */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Annual Family Income (INR)
              </label>
              <input
                type="number"
                placeholder="e.g. 120000"
                value={answers.annualIncome}
                onChange={(e) => updateAnswer('annualIncome', e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Social Category
              </label>
              <select
                value={answers.category}
                onChange={(e) => updateAnswer('category', e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443]"
              >
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Primary Occupation
              </label>
              <select
                value={answers.occupation}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAnswer('occupation', val);
                  if (val === 'Student') updateAnswer('isStudent', true);
                }}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443]"
              >
                <option value="Farmer">Farmer (Landholder)</option>
                <option value="Agricultural Laborer">Agricultural Laborer</option>
                <option value="Student">Student</option>
                <option value="Self-Employed">Self-Employed / Artisan</option>
                <option value="Other">Other / Retired</option>
              </select>
            </div>

            {/* Land Ownership */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Land Ownership
              </label>
              <select
                value={answers.landOwnership}
                onChange={(e) => updateAnswer('landOwnership', e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] font-medium focus:outline-none focus:border-[#087443]"
              >
                <option value="landless">Landless (No agricultural land)</option>
                <option value="marginal">Marginal (Under 2.5 Acres / 1 Hectare)</option>
                <option value="small">Small (2.5 - 5 Acres)</option>
                <option value="medium">Medium (More than 5 Acres)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateAnswer('gender', g)}
                    className={`min-h-[44px] rounded-lg text-xs font-bold transition-colors ${
                      answers.gender === g
                        ? 'bg-[#087443] text-white'
                        : 'bg-white text-[#172033] border-2 border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEvaluated(true)}
            className="w-full min-h-[48px] rounded-lg font-bold text-white bg-[#087443] hover:bg-[#065f37] border border-[#065f37] flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check Eligible Schemes</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D1D5DB] pb-3">
            <h2 className="text-xl font-bold text-[#172033]">
              Matched Welfare Schemes
              {evaluated && (
                <span className="ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#087443] border border-[#16A34A]">
                  {eligibleSchemes.length} Schemes Available
                </span>
              )}
            </h2>
          </div>

          {!evaluated ? (
            <div className="p-12 text-center rounded-xl bg-white border border-[#CBD5E1] space-y-2">
              <Sparkles className="w-10 h-10 text-[#087443] mx-auto" />
              <h3 className="text-base font-bold text-[#172033]">
                Enter Details to Calculate Eligibility
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Fill in the questionnaire on the left or select a sample profile above to see instant recommendations.
              </p>
            </div>
          ) : eligibleSchemes.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white border border-[#CBD5E1] space-y-2">
              <HelpCircle className="w-8 h-8 text-[#D97706] mx-auto" />
              <h3 className="text-base font-bold text-[#172033]">No Direct Matches Found</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Based on the provided income or land details, you do not meet current criteria for the 6 available schemes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eligibleSchemes.map(({ scheme, reasons }) => (
                <div
                  key={scheme.id}
                  className="p-6 rounded-xl bg-white border-2 border-[#16A34A] shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#007C83]">
                        {scheme.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#172033] mt-0.5">
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-[#475569] mt-1">
                        {scheme.description}
                      </p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#087443] border border-[#16A34A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Eligible</span>
                    </span>
                  </div>

                  {/* Benefit Callout */}
                  <div className="p-3 rounded-lg bg-[#EBF7F0] border border-[#A3D9BE] text-xs text-[#087443] font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#087443] flex-shrink-0" />
                    <span>Benefit: {scheme.benefits}</span>
                  </div>

                  {/* Verification Criteria */}
                  <div className="space-y-1 text-xs border-t border-[#E5E7EB] pt-3">
                    <span className="font-bold text-[#172033]">Criteria Met:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[#334155]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#087443] flex-shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {scheme.applicationForm && (
                    <div className="pt-2">
                      <Link
                        to={`/services/${scheme.applicationForm}`}
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#087443] hover:bg-[#065f37] transition-colors cursor-pointer"
                      >
                        <span>Apply Now Offline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Ineligible Schemes */}
              {otherSchemes.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Schemes Outside Your Eligibility Criteria ({otherSchemes.length})
                  </h4>
                  <div className="space-y-2">
                    {otherSchemes.map(({ scheme, reasons }) => {
                      const failedReasons = reasons.filter(
                        (r) => !r.includes('met') && !r.includes('satisfied') && !r.includes('confirmed') && !r.includes('qualifies')
                      );
                      return (
                        <div
                          key={scheme.id}
                          className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#CBD5E1] text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#172033]">{scheme.name}</span>
                            <span className="text-[#991B1B] text-[11px] font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-[#DC2626]" />
                              <span>Not Qualified</span>
                            </span>
                          </div>
                          {failedReasons.length > 0 && (
                            <p className="text-[#64748B] text-[11px]">
                              Reason: {failedReasons[0]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
