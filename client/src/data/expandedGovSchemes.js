/**
 * OfflineBridge — Authoritative Government Schemes & Services Dataset
 * Compiled from authorized official government sources:
 * - https://www.myscheme.gov.in
 * - https://sevasindhu.karnataka.gov.in
 * - https://fruits.karnataka.gov.in
 * - https://ssp.postmatric.karnataka.gov.in
 * - https://nadakacheri.karnataka.gov.in
 * - https://ahara.kar.nic.in
 * - https://sw.kar.nic.in
 * 
 * Contains verified Central & Karnataka State welfare schemes and citizen services
 * with full bilingual metadata, official URLs, and structured eligibility rules.
 */

export const EXPANDED_GOV_SCHEMES = [
  // ===========================================================================
  // 1. AGRICULTURE & FARMER WELFARE
  // ===========================================================================
  {
    id: 'pm-kisan',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    titleKn: 'ಪಿಎಂ-ಕಿಸಾನ್ (ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ)',
    department: 'Ministry of Agriculture & Farmers Welfare / Dept of Agriculture, Karnataka',
    departmentKn: 'ಕೃಷಿ ಮತ್ತು ರೈತರ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ / ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ',
    category: 'farmer',
    categoryLabel: 'Farmer & Agriculture',
    categoryLabelKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
    description: 'Income support scheme providing ₹6,000 per year in three equal installments directly into the Aadhaar-seeded bank accounts of landholding farmer families across India.',
    descriptionKn: 'ಭಾರತದ ಎಲ್ಲಾ ಕೃಷಿ ಭೂಮಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹6,000 ಆರ್ಥಿಕ ನೆರವನ್ನು ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ (ಪ್ರತಿ ಕಂತಿಗೆ ₹2,000) ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಮಾಡುವ ಯೋಜನೆ.',
    benefits: [
      '₹6,000 per year distributed in three equal 4-monthly installments of ₹2,000.',
      'Direct Benefit Transfer (DBT) directly credited to Aadhaar-seeded bank account.',
      'Automated linkage with PM-KMY (Pension) and Kisan Credit Card (KCC).'
    ],
    benefitsKn: [
      'ವಾರ್ಷಿಕ ₹6,000 ಆರ್ಥಿಕ ನೆರವು ಮೂರು ಕಂತುಗಳಲ್ಲಿ (ಪ್ರತಿ ಕಂತಿಗೆ ₹2,000).',
      'ಆಧಾರ್ ಜೋಡಣೆಗೊಂಡ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
      'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಪಡೆಯಲು ಸುಲಭ ಸಂಪರ್ಕ.'
    ],
    eligibilityCriteria: [
      'All landholder farmer families who have cultivable landholding in their names.',
      'Land records must be verified in State FRUITS / Bhoomi database.',
      'Exclusions: Institutional landholders, former/present constitutional post holders, income tax payers, and professionals (doctors, engineers, lawyers).'
    ],
    eligibilityCriteriaKn: [
      'ತಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಸಾಗುವಳಿ ಮಾಡಬಹುದಾದ ಭೂಮಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳು.',
      'ಕರ್ನಾಟಕದ FRUITS ಮತ್ತು ಭೂಮಿ ತಂತ್ರಾಂಶದಲ್ಲಿ ಜಮೀನಿನ ವಿವರ ನಮೂದಾಗಿರಬೇಕು.',
      'ಸಂಸ್ಥಾಗತ ಭೂಮಾಲೀಕರು, ಸಾಂವಿಧಾನಿಕ ಹುದ್ದೆ ಹೊಂದಿರುವವರು ಮತ್ತು ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರರಿಗೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ.'
    ],
    eligibilityRules: {
      requiresLand: true,
      karnatakaResidentOnly: false
    },
    requiredDocuments: [
      'Aadhaar Card of landholder',
      'Bhoomi RTC / Land Record extract',
      'FRUITS Farmer Registration ID (FID)',
      'Active Bank Passbook seeded with Aadhaar and NPCI'
    ],
    requiredDocumentsKn: [
      'ಭೂಮಾಲೀಕರ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಭೂಮಿ ಪಹಣಿ / ಆರ್‌ಟಿಸಿ (RTC) ಪ್ರತಿ',
      'ಫ್ರೂಟ್ಸ್ (FRUITS) ರೈತ ನೋಂದಣಿ ಗುರುತಿನ ಸಂಖ್ಯೆ (FID)',
      'ಆಧಾರ್ ಮತ್ತು NPCI ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್'
    ],
    applicationProcedure: [
      'Register farmer profile in Karnataka FRUITS portal or visit nearest Raitha Samparka Kendra.',
      'Submit Aadhaar-authenticated e-KYC on official PM-KISAN portal (pmkisan.gov.in).',
      'Gram Panchayat / Taluk Agriculture Officer verifies land records against Bhoomi.',
      'Approved beneficiary receives installments via DBT every 4 months.'
    ],
    applicationProcedureKn: [
      'ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ ಅಥವಾ ಗ್ರಾಮ ಒನ್‌ನಲ್ಲಿ ಫ್ರೂಟ್ಸ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ.',
      'ಅಧಿಕೃತ ಪಿಎಂ-ಕಿಸಾನ್ ಪೋರ್ಟಲ್ (pmkisan.gov.in) ನಲ್ಲಿ ಇ-ಕೆವೈಸಿ (e-KYC) ಪೂರ್ಣಗೊಳಿಸಿ.',
      'ತಾಲೂಕು ಕೃಷಿ ಅಧಿಕಾರಿಗಳಿಂದ ಭೂದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ.',
      'ಅರ್ಹ ರೈತರ ಖಾತೆಗೆ ಪ್ರತಿ 4 ತಿಂಗಳಿಗೊಮ್ಮೆ ನೇರ ನಗದು ಜಮೆ.'
    ],
    officialUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 1800-115-526',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'pm-fasal-bima',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    titleKn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (PMFBY)',
    department: 'Department of Agriculture, Govt. of Karnataka',
    departmentKn: 'ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ',
    category: 'farmer',
    categoryLabel: 'Farmer & Agriculture',
    categoryLabelKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
    description: 'Comprehensive yield and weather-based crop insurance scheme providing financial support to farmers suffering crop loss or damage arising from natural calamities, pests, and unseasonal rainfall.',
    descriptionKn: 'ಅನಾವೃಷ್ಟಿ, ಅತಿವೃಷ್ಟಿ, ಕೀಟಬಾಧೆ ಹಾಗೂ ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದ ಬೆಳೆ ಹಾನಿಯಾದ ಸಂದರ್ಭದಲ್ಲಿ ರೈತರಿಗೆ ಸಮಗ್ರ ವಿಮಾ ರಕ್ಷಣೆ ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      'Low premium: Only 2% for Kharif crops, 1.5% for Rabi food/oilseed crops, and 5% for commercial/horticultural crops.',
      'Full insured sum paid for localized calamities (hailstorm, landslide, inundation).',
      'Post-harvest losses covered up to 14 days after harvest.'
    ],
    benefitsKn: [
      'ಕಡಿಮೆ ಪ್ರೀಮಿಯಂ: ಖಾರೀಫ್ ಬೆಳೆಗಳಿಗೆ ಕೇವಲ 2%, ರಬಿ ಬೆಳೆಗಳಿಗೆ 1.5% ಮತ್ತು ವಾಣಿಜ್ಯ ಬೆಳೆಗಳಿಗೆ 5%.',
      'ಸ್ಥಳೀಯ ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದ (ಆಲಿಕಲ್ಲು ಮಳೆ, ಪ್ರವಾಹ) ಬೆಳೆ ಹಾನಿಗೆ ತ್ವರಿತ ಪರಿಹಾರ.',
      'ಕೊಯ್ಲಿನ ನಂತರದ 14 ದಿನಗಳವರೆಗೆ ಸಂಭವಿಸುವ ಹಾನಿಗೂ ವಿಮಾ ರಕ್ಷಣೆ.'
    ],
    eligibilityCriteria: [
      'All farmers cultivating notified crops in notified areas (both loanee and non-loanee farmers).',
      'Tenant farmers and sharecroppers cultivating notified crops are eligible with tenancy documents.'
    ],
    eligibilityCriteriaKn: [
      'ಅಧಿಸೂಚಿತ ಪ್ರದೇಶಗಳಲ್ಲಿ ಅಧಿಸೂಚಿತ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯುವ ಎಲ್ಲಾ ರೈತರು (ಸಾಲ ಪಡೆದ ಮತ್ತು ಸಾಲ ಪಡೆಯದ ರೈತರು).',
      'ಗೇಣಿ ರೈತರು ಸಹ ದಾಖಲೆ ಸಲ್ಲಿಸಿ ವಿಮೆ ಮಾಡಿಸಬಹುದು.'
    ],
    eligibilityRules: {
      requiresLand: true,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Pahani / RTC copy for the current agricultural season',
      'FRUITS Farmer ID',
      'Sowing certificate issued by Village Administrative Officer / self-declaration',
      'Aadhaar-seeded Bank Passbook'
    ],
    requiredDocumentsKn: [
      'ಪ್ರಸ್ತುತ ಸಾಲಿನ ಪಹಣಿ / ಆರ್‌ಟಿಸಿ (RTC)',
      'ಫ್ರೂಟ್ಸ್ ರೈತ ಗುರುತಿನ ಸಂಖ್ಯೆ (FID)',
      'ಬೆಳೆ ಬಿತ್ತನೆ ದೃಢೀಕರಣ ಪತ್ರ / ಸ್ವಯಂ ಘೋಷಣೆ',
      'ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ'
    ],
    applicationProcedure: [
      'Enroll before crop cut-off date through nearest Primary Agriculture Cooperative Bank (PACB), Commercial Bank, or Samrakshane portal.',
      'Pay designated farmer share premium.',
      'In case of localized damage, report within 72 hours through Crop Insurance App or toll-free helpline.'
    ],
    applicationProcedureKn: [
      'ಗ್ರಾಮ ಒನ್, ಬ್ಯಾಂಕ್ ಅಥವಾ ಸಂರಕ್ಷಣೆ (Samrakshane) ಪೋರ್ಟಲ್ ಮೂಲಕ ಕೊನೆಯ ದಿನಾಂಕದೊಳಗೆ ನೋಂದಾಯಿಸಿ.',
      'ರೈತರ ಪಾಲಿನ ವಿಮಾ ಕಂತು (ಪ್ರೀಮಿಯಂ) ಪಾವತಿಸಿ.',
      'ಬೆಳೆ ಹಾನಿಯಾದ 72 ಗಂಟೆಗಳ ಒಳಗೆ ಬೆಳೆ ವಿಮೆ ಆ್ಯಪ್ ಅಥವಾ ಸಹಾಯವಾಣಿಗೆ ಮಾಹಿತಿ ನೀಡಿ.'
    ],
    officialUrl: 'https://samrakshane.karnataka.gov.in',
    helpline: '1800-425-3553 / 1800-180-1551',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'krishi-bhagya',
    title: 'Krishi Bhagya Scheme (Farm Ponds & Polyhouse Subsidy)',
    titleKn: 'ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಪಾಲಿಹೌಸ್)',
    department: 'Department of Agriculture, Govt. of Karnataka',
    departmentKn: 'ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ',
    category: 'farmer',
    categoryLabel: 'Farmer & Agriculture',
    categoryLabelKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
    description: 'Dryland agricultural support providing 80% to 90% subsidy for construction of farm ponds (Krishi Honda), polythene tarpaulin lining, diesel/solar pump sets, and micro-irrigation systems.',
    descriptionKn: 'ಮಳೆ ಆಶ್ರಿತ ಒಣಭೂಮಿ ಪ್ರದೇಶಗಳಲ್ಲಿ ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣ, ಪಾಲಿಥಿನ್ ಹೊದಿಕೆ, ಡೀಸೆಲ್/ಸೌರ ಪಂಪ್‌ಸೆಟ್ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಘಟಕಗಳಿಗೆ ಶೇಕಡಾ 80 ರಿಂದ 90 ರಷ್ಟು ಸಹಾಯಧನ ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      'Subsidy up to 80% for general category and 90% for SC/ST farmers for farm pond construction.',
      'Financial grant up to ₹1.5 lakh for polythene tarpaulin lining to prevent water percolation.',
      '50% subsidy on 3HP to 5HP diesel pumpsets and shade nets.'
    ],
    benefitsKn: [
      'ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣಕ್ಕೆ ಸಾಮಾನ್ಯ ವರ್ಗಕ್ಕೆ ಶೇ. 80 ಮತ್ತು ಪರಿಶಿಷ್ಟ ಜಾತಿ/ಪಂಗಡಕ್ಕೆ ಶೇ. 90 ರಿಯಾಯಿತಿ.',
      'ನೀರು ಇಂಗುವುದನ್ನು ತಡೆಯಲು ಪಾಲಿಥಿನ್ ಹೊದಿಕೆಗೆ ₹1.5 ಲಕ್ಷದವರೆಗೆ ಅನುದಾನ.',
      'ಡೀಸೆಲ್/ಸೌರ ಪಂಪ್‌ಸೆಟ್ ಮತ್ತು ನೆರಳು ಪರದೆಗಳಿಗೆ ಶೇ. 50 ಸಹಾಯಧನ.'
    ],
    eligibilityCriteria: [
      'Farmer possessing minimum 1 acre dryland agricultural land in rainfed taluks of Karnataka.',
      'Must have registered landholding in Bhoomi portal with FRUITS ID.',
      'Priority given to small, marginal, and drought-affected farmers.'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದ ಮಳೆ ಆಶ್ರಿತ ತಾಲೂಕುಗಳಲ್ಲಿ ಕನಿಷ್ಠ 1 ಎಕರೆ ಒಣಭೂಮಿ ಹೊಂದಿರುವ ರೈತರು.',
      'ಭೂಮಿ ಮತ್ತು ಫ್ರೂಟ್ಸ್ ತಂತ್ರಾಂಶದಲ್ಲಿ ಜಮೀನು ನೋಂದಣಿಯಾಗಿರಬೇಕು.',
      'ಸಣ್ಣ, ಅತಿ ಸಣ್ಣ ಮತ್ತು ಬರಪೀಡಿತ ಪ್ರದೇಶದ ರೈತರಿಗೆ ಮೊದಲ ಆದ್ಯತೆ.'
    ],
    eligibilityRules: {
      requiresLand: true,
      requiresRural: true,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'FRUITS FID and Bhoomi RTC',
      'Caste and Income certificate (for SC/ST subsidy preference)',
      'Land survey sketch from Revenue Department',
      'Bank passbook and Aadhaar card'
    ],
    requiredDocumentsKn: [
      'ಫ್ರೂಟ್ಸ್ FID ಮತ್ತು ಆರ್‌ಟಿಸಿ (RTC) ಪಹಣಿ',
      'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
      'ಜಮೀನಿನ ನಕಾಶೆ / ಸ್ಕೆಚ್',
      'ಆಧಾರ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ'
    ],
    applicationProcedure: [
      'Apply online via Seva Sindhu or visit Assistant Director of Agriculture (ADA) office.',
      'Field inspection conducted by Agriculture Officer to verify location and soil feasibility.',
      'Direct subsidy release upon construction verification and geotagging.'
    ],
    applicationProcedureKn: [
      'ಸೇವಾ ಸಿಂಧು ಅಥವಾ ತಾಲೂಕು ಸಹಾಯಕ ಕೃಷಿ ನಿರ್ದೇಶಕರ ಕಚೇರಿಯಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ಕೃಷಿ ಅಧಿಕಾರಿಗಳಿಂದ ಸ್ಥಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಸ್ಥಳ ನಕಾಶೆ ಮಂಜೂರಾತಿ.',
      'ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣ ಮತ್ತು ಜಿಯೋ-ಟ್ಯಾಗ್ ಪರಿಶೀಲನೆ ಬಳಿಕ ನೇರ ಸಬ್ಸಿಡಿ ಬಿಡುಗಡೆ.'
    ],
    officialUrl: 'https://raitamitra.karnataka.gov.in',
    helpline: 'Janaspandana 1902 / 080-22212844',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'ksheera-siri',
    title: 'Ksheera Siri Milk Producer Incentive Scheme',
    titleKn: 'ಕ್ಷೀರ ಸಿರಿ — ಹಾಲು ಉತ್ಪಾದಕರಿಗೆ ಪ್ರೋತ್ಸಾಹಧನ ಯೋಜನೆ',
    department: 'Department of Animal Husbandry & Fisheries / KMF',
    departmentKn: 'ಪಶುಸಂಗೋಪನೆ ಮತ್ತು ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆ / ಕೆ.ಎಂ.ಎಫ್',
    category: 'farmer',
    categoryLabel: 'Farmer & Agriculture',
    categoryLabelKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
    description: 'Government incentive of ₹5.00 per liter of milk supplied by dairy farmers to Karnataka Milk Federation (KMF) and District Milk Producers Cooperative Societies.',
    descriptionKn: 'ಕರ್ನಾಟಕ ಹಾಲು ಮಹಾಮಂಡಳಿ (KMF) ಮತ್ತು ಗ್ರಾಮ ಹಾಲು ಉತ್ಪಾದಕರ ಸಹಕಾರ ಸಂಘಗಳಿಗೆ ಹಾಲು ಪೂರೈಸುವ ರೈತರಿಗೆ ಪ್ರತಿ ಲೀಟರ್ ಹಾಲಿಗೆ ₹5.00 ಹೆಚ್ಚುವರಿ ಪ್ರೋತ್ಸಾಹಧನ ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      'Direct incentive of ₹5.00 per liter credited monthly to dairy farmer bank account.',
      'Additional price stability supporting small rural dairy farm households.'
    ],
    benefitsKn: [
      'ಹಾಲು ಉತ್ಪಾದಕರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಪ್ರತಿ ಲೀಟರ್‌ಗೆ ₹5.00 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
      'ಗ್ರಾಮೀಣ ಹೈನುಗಾರರಿಗೆ ಖಾತರಿ ಮಾಸಿಕ ಆದಾಯ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ.'
    ],
    eligibilityCriteria: [
      'Must be a member of an affiliated Village Dairy Cooperative Society (MPCS).',
      'Must supply milk daily and maintain membership passbook.'
    ],
    eligibilityCriteriaKn: [
      'ಗ್ರಾಮ ಹಾಲು ಉತ್ಪಾದಕರ ಸಹಕಾರ ಸಂಘದ (MPCS) ನೋಂದಾಯಿತ ಸದಸ್ಯರಾಗಿರಬೇಕು.',
      'ಸಂಘಕ್ಕೆ ನಿಯಮಿತವಾಗಿ ಹಾಲು ಪೂರೈಕೆ ಮಾಡುತ್ತಿರಬೇಕು.'
    ],
    eligibilityRules: {
      requiresRural: true,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Dairy Cooperative Society Membership Passbook / Card',
      'Aadhaar Card',
      'Bank Account passbook linked to Aadhaar'
    ],
    requiredDocumentsKn: [
      'ಹಾಲು ಉತ್ಪಾದಕರ ಸಂಘದ ಸದಸ್ಯತ್ವ ಪಾಸ್ ಬುಕ್',
      'ಆಧಾರ್ ಕಾರ್ಡ್ ಪ್ರತಿ',
      'ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ'
    ],
    applicationProcedure: [
      'Register bank details and Aadhaar with local Village Milk Producers Cooperative Society.',
      'Milk quantity and quality (fat/SNF) automatically logged at collection center.',
      'Incentive credited directly to farmer account by Government via DBT.'
    ],
    applicationProcedureKn: [
      'ಸ್ಥಳೀಯ ಹಾಲು ಉತ್ಪಾದಕರ ಸಹಕಾರ ಸಂಘದಲ್ಲಿ ಆಧಾರ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆ ನೋಂದಾಯಿಸಿ.',
      'ಹಾಲು ಶೇಖರಣಾ ಕೇಂದ್ರದಲ್ಲಿ ದಿನನಿತ್ಯ ಹಾಲು ಪೂರೈಕೆಯ ತೂಕ ಮತ್ತು ಕೊಬ್ಬಿನಾಂಶ ದಾಖಲಾತಿ.',
      'ಪ್ರತಿ ತಿಂಗಳು ಸರಕಾರದಿಂದ ನೇರವಾಗಿ ರೈತರ ಖಾತೆಗೆ ಪ್ರೋತ್ಸಾಹಧನ ಜಮೆ.'
    ],
    officialUrl: 'https://ahvs.karnataka.gov.in',
    helpline: '080-26096800 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },

  // ===========================================================================
  // 2. CITIZEN, SOCIAL WELFARE & FIVE GUARANTEES
  // ===========================================================================
  {
    id: 'gruha-jyothi',
    title: 'Gruha Jyothi Scheme (Free Domestic Electricity)',
    titleKn: 'ಗೃಹ ಜ್ಯೋತಿ ಯೋಜನೆ (ಉಚಿತ ಗೃಹ ವಿದ್ಯುತ್)',
    department: 'Energy Department, Govt. of Karnataka / ESCOMs',
    departmentKn: 'ಇಂಧನ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ / ಎಸ್ಕಾಂಗಳು (BESCOM, CHESCOM, MESCOM)',
    category: 'citizen',
    categoryLabel: 'Citizen & Social Welfare',
    categoryLabelKn: 'ನಾಗರಿಕ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣ',
    description: 'Flagship Karnataka welfare scheme providing up to 200 units of free domestic electricity per month to all residential households based on annual average consumption + 10%.',
    descriptionKn: 'ರಾಜ್ಯದ ಎಲ್ಲಾ ಗೃಹ ಬಳಕೆದಾರರಿಗೆ ಮಾಸಿಕ 200 ಯೂನಿಟ್‌ವರೆಗೆ ಉಚಿತ ವಿದ್ಯುತ್ ಒದಗಿಸುವ ಕರ್ನಾಟಕ ಸರಕಾರದ ಪ್ರಮುಖ ಗ್ಯಾರಂಟಿ ಯೋಜನೆ.',
    benefits: [
      'Zero electricity bill for domestic households consuming within their entitled monthly quota (up to 200 units).',
      'Direct reduction in cost of living for urban and rural families alike.'
    ],
    benefitsKn: [
      'ನಿಗದಿತ ಮಿತಿಯೊಳಗೆ (ಮಾಸಿಕ 200 ಯೂನಿಟ್‌ವರೆಗೆ) ವಿದ್ಯುತ್ ಬಳಸುವ ಕುಟುಂಬಗಳಿಗೆ ಶೂನ್ಯ ವಿದ್ಯುತ್ ಬಿಲ್.',
      'ಬಡ ಮತ್ತು ಮಧ್ಯಮ ವರ್ಗದ ಕುಟುಂಬಗಳ ಮಾಸಿಕ ವಿದ್ಯುತ್ ವೆಚ್ಚ ಸಂಪೂರ್ಣ ಉಳಿತಾಯ.'
    ],
    eligibilityCriteria: [
      'All residential households in Karnataka with a dedicated domestic electric meter connection.',
      'Applies to tenants and owners alike; only one meter connection per household is eligible.',
      'Household average consumption calculated from previous 12 months + 10% buffer.'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಮನೆಗಳು ಮತ್ತು ಗೃಹ ಬಳಕೆ ಮೀಟರ್ ಸಂಪರ್ಕ ಹೊಂದಿರುವ ನಾಗರಿಕರು.',
      'ಬಾಡಿಗೆದಾರರು ಮತ್ತು ಸ್ವಂತ ಮನೆ ಹೊಂದಿರುವವರಿಬ್ಬರಿಗೂ ಅನ್ವಯ (ಒಂದು ಕುಟುಂಬಕ್ಕೆ ಒಂದು ಮೀಟರ್ ಮಾತ್ರ).',
      'ಹಿಂದಿನ 12 ತಿಂಗಳ ಸರಾಸರಿ ಬಳಕೆಗೆ ಶೇ. 10 ರಷ್ಟು ಹೆಚ್ಚುವರಿ ಯೂನಿಟ್‌ಗಳ ಮಿತಿ.'
    ],
    eligibilityRules: {
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Electricity Bill Account ID (Connection ID from BESCOM/CHESCOM/GESCOM/HESCOM/MESCOM)',
      'Aadhaar Card of the applicant',
      'Rental / Lease agreement or Voter ID showing proof of residence (for tenants)'
    ],
    requiredDocumentsKn: [
      'ವಿದ್ಯುತ್ ಬಿಲ್ ಖಾತೆ ಸಂಖ್ಯೆ (Account ID / Consumer ID)',
      'ಅರ್ಜಿದಾರರ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಬಾಡಿಗೆದಾರರಾಗಿದ್ದಲ್ಲಿ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಪತ್ರ ಅಥವಾ ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ'
    ],
    applicationProcedure: [
      'Apply online via Seva Sindhu (sevasindhu.karnataka.gov.in) or visit Grama One / Karnataka One center.',
      'Enter electricity Account ID, ESCOM name, and Aadhaar number.',
      'Complete Aadhaar OTP verification to link connection.',
      'Eligible zero bill is issued automatically from next billing cycle.'
    ],
    applicationProcedureKn: [
      'ಸೇವಾ ಸಿಂಧು ಪೋರ್ಟಲ್ ಅಥವಾ ಗ್ರಾಮ ಒನ್ / ಕರ್ನಾಟಕ ಒನ್ ಕೇಂದ್ರದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ವಿದ್ಯುತ್ ಖಾತೆ ಸಂಖ್ಯೆ (Account ID) ಮತ್ತು ಆಧಾರ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.',
      'ಆಧಾರ್ ಒಟಿಪಿ (OTP) ಮೂಲಕ ಖಾತ್ರಿಪಡಿಸಿ.',
      'ಮುಂದಿನ ಬಿಲ್ಲಿಂಗ್ ತಿಂಗಳಿಂದ ಅರ್ಹ ಉಚಿತ ಶೂನ್ಯ ಬಿಲ್ ವಿತರಣೆ.'
    ],
    officialUrl: 'https://sevasindhu.karnataka.gov.in',
    helpline: '1912 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'shakti-scheme',
    title: 'Shakti Scheme (Free Bus Travel for Women)',
    titleKn: 'ಶಕ್ತಿ ಯೋಜನೆ (ಮಹಿಳೆಯರಿಗೆ ಉಚಿತ ಬಸ್ ಪ್ರಯಾಣ)',
    department: 'Transport Department, Govt. of Karnataka / KSRTC, BMTC, NWKRTC, KKRTC',
    departmentKn: 'ಸಾರಿಗೆ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ (KSRTC, BMTC, NWKRTC, KKRTC)',
    category: 'citizen',
    categoryLabel: 'Citizen & Social Welfare',
    categoryLabelKn: 'ನಾಗರಿಕ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣ',
    description: '100% free bus travel for all women, students, and transgender persons domiciled in Karnataka across state road transport corporation ordinary, express, and city bus services.',
    descriptionKn: 'ಕರ್ನಾಟಕದ ಮಹಿಳೆಯರು, ವಿದ್ಯಾರ್ಥಿನಿಯರು ಮತ್ತು ಲಿಂಗತ್ವ ಅಲ್ಪಸಂಖ್ಯಾತರಿಗೆ ರಾಜ್ಯ ಸಾರಿಗೆ ಸಂಸ್ಥೆಯ (KSRTC, BMTC, NWKRTC, KKRTC) ಸಾಮಾನ್ಯ ಮತ್ತು ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಬಸ್‌ಗಳಲ್ಲಿ ಸಂಪೂರ್ಣ ಉಚಿತ ಪ್ರಯಾಣ ಕಲ್ಪಿಸುವ ಯೋಜನೆ.',
    benefits: [
      '100% fare waiver on ordinary, express, and city buses within Karnataka state borders.',
      'Zero ticket cost on presenting government-issued photo identity card.'
    ],
    benefitsKn: [
      'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸಾರಿಗೆ ಸಂಸ್ಥೆಗಳ ಬಸ್‌ಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರಯಾಣ.',
      'ಸರಕಾರ ನೀಡಿದ ಫೋಟೋ ಗುರುತಿನ ಚೀಟಿ ತೋರಿಸಿ ಶೂನ್ಯ ದರದ ಟಿಕೆಟ್ ಪಡೆಯುವ ಸೌಲಭ್ಯ.'
    ],
    eligibilityCriteria: [
      'All women and transgender individuals domiciled in the State of Karnataka.',
      'No income, age, or caste restrictions apply.'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದಲ್ಲಿ ವಾಸವಾಗಿರುವ ಎಲ್ಲಾ ಮಹಿಳೆಯರು, ಹೆಣ್ಣು ಮಕ್ಕಳು ಮತ್ತು ತೃತೀಯ ಲಿಂಗಿಗಳು.',
      'ಯಾವುದೇ ಆದಾಯ, ವಯಸ್ಸು ಅಥವಾ ಜಾತಿಯ ಮಿತಿ ಇಲ್ಲ.'
    ],
    eligibilityRules: {
      requiresFemaleHead: false,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Any government photo identity card displaying Karnataka residential address (Aadhaar Card, Voter ID, Driving License, or BPL/APL Ration Card)'
    ],
    requiredDocumentsKn: [
      'ಕರ್ನಾಟಕದ ವಿಳಾಸವಿರುವ ಸರಕಾರಿ ಫೋಟೋ ಗುರುತಿನ ಚೀಟಿ (ಆಧಾರ್ ಕಾರ್ಡ್, ವೋಟರ್ ಐಡಿ, ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಅಥವಾ ಪಡಿತರ ಚೀಟಿ)'
    ],
    applicationProcedure: [
      'Board eligible KSRTC / BMTC / NWKRTC / KKRTC bus within Karnataka.',
      'Display official photo ID card with Karnataka address to conductor.',
      'Conductor issues zero-fare Shakti ticket.'
    ],
    applicationProcedureKn: [
      'ಕರ್ನಾಟಕದ ಒಳಗೆ ಸಂಚರಿಸುವ ನಿಗಮದ ಬಸ್ಸುಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ.',
      'ನಿರ್ವಾಹಕರಿಗೆ ಕರ್ನಾಟಕ ವಿಳಾಸವಿರುವ ಅಧಿಕೃತ ಫೋಟೋ ಗುರುತಿನ ಚೀಟಿ ತೋರಿಸಿ.',
      'ನಿರ್ವಾಹಕರಿಂದ ಉಚಿತ ಶಕ್ತಿ ಟಿಕೆಟ್ ಪಡೆದು ಪ್ರಯಾಣಿಸಿ.'
    ],
    officialUrl: 'https://ksrtc.karnataka.gov.in',
    helpline: '080-49596666 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'anna-bhagya',
    title: 'Anna Bhagya Scheme (Free Food Grains & Cash DBT)',
    titleKn: 'ಅನ್ನಭಾಗ್ಯ ಯೋಜನೆ (ಉಚಿತ ಆಹಾರ ಧಾನ್ಯ ಮತ್ತು ನಗದು ಡಿಬಿಟಿ)',
    department: 'Food, Civil Supplies and Consumer Affairs Department',
    departmentKn: 'ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ',
    category: 'food',
    categoryLabel: 'Food & Civil Supplies',
    categoryLabelKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು',
    description: 'Guarantees 10 kg of food grains per person per month for BPL and Antyodaya cardholders, comprising 5 kg free Central rice under NFSA + ₹170 per person per month DBT in lieu of State 5 kg rice.',
    descriptionKn: 'ಅಂತ್ಯೋದಯ ಮತ್ತು ಬಿಪಿಎಲ್ (BPL) ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರುವ ಪ್ರತಿ ಸದಸ್ಯರಿಗೆ ಮಾಸಿಕ 10 ಕೆಜಿ ಆಹಾರ ಧಾನ್ಯ ಖಾತರಿ: 5 ಕೆಜಿ ಉಚಿತ ಅಕ್ಕಿ ಮತ್ತು ಉಳಿದ 5 ಕೆಜಿಗೆ ಪ್ರತಿಯೊಬ್ಬರಿಗೆ ತಿಂಗಳಿಗೆ ₹170 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
    benefits: [
      '5 kg free rice per beneficiary per month under NFSA.',
      'Cash transfer of ₹170 per person per month credited directly to the woman head of household bank account.',
      'Antyodaya Anna Yojana (AAY) families receive fixed 35 kg food grains per card.'
    ],
    benefitsKn: [
      'ಪ್ರತಿ ಸದಸ್ಯರಿಗೆ ತಿಂಗಳಿಗೆ 5 ಕೆಜಿ ಉಚಿತ ಅಕ್ಕಿ.',
      'ಉಳಿದ 5 ಕೆಜಿ ಬದಲಿಗೆ ಪ್ರತಿ ಸದಸ್ಯರಿಗೆ ತಿಂಗಳಿಗೆ ₹170 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
      'ಅಂತ್ಯೋದಯ (AAY) ಕುಟುಂಬಗಳಿಗೆ ಪ್ರತಿ ಕಾರ್ಡಿಗೆ ಕನಿಷ್ಠ 35 ಕೆಜಿ ಆಹಾರ ಧಾನ್ಯ ಖಾತರಿ.'
    ],
    eligibilityCriteria: [
      'Must hold an active BPL (Priority Household) or AAY (Antyodaya) ration card in Karnataka.',
      'Head of family must have Aadhaar-linked active bank account enabled for NPCI direct credit.'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದಲ್ಲಿ ಸಕ್ರಿಯ ಬಿಪಿಎಲ್ (BPL) ಅಥವಾ ಅಂತ್ಯೋದಯ (AAY) ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರಬೇಕು.',
      'ಕುಟುಂಬದ ಯಜಮಾನಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಮತ್ತು NPCI ಲಿಂಕ್ ಆಗಿರಬೇಕು.'
    ],
    eligibilityRules: {
      requiresBpl: true,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'BPL / AAY Ration Card',
      'Aadhaar numbers of all family members listed on card',
      'Aadhaar-linked Bank account of woman head of household'
    ],
    requiredDocumentsKn: [
      'ಬಿಪಿಎಲ್ ಅಥವಾ ಅಂತ್ಯೋದಯ ಪಡಿತರ ಚೀಟಿ',
      'ಕಾರ್ಡಿನಲ್ಲಿರುವ ಎಲ್ಲಾ ಸದಸ್ಯರ ಆಧಾರ್ ಸಂಖ್ಯೆಗಳು',
      'ಮಹಿಳಾ ಮುಖ್ಯಸ್ಥೆಯ ಆಧಾರ್ ಜೋಡಣೆಯಾದ ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್'
    ],
    applicationProcedure: [
      'Eligible ration cardholders are enrolled automatically based on Ahara portal data.',
      'Verify Aadhaar seeding status on ahara.kar.nic.in portal.',
      'Cash entitlement credited on 15th-25th of every calendar month.'
    ],
    applicationProcedureKn: [
      'ಆಹಾರ ಪೋರ್ಟಲ್‌ನಲ್ಲಿರುವ ಅರ್ಹ ಕಾರ್ಡುದಾರರಿಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೌಲಭ್ಯ ಲಭ್ಯ.',
      'ಆಹಾರ ವೆಬ್‌ಸೈಟ್ (ahara.kar.nic.in) ನಲ್ಲಿ ಡಿಬಿಟಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿಕೊಳ್ಳಿ.',
      'ಪ್ರತಿ ತಿಂಗಳು ನಿಗದಿತ ದಿನಾಂಕದೊಳಗೆ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನಗದು ಜಮೆ.'
    ],
    officialUrl: 'https://ahara.kar.nic.in',
    helpline: '1967 / 1800-425-9339',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'ganga-kalyana',
    title: 'Ganga Kalyana Scheme (Free Irrigation Borewells)',
    titleKn: 'ಗಂಗಾ ಕಲ್ಯಾಣ ಯೋಜನೆ (ಉಚಿತ ನೀರಾವರಿ ಕೊಳವೆಬಾವಿ)',
    department: 'Social Welfare / Backward Classes / Minorities Development Corporations',
    departmentKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಅಭಿವೃದ್ಧಿ ನಿಗಮಗಳು (ಅಂಬೇಡ್ಕರ್, ಡಿ. ದೇವರಾಜ ಅರಸು, KMDC)',
    category: 'farmer',
    categoryLabel: 'Farmer & Agriculture',
    categoryLabelKn: 'ರೈತ ಮತ್ತು ಕೃಷಿ',
    description: 'Provides free individual or community irrigation borewells, casing pipes, submersible pumps, and electricity energization for small/marginal farmers belonging to SC, ST, OBC, and Minority communities.',
    descriptionKn: 'ಪರಿಶಿಷ್ಟ ಜಾತಿ, ಪರಿಶಿಷ್ಟ ಪಂಗಡ, ಹಿಂದುಳಿದ ವರ್ಗ ಹಾಗೂ ಅಲ್ಪಸಂಖ್ಯಾತ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರ ಜಮೀನುಗಳಿಗೆ ಸರಕಾರದ ವತಿಯಿಂದ ಸಂಪೂರ್ಣ ಉಚಿತ ಕೊಳವೆಬಾವಿ ಕೊರೆದು, ಪಂಪ್‌ಸೆಟ್ ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ಯೋಜನೆ.',
    benefits: [
      'Complete funding up to ₹3.50 lakh for individual borewell drilling, casing, and pump set.',
      'Up to ₹4.50 lakh for community lift irrigation borewells for groups of farmers.',
      'Free power transmission line and electrical transformer setup by ESCOM.'
    ],
    benefitsKn: [
      'ವೈಯಕ್ತಿಕ ಕೊಳವೆಬಾವಿ ಕೊರೆಯಲು, ಪಂಪ್ ಮತ್ತು ಮೋಟಾರ್ ಅಳವಡಿಕೆಗೆ ₹3.50 ಲಕ್ಷದವರೆಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ ಅನುದಾನ.',
      'ರೈತರ ಗುಂಪಿಗೆ ಸಮುದಾಯ ನೀರಾವರಿ ಯೋಜನೆಗೆ ₹4.50 ಲಕ್ಷದವರೆಗೆ ನೆರವು.',
      'ಎಸ್ಕಾಂ ವತಿಯಿಂದ ಉಚಿತ ವಿದ್ಯುತ್ ಲೈನ್ ಮತ್ತು ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ಸಂಪರ್ಕ.'
    ],
    eligibilityCriteria: [
      'Applicant must belong to SC, ST, Backward Classes, or Minority community.',
      'Must possess minimum 1.5 to 5 acres of dry agricultural land (2 to 5 contiguous acres for group).',
      'Annual family income must not exceed ₹1.5 lakh for rural areas (₹2.0 lakh for urban).',
      'No other member of family should have availed Ganga Kalyana benefit earlier.'
    ],
    eligibilityCriteriaKn: [
      'ಪರಿಶಿಷ್ಟ ಜಾತಿ, ಪರಿಶಿಷ್ಟ ಪಂಗಡ, ಹಿಂದುಳಿದ ವರ್ಗ ಅಥವಾ ಅಲ್ಪಸಂಖ್ಯಾತ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿದ ರೈತರು.',
      'ಕನಿಷ್ಠ 1.5 ರಿಂದ 5 ಎಕರೆ ಒಣಭೂಮಿ ಹೊಂದಿರಬೇಕು.',
      'ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ಗ್ರಾಮೀಣ ಪ್ರದೇಶದಲ್ಲಿ ₹1.5 ಲಕ್ಷ ಮೀರಿರಬಾರದು.',
      'ಕುಟುಂಬದಲ್ಲಿ ಯಾರೊಬ್ಬರೂ ಈ ಹಿಂದೆ ಗಂಗಾ ಕಲ್ಯಾಣ ಸೌಲಭ್ಯ ಪಡೆದಿರಬಾರದು.'
    ],
    eligibilityRules: {
      requiresLand: true,
      requiresRural: true,
      maxIncome: 150000,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Caste and Income certificate RD number from Nada Kacheri',
      'Bhoomi RTC and Land Tax receipt',
      'Groundwater Authority feasibility certificate (Hydrologist report)',
      'Aadhaar card and Bank passbook'
    ],
    requiredDocumentsKn: [
      'ನಾಡಕಚೇರಿಯ ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (RD ಸಂಖ್ಯೆ)',
      'ಭೂಮಿ ಪಹಣಿ (RTC) ಮತ್ತು ಕಂದಾಯ ರಸೀದಿ',
      'ಅಂತರ್ಜಲ ಇಲಾಖೆಯ ತಜ್ಞರ ಕೊಳವೆಬಾವಿ ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿ',
      'ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ'
    ],
    applicationProcedure: [
      'Apply online on Seva Sindhu or dedicated corporation portal during annual notification window.',
      'Scrutiny and spot verification by District Manager and Groundwater Geologist.',
      'Sanction approved by Taluk Level Committee headed by MLA/Tahsildar.',
      'Drilling and installation executed through empanelled government agencies.'
    ],
    applicationProcedureKn: [
      'ಅರ್ಜಿ ಕರೆಯಲಾದ ಅವಧಿಯಲ್ಲಿ ಸೇವಾ ಸಿಂಧು ಅಥವಾ ನಿಗಮದ ವೆಬ್‌ಸೈಟ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ನಿಗಮದ ಜಿಲ್ಲಾ ವ್ಯವಸ್ಥಾಪಕರು ಮತ್ತು ಭೂಗರ್ಭ ವಿಜ್ಞಾನಿಗಳಿಂದ ಸ್ಥಳ ಪರಿಶೀಲನೆ.',
      'ಶಾಸಕರ ನೇತೃತ್ವದ ತಾಲೂಕು ಮಟ್ಟದ ಆಯ್ಕೆ ಸಮಿತಿಯಿಂದ ಮಂಜೂರಾತಿ.',
      'ಸರಕಾರದ ಅಧಿಕೃತ ಏಜೆನ್ಸಿಗಳ ಮೂಲಕ ಬೋರ್‌ವೆಲ್ ಕೊರೆಯುವಿಕೆ ಮತ್ತು ಪಂಪ್ ಅಳವಡಿಕೆ.'
    ],
    officialUrl: 'https://sw.kar.nic.in',
    helpline: '080-22207784 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'swavalambi-sarathi',
    title: 'Swavalambi Sarathi Vehicle Subsidy Scheme',
    titleKn: 'ಸ್ವಾವಲಂಬಿ ಸಾರಥಿ ಯೋಜನೆ (ವಾಹನ ಖರೀದಿ ಸಬ್ಸಿಡಿ)',
    department: 'Karnataka Minorities / Backward Classes Development Corporation',
    departmentKn: 'ಕರ್ನಾಟಕ ಅಲ್ಪಸಂಖ್ಯಾತರ / ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಅಭಿವೃದ್ಧಿ ನಿಗಮ (KMDC / D. Devaraj Urs)',
    category: 'business',
    categoryLabel: 'Business & MSME',
    categoryLabelKn: 'ಉದ್ಯಮ ಮತ್ತು ಕೈಗಾರಿಕೆ',
    description: 'Provides 50% capital subsidy (up to ₹3.00 lakh) for unemployed youth purchasing commercial four-wheelers (taxis, passenger autos, delivery vans, tractors) through bank linkage.',
    descriptionKn: 'ನಿರುದ್ಯೋಗಿ ಯುವಕರು ಸ್ವಯಂ ಉದ್ಯೋಗಕ್ಕಾಗಿ ವಾಣಿಜ್ಯ ವಾಹನಗಳನ್ನು (ಟ್ಯಾಕ್ಸಿ, ಸರಕು ಸಾಗಣೆ ವಾಹನ, ಟ್ರ್ಯಾಕ್ಟರ್) ಖರೀದಿಸಲು ಶೇ. 50 ರಷ್ಟು (ಗರಿಷ್ಠ ₹3.00 ಲಕ್ಷ) ಸಬ್ಸಿಡಿ ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      '50% margin money subsidy on vehicle on-road price, up to a maximum of ₹3.0 lakh.',
      'Remaining loan balance financed through scheduled commercial banks at subsidized interest.'
    ],
    benefitsKn: [
      'ವಾಹನದ ಒಟ್ಟು ಮೊತ್ತದ ಶೇ. 50 ರಷ್ಟು (ಗರಿಷ್ಠ ₹3.0 ಲಕ್ಷ) ಸರಕಾರದಿಂದ ನೇರ ಸಬ್ಸಿಡಿ.',
      'ಉಳಿದ ಮೊತ್ತಕ್ಕೆ ಬ್ಯಾಂಕ್ ಮೂಲಕ ಸುಲಭ ಸಾಲ ಸೌಲಭ್ಯ.'
    ],
    eligibilityCriteria: [
      'Applicant aged 21 to 45 years belonging to Religious Minorities or Backward Classes.',
      'Must possess a valid Yellow Badge / Commercial Driving License (LMV-TR / Transport).',
      'Annual family income must be below ₹3.50 lakh in rural areas.',
      'Must not have availed vehicle subsidy under any other state corporation.'
    ],
    eligibilityCriteriaKn: [
      '21 ರಿಂದ 45 ವರ್ಷ ವಯಸ್ಸಿನ ಅಲ್ಪಸಂಖ್ಯಾತ ಅಥವಾ ಹಿಂದುಳಿದ ವರ್ಗದ ಅಭ್ಯರ್ಥಿಗಳು.',
      'ಮಾನ್ಯತೆ ಪಡೆದ ವಾಣಿಜ್ಯ ವಾಹನ ಚಾಲನಾ ಪರವಾನಗಿ (Commercial Driving License) ಹೊಂದಿರಬೇಕು.',
      'ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ₹3.50 ಲಕ್ಷ ಮೀರಬಾರದು.',
      'ಈ ಹಿಂದೆ ಯಾವುದೇ ನಿಗಮದಿಂದ ವಾಹನ ಸಬ್ಸಿಡಿ ಪಡೆದಿರಬಾರದು.'
    ],
    eligibilityRules: {
      minAge: 21,
      maxAge: 45,
      maxIncome: 350000,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Commercial Driving License (Yellow Board / Transport endorsement)',
      'Nada Kacheri Caste and Income Certificate',
      'Aadhaar card and residential proof',
      'Vehicle proforma quotation from authorized dealer'
    ],
    requiredDocumentsKn: [
      'ವಾಣಿಜ್ಯ ಚಾಲನಾ ಪರವಾನಗಿ ಪತ್ರ (Commercial DL)',
      'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
      'ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ವಾಸಸ್ಥಳ ದೃಢೀಕರಣ ಪತ್ರ',
      'ಅಧಿಕೃತ ಡೀಲರ್‌ನಿಂದ ವಾಹನದ ಕೊಟೇಶನ್ (Quotation)'
    ],
    applicationProcedure: [
      'Apply online on KMDC / Seva Sindhu portal.',
      'Upload DL, quotation, and caste certificate.',
      'Interview and document scrutiny by District Corporation Committee.',
      'Subsidy released directly to financing bank upon loan sanction.'
    ],
    applicationProcedureKn: [
      'ಸೇವಾ ಸಿಂಧು ಅಥವಾ ಕೆಎಂಡಿಸಿ ಪೋರ್ಟಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ಚಾಲನಾ ಪರವಾನಗಿ ಮತ್ತು ಕೊಟೇಶನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      'ಜಿಲ್ಲಾ ಸಮಿತಿಯಿಂದ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಂದರ್ಶನ.',
      'ಬ್ಯಾಂಕ್ ಸಾಲ ಮಂಜೂರಾದ ನಂತರ ಸಬ್ಸಿಡಿ ಮೊತ್ತ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್‌ಗೆ ಜಮೆ.'
    ],
    officialUrl: 'https://kmdc.karnataka.gov.in',
    helpline: '080-22864545 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'vidya-siri',
    title: 'Vidya Siri Scheme (Food & Accommodation Assistance)',
    titleKn: 'ವಿದ್ಯಾ ಸಿರಿ ಯೋಜನೆ (ಊಟ ಮತ್ತು ವಸತಿ ಸಹಾಯ ಯೋಜನೆ)',
    department: 'Backward Classes Welfare Department (BCWD), Govt. of Karnataka',
    departmentKn: 'ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ (BCWD), ಕರ್ನಾಟಕ ಸರಕಾರ',
    category: 'student',
    categoryLabel: 'Youth & Education',
    categoryLabelKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ',
    description: 'Monthly financial stipend of ₹1,500 per month for 10 months (₹15,000/year) for rural post-matric students who could not get admission into government department hostels.',
    descriptionKn: 'ಸರಕಾರಿ ಹಾಸ್ಟೆಲ್‌ಗಳಲ್ಲಿ ಪ್ರವೇಶಾವಕಾಶ ಸಿಗದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಊಟ ಮತ್ತು ವಸತಿಗಾಗಿ ಮಾಸಿಕ ₹1,500 (ವಾರ್ಷಿಕ ₹15,000) ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      'Monthly financial assistance of ₹1,500 credited via DBT for 10 academic months.',
      'Reduces hostel deficit barriers for rural students studying in taluk and district headquarters.'
    ],
    benefitsKn: [
      'ಶೈಕ್ಷಣಿಕ ಸಾಲಿನ 10 ತಿಂಗಳುಗಳ ಕಾಲ ಮಾಸಿಕ ₹1,500 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
      'ಗ್ರಾಮೀಣ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ನಗರ ಪ್ರದೇಶಗಳಲ್ಲಿ ಶಿಕ್ಷಣ ಮುಂದುವರಿಸಲು ವಸತಿ ಮತ್ತು ಊಟದ ಭದ್ರತೆ.'
    ],
    eligibilityCriteria: [
      'Karnataka domicile student studying in Post-Matric courses (PUC, Diploma, Degree, PG, Engineering, Medicine).',
      'Belonging to Backward Classes (Cat-1, 2A, 2B, 3A, 3B).',
      'Family annual income must be below ₹2.50 lakh (Cat-1) or ₹1.00 lakh (2A, 2B, 3A, 3B).',
      'Student native place must be at least 5 km away from college town, and student must not reside in any government hostel.'
    ],
    eligibilityCriteriaKn: [
      'ಮೆಟ್ರಿಕ್ ನಂತರದ ಕೋರ್ಸ್‌ಗಳಲ್ಲಿ (ಪಿಯುಸಿ, ಪದವಿ, ಡಿಪ್ಲೊಮಾ, ಎಂಜಿನಿಯರಿಂಗ್, ಮೆಡಿಕಲ್) ಓದುತ್ತಿರುವ ವಿದ್ಯಾರ್ಥಿಗಳು.',
      'ಹಿಂದುಳಿದ ವರ್ಗಗಳ (ಪ್ರವರ್ಗ-1, 2A, 2B, 3A, 3B) ಸಮುದಾಯಕ್ಕೆ ಸೇರಿದವರಾಗಿರಬೇಕು.',
      'ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ: ಪ್ರವರ್ಗ-1 ಕ್ಕೆ ₹2.50 ಲಕ್ಷ, ಇತರೆ ಪ್ರವರ್ಗಗಳಿಗೆ ₹1.00 ಲಕ್ಷದ ಮಿತಿ.',
      'ಕಾಲೇಜು ಮತ್ತು ಊರಿನ ನಡುವೆ ಕನಿಷ್ಠ 5 ಕಿ.ಮೀ ಅಂತರವಿರಬೇಕು ಮತ್ತು ಯಾವುದೇ ಸರಕಾರಿ ಹಾಸ್ಟೆಲ್‌ನಲ್ಲಿ ಇರಬಾರದು.'
    ],
    eligibilityRules: {
      requiresStudent: true,
      maxIncome: 250000,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Student SATS ID / SSP Registration number',
      'Caste and Income Certificate (RD number from Nada Kacheri)',
      'College bonafide study certificate with fee receipt',
      'Aadhaar seeded bank passbook'
    ],
    requiredDocumentsKn: [
      'ವಿದ್ಯಾರ್ಥಿಯ SATS ಐಡಿ ಅಥವಾ SSP ನೋಂದಣಿ ಸಂಖ್ಯೆ',
      'ನಾಡಕಚೇರಿಯ ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (RD ಸಂಖ್ಯೆ)',
      'ಕಾಲೇಜು ಪ್ರವೇಶ ಮತ್ತು ಶುಲ್ಕ ರಸೀದಿ (Bonafide Certificate)',
      'ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ'
    ],
    applicationProcedure: [
      'Apply online via State Scholarship Portal (ssp.postmatric.karnataka.gov.in).',
      'Select Vidya Siri option under Backward Classes Welfare Department.',
      'Submit e-Attestation of study details with college principal.',
      'Funds disbursed directly to bank account upon verification.'
    ],
    applicationProcedureKn: [
      'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ (ssp.postmatric.karnataka.gov.in) ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆಯಡಿ ವಿದ್ಯಾಸಿರಿ ಆಯ್ಕೆ ಮಾಡಿ.',
      'ಕಾಲೇಜು ಪ್ರಾಂಶುಪಾಲರಿಂದ ಇ-ದೃಢೀಕರಣ (e-Attestation) ಮಾಡಿಸಿ.',
      'ಇಲಾಖಾ ಪರಿಶೀಲನೆಯ ನಂತರ ವಿದ್ಯಾರ್ಥಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಹಣ ಜಮೆ.'
    ],
    officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
    helpline: '080-35254757 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'matru-poorna',
    title: 'Matru Poorna Scheme (Nutritious Meal for Mothers)',
    titleKn: 'ಮಾತೃಪೂರ್ಣ ಯೋಜನೆ (ಗರ್ಭಿಣಿಯರಿಗೆ ಬಿಸಿಯೂಟ ಯೋಜನೆ)',
    department: 'Department of Women & Child Development, Govt. of Karnataka',
    departmentKn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ',
    category: 'health',
    categoryLabel: 'Health Services',
    categoryLabelKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು',
    description: 'Provides one complete hot cooked nutritious mid-day meal, boiled egg/sprouted grains, milk, and iron-folic acid tablets daily to pregnant and lactating rural mothers at local Anganwadi centers.',
    descriptionKn: 'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ಗರ್ಭಿಣಿ ಮತ್ತು ಬಾಣಂತಿಯರಲ್ಲಿ ಅಪೌಷ್ಟಿಕತೆ ಹಾಗೂ ರಕ್ತಹೀನತೆ ತಡೆಗಟ್ಟಲು ಅಂಗನವಾಡಿ ಕೇಂದ್ರಗಳಲ್ಲಿ ಪ್ರತಿದಿನ ಒಂದು ಪೌಷ್ಟಿಕ ಬಿಸಿಯೂಟ, ಮೊಟ್ಟೆ/ಕಾಳು, ಹಾಲು ಮತ್ತು ಐರನ್ ಮಾತ್ರೆ ನೀಡುವ ಯೋಜನೆ.',
    benefits: [
      'One full hot cooked nutritious meal meeting 40-45% of daily calorie and 50% of protein requirement.',
      '200 ml boiled milk and 1 boiled egg (or sprouted grains for vegetarians) 6 days a week.',
      'Free ante-natal and post-natal health monitoring and immunization counseling.'
    ],
    benefitsKn: [
      'ಪ್ರತಿದಿನ ಮಧ್ಯಾಹ್ನ ಅಂಗನವಾಡಿಯಲ್ಲಿ ಉಚಿತ ಪೌಷ್ಟಿಕ ಬಿಸಿಯೂಟ.',
      'ವಾರದ 6 ದಿನಗಳು ಬೇಯಿಸಿದ ಮೊಟ್ಟೆ ಅಥವಾ ಮೊಳಕೆ ಕಾಳುಗಳು ಮತ್ತು 200 ಮಿ.ಲೀ ಹಾಲು.',
      'ಗರ್ಭಾವಸ್ಥೆಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮತ್ತು ಮಗುವಿನ ಲಸಿಕೆ ಮಾರ್ಗದರ್ಶನ.'
    ],
    eligibilityCriteria: [
      'All pregnant women and lactating mothers up to 6 months post-delivery residing in rural Karnataka.',
      'Registered with local Anganwadi worker and Primary Health Center (PHC).'
    ],
    eligibilityCriteriaKn: [
      'ಗ್ರಾಮೀಣ ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಗರ್ಭಿಣಿಯರು ಮತ್ತು 6 ತಿಂಗಳವರೆಗೆ ಹಾಲುಣಿಸುವ ಬಾಣಂತಿಯರು.',
      'ಸ್ಥಳೀಯ ಅಂಗನವಾಡಿ ಕೇಂದ್ರ ಮತ್ತು ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ (PHC) ನೋಂದಾಯಿತರಾಗಿರಬೇಕು.'
    ],
    eligibilityRules: {
      requiresRural: true,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Mother and Child Protection Card (MCP Card / Thayi Card)',
      'Aadhaar card of mother',
      'Anganwadi registration record'
    ],
    requiredDocumentsKn: [
      'ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ರಕ್ಷಣಾ ಕಾರ್ಡ್ (ತಾಯಿ ಕಾರ್ಡ್ / MCP Card)',
      'ತಾಯಿಯ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಅಂಗನವಾಡಿ ನೋಂದಣಿ ಪುಸ್ತಕದ ಮಾಹಿತಿ'
    ],
    applicationProcedure: [
      'Enroll at nearest rural Anganwadi Center within the first trimester of pregnancy.',
      'Obtain Thayi Card from Village Health Worker (ASHA / ANM).',
      'Avail daily nutritious meal at Anganwadi center from 11:30 AM to 1:30 PM.'
    ],
    applicationProcedureKn: [
      'ಗರ್ಭಧಾರಣೆಯ ಮೊದಲ ಮೂರು ತಿಂಗಳೊಳಗೆ ಸಮೀಪದ ಅಂಗನವಾಡಿ ಕೇಂದ್ರದಲ್ಲಿ ನೋಂದಾಯಿಸಿ.',
      'ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯಿಂದ ತಾಯಿ ಕಾರ್ಡ್ ಪಡೆದುಕೊಳ್ಳಿ.',
      'ಪ್ರತಿದಿನ ಮಧ್ಯಾಹ್ನ 11:30 ರಿಂದ 1:30 ರವರೆಗೆ ಅಂಗನವಾಡಿಯಲ್ಲಿ ಬಿಸಿಯೂಟ ಸವಿಯಿರಿ.'
    ],
    officialUrl: 'https://wcd.karnataka.gov.in',
    helpline: '181 (Women Helpline) / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'cmegp-subsidy',
    title: 'Chief Minister Employment Generation Programme (CMEGP)',
    titleKn: 'ಮುಖ್ಯಮಂತ್ರಿ ಉದ್ಯೋಗ ಸೃಜನ ಯೋಜನೆ (CMEGP)',
    department: 'Department of Commerce and Industries, Govt. of Karnataka',
    departmentKn: 'ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರಕಾರ',
    category: 'business',
    categoryLabel: 'Business & MSME',
    categoryLabelKn: 'ಉದ್ಯಮ ಮತ್ತು ಕೈಗಾರಿಕೆ',
    description: 'Credit-linked margin money subsidy up to 35% on manufacturing project costs up to ₹25.0 lakh and service projects up to ₹10.0 lakh for rural entrepreneurs and youth setting up micro-enterprises.',
    descriptionKn: 'ಗ್ರಾಮೀಣ ನಿರುದ್ಯೋಗಿ ಯುವಕರು ಮತ್ತು ಉದ್ಯಮಿಗಳು ಹೊಸ ಸಣ್ಣ ಕೈಗಾರಿಕೆ ಅಥವಾ ಸೇವಾ ಘಟಕಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ಶೇಕಡಾ 25 ರಿಂದ 35 ರಷ್ಟು ಸರಕಾರಿ ಸಬ್ಸಿಡಿ ನೀಡುವ ಯೋಜನೆ (ಯೋಜನಾ ವೆಚ್ಚ ಗರಿಷ್ಠ ₹25 ಲಕ್ಷ).',
    benefits: [
      'Up to 35% margin money subsidy on project cost for rural and special category entrepreneurs (SC/ST/Women/Minority/OBC).',
      'Up to 25% subsidy for general category entrepreneurs.',
      'Bank loan covering 90% to 95% of total project investment.'
    ],
    benefitsKn: [
      'ಗ್ರಾಮೀಣ ಪ್ರದೇಶ ಮತ್ತು ವಿಶೇಷ ವರ್ಗದವರಿಗೆ (SC/ST/ಮಹಿಳೆಯರು/ಅಲ್ಪಸಂಖ್ಯಾತರು) ಶೇಕಡಾ 35 ರಷ್ಟು ಸಬ್ಸಿಡಿ.',
      'ಸಾಮಾನ್ಯ ವರ್ಗದವರಿಗೆ ಶೇಕಡಾ 25 ರಷ್ಟು ಸರಕಾರಿ ಸಬ್ಸಿಡಿ.',
      'ಉಳಿದ ಶೇ. 90-95 ರಷ್ಟು ಮೊತ್ತಕ್ಕೆ ಬ್ಯಾಂಕ್ ಸಾಲ ಸೌಲಭ್ಯ.'
    ],
    eligibilityCriteria: [
      'Age between 21 and 45 years (up to 50 years for SC, ST, Women, Minorities, Ex-servicemen).',
      'Minimum educational qualification: 8th standard pass.',
      'Project setup must be located in Karnataka; preference given to rural Gram Panchayat areas.'
    ],
    eligibilityCriteriaKn: [
      '21 ರಿಂದ 45 ವರ್ಷ ವಯಸ್ಸು (ಪರಿಶಿಷ್ಟ ಜಾತಿ, ಪಂಗಡ, ಮಹಿಳೆಯರು ಮತ್ತು ವಿಶೇಷ ವರ್ಗಕ್ಕೆ 50 ವರ್ಷಗಳವರೆಗೆ ಸಡಿಲಿಕೆ).',
      'ಕನಿಷ್ಠ 8ನೇ ತರಗತಿ ತೇರ್ಗಡೆಯಾಗಿರಬೇಕು.',
      'ಕರ್ನಾಟಕದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ, ವಿಶೇಷವಾಗಿ ಗ್ರಾಮೀಣ ಪಂಚಾಯಿತಿ ಪ್ರದೇಶದಲ್ಲಿ ಉದ್ದಿಮೆ ಸ್ಥಾಪಿಸಬೇಕು.'
    ],
    eligibilityRules: {
      minAge: 21,
      maxAge: 50,
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Detailed Project Report (DPR) / Machinery Quotations',
      'Educational certificate (8th/10th marks card)',
      'Caste and Income certificate from Nada Kacheri',
      'Entrepreneurship Development Training (EDP) completion certificate (can be completed post-selection)'
    ],
    requiredDocumentsKn: [
      'ಉದ್ದಿಮೆಯ ವಿಸ್ತೃತ ಯೋಜನಾ ವರದಿ (DPR) ಮತ್ತು ಯಂತ್ರೋಪಕರಣಗಳ ಕೊಟೇಶನ್',
      'ವಿದ್ಯಾರ್ಹತೆ ಪ್ರಮಾಣಪತ್ರ (8ನೇ ಅಥವಾ 10ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ)',
      'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
      'ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ಜಮೀನು/ಬಾಡಿಗೆ ಜಾಗದ ಒಪ್ಪಂದ ಪತ್ರ'
    ],
    applicationProcedure: [
      'Apply online on official CMEGP portal (cmegp.kar.nic.in).',
      'Submit Project Report and select preferred financing bank.',
      'Joint District Level Task Force Committee (DLTFC) evaluates business viability.',
      'Subsidy deposited to bank as term deposit for 3 years, then adjusted against loan.'
    ],
    applicationProcedureKn: [
      'ಅಧಿಕೃತ CMEGP ಪೋರ್ಟಲ್ (cmegp.kar.nic.in) ನಲ್ಲಿ ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ಯೋಜನಾ ವರದಿ (DPR) ಮತ್ತು ಯಂತ್ರಗಳ ವಿವರ ನಮೂದಿಸಿ ಬ್ಯಾಂಕ್ ಆಯ್ಕೆ ಮಾಡಿ.',
      'ಜಿಲ್ಲಾ ಕಾರ್ಯಪಡೆ ಸಮಿತಿಯಿಂದ ಪ್ರಾಜೆಕ್ಟ್ ಪರಿಶೀಲನೆ ಮತ್ತು ಅನುಮೋದನೆ.',
      'ಬ್ಯಾಂಕ್ ಸಾಲ ಮಂಜೂರಾದ ಬಳಿಕ ಸರಕಾರಿ ಸಬ್ಸಿಡಿ ಬಿಡುಗಡೆ.'
    ],
    officialUrl: 'https://cmegp.kar.nic.in',
    helpline: '080-22268711 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },

  // ===========================================================================
  // 3. STATUTORY CITIZEN SERVICES & REVENUE CERTIFICATES (SEVA SINDHU / NADA KACHERI)
  // ===========================================================================
  {
    id: 'caste-income-cert',
    title: 'Caste & Income Certificate (Form RD0038 / Sakala)',
    titleKn: 'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (ಫಾರಂ RD0038 / ಸಕಾಲ)',
    department: 'Revenue Department / Atalji Janasnehi Kendra (Nada Kacheri)',
    departmentKn: 'ಕಂದಾಯ ಇಲಾಖೆ / ಅಟಲ್ ಜೀ ಜನಸ್ನೇಹಿ ಕೇಂದ್ರ (ನಾಡಕಚೇರಿ)',
    category: 'it_services',
    categoryLabel: 'IT & Digital Services',
    categoryLabelKn: 'ಐಟಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಸೇವೆಗಳು',
    description: 'Statutory certificate issued by Revenue Department establishing a citizen’s caste category (SC/ST/Cat-1/2A/2B/3A/3B) and annual household income, essential for all government scholarships, schemes, and quotas.',
    descriptionKn: 'ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರ ಸರಕಾರದ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿವೇತನ, ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಹಾಗೂ ಮೀಸಲಾತಿ ಸೌಲಭ್ಯ ಪಡೆಯಲು ಕಂದಾಯ ಇಲಾಖೆಯಿಂದ ವಿತರಿಸಲಾಗುವ ಅಧಿಕೃತ ಜಾತಿ ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (ಸಕಾಲ ಸೇವೆ).',
    benefits: [
      'Legally binding digital certificate with tamper-proof QR code and digital signature of Tahsildar.',
      'Guaranteed 21-day Sakala delivery timeline.',
      'Universal prerequisite for SSP scholarships, housing, and government subsidies.'
    ],
    benefitsKn: [
      'ತಹಶೀಲ್ದಾರ್ ಡಿಜಿಟಲ್ ಸಹಿ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ (QR Code) ಹೊಂದಿರುವ ಮಾನ್ಯತೆ ಪಡೆದ ಪ್ರಮಾಣಪತ್ರ.',
      'ಸಕಾಲ ಕಾಯ್ದೆಯಡಿ ಗರಿಷ್ಠ 21 ದಿನಗಳಲ್ಲಿ ಖಾತರಿ ವಿತರಣೆ.',
      'ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಸರಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಕಡ್ಡಾಯ ದಾಖಲೆ.'
    ],
    eligibilityCriteria: [
      'Any permanent resident of Karnataka claiming belonging to designated backward classes or seeking income certification.',
      'Verification conducted through Village Administrative Officer (VAO) and Revenue Inspector (RI).'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದಲ್ಲಿ ಖಾಯಂ ಆಗಿ ವಾಸಿಸುತ್ತಿರುವ ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕರು.',
      'ಗ್ರಾಮ ಆಡಳಿತಾಧಿಕಾರಿ (VAO) ಮತ್ತು ಕಂದಾಯ ನಿರೀಕ್ಷಕರಿಂದ (RI) ಸ್ಥಳ ಪರಿಶೀಲನೆ.'
    ],
    eligibilityRules: {
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Aadhaar card of applicant and parent/guardian',
      'Ration Card / Voter ID copy',
      'Previous caste certificate or school transfer certificate (TC) showing caste',
      'Salary slip / Land RTC / Income self-declaration'
    ],
    requiredDocumentsKn: [
      'ಅರ್ಜಿದಾರ ಮತ್ತು ಪೋಷಕರ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಪಡಿತರ ಚೀಟಿ ಅಥವಾ ವೋಟರ್ ಐಡಿ ಪ್ರತಿ',
      'ಹಳೆಯ ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಶಾಲಾ ವರ್ಗಾವಣೆ ಪತ್ರ (TC)',
      'ವೇತನ ಚೀಟಿ ಅಥವಾ ಜಮೀನಿನ ಪಹಣಿ (RTC)'
    ],
    applicationProcedure: [
      'Apply online on Nada Kacheri portal (nadakacheri.karnataka.gov.in) or visit nearest Grama One center.',
      'Pay Sakala service fee of ₹40.',
      'Application forwarded digitally to Village Administrative Officer and Revenue Inspector for field verification.',
      'Download digitally signed certificate using GSC / RD number.'
    ],
    applicationProcedureKn: [
      'ನಾಡಕಚೇರಿ (nadakacheri.karnataka.gov.in) ಅಥವಾ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      'ಸಕಾಲ ಶುಲ್ಕ ₹40 ಪಾವತಿಸಿ.',
      'ಗ್ರಾಮ ಆಡಳಿತಾಧಿಕಾರಿ (VAO) ಮತ್ತು ಕಂದಾಯ ನಿರೀಕ್ಷಕರಿಂದ (RI) ಸ್ಥಳ ತನಿಖೆ.',
      'ಅನುಮೋದನೆಯಾದ ನಂತರ RD ಸಂಖ್ಯೆ ಬಳಸಿ ಡಿಜಿಟಲ್ ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ.'
    ],
    officialUrl: 'https://nadakacheri.karnataka.gov.in',
    helpline: '080-22340676 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'domicile-certificate',
    title: 'Residence / Domicile Certificate (Sakala Service)',
    titleKn: 'ವಾಸಸ್ಥಳ / ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರ (ಸಕಾಲ ಸೇವೆ)',
    department: 'Revenue Department / Atalji Janasnehi Kendra (Nada Kacheri)',
    departmentKn: 'ಕಂದಾಯ ಇಲಾಖೆ / ಅಟಲ್ ಜೀ ಜನಸ್ನೇಹಿ ಕೇಂದ್ರ (ನಾಡಕಚೇರಿ)',
    category: 'it_services',
    categoryLabel: 'IT & Digital Services',
    categoryLabelKn: 'ಐಟಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಸೇವೆಗಳು',
    description: 'Official revenue document certifying that an individual has continuously resided in a specific village, town, or city in Karnataka for at least 7 years, mandatory for CET admissions and state jobs.',
    descriptionKn: 'ಅರ್ಜಿದಾರರು ಕರ್ನಾಟಕದ ನಿರ್ದಿಷ್ಟ ಗ್ರಾಮ ಅಥವಾ ನಗರದಲ್ಲಿ ಕನಿಷ್ಠ 7 ವರ್ಷಗಳಿಂದ ಸತತವಾಗಿ ವಾಸಿಸುತ್ತಿದ್ದಾರೆ ಎಂದು ಕಂದಾಯ ಇಲಾಖೆ ನೀಡುವ ಅಧಿಕೃತ ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರ.',
    benefits: [
      'Statutory proof of Karnataka local domicile for educational entrance (KCET/NEET) and State PSC recruitments.',
      'Guaranteed 14-day Sakala delivery timeline.'
    ],
    benefitsKn: [
      'ಕೆಸಿಇಟಿ (KCET) ಪ್ರವೇಶ ಹಾಗೂ ಸರಕಾರಿ ಉದ್ಯೋಗಗಳಲ್ಲಿ ರಾಜ್ಯ ಕೋಟಾ ಪಡೆಯಲು ಕಡ್ಡಾಯ ದಾಖಲೆ.',
      'ಸಕಾಲ ಕಾಯ್ದೆಯಡಿ 14 ದಿನಗಳಲ್ಲಿ ಖಾತರಿ ವಿತರಣೆ.'
    ],
    eligibilityCriteria: [
      'Continuous residence in Karnataka for not less than seven consecutive years.',
      'Verified by local revenue authorities.'
    ],
    eligibilityCriteriaKn: [
      'ಕರ್ನಾಟಕದಲ್ಲಿ ಕನಿಷ್ಠ 7 ವರ್ಷಗಳ ಕಾಲ ನಿರಂತರವಾಗಿ ವಾಸಿಸಿರಬೇಕು.',
      'ಗ್ರಾಮ ಆಡಳಿತಾಧಿಕಾರಿಗಳಿಂದ ದೃಢೀಕರಣ.'
    ],
    eligibilityRules: {
      karnatakaResidentOnly: true
    },
    requiredDocuments: [
      'Aadhaar Card with local address',
      'School Study Certificate showing 7 years of schooling in Karnataka',
      'Electricity Bill / House Tax Receipt / Rental Agreement'
    ],
    requiredDocumentsKn: [
      'ಸ್ಥಳೀಯ ವಿಳಾಸವಿರುವ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಕರ್ನಾಟಕದಲ್ಲಿ 7 ವರ್ಷ ವ್ಯಾಸಂಗ ಮಾಡಿದ ಶಾಲಾ ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ (Study Certificate)',
      'ಮನೆ ಕಂದಾಯ ರಸೀದಿ / ವಿದ್ಯುತ್ ಬಿಲ್'
    ],
    applicationProcedure: [
      'Apply at Grama One / Nada Kacheri counter or online via nadakacheri.karnataka.gov.in.',
      'Submit proof of 7-year continuous residence.',
      'Revenue Inspector conducts local inquiry.',
      'Tahsildar issues digitally signed certificate within Sakala timeline.'
    ],
    applicationProcedureKn: [
      'ಗ್ರಾಮ ಒನ್ ಅಥವಾ ನಾಡಕಚೇರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      '7 ವರ್ಷಗಳ ವಾಸಸ್ಥಳ ದೃಢೀಕರಣ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಿ.',
      'ಕಂದಾಯ ನಿರೀಕ್ಷಕರಿಂದ ಸ್ಥಳ ತನಿಖೆ ಮತ್ತು ತಹಶೀಲ್ದಾರರಿಂದ ಡಿಜಿಟಲ್ ಸಹಿ.',
      'ಆನ್‌ಲೈನ್ ಮೂಲಕ ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿಕೊಳ್ಳಿ.'
    ],
    officialUrl: 'https://nadakacheri.karnataka.gov.in',
    helpline: '1902 / 080-22340676',
    verifiedDate: '2026-03-31',
    isActive: true
  },
  {
    id: 'pm-awas-gramin',
    title: 'Pradhan Mantri Awas Yojana — Gramin (PMAY-G)',
    titleKn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ — ಗ್ರಾಮೀಣ (PMAY-G)',
    department: 'Ministry of Rural Development / Rajiv Gandhi Housing Corporation (RGHCL)',
    departmentKn: 'ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಸಚಿವಾಲಯ / ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL)',
    category: 'housing',
    categoryLabel: 'Rural Housing',
    categoryLabelKn: 'ಗ್ರಾಮೀಣ ವಸತಿ',
    description: 'Flagship rural housing program providing financial assistance of ₹1.20 lakh per unit for construction of permanent pucca houses with toilet facility for homeless rural families.',
    descriptionKn: 'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವಸತಿ ರಹಿತ ಮತ್ತು ಶಿಥಿಲಾವಸ್ಥೆಯ ಮನೆಗಳಲ್ಲಿ ವಾಸಿಸುತ್ತಿರುವ ಬಡ ಕುಟುಂಬಗಳಿಗೆ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಿಸಿಕೊಳ್ಳಲು ₹1.20 ಲಕ್ಷ ನೇರ ಧನಸಹಾಯ ನೀಡುವ ಕೇಂದ್ರ ಸರಕಾರದ ವಸತಿ ಯೋಜನೆ.',
    benefits: [
      'Direct grant of ₹1.20 lakh paid in 4 stages linked to construction milestones.',
      'Additional 90 days of unskilled wage employment under MGNREGA (approx ₹28,000).',
      '₹12,000 additional incentive for toilet construction under Swachh Bharat Mission (SBM).'
    ],
    benefitsKn: [
      'ಹಂತ-ಹಂತವಾಗಿ ಮನೆ ನಿರ್ಮಾಣಕ್ಕೆ ತಕ್ಕಂತೆ ಒಟ್ಟು ₹1.20 ಲಕ್ಷ ನೇರ ನಗದು ಅನುದಾನ.',
      'ನರೇಗಾ (MGNREGA) ಯೋಜನೆಯಡಿ 90 ದಿನಗಳ ಕೂಲಿ ಹಣ (ಅಂದಾಜು ₹28,000).',
      'ಸ್ವಚ್ಛ ಭಾರತ ಮಿಷನ್ ಅಡಿಯಲ್ಲಿ ಶೌಚಾಲಯ ನಿರ್ಮಾಣಕ್ಕೆ ₹12,000 ಪ್ರೋತ್ಸಾಹಧನ.'
    ],
    eligibilityCriteria: [
      'Families residing in kutcha or dilapidated houses in rural areas with no pucca house in their name anywhere in India.',
      'Selected based on Socio-Economic Caste Census (SECC) and Awaas+ survey list approved by Gram Sabha.'
    ],
    eligibilityCriteriaKn: [
      'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದಲ್ಲಿ ಸ್ವಂತ ಪಕ್ಕಾ ಮನೆ ಇಲ್ಲದ ಕಚ್ಚಾ ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಕುಟುಂಬಗಳು.',
      'ಗ್ರಾಮ ಸಭೆಯಿಂದ ಅನುಮೋದಿಸಲ್ಪಟ್ಟ ಆವಾಸ್+ (Awaas+) ಪಟ್ಟಿಯಲ್ಲಿ ಹೆಸರಿರಬೇಕು.'
    ],
    eligibilityRules: {
      requiresRural: true,
      requiresBpl: true,
      karnatakaResidentOnly: false
    },
    requiredDocuments: [
      'Aadhaar card of all family members',
      'BPL Ration Card',
      'Title deed / Hakku Patra of residential site / ancestral plot',
      'Bank passbook linked with Aadhaar and MGNREGA Job Card'
    ],
    requiredDocumentsKn: [
      'ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಆಧಾರ್ ಕಾರ್ಡ್',
      'ಬಿಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ',
      'ನಿವೇಶನದ ಹಕ್ಕುಪತ್ರ / ಜಾಗದ ಮಾಲೀಕತ್ವ ದಾಖಲೆ',
      'ನರೇಗಾ ಜಾಬ್ ಕಾರ್ಡ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ'
    ],
    applicationProcedure: [
      'Beneficiaries identified through Gram Sabha social audit from Awaas+ list.',
      'Geotagging of existing kutcha site by Panchayat Development Officer (PDO).',
      'Financial installments released directly via DBT upon geotagged foundation, lintel, and roof completion.'
    ],
    applicationProcedureKn: [
      'ಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಗ್ರಾಮ ಸಭೆಯಲ್ಲಿ ಫಲಾನುಭವಿಗಳ ಪಟ್ಟಿ ಆಯ್ಕೆ.',
      'ಪಿಡಿಒ (PDO) ವತಿಯಿಂದ ಜಾಗದ ಮೊದಲ ಹಂತದ ಜಿಯೋ-ಟ್ಯಾಗಿಂಗ್.',
      'ಪಾಯ, ಗೋಡೆ, ಛಾವಣಿ ಪೂರ್ಣಗೊಂಡಂತೆ 4 ಕಂತುಗಳಲ್ಲಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರ ಹಣ ಜಮೆ.'
    ],
    officialUrl: 'https://pmayg.nic.in',
    helpline: '1800-11-6446 / 1902',
    verifiedDate: '2026-03-31',
    isActive: true
  }
];
