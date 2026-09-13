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
  IndianRupee,
  MapPin,
  Briefcase,
  Zap,
  RotateCcw
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

  // Helper to handle answers
  const updateAnswer = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  // Rule evaluation algorithm against schemes.json
  const evaluateScheme = (scheme, userProfile) => {
    const rules = scheme.rules;
    const reasons = [];
    let isEligible = true;

    const userAge = Number(userProfile.age) || 0;
    const userIncome = Number(userProfile.annualIncome) || 0;

    // Rule 1: Minimum Age
    if (rules.minAge !== undefined) {
      if (userAge < rules.minAge) {
        isEligible = false;
        reasons.push(`Minimum required age is ${rules.minAge} (You entered ${userAge})`);
      } else {
        reasons.push(`Age criterion satisfied (>= ${rules.minAge})`);
      }
    }

    // Rule 2: Maximum Age
    if (rules.maxAge !== undefined) {
      if (userAge > rules.maxAge) {
        isEligible = false;
        reasons.push(`Maximum permissible age is ${rules.maxAge} (You entered ${userAge})`);
      } else {
        reasons.push(`Age limit satisfied (<= ${rules.maxAge})`);
      }
    }

    // Rule 3: Maximum Household Income
    if (rules.maxIncome !== undefined) {
      if (userIncome > rules.maxIncome) {
        isEligible = false;
        reasons.push(`Income ceiling is ₹${rules.maxIncome.toLocaleString()} (Your income: ₹${userIncome.toLocaleString()})`);
      } else {
        reasons.push(`Income limit satisfied (Under ₹${rules.maxIncome.toLocaleString()})`);
      }
    }

    // Rule 4: Social Category
    if (rules.allowedCategories && !rules.allowedCategories.includes('All')) {
      if (!rules.allowedCategories.includes(userProfile.category)) {
        isEligible = false;
        reasons.push(`Available for categories: ${rules.allowedCategories.join(', ')}`);
      } else {
        reasons.push(`Category '${userProfile.category}' is eligible`);
      }
    }

    // Rule 5: Occupation
    if (rules.occupations && rules.occupations.length > 0) {
      if (!rules.occupations.includes(userProfile.occupation)) {
        isEligible = false;
        reasons.push(`Applicable for: ${rules.occupations.join(', ')}`);
      } else {
        reasons.push(`Occupation '${userProfile.occupation}' qualifies`);
      }
    }

    // Rule 6: Student Status
    if (rules.isStudent === true) {
      if (!userProfile.isStudent && userProfile.occupation !== 'Student') {
        isEligible = false;
        reasons.push(`Applicant must be an actively enrolled student`);
      } else {
        reasons.push(`Student status confirmed`);
      }
    }

    // Rule 7: Female Specific
    if (rules.isFemale === true) {
      if (userProfile.gender !== 'Female') {
        isEligible = false;
        reasons.push(`Exclusive grant for female applicants / girl child`);
      } else {
        reasons.push(`Gender requirement satisfied`);
      }
    }

    // Rule 8: Land Ownership
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

  // Quick Preset Profiles for Instant Demo & Testing
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
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-300 border border-teal-800/50">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Offline Rule-Based Evaluation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Welfare Scheme Eligibility Assistant
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Answer a quick questionnaire to identify which state and central welfare schemes you qualify for. All evaluation happens directly in your browser without any network connection.
        </p>
      </div>

      {/* Quick Test Demo Presets */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          Quick Demo Test Profiles:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('farmer')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80 transition-colors cursor-pointer"
          >
            Profile 1: Marginal Farmer (42y)
          </button>
          <button
            onClick={() => applyPreset('student')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-700/50 hover:bg-blue-900/80 transition-colors cursor-pointer"
          >
            Profile 2: Rural Girl Student (19y)
          </button>
          <button
            onClick={() => applyPreset('elderly')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50 hover:bg-amber-900/80 transition-colors cursor-pointer"
          >
            Profile 3: Senior Citizen (67y)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Questionnaire Form */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-400" />
            <span>Citizen Profile Questionnaire</span>
          </h2>

          <div className="space-y-4 text-sm">
            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Applicant Age (Years)
              </label>
              <input
                type="number"
                min="10"
                max="110"
                placeholder="e.g. 35"
                value={answers.age}
                onChange={(e) => updateAnswer('age', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Annual Family Income (INR)
              </label>
              <input
                type="number"
                placeholder="e.g. 120000"
                value={answers.annualIncome}
                onChange={(e) => updateAnswer('annualIncome', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Social Category
              </label>
              <select
                value={answers.category}
                onChange={(e) => updateAnswer('category', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Occupation
              </label>
              <select
                value={answers.occupation}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAnswer('occupation', val);
                  if (val === 'Student') updateAnswer('isStudent', true);
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Land Ownership
              </label>
              <select
                value={answers.landOwnership}
                onChange={(e) => updateAnswer('landOwnership', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="landless">Landless (No agricultural land)</option>
                <option value="marginal">Marginal (Less than 2.5 Acres / 1 Hectare)</option>
                <option value="small">Small (2.5 - 5 Acres)</option>
                <option value="medium">Medium (More than 5 Acres)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateAnswer('gender', g)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      answers.gender === g
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
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
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check Eligible Schemes</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Matched Welfare Schemes
              {evaluated && (
                <span className="ml-2 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {eligibleSchemes.length} Available
                </span>
              )}
            </h2>
          </div>

          {!evaluated ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Sparkles className="w-10 h-10 text-teal-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">
                Awaiting Citizen Details
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the profile questionnaire or select one of the Quick Demo Test Profiles above to instantly view qualified schemes.
              </p>
            </div>
          ) : eligibleSchemes.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <HelpCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Direct Matches Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Based on the provided income or land holding details, you did not meet the eligibility thresholds for the current 6 schemes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eligibleSchemes.map(({ scheme, reasons }) => (
                <div
                  key={scheme.id}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-xl space-y-4 transition-all hover:border-emerald-500/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {scheme.category}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {scheme.description}
                      </p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Eligible</span>
                    </span>
                  </div>

                  {/* Benefit Pill */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Benefit: {scheme.benefits}</span>
                  </div>

                  {/* Why eligible checklist */}
                  <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold">Eligibility Verification:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Link to Application Form if exists */}
                  {scheme.applicationForm && (
                    <div className="pt-2">
                      <Link
                        to={`/services/${scheme.applicationForm}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-950 cursor-pointer"
                      >
                        <span>Apply Now Offline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Other Ineligible Schemes */}
              {otherSchemes.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Schemes Outside Your Eligibility Criteria ({otherSchemes.length})
                  </h4>
                  <div className="space-y-2">
                    {otherSchemes.map(({ scheme, reasons }) => {
                      const failedReasons = reasons.filter((r) => !r.includes('satisfied') && !r.includes('confirmed') && !r.includes('qualifies'));
                      return (
                        <div
                          key={scheme.id}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs opacity-75 space-y-1.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-300">{scheme.name}</span>
                            <span className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Not Qualified</span>
                            </span>
                          </div>
                          {failedReasons.length > 0 && (
                            <p className="text-slate-500 text-[11px]">
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
