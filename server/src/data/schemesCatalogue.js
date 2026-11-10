/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Authoritative Karnataka Government Schemes Catalogue
 * 
 * Verified public welfare schemes, social security entitlements, and citizen services
 * across Karnataka departments. Referenced from official sources: Seva Sindhu,
 * Mahiti Kanaja, Food Karnataka (Ahara), FRUITS, Nadakacheri, and SSP.
 * 
 * Safety & Transparency Principles:
 * - Does not invent eligibility criteria or government integrations.
 * - Explicitly marks whether official online integration is available (false — offline draft only).
 * - Provides verified official application URLs and sources.
 * - Defines structured form fields for scheme-specific offline drafts.
 */

import { EXPANDED_GOV_SCHEMES } from './expandedGovSchemes.js';

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagar',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayanagara',
  'Yadgir'
];

export const CATEGORIES = [
  { id: 'all', title: 'All Services', titleKn: 'ಎಲ್ಲಾ ಸೇವೆಗಳು', sub: 'Complete Catalogue', subKn: 'ಸಂಪೂರ್ಣ ಯೋಜನೆಗಳು', icon: 'Layers' },
  { id: 'farmer', title: 'Farmer / Agriculture', titleKn: 'ರೈತ / ಕೃಷಿ', sub: 'Seed, Crop, Subsidy', subKn: 'ಬೀಜ, ಬೆಳೆ, ಸಹಾಯಧನ', icon: 'Sprout' },
  { id: 'citizen', title: 'Citizen / Social Welfare', titleKn: 'ನಾಗರಿಕ / ಸಮಾಜ ಕಲ್ಯಾಣ', sub: 'Pensions, Guarantee', subKn: 'ಪಿಂಚಣಿ, ಗ್ಯಾರಂಟಿ', icon: 'Users' },
  { id: 'housing', title: 'Rural Housing', titleKn: 'ಗ್ರಾಮೀಣ ವಸತಿ', sub: 'Basava Vasathi, Pucca Home', subKn: 'ಬಸವ ವಸತಿ, ಪಕ್ಕಾ ಮನೆ', icon: 'Home' },
  { id: 'food', title: 'Food & Civil Supplies', titleKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು', sub: 'Ration, Ahara, BPL', subKn: 'ಪಡಿತರ, ಆಹಾರ, ಬಿಪಿಎಲ್', icon: 'ShoppingBag' },
  { id: 'student', title: 'Youth & Education', titleKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ', sub: 'SSP, Yuva Nidhi', subKn: 'ಎಸ್ಎಸ್ಪಿ, ಯುವ ನಿಧಿ', icon: 'GraduationCap' },
  { id: 'health', title: 'Health Services', titleKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು', sub: 'Arogya Karnataka, AB-ArK', subKn: 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ', icon: 'HeartPulse' },
  { id: 'business', title: 'Business / MSME', titleKn: 'ಉದ್ಯಮ / ಎಂಎಸ್ಎಂಇ', sub: 'Artisans, Micro Subsidy', subKn: 'ಕುಶಲಕರ್ಮಿಗಳು, ಸಬ್ಸಿಡಿ', icon: 'Briefcase' },
  { id: 'it_services', title: 'IT & Digital Services', titleKn: 'ಡಿಜಿಟಲ್ / ದಾಖಲೆ ಸೇವೆಗಳು', sub: 'Kaveri, DigiLocker', subKn: 'ಕಾವೇರಿ, ಡಿಜಿಲಾಕರ್', icon: 'Monitor' }
];

const BASE_SCHEMES = [
  // 1. Agriculture / Farmer (Preserves legacy ID: agri-seed-subsidy)
  {
    id: 'agri-seed-subsidy',
    title: 'Farmer Seed & Fertilizer Subsidy (Raitha Siri)',
    titleKn: 'ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ',
    department: 'Department of Agriculture, Govt. of Karnataka',
    departmentKn: 'ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
    category: 'farmer',
    categoryLabel: 'Farmer / Agriculture',
    categoryLabelKn: 'ರೈತ / ಕೃಷಿ',
    shortDesc: 'Financial support and subsidised certified seeds distribution for small and marginal farmers cultivating seasonal notified crops and millets.',
    shortDescKn: 'ಅಧಿಸೂಚಿತ ಬೆಳೆ ಮತ್ತು ಸಿರಿಧಾನ್ಯ ಬೆಳೆಯುವ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಪ್ರಮಾಣೀಕೃತ ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ.',
    beneficiaries: 'Small & marginal farmers holding agricultural land registered in FRUITS.',
    beneficiariesKn: 'ಫ್ರೂಟ್ಸ್ ತಂತ್ರಾಂಶದಲ್ಲಿ ನೋಂದಾಯಿತ ಕೃಷಿ ಜಮೀನು ಹೊಂದಿರುವ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರು.',
    benefits: '₹10,000 per hectare direct credit for millet cultivation and up to 50% subsidy on certified seeds through Raitha Samparka Kendras (RSK).',
    benefitsKn: 'ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಮತ್ತು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳ ಮೂಲಕ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳಿಗೆ ಶೇ.50 ರಿಯಾಯಿತಿ.',
    eligibilityCriteria: [
      'Must be a permanent resident farmer in Karnataka.',
      'Must possess cultivable agricultural land registered in FRUITS with valid FID.',
      'Must cultivate notified food grains, oilseeds, pulses, or millets.',
      'Bank account must be active and linked to Aadhaar (NPCI mapped).'
    ],
    requiredDocuments: [
      'Aadhaar Card of the farmer',
      'FRUITS ID (FID) Certificate',
      'Land Ownership Record (RTC / Pahani)',
      'Bank Passbook photocopy showing IFSC and Account Number'
    ],
    officialUrl: 'https://fruits.karnataka.gov.in',
    sourceUrl: 'https://raitamitra.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      allowedOccupations: ['farmer'],
      requiresLand: true,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'fruitsId',
        label: 'FRUITS Farmer ID (FID)',
        labelKn: 'ಫ್ರೂಟ್ಸ್ ರೈತ ಐಡಿ (FID)',
        type: 'text',
        placeholder: 'e.g. 202400123456',
        required: true,
        helpText: 'Official 12-digit FRUITS registration number from Agriculture Department.'
      },
      {
        id: 'rtcSurveyNo',
        label: 'Land Survey / Hissa Number (RTC)',
        labelKn: 'ಸರ್ವೆ / ಹಿಸ್ಸಾ ಸಂಖ್ಯೆ (ಪಹಣಿ)',
        type: 'text',
        placeholder: 'e.g. 142/2A',
        required: true,
        helpText: 'Survey number as recorded in the Bhoomi Pahani record.'
      },
      {
        id: 'landAreaAcres',
        label: 'Total Cultivable Land (in Acres)',
        labelKn: 'ಒಟ್ಟು ಸಾಗುವಳಿ ಜಮೀನು (ಎಕರೆಗಳಲ್ಲಿ)',
        type: 'number',
        placeholder: 'e.g. 2.5',
        required: true,
        helpText: 'Eligible for small/marginal farmers with up to 5 acres.'
      },
      {
        id: 'cropType',
        label: 'Target Seasonal Crop',
        labelKn: 'ಉದ್ದೇಶಿತ ಬೆಳೆ',
        type: 'select',
        required: true,
        options: [
          { value: 'ragi', label: 'Ragi / Finger Millet' },
          { value: 'paddy', label: 'Paddy / Rice' },
          { value: 'maize', label: 'Maize / Corn' },
          { value: 'pulses', label: 'Pulses (Tur / Gram)' },
          { value: 'oilseeds', label: 'Oilseeds (Groundnut / Sunflower)' },
          { value: 'millets_other', label: 'Minor Millets (Jowar / Bajra)' }
        ]
      },
      {
        id: 'irrigationType',
        label: 'Irrigation Source',
        labelKn: 'ನೀರಾವರಿ ಮೂಲ',
        type: 'select',
        required: true,
        options: [
          { value: 'rainfed', label: 'Rainfed (Kushki)' },
          { value: 'borewell', label: 'Borewell / Tube Well' },
          { value: 'canal', label: 'Canal / River Irrigation' },
          { value: 'drip', label: 'Drip / Micro-Irrigation' }
        ]
      }
    ]
  },

  // 2. Senior Citizen Pension (Preserves legacy ID: old-age-pension)
  {
    id: 'old-age-pension',
    title: 'Senior Citizen Pension Scheme (Sandhya Suraksha)',
    titleKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ',
    department: 'Directorate of Social Security and Pensions, Revenue Dept.',
    departmentKn: 'ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ',
    category: 'citizen',
    categoryLabel: 'Citizen / Social Welfare',
    categoryLabelKn: 'ನಾಗರಿಕ / ಸಮಾಜ ಕಲ್ಯಾಣ',
    shortDesc: 'Monthly subsistence pension of ₹1,200 for rural and urban elderly citizens aged 65 and above from economically weaker families.',
    shortDescKn: '65 ವರ್ಷ ಮತ್ತು ಮೇಲ್ಪಟ್ಟ ಆರ್ಥಿಕವಾಗಿ ಹಿಂದುಳಿದ ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮಾಸಿಕ ₹1,200 ಸಾಮಾಜಿಕ ಭದ್ರತಾ ಪಿಂಚಣಿ.',
    beneficiaries: 'Senior citizens aged 65 and above without adequate income or family financial support.',
    beneficiariesKn: '65 ವರ್ಷ ಮೀರಿದ ಸ್ವಾವಲಂಬಿ ಆದಾಯವಿಲ್ಲದ ರಾಜ್ಯದ ಹಿರಿಯ ನಾಗರಿಕರು.',
    benefits: 'Direct monthly pension credit of ₹1,200 to beneficiary bank or postal account.',
    benefitsKn: 'ಫಲಾನುಭವಿಯ ಬ್ಯಾಂಕ್ ಅಥವಾ ಅಂಚೆ ಖಾತೆಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,200 ನೇರ ಜಮೆ.',
    eligibilityCriteria: [
      'Applicant must be 65 years of age or older.',
      'Must be a resident of Karnataka for at least 3 consecutive years.',
      'Combined annual income of applicant and spouse must be below ₹32,000 (rural) or ₹40,000 (urban).',
      'Applicant must not be receiving any other government, freedom fighter, or EPF pension.'
    ],
    requiredDocuments: [
      'Age Proof (Voter ID, Aadhaar Card, or Birth Certificate)',
      'Income Certificate issued by Tahsildar / Nadakacheri (RD Number)',
      'Domicile / Residence Certificate (proof of 3 years stay in Karnataka)',
      'Bank Account Passbook / Postal Savings Account details'
    ],
    officialUrl: 'https://nadakacheri.karnataka.gov.in',
    sourceUrl: 'https://sevasindhu.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      minAge: 65,
      maxIncome: 32000,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'applicantAge',
        label: 'Applicant Age (in Years)',
        labelKn: 'ಅರ್ಜಿದಾರರ ವಯಸ್ಸು (ವರ್ಷಗಳಲ್ಲಿ)',
        type: 'number',
        placeholder: 'e.g. 68',
        required: true,
        helpText: 'Must be 65 years or above on the date of application.'
      },
      {
        id: 'annualIncome',
        label: 'Combined Annual Household Income (₹)',
        labelKn: 'ಕುಟುಂಬದ ಒಟ್ಟು ವಾರ್ಷಿಕ ಆದಾಯ (₹)',
        type: 'number',
        placeholder: 'e.g. 24000',
        required: true,
        helpText: 'Must be within statutory ceiling (under ₹32,000 in rural areas).'
      },
      {
        id: 'incomeCertRdNo',
        label: 'Income Certificate RD Number',
        labelKn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ RD ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. RD00384729182',
        required: true,
        helpText: 'Nadakacheri / Atalji Janasnehi Kendra certificate registration number.'
      },
      {
        id: 'hasOtherPension',
        label: 'Are you currently receiving any other government pension?',
        labelKn: 'ನೀವು ಪ್ರಸ್ತುತ ಯಾವುದಾದರೂ ಸರ್ಕಾರಿ ಪಿಂಚಣಿ ಪಡೆಯುತ್ತಿದ್ದೀರಾ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no', label: 'No, I do not receive any other pension' },
          { value: 'yes', label: 'Yes, I receive another pension' }
        ],
        helpText: 'Beneficiaries of other state/central pensions are not eligible for Sandhya Suraksha.'
      }
    ]
  },

  // 3. Rural Pucca Housing (Preserves legacy ID: rural-housing-assist)
  {
    id: 'rural-housing-assist',
    title: 'Rural Pucca Housing Grant (Basava Vasathi Yojana)',
    titleKn: 'ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ',
    department: 'Rajiv Gandhi Housing Corporation Limited (RGHCL)',
    departmentKn: 'ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ',
    category: 'housing',
    categoryLabel: 'Rural Housing',
    categoryLabelKn: 'ಗ್ರಾಮೀಣ ವಸತಿ',
    shortDesc: 'Financial construction grant up to ₹1.20 lakh for economically backward rural families without permanent pucca dwelling units.',
    shortDescKn: 'ಸ್ವಂತ ನಿವೇಶನವಿದ್ದು ಪಕ್ಕಾ ಮನೆ ಇಲ್ಲದ ಗ್ರಾಮೀಣ ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳಿಗೆ ₹1.20 ಲಕ್ಷ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ.',
    beneficiaries: 'Rural homeless BPL households or families living in temporary katcha huts.',
    beneficiariesKn: 'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವಸತಿ ರಹಿತ ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳು.',
    benefits: 'Direct benefit subsidy of ₹1,200,000 released in 4 geo-tagged construction stages.',
    benefitsKn: 'ಜಿಪಿಎಸ್ ಜಿಯೋ-ಟ್ಯಾಗ್ ಆಧಾರಿತ 4 ಹಂತಗಳಲ್ಲಿ ₹1.20 ಲಕ್ಷ ಅನುದಾನ ಫಲಾನುಭವಿಯ ಖಾತೆಗೆ ನೇರ ಜಮೆ.',
    eligibilityCriteria: [
      'Applicant must be a permanent resident of a rural Gram Panchayat in Karnataka.',
      'Family must hold an active BPL Ration Card.',
      'Must own a residential site / plot sanctioned by Gram Panchayat or ancestral land.',
      'Must not own any pucca residential house anywhere in India.',
      'Annual household income must be below ₹32,000.'
    ],
    requiredDocuments: [
      'BPL Ration Card',
      'Aadhaar Cards of all adult family members',
      'Plot Ownership Document / Hakku Patra / GP Form 9 & 11',
      'Income Certificate issued by Revenue Authority',
      'Photograph of existing katcha house or vacant site'
    ],
    officialUrl: 'https://ashraya.karnataka.gov.in',
    sourceUrl: 'https://rghcl.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      requiresBpl: true,
      requiresRural: true,
      maxIncome: 32000,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'rationCardNumber',
        label: 'BPL Ration Card Number',
        labelKn: 'ಬಿಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. 1029384756',
        required: true,
        helpText: '10-digit Karnataka Priority Household (PHH/AAY) card number.'
      },
      {
        id: 'currentHousingType',
        label: 'Current Dwelling Condition',
        labelKn: 'ಪ್ರಸ್ತುತ ವಾಸವಿರುವ ಮನೆಯ ಸ್ಥಿತಿ',
        type: 'select',
        required: true,
        options: [
          { value: 'katcha_hut', label: 'Katcha Mud / Thatched Hut' },
          { value: 'temporary_shed', label: 'Temporary Sheet Shed' },
          { value: 'homeless_rent', label: 'Homeless / Rented Katcha Room' },
          { value: 'damaged_structure', label: 'Dilapidated / Uninhabitable Room' }
        ]
      },
      {
        id: 'ownsSite',
        label: 'Do you possess a site / plot with Gram Panchayat Hakku Patra?',
        labelKn: 'ನಿಮ್ಮ ಬಳಿ ಗ್ರಾಮ್ ಪಂಚಾಯಿತಿ ಹಕ್ಕುಪತ್ರವಿರುವ ಸ್ವಂತ ನಿವೇಶನವಿದೆಯೇ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, I possess a valid site / plot' },
          { value: 'no', label: 'No, site is not yet allotted' }
        ]
      },
      {
        id: 'hakkuPatraNo',
        label: 'Hakku Patra / Form 9-11 Property Extract No.',
        labelKn: 'ಹಕ್ಕುಪತ್ರ / ನಮೂನೆ 9-11 ಆಸ್ತಿ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. GP/HAKKU/2023/88',
        required: false,
        dependsOn: { field: 'ownsSite', value: 'yes' },
        helpText: 'Provide the document number issued by your Gram Panchayat.'
      }
    ]
  },

  // 4. Ration Card (Preserves legacy ID: ration-card-update)
  {
    id: 'ration-card-update',
    title: 'Priority Ration Card Services (Ahara / Food & Civil Supplies)',
    titleKn: 'ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ',
    department: 'Food, Civil Supplies and Consumer Affairs Department',
    departmentKn: 'ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ',
    category: 'food',
    categoryLabel: 'Food & Civil Supplies',
    categoryLabelKn: 'ಆಹಾರ ಮತ್ತು ನಾಗರಿಕ ಸರಬರಾಜು',
    shortDesc: 'Addition of newborn child/spouse, member address updates, fair price shop transfer, and cardholder detail corrections on BPL/APL ration cards.',
    shortDescKn: 'ಪಡಿತರ ಚೀಟಿಗೆ ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ, ವಿಳಾಸ ಬದಲಾವಣೆ, ನ್ಯಾಯಬೆಲೆ ಅಂಗಡಿ ವರ್ಗಾವಣೆ ಮತ್ತು ತಿದ್ದುಪಡಿ ಸೇವೆಗಳು.',
    beneficiaries: 'Ration cardholders holding valid Priority (BPL/PHH) or Non-Priority (APL) cards.',
    beneficiariesKn: 'ಕರ್ನಾಟಕದ ಮಾನ್ಯತೆ ಹೊಂದಿರುವ ಪಡಿತರ ಚೀಟಿದಾರರು.',
    benefits: 'Guaranteed access to monthly Anna Bhagya food grain entitlement and subsidized essential commodities.',
    benefitsKn: 'ಅನ್ನಭಾಗ್ಯ ಯೋಜನೆಯಡಿ ಮಾಸಿಕ ಉಚಿತ ಆಹಾರ ಧಾನ್ಯ ವಿತರಣೆಗೆ ನಿಖರ ಕುಟುಂಬ ಸದಸ್ಯರ ಪಟ್ಟಿ ಖಾತರಿ.',
    eligibilityCriteria: [
      'Applicant must already hold a valid Karnataka Ration Card number in Ahara database.',
      'For adding child: Birth certificate with parents’ names matching ration card.',
      'For adding spouse: Marriage certificate and NOC/deletion certificate from previous ration card.',
      'All members must have individual biometric Aadhaar numbers.'
    ],
    requiredDocuments: [
      'Existing Ration Card Number',
      'Aadhaar Card of Head of Family (Female Head of Household)',
      'Aadhaar Card of member being added or corrected',
      'Birth Certificate (if adding newborn) or Marriage Certificate (if adding spouse)',
      'Electricity Bill / Gram Panchayat Tax Receipt (if updating address)'
    ],
    officialUrl: 'https://ahara.kar.nic.in',
    sourceUrl: 'https://sevasindhu.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'existingRationCardNo',
        label: 'Existing Karnataka Ration Card Number',
        labelKn: 'ಹಾಲಿ ಪಡಿತರ ಚೀಟಿ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. 1029485721',
        required: true,
        helpText: 'Official 10-digit number printed on your Ahara ration card.'
      },
      {
        id: 'modificationType',
        label: 'Service / Modification Requested',
        labelKn: 'ಕೋರಿದ ಸೇವೆ / ಬದಲಾವಣೆ',
        type: 'select',
        required: true,
        options: [
          { value: 'add_child', label: 'Add Newborn Child (Birth Certificate Required)' },
          { value: 'add_spouse', label: 'Add Spouse (Marriage Certificate Required)' },
          { value: 'address_change', label: 'Change Address / Fair Price Shop (FPS)' },
          { value: 'surrender_card', label: 'Member Name Deletion / Surrender' },
          { value: 'update_head', label: 'Update Head of Family Name' }
        ]
      },
      {
        id: 'memberNameToAdd',
        label: 'Full Name of Member to Add / Correct',
        labelKn: 'ಸೇರಿಸಬೇಕಾದ / ತಿದ್ದುಪಡಿ ಮಾಡಬೇಕಾದ ಸದಸ್ಯರ ಹೆಸರು',
        type: 'text',
        placeholder: 'e.g. Ananya Kumar',
        required: false,
        dependsOn: { field: 'modificationType', value: 'add_child' },
        helpText: 'Name must match the Birth / Aadhaar certificate exactly.'
      },
      {
        id: 'memberAadhaar',
        label: 'Aadhaar Number of the Member',
        labelKn: 'ಸದಸ್ಯರ ಆಧಾರ್ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: '12-digit Aadhaar number',
        required: false,
        dependsOn: { field: 'modificationType', value: 'add_child' },
        helpText: 'Biometric Aadhaar must be linked.'
      }
    ]
  },

  // 5. Gruha Lakshmi Scheme
  {
    id: 'gruha-lakshmi',
    title: 'Gruha Lakshmi Scheme (₹2,000 Monthly DBT)',
    titleKn: 'ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು',
    department: 'Department of Women and Child Development',
    departmentKn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
    category: 'citizen',
    categoryLabel: 'Citizen / Social Welfare',
    categoryLabelKn: 'ನಾಗರಿಕ / ಸಮಾಜ ಕಲ್ಯಾಣ',
    shortDesc: 'Direct monthly financial entitlement of ₹2,000 credited to the bank account of the designated woman head of household in BPL/APL families.',
    shortDescKn: 'ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿ ಕುಟುಂಬದ ಯಜಮಾನಿ ಎಂದು ಗುರುತಿಸಲಾದ ಮಹಿಳೆಗೆ ಮಾಸಿಕ ₹2,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT).',
    beneficiaries: 'Designated woman head of the family as recorded in Karnataka Antyodaya, BPL, or APL ration cards.',
    beneficiariesKn: 'ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿ ನಮೂದಾಗಿರುವ ಮಹಿಳಾ ಕುಟುಂಬದ ಯಜಮಾನಿ.',
    benefits: '₹2,000 per month transferred through Aadhaar-enabled Direct Benefit Transfer (Aadhaar DBT / NPCI).',
    benefitsKn: 'ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ.',
    eligibilityCriteria: [
      'Applicant must be designated as the woman head of family on the ration card.',
      'Only one woman per household is eligible.',
      'Neither the woman head of household nor her husband should be an income tax payer.',
      'Neither the woman nor her husband should be filing GST returns.'
    ],
    requiredDocuments: [
      'Karnataka Ration Card Number (Antyodaya / BPL / APL)',
      'Aadhaar Card of the woman head of household',
      'Bank Account linked to Aadhaar (NPCI Aadhaar mapping active)',
      'Aadhaar Card of spouse/husband'
    ],
    officialUrl: 'https://sevasindhugs.karnataka.gov.in',
    sourceUrl: 'https://sevasindhu.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      requiresFemaleHead: true,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'rationCardNumber',
        label: 'Ration Card Number',
        labelKn: 'ಪಡಿತರ ಚೀಟಿ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. 1049382710',
        required: true,
        helpText: 'Karnataka Antyodaya, BPL, or APL ration card number.'
      },
      {
        id: 'womanHeadName',
        label: 'Woman Head of Household Full Name',
        labelKn: 'ಮಹಿಳಾ ಯಜಮಾನಿಯ ಪೂರ್ಣ ಹೆಸರು',
        type: 'text',
        placeholder: 'e.g. Lakshmi Bai',
        required: true,
        helpText: 'Must match the name listed as head on the ration card and Aadhaar.'
      },
      {
        id: 'bankAccountNo',
        label: 'Aadhaar-Linked Bank Account Number',
        labelKn: 'ಆಧಾರ್ ಜೋಡಣೆಯಾಗಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. 110022334455',
        required: true,
        helpText: 'Ensure your account has NPCI Aadhaar seeding for DBT receipt.'
      },
      {
        id: 'bankIfsc',
        label: 'Bank Branch IFSC Code',
        labelKn: 'ಬ್ಯಾಂಕ್ ಶಾಖೆಯ IFSC ಕೋಡ್',
        type: 'text',
        placeholder: 'e.g. SBIN0001234',
        required: true
      },
      {
        id: 'taxPayerDeclaration',
        label: 'Does the woman head or her husband pay Income Tax or file GST?',
        labelKn: 'ಮಹಿಳಾ ಯಜಮಾನಿ ಅಥವಾ ಅವರ ಪತಿ ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರರೇ / ಜಿಎಸ್‌ಟಿ ಸಲ್ಲಿಸುತ್ತಾರೆಯೇ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'no', label: 'No, neither pays income tax nor files GST' },
          { value: 'yes', label: 'Yes, tax payer (Not eligible under statutory rules)' }
        ]
      }
    ]
  },

  // 6. Yuva Nidhi Scheme (Unemployment stipend for graduates/diploma holders)
  {
    id: 'yuva-nidhi',
    title: 'Yuva Nidhi Scheme (Graduate & Diploma Stipend)',
    titleKn: 'ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ',
    department: 'Department of Skill Development, Entrepreneurship and Livelihood',
    departmentKn: 'ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ',
    category: 'student',
    categoryLabel: 'Youth & Education',
    categoryLabelKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ',
    shortDesc: 'Monthly allowance of ₹3,000 for degree holders and ₹1,500 for diploma holders for up to two years during job-seeking and skill-upgradation.',
    shortDescKn: 'ನಿರುದ್ಯೋಗಿ ಪದವೀಧರರಿಗೆ ಮಾಸಿಕ ₹3,000 ಮತ್ತು ಡಿಪ್ಲೊಮಾ ತೇರ್ಗಡೆಯಾದವರಿಗೆ ₹1,500 ಮಾಸಿಕ ಭತ್ಯೆ (ಗರಿಷ್ಠ 2 ವರ್ಷಗಳು).',
    beneficiaries: 'Unemployed youth who completed graduation or diploma from recognized Karnataka institutions.',
    beneficiariesKn: 'ಕರ್ನಾಟಕದಲ್ಲಿ ಪದವಿ ಅಥವಾ ಡಿಪ್ಲೊಮಾ ಮುಗಿಸಿ ಉದ್ಯೋಗ ಹುಡುಕುತ್ತಿರುವ ಯುವಜನತೆ.',
    benefits: '₹3,000/month for degree holders and ₹1,500/month for diploma holders via DBT for up to 24 months.',
    benefitsKn: 'ಪದವೀಧರರಿಗೆ ₹3,000 ಹಾಗೂ ಡಿಪ್ಲೊಮಾ ಮುಗಿಸಿದವರಿಗೆ ₹1,500 ಮಾಸಿಕ ಭತ್ಯೆ.',
    eligibilityCriteria: [
      'Must have passed degree or diploma from a recognized university or board in Karnataka.',
      'Must have completed a minimum of 6 years of study in Karnataka (domicile requirement).',
      'Must have remained unemployed for at least 180 days after graduation results.',
      'Must not be pursuing higher education or employed in government/private sectors.',
      'Must not be self-employed or eligible for EPF/ESI benefits.'
    ],
    requiredDocuments: [
      'SSLC Marks Card',
      'Degree or Diploma Certificate & Final Year Marks Card',
      'Aadhaar Card linked to active bank account',
      'Domicile / Study Certificate proving 6 years study in Karnataka',
      'Self-declaration of unemployment'
    ],
    officialUrl: 'https://sevasindhugs.karnataka.gov.in',
    sourceUrl: 'https://skill.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      allowedOccupations: ['student'],
      requiresStudent: false, // Must be a graduated youth seeking jobs
      requiresUnemployed: true,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'qualificationType',
        label: 'Completed Qualification',
        labelKn: 'ತೇರ್ಗಡೆಯಾದ ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ',
        type: 'select',
        required: true,
        options: [
          { value: 'degree', label: 'Bachelor Degree (B.A / B.Sc / B.Com / B.E / etc.) — ₹3,000/mo' },
          { value: 'diploma', label: 'Polytechnic Diploma — ₹1,500/mo' }
        ]
      },
      {
        id: 'passingYear',
        label: 'Year of Passing / Result Date',
        labelKn: 'ತೇರ್ಗಡೆಯಾದ ವರ್ಷ / ಫಲಿತಾಂಶ ದಿನಾಂಕ',
        type: 'select',
        required: true,
        options: [
          { value: '2024', label: 'Academic Year 2023-2024' },
          { value: '2025', label: 'Academic Year 2024-2025' },
          { value: '2026', label: 'Academic Year 2025-2026' }
        ]
      },
      {
        id: 'universityRegNo',
        label: 'University / Board Registration Number',
        labelKn: 'ವಿಶ್ವವಿದ್ಯಾನಿಲಯ / ಮಂಡಳಿಯ ನೋಂದಣಿ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. U19ISE0421',
        required: true,
        helpText: 'Official roll/registration number on your degree/diploma marks card.'
      },
      {
        id: 'unemploymentDaysConfirmed',
        label: 'Have you completed at least 180 days since graduation without job/higher education?',
        labelKn: 'ಫಲಿತಾಂಶ ಪ್ರಕಟವಾಗಿ 180 ದಿನಗಳು ಪೂರ್ಣಗೊಂಡಿದ್ದು, ಉದ್ಯೋಗ ಅಥವಾ ಉನ್ನತ ಶಿಕ್ಷಣದಲ್ಲಿಲ್ಲವೇ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, 180+ days completed and currently unemployed' },
          { value: 'no', label: 'No, less than 180 days completed' }
        ]
      }
    ]
  },

  // 7. State Scholarship Portal (SSP Post-Matric)
  {
    id: 'ssp-scholarship',
    title: 'State Scholarship Portal (SSP) Post-Matric Scholarships',
    titleKn: 'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ',
    department: 'Social Welfare & Backward Classes Welfare Departments',
    departmentKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ',
    category: 'student',
    categoryLabel: 'Youth & Education',
    categoryLabelKn: 'ಯುವಜನ ಮತ್ತು ಶಿಕ್ಷಣ',
    shortDesc: 'Fee reimbursement, maintenance allowances, and examination fees for SC, ST, OBC, and minority students enrolled in post-matric colleges.',
    shortDescKn: 'ಮೆಟ್ರಿಕ್ ನಂತರದ (ಪಿಯುಸಿ, ಪದವಿ, ಡಿಪ್ಲೊಮಾ) ಕಾಲೇಜುಗಳಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿರುವ ಅರ್ಹ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ನಿರ್ವಹಣಾ ಭತ್ಯೆ.',
    beneficiaries: 'Post-matriculation students belonging to SC, ST, Cat-1, 2A, 2B, 3A, 3B, and EWS categories.',
    beneficiariesKn: 'ಎಸ್.ಸಿ, ಎಸ್.ಟಿ, ಒಬಿಸಿ ಮತ್ತು ಅಲ್ಪಸಂಖ್ಯಾತ ವರ್ಗದ ವಿದ್ಯಾರ್ಥಿಗಳು.',
    benefits: 'College tuition fee reimbursement and monthly hostel/maintenance grant up to ₹25,000 per academic year.',
    benefitsKn: 'ಕಾಲೇಜು ಶುಲ್ಕ ಮರುಪಾವತಿ ಹಾಗೂ ವಾರ್ಷಿಕ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅನುದಾನ.',
    eligibilityCriteria: [
      'Applicant must be a bonafide student in a recognized Karnataka college / institute.',
      'Must possess a valid Student SATS ID / e-Attestation Number.',
      'Annual family income ceiling: Up to ₹2.5 Lakh for SC/ST; Up to ₹1.0 Lakh for OBC (Cat-1, 2A, 2B, 3A, 3B).',
      'Must have verified Caste and Income Certificate RD numbers from Nadakacheri.'
    ],
    requiredDocuments: [
      'Student Aadhaar Card',
      'College Admission Fee Receipt & Bonafide Certificate',
      'Caste and Income Certificate RD Number',
      'SSLC Registration Number & Marks Card',
      'Hostel certificate (if residing in government/private hostel)'
    ],
    officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
    sourceUrl: 'https://sw.kar.nic.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      allowedOccupations: ['student'],
      requiresStudent: true,
      maxIncome: 250000,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'sspStudentId',
        label: 'SSP Student ID (if already registered)',
        labelKn: 'SSP ವಿದ್ಯಾರ್ಥಿ ಐಡಿ (ಇದ್ದರೆ)',
        type: 'text',
        placeholder: 'e.g. SSP202409871',
        required: false,
        helpText: 'Existing student portal login account ID.'
      },
      {
        id: 'collegeName',
        label: 'College / Institute Name',
        labelKn: 'ಕಾಲೇಜು / ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ಹೆಸರು',
        type: 'text',
        placeholder: 'e.g. Government First Grade College, Mysuru',
        required: true
      },
      {
        id: 'courseCategory',
        label: 'Current Course of Study',
        labelKn: 'ಪ್ರಸ್ತುತ ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿರುವ ಕೋರ್ಸ್',
        type: 'select',
        required: true,
        options: [
          { value: 'puc', label: 'Pre-University (PUC 1st / 2nd Year)' },
          { value: 'iti_diploma', label: 'ITI / Polytechnic Diploma' },
          { value: 'undergraduate', label: 'Undergraduate Degree (B.A / B.Sc / B.Com / B.B.A)' },
          { value: 'professional', label: 'Professional Degree (Engineering / Medicine / Law / Agri)' },
          { value: 'postgraduate', label: 'Post-Graduate (M.A / M.Sc / M.Tech / MBA)' }
        ]
      },
      {
        id: 'casteCategory',
        label: 'Reservation / Beneficiary Category',
        labelKn: 'ಪ್ರವರ್ಗ / ಮೀಸಲಾತಿ ವರ್ಗ',
        type: 'select',
        required: true,
        options: [
          { value: 'sc', label: 'Scheduled Caste (SC)' },
          { value: 'st', label: 'Scheduled Tribe (ST)' },
          { value: 'cat_1', label: 'Backward Classes Category-1' },
          { value: 'cat_2a_2b', label: 'Category 2A / 2B' },
          { value: 'cat_3a_3b', label: 'Category 3A / 3B' },
          { value: 'general_ews', label: 'General / EWS' }
        ]
      },
      {
        id: 'casteIncomeCertRd',
        label: 'Caste & Income Certificate RD Number',
        labelKn: 'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ RD ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. RD00392817263',
        required: true,
        helpText: 'Official 15-digit RD number from Nadakacheri.'
      }
    ]
  },

  // 8. Health Services (Ayushman Bharat - Arogya Karnataka)
  {
    id: 'arogya-karnataka',
    title: 'Arogya Karnataka (Ayushman Bharat — SAST)',
    titleKn: 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)',
    department: 'Health and Family Welfare / Suvarna Arogya Suraksha Trust',
    departmentKn: 'ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್',
    category: 'health',
    categoryLabel: 'Health Services',
    categoryLabelKn: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು',
    shortDesc: 'Cashless secondary and tertiary hospitalization cover up to ₹5 lakh per year per family for BPL families and subsidized co-payment for APL families.',
    shortDescKn: 'ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಎಪಿಎಲ್ ಕುಟುಂಬಗಳಿಗೆ ರಿಯಾಯಿತಿ ದರದ ವೈದ್ಯಕೀಯ ಸೇವೆ.',
    beneficiaries: 'All permanent residents of Karnataka holding an eligible Ration Card.',
    beneficiariesKn: 'ಕರ್ನಾಟಕದ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ನಾಗರಿಕರು.',
    benefits: 'Cashless treatment up to ₹5 lakh at government hospitals and empanelled private super-specialty hospitals.',
    benefitsKn: 'ನೊಂದಾಯಿತ ಸರ್ಕಾರಿ ಮತ್ತು ಖಾಸಗಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ.',
    eligibilityCriteria: [
      'Permanent resident of Karnataka.',
      'Must possess an active BPL / PHH Ration Card for 100% free treatment or APL Card for co-payment.',
      'Referral from Government Primary Health Centre (PHC) / Taluk Hospital required for non-emergency tertiary care.'
    ],
    requiredDocuments: [
      'Karnataka Ration Card (BPL / APL)',
      'Aadhaar Card of the patient and family head',
      'Government Hospital Referral Slip (for tertiary treatment)'
    ],
    officialUrl: 'https://arogya.karnataka.gov.in',
    sourceUrl: 'https://sast.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'patientName',
        label: 'Patient Full Name',
        labelKn: 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು',
        type: 'text',
        placeholder: 'e.g. Parvathamma',
        required: true
      },
      {
        id: 'patientAge',
        label: 'Patient Age',
        labelKn: 'ರೋಗಿಯ ವಯಸ್ಸು',
        type: 'number',
        placeholder: 'e.g. 52',
        required: true
      },
      {
        id: 'rationCardType',
        label: 'Ration Card Category',
        labelKn: 'ಪಡಿತರ ಚೀಟಿ ವರ್ಗ',
        type: 'select',
        required: true,
        options: [
          { value: 'bpl', label: 'BPL / Antyodaya (Eligible for 100% Cashless Treatment)' },
          { value: 'apl', label: 'APL Cardholder (Eligible for 30% Package Subsidy)' }
        ]
      },
      {
        id: 'medicalCondition',
        label: 'Chief Medical Concern / Diagnosis',
        labelKn: 'ಆರೋಗ್ಯ ಸಮಸ್ಯೆ / ಕಾಯಿಲೆಯ ವಿವರ',
        type: 'textarea',
        placeholder: 'Describe symptoms or surgical procedure advised by treating physician...',
        required: true
      }
    ]
  },

  // 9. Business / MSME (Rural Artisan & Micro Subsidy)
  {
    id: 'msme-artisan-subsidy',
    title: 'Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy',
    titleKn: 'ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ',
    department: 'Commerce and Industries / Development Corporations',
    departmentKn: 'ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ',
    category: 'business',
    categoryLabel: 'Business / MSME',
    categoryLabelKn: 'ಉದ್ಯಮ / ಎಂಎಸ್ಎಂಇ',
    shortDesc: 'Financial margin-money subsidy up to ₹2.0 lakh for rural artisans, traditional craftsmen, and small micro-enterprises setting up local production.',
    shortDescKn: 'ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗಳು ಮತ್ತು ಕಿರು ಉದ್ಯಮಿಗಳಿಗೆ ಹೊಸ ಘಟಕ ಸ್ಥಾಪಿಸಲು ₹2 ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಮತ್ತು ಸಹಾಯಧನ.',
    beneficiaries: 'Rural traditional artisans, potters, weavers, carpenters, and small manufacturing entrepreneurs.',
    beneficiariesKn: 'ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗಳು ಹಾಗೂ ಸ್ವಯಂ ಉದ್ಯೋಗ ಆರಂಭಿಸುವ ಆಸಕ್ತ ಯುವಕರು.',
    benefits: '50% capital subsidy (up to ₹2,00,000) combined with bank soft loan at concessional interest.',
    benefitsKn: 'ಶೇ.50 ರವರೆಗೆ ನೇರ ಬಂಡವಾಳ ಸಹಾಯಧನ ಮತ್ತು ಬ್ಯಾಂಕ್ ಸಾಲ ಸೌಲಭ್ಯ.',
    eligibilityCriteria: [
      'Applicant must be aged 18 to 55 years and a permanent resident of Karnataka.',
      'Must have skill or vocational experience in proposed trade or artisan activity.',
      'Annual household income must be below ₹2.0 lakh in rural areas.',
      'Must not have defaulted on any commercial or cooperative bank loan.'
    ],
    requiredDocuments: [
      'Aadhaar Card and Voter ID',
      'Caste and Income Certificate issued by Revenue Authority',
      'Artisan Identity Card / Skill Training Certificate (if available)',
      'Detailed Project Cost Estimate for tools/equipment',
      'Gram Panchayat trade endorsement or premises proof'
    ],
    officialUrl: 'https://adcl.karnataka.gov.in',
    sourceUrl: 'https://sevasindhu.karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      minAge: 18,
      maxAge: 55,
      maxIncome: 200000,
      karnatakaResidentOnly: true
    },
    formFields: [
      {
        id: 'enterpriseName',
        label: 'Proposed Enterprise / Workshop Name',
        labelKn: 'ಉದ್ದೇಶಿತ ಉದ್ದಿಮೆ / ಕಾರ್ಯಾಗಾರದ ಹೆಸರು',
        type: 'text',
        placeholder: 'e.g. Sri Maruthi Rural Agro Works',
        required: true
      },
      {
        id: 'tradeCategory',
        label: 'Trade / Artisan Category',
        labelKn: 'ವೃತ್ತಿ / ಕರಕುಶಲ ಕಲೆಯ ವಿವರ',
        type: 'select',
        required: true,
        options: [
          { value: 'carpentry', label: 'Carpentry / Woodcraft' },
          { value: 'blacksmithy', label: 'Blacksmithy / Metal Works' },
          { value: 'pottery', label: 'Pottery / Terracotta Crafts' },
          { value: 'handloom', label: 'Handloom / Weaving / Tailoring' },
          { value: 'agro_processing', label: 'Small Agro-Processing (Flour / Oil Mill)' },
          { value: 'repair_works', label: 'Rural Repair Shop / Two-Wheeler Workshop' }
        ]
      },
      {
        id: 'projectCost',
        label: 'Total Estimated Project Cost (₹)',
        labelKn: 'ಒಟ್ಟು ಅಂದಾಜು ಯೋಜನಾ ವೆಚ್ಚ (₹)',
        type: 'number',
        placeholder: 'e.g. 150000',
        required: true,
        helpText: 'Eligible for projects up to ₹5,00,000 (Subsidy applies up to ₹2,00,000).'
      }
    ]
  },

  // 10. IT & Digital Services (Kaveri 2.0 Encumbrance Certificate & Deeds)
  {
    id: 'kaveri-ec-services',
    title: 'Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds',
    titleKn: 'ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು',
    department: 'Department of Stamps and Registration',
    departmentKn: 'ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
    category: 'it_services',
    categoryLabel: 'IT & Digital Services',
    categoryLabelKn: 'ಡಿಜಿಟಲ್ / ದಾಖಲೆ ಸೇವೆಗಳು',
    shortDesc: 'Instant digital application for Encumbrance Certificate (EC Form 15/16) and certified copies of registered land/property sale deeds.',
    shortDescKn: 'ಸ್ಥಿರ ಆಸ್ತಿಯ ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (ಇ.ಸಿ) ಮತ್ತು ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರಗಳ ದೃಢೀಕೃತ ನಕಲು ಪಡೆಯುವ ಆನ್‌ಲೈನ್ ಸೇವೆ.',
    beneficiaries: 'Property owners, rural farmers, and citizens verifying legal land title and registered encumbrances.',
    beneficiariesKn: 'ಆಸ್ತಿ ಮಾಲೀಕರು ಮತ್ತು ಕೃಷಿ ಜಮೀನಿನ ಮಾಲೀಕತ್ವ ಪರಿಶೀಲಿಸುವ ನಾಗರಿಕರು.',
    benefits: 'Cryptographically signed digital Encumbrance Certificate legally valid for bank loans and registration.',
    benefitsKn: 'ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿದ ಮಾನ್ಯತೆ ಪಡೆದ ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC).',
    eligibilityCriteria: [
      'Any citizen possessing property survey number, village/ward details, or registration deed number.',
      'No income restriction applies.'
    ],
    requiredDocuments: [
      'Property Survey Number / Municipal Khata Number',
      'Name of Property Owner as per Registration Record',
      'Sub-Registrar Office (SRO) jurisdiction name',
      'Applicant Aadhaar or Mobile Number'
    ],
    officialUrl: 'https://kaverionline.karnataka.gov.in',
    sourceUrl: 'https://karnataka.gov.in',
    lastVerified: 'October 2026',
    offlineReady: true,
    officialIntegrationAvailable: false,
    eligibilityRules: {
      karnatakaResidentOnly: false
    },
    formFields: [
      {
        id: 'serviceRequired',
        label: 'Certificate Service Required',
        labelKn: 'ಕೋರಿದ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆ',
        type: 'select',
        required: true,
        options: [
          { value: 'ec', label: 'Encumbrance Certificate (EC Form 15 / 16)' },
          { value: 'certified_copy', label: 'Certified Copy of Registered Sale / Title Deed' }
        ]
      },
      {
        id: 'subRegistrarOffice',
        label: 'Sub-Registrar Office (SRO) Jurisdiction',
        labelKn: 'ಸಂಬಂಧಪಟ್ಟ ಉಪನೋಂದಣಾಧಿಕಾರಿ ಕಚೇರಿ (SRO)',
        type: 'text',
        placeholder: 'e.g. Mysuru South / Hunsur SRO',
        required: true
      },
      {
        id: 'surveyOrKhataNo',
        label: 'Property Survey No. / Municipal Khata No.',
        labelKn: 'ಆಸ್ತಿಯ ಸರ್ವೆ ನಂ. / ಖಾತಾ ಸಂಖ್ಯೆ',
        type: 'text',
        placeholder: 'e.g. Survey No. 45/3 or Khata No. 1290',
        required: true
      },
      {
        id: 'searchPeriodYears',
        label: 'Search Duration Period (in Years)',
        labelKn: 'ಶೋಧನಾ ಅವಧಿ (ವರ್ಷಗಳಲ್ಲಿ)',
        type: 'select',
        required: true,
        options: [
          { value: '5', label: 'Last 5 Years' },
          { value: '10', label: 'Last 10 Years' },
          { value: '15', label: 'Last 15 Years' },
          { value: '30', label: 'Full 30 Years Search (Title Clearance)' }
        ]
      }
    ]
  }
];

// ==============================================================================
// VERIFIED EXTENDED DETAILS FOR SCHEME DETAILS MODAL (PART A2 / A3)
// ==============================================================================
const SCHEME_EXTENDED_DETAILS = {
  'agri-seed-subsidy': {
    intendedFor: 'Small and marginal farmers holding agricultural land registered in FRUITS.',
    intendedForKn: 'ಫ್ರೂಟ್ಸ್ ತಂತ್ರಾಂಶದಲ್ಲಿ ನೋಂದಾಯಿತ ಕೃಷಿ ಜಮೀನು ಹೊಂದಿರುವ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರು.',
    applicationProcedure: [
      'Fill and save your application draft in OfflineBridge completely offline.',
      'Obtain or verify your 12-digit FRUITS Farmer ID (FID) at the nearest Raitha Samparka Kendra (RSK).',
      'Submit the verified draft details along with your RTC / Pahani record at your local RSK or Agriculture Assistant office before sowing season.',
      'Upon biometric verification, collect subsidised certified seeds directly from the RSK distribution counter.'
    ],
    deadlines: 'Seasonal: Kharif distribution (May–July) and Rabi distribution (September–November). Open annually.',
    deadlinesKn: 'ಋತುಮಾನ ಆಧಾರಿತ: ಮುಂಗಾರು ಹಂಚಿಕೆ (ಮೇ-ಜುಲೈ) ಮತ್ತು ಹಿಂಗಾರು ಹಂಚಿಕೆ (ಸೆಪ್ಟೆಂಬರ್-ನವೆಂಬರ್).',
    faqs: [
      {
        question: 'Is FRUITS Farmer ID mandatory to receive seed subsidies?',
        questionKn: 'ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ ಪಡೆಯಲು FRUITS ಐಡಿ ಕಡ್ಡಾಯವೇ?',
        answer: 'Yes. The Agriculture Department requires every farmer to have an active Farmer ID (FID) registered in the Karnataka FRUITS portal to prevent duplicate allotments.',
        answerKn: 'ಹೌದು, ಕೃಷಿ ಇಲಾಖೆಯ ನಿಯಮಾವಳಿಯಂತೆ ನಕಲು ತಡೆಯಲು FRUITS ತಂತ್ರಾಂಶದಲ್ಲಿ ನೋಂದಾಯಿತ ರೈತ ಐಡಿ (FID) ಕಡ್ಡಾಯವಾಗಿದೆ.'
      },
      {
        question: 'Can tenant farmers or sharecroppers apply?',
        questionKn: 'ಗೇಣಿ ಅಥವಾ ಜಂಟಿ ಸಾಗುವಳಿದಾರರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದೇ?',
        answer: 'Tenant farmers can apply if their tenancy agreement is endorsed by the local Gram Panchayat or recorded on the Bhoomi RTC.',
        answerKn: 'ಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಅಥವಾ ಭೂಮಿ ಪಹಣಿಯಲ್ಲಿ ಗೇಣಿ ಸಾಗುವಳಿ ನಮೂದಾಗಿದ್ದರೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.'
      }
    ]
  },
  'old-age-pension': {
    intendedFor: 'Destitute and elderly rural/urban citizens aged 65 and above without family financial support.',
    intendedForKn: '65 ವರ್ಷ ಮೀರಿದ ಸ್ವಾವಲಂಬಿ ಆದಾಯವಿಲ್ಲದ ರಾಜ್ಯದ ಹಿರಿಯ ನಾಗರಿಕರು.',
    applicationProcedure: [
      'Fill personal and income details into the offline draft on your device.',
      'Obtain an annual Income Certificate (RD Number) from Nadakacheri or Atalji Janasnehi Kendra showing family income under ₹32,000.',
      'Submit the application at your local Nadakacheri, Bangalore One, or Grama One centre with age and residence proof.',
      'Revenue Inspector conducts local verification within 21 working days under Sakala standards.'
    ],
    deadlines: 'Open continuous enrollment throughout the financial year. No fixed seasonal deadline.',
    deadlinesKn: 'ವರ್ಷಪೂರ್ತಿ ನಿರಂತರ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಮುಕ್ತವಾಗಿದೆ.',
    faqs: [
      {
        question: 'What is the minimum age to receive Sandhya Suraksha pension?',
        questionKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಪಿಂಚಣಿಗೆ ಕನಿಷ್ಠ ವಯಸ್ಸು ಎಷ್ಟು?',
        answer: 'The applicant must be at least 65 years old on the date of application, verified via Voter ID, Aadhaar, or Birth Certificate.',
        answerKn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ದಿನಾಂಕಕ್ಕೆ ಕನಿಷ್ಠ 65 ವರ್ಷ ಪೂರ್ಣಗೊಂಡಿರಬೇಕು (ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಅಥವಾ ಆಧಾರ್ ದಾಖಲೆ).'
      },
      {
        question: 'Can I apply if my son is employed?',
        questionKn: 'ಮಕ್ಕಳು ಉದ್ಯೋಗದಲ್ಲಿದ್ದರೆ ತಂದೆ-ತಾಯಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದೇ?',
        answer: 'Eligibility depends on combined household annual income. If the total family income exceeds statutory limits, the pension cannot be sanctioned.',
        answerKn: 'ಒಟ್ಟಾರೆ ಕುಟುಂಬದ ಆದಾಯ ₹32,000 ಮೀರದಿದ್ದಲ್ಲಿ ಮಾತ್ರ ಮಾಸಾಶನ ಮಂಜೂರಾಗುತ್ತದೆ.'
      }
    ]
  },
  'rural-housing-assist': {
    intendedFor: 'Homeless rural families or residents living in kutcha/thatched dwellings with an active BPL ration card.',
    intendedForKn: 'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವಸತಿ ರಹಿತ ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳು.',
    applicationProcedure: [
      'Prepare site and household draft details in OfflineBridge.',
      'Ensure your name is included in the Gram Panchayat beneficiary waiting list (Ashraya list).',
      'Submit your application with GP Hakku Patra and BPL card to the Panchayat Development Officer (PDO).',
      'Gram Sabha approves beneficiary selection, followed by geo-tagging of the vacant site before stage-wise grant release.'
    ],
    deadlines: 'Gram Sabha annual selection meetings held post-budget allocation (typically July–September).',
    deadlinesKn: 'ವಾರ್ಷಿಕ ಗ್ರಾಮ್ ಸಭೆ ಅನುಮೋದನೆ ಹಂತದಲ್ಲಿ ಆಯ್ಕೆ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತದೆ.',
    faqs: [
      {
        question: 'How is the ₹1.20 lakh housing grant released?',
        questionKn: 'ವಸತಿ ಅನುದಾನ ಹಣ ಹೇಗೆ ಬಿಡುಗಡೆಯಾಗುತ್ತದೆ?',
        answer: 'The grant is released directly to the beneficiary bank account in 4 GPS geo-tagged construction stages: Basement level, Lintel level, Roof level, and Completion.',
        answerKn: 'ಜಿಪಿಎಸ್ ಜಿಯೋ-ಟ್ಯಾಗ್ ಆಧಾರಿತ 4 ಹಂತಗಳಲ್ಲಿ (ಅಡಿಪಾಯ, ಲಿಂಟಲ್, ಛಾವಣಿ ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ನಂತರ) ಹಣ ನೇರವಾಗಿ ಜಮೆಯಾಗುತ್ತದೆ.'
      }
    ]
  },
  'ration-card-update': {
    intendedFor: 'Existing ration cardholders seeking additions, deletions, address transfers, or head-of-household updates.',
    intendedForKn: 'ಕರ್ನಾಟಕದ ಮಾನ್ಯತೆ ಹೊಂದಿರುವ ಪಡಿತರ ಚೀಟಿದಾರರು.',
    applicationProcedure: [
      'Fill required modification information into the offline ArivuNet form.',
      'For child addition, obtain digital birth certificate. For spouse, obtain marriage certificate and name deletion certificate from previous card.',
      'Submit via Ahara online portal or at Grama One / Karnataka One / Bangalore One service counter.',
      'Food Inspector approves modification after verifying Aadhaar biometric deduplication in Ahara database.'
    ],
    deadlines: 'Open during online portal operational windows (notified monthly by Food and Civil Supplies Dept).',
    deadlinesKn: 'ಆಹಾರ ಇಲಾಖೆಯ ಪೋರ್ಟಲ್ ವಿಂಡೋ ತೆರೆದಿರುವ ದಿನಗಳಲ್ಲಿ ಲಭ್ಯ.',
    faqs: [
      {
        question: 'Is biometric Aadhaar authentication required for all members?',
        questionKn: 'ಎಲ್ಲಾ ಕುಟುಂಬ ಸದಸ್ಯರ ಬಯೋಮೆಟ್ರಿಕ್ ಆಧಾರ್ ಇ-ಕೆವೈಸಿ ಕಡ್ಡಾಯವೇ?',
        answer: 'Yes. E-KYC biometric authentication via Aadhaar OTP or POS machine is mandatory for every family member on the ration card.',
        answerKn: 'ಹೌದು, ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿರುವ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಇ-ಕೆವೈಸಿ ಬಯೋಮೆಟ್ರಿಕ್ ದೃಢೀಕರಣ ಕಡ್ಡಾಯ.'
      }
    ]
  },
  'gruha-lakshmi': {
    intendedFor: 'The designated woman head of household recorded in Antyodaya, BPL, or APL ration cards in Karnataka.',
    intendedForKn: 'ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿ ನಮೂದಾಗಿರುವ ಮಹಿಳಾ ಕುಟುಂಬದ ಯಜಮಾನಿ.',
    applicationProcedure: [
      'Draft your application and verify bank account details locally in ArivuNet.',
      'Ensure the woman head’s bank account has NPCI Aadhaar seeding active.',
      'Submit at Grama One, Karnataka One, Bangalore One, or Bapuji Seva Kendra.',
      'No application fees are required. Monthly ₹2,000 credit begins post-verification via Direct Benefit Transfer (DBT).'
    ],
    deadlines: 'Continuous open scheme. No closing deadline.',
    deadlinesKn: 'ಯೋಜನೆಯು ನಿರಂತರವಾಗಿ ಜಾರಿಯಲ್ಲಿದೆ.',
    faqs: [
      {
        question: 'Can two women in the same joint family get Gruha Lakshmi?',
        questionKn: 'ಒಂದೇ ಜಂಟಿ ಕುಟುಂಬದ ಇಬ್ಬರು ಮಹಿಳೆಯರಿಗೆ ಯೋಜನೆ ಸಿಗುವುದೇ?',
        answer: 'No. Only one woman who is designated as the primary head of the family on the ration card is entitled to the benefit.',
        answerKn: 'ಇಲ್ಲ. ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿ ಕುಟುಂಬದ ಪ್ರಮುಖ ಯಜಮಾನಿ ಎಂದು ಗುರುತಿಸಲಾದ ಒಬ್ಬ ಮಹಿಳೆಗೆ ಮಾತ್ರ ಸೌಲಭ್ಯ ದೊರೆಯುತ್ತದೆ.'
      }
    ]
  },
  'yuva-nidhi': {
    intendedFor: 'Unemployed graduate degree or polytechnic diploma holders who completed studies from Karnataka institutions.',
    intendedForKn: 'ಕರ್ನಾಟಕದಲ್ಲಿ ಪದವಿ ಅಥವಾ ಡಿಪ್ಲೊಮಾ ಮುಗಿಸಿ ಉದ್ಯೋಗ ಹುಡುಕುತ್ತಿರುವ ಯುವಜನತೆ.',
    applicationProcedure: [
      'Prepare degree/diploma roll number and domicile details in ArivuNet.',
      'Register on Seva Sindhu Guarantee Services portal (sevasindhugs.karnataka.gov.in) with Aadhaar.',
      'Submit the unemployment declaration confirming 180+ days since graduation without private/govt employment or higher studies.',
      'Submit monthly self-declaration on the portal to continue receiving ₹3,000 (Degree) or ₹1,500 (Diploma) monthly DBT.'
    ],
    deadlines: 'Applicable for eligible academic passing batches. Ongoing enrollment.',
    deadlinesKn: 'ಅರ್ಹ ಶೈಕ್ಷಣಿಕ ಬ್ಯಾಚ್‌ಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಮುಕ್ತವಾಗಿದೆ.',
    faqs: [
      {
        question: 'How long can I receive the Yuva Nidhi monthly allowance?',
        questionKn: 'ಯುವ ನಿಧಿ ಭತ್ಯೆಯನ್ನು ಗರಿಷ್ಠ ಎಷ್ಟು ಅವಧಿಯವರೆಗೆ ಪಡೆಯಬಹುದು?',
        answer: 'For a maximum period of two years (24 months) from the date of sanction, or until the candidate secures employment or enrolls in higher studies.',
        answerKn: 'ಗರಿಷ್ಠ 2 ವರ್ಷಗಳವರೆಗೆ ಅಥವಾ ಉದ್ಯೋಗ ದೊರೆಯುವವರೆಗೆ (ಯಾವುದು ಮೊದಲೋ ಅದು).'
      }
    ]
  },
  'ssp-scholarship': {
    intendedFor: 'SC, ST, OBC, and minority students enrolled in recognized post-matric colleges and technical institutes.',
    intendedForKn: 'ಎಸ್.ಸಿ, ಎಸ್.ಟಿ, ಒಬಿಸಿ ಮತ್ತು ಅಲ್ಪಸಂಖ್ಯಾತ ವರ್ಗದ ವಿದ್ಯಾರ್ಥಿಗಳು.',
    applicationProcedure: [
      'Assemble college fee receipts, SATS ID, and Caste/Income certificate RD numbers.',
      'Prepare draft profile in ArivuNet.',
      'Complete online submission on State Scholarship Portal (ssp.postmatric.karnataka.gov.in).',
      'Institute nodal officer verifies admission, after which department sanctions tuition and maintenance allowances.'
    ],
    deadlines: 'Annual academic notification (typically August to November annually, extended as per university calendar).',
    deadlinesKn: 'ವಾರ್ಷಿಕ ಶೈಕ್ಷಣಿಕ ಅಧಿಸೂಚನೆ (ಆಗಸ್ಟ್-ನವೆಂಬರ್ ಅವಧಿ).',
    faqs: [
      {
        question: 'What is e-Attestation for SSP?',
        questionKn: 'SSP ತಂತ್ರಾಂಶದಲ್ಲಿ ಇ-ದೃಢೀಕರಣ (e-Attestation) ಎಂದರೇನು?',
        answer: 'e-Attestation is the digital verification of original academic and fee documents by an assigned taluk e-Attestation officer before scholarship submission.',
        answerKn: 'ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಲ್ಲಿಕೆಗೆ ಮುನ್ನ ತಾಲೂಕು ಅಧಿಕಾರಿಯಿಂದ ಮೂಲ ದಾಖಲೆಗಳನ್ನು ಆನ್‌ಲೈನ್ ಮೂಲಕ ಪರಿಶೀಲಿಸುವ ಪ್ರಕ್ರಿಯೆ.'
      }
    ]
  },
  'arogya-karnataka': {
    intendedFor: 'All permanent residents of Karnataka requiring secondary and tertiary medical/surgical care.',
    intendedForKn: 'ಕರ್ನಾಟಕದ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ನಾಗರಿಕರು.',
    applicationProcedure: [
      'Visit your local Government Primary Health Centre (PHC) or General Hospital with your Ration Card and Aadhaar.',
      'Primary doctor evaluates medical condition and provides an online referral slip (SAST referral) for tertiary care.',
      'Present referral slip and Ration Card at any empanelled government or private super-specialty hospital.',
      'Arogya Mitra desk at the hospital registers patient and processes cashless treatment package up to ₹5 lakh for BPL.'
    ],
    deadlines: 'Emergency and non-emergency services available 24/7 across all 365 days.',
    deadlinesKn: 'ವರ್ಷದ ಎಲ್ಲಾ ದಿನಗಳಲ್ಲೂ 24/7 ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.',
    faqs: [
      {
        question: 'Is a government hospital referral mandatory for private hospitals?',
        questionKn: 'ಖಾಸಗಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಚಿಕಿತ್ಸೆ ಪಡೆಯಲು ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯ ರೆಫರಲ್ ಕಡ್ಡಾಯವೇ?',
        answer: 'Yes, for non-emergency tertiary packages, a referral slip from a government hospital is mandatory. Emergency life-threatening cases can be admitted directly.',
        answerKn: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಸಾಮಾನ್ಯ ಸಂದರ್ಭಗಳಲ್ಲಿ ಸರ್ಕಾರಿ ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆಯ ರೆಫರಲ್ ಕಡ್ಡಾಯ.'
      }
    ]
  },
  'msme-artisan-subsidy': {
    intendedFor: 'Rural traditional artisans, carpenters, weavers, potters, and small rural enterprise creators.',
    intendedForKn: 'ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗಳು ಹಾಗೂ ಸ್ವಯಂ ಉದ್ಯೋಗ ಆರಂಭಿಸುವ ಆಸಕ್ತ ಯುವಕರು.',
    applicationProcedure: [
      'Prepare artisan trade details and estimated project equipment costs in ArivuNet.',
      'Obtain Caste and Income certificate from Nadakacheri.',
      'Submit application online via Seva Sindhu or through Dr. B.R. Ambedkar Development Corporation district office.',
      'District selection committee interviews candidates and sanctions soft loan + 50% capital subsidy with partner bank.'
    ],
    deadlines: 'Annual financial year schemes window (notified by Development Corporations).',
    deadlinesKn: 'ಅಭಿವೃದ್ಧಿ ನಿಗಮಗಳ ವಾರ್ಷಿಕ ಪ್ರಕಟಣೆಯಂತೆ.',
    faqs: [
      {
        question: 'What is the maximum subsidy amount available?',
        questionKn: 'ಗರಿಷ್ಠ ಎಷ್ಟು ಸಹಾಯಧನ ದೊರೆಯುತ್ತದೆ?',
        answer: 'Up to 50% of the project cost or a maximum of ₹2,00,000 (whichever is lower) as margin-money capital subsidy.',
        answerKn: 'ಯೋಜನಾ ವೆಚ್ಚದ ಶೇ.50 ರಷ್ಟು ಅಥವಾ ಗರಿಷ್ಠ ₹2 ಲಕ್ಷ (ಯಾವುದು ಕಡಿಮೆಯೋ ಅದು) ಸಹಾಯಧನ ದೊರೆಯುತ್ತದೆ.'
      }
    ]
  },
  'kaveri-ec-services': {
    intendedFor: 'Property owners, farmers, and legal title seekers verifying property encumbrance and registered deeds.',
    intendedForKn: 'ಆಸ್ತಿ ಮಾಲೀಕರು ಮತ್ತು ಕೃಷಿ ಜಮೀನಿನ ಮಾಲೀಕತ್ವ ಪರಿಶೀಲಿಸುವ ನಾಗರಿಕರು.',
    applicationProcedure: [
      'Locate your property survey number or municipal khata number and Sub-Registrar Office jurisdiction.',
      'Draft your search period in ArivuNet.',
      'Apply online on Kaveri 2.0 portal (kaverionline.karnataka.gov.in).',
      'Pay prescribed nominal government search fee online and download cryptographically signed digital Encumbrance Certificate (Form 15/16).'
    ],
    deadlines: 'Instant digital service available online 24x7.',
    deadlinesKn: 'ದಿನದ 24 ಗಂಟೆಯೂ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ.',
    faqs: [
      {
        question: 'What is the difference between Form 15 and Form 16 EC?',
        questionKn: 'ನಮೂನೆ 15 ಮತ್ತು ನಮೂನೆ 16 ಇ.ಸಿ (EC) ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?',
        answer: 'Form 15 is issued when registered transactions/encumbrances exist for the search period. Form 16 (Nil Encumbrance) is issued when no transactions are registered.',
        answerKn: 'ನಮೂನೆ 15 ನೋಂದಾಯಿತ ವ್ಯವಹಾರಗಳಿದ್ದಾಗ ನೀಡಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಸಾಲ ಅಥವಾ ವ್ಯವಹಾರ ಇಲ್ಲದಿದ್ದಾಗ ನಿರಾಕ್ಷೇಪಣಾ ನಮೂನೆ 16 (Nil EC) ದೊರೆಯುತ್ತದೆ.'
      }
    ]
  }
};

// Normalize expanded schemes for 100% backward compatibility
const normalizedExpanded = (EXPANDED_GOV_SCHEMES || []).map((s) => ({
  ...s,
  shortDesc: s.shortDesc || (typeof s.description === 'string' ? s.description : ''),
  shortDescKn: s.shortDescKn || (typeof s.descriptionKn === 'string' ? s.descriptionKn : ''),
  offlineReady: s.offlineReady !== false,
  officialIntegrationAvailable: false,
  beneficiaries: s.beneficiaries || s.categoryLabel || 'Eligible Citizens',
  beneficiariesKn: s.beneficiariesKn || s.categoryLabelKn || 'ಅರ್ಹ ನಾಗರಿಕರು'
}));

export const SCHEMES_CATALOGUE = [
  ...BASE_SCHEMES,
  ...normalizedExpanded
];

// Merge extended details into every scheme object
SCHEMES_CATALOGUE.forEach((scheme) => {
  const ext = SCHEME_EXTENDED_DETAILS[scheme.id] || {};
  scheme.intendedFor = ext.intendedFor || scheme.beneficiaries;
  scheme.intendedForKn = ext.intendedForKn || scheme.beneficiariesKn;
  scheme.applicationProcedure = ext.applicationProcedure || [
    'Prepare application details and document readiness using the offline draft form in OfflineBridge.',
    'Verify mandatory eligibility criteria and required documents checklist.',
    'Submit final application through the verified government department portal or at your local Grama One / Bangalore One centre.'
  ];
  scheme.deadlines = ext.deadlines || 'Open during active government scheme notification window.';
  scheme.deadlinesKn = ext.deadlinesKn || 'ಇಲಾಖೆಯ ಅಧಿಕೃತ ಅಧಿಸೂಚನೆ ಅವಧಿಯಲ್ಲಿ ಲಭ್ಯ.';
  scheme.faqs = ext.faqs || [
    {
      question: 'Is this an official government application submission?',
      questionKn: 'ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆಯೇ?',
      answer: 'No. OfflineBridge is an offline-first guidance portal that preserves your application draft locally. Final submission must be completed via the verified government portal.',
      answerKn: 'ಇಲ್ಲ. ಇದು ಆಫ್‌ಲೈನ್ ಮಾರ್ಗದರ್ಶಿ ನಮೂನೆಯಾಗಿದೆ. ಅಧಿಕೃತ ಸಲ್ಲಿಕೆಯನ್ನು ಅಧಿಕೃತ ಇಲಾಖಾ ಪೋರ್ಟಲ್ ಮೂಲಕ ಪೂರ್ಣಗೊಳಿಸಬೇಕು.'
    }
  ];
});

/**
 * Retrieve all catalogue schemes
 */
export function getAllCatalogueSchemes() {
  return SCHEMES_CATALOGUE;
}

/**
 * Find single scheme by unique identifier
 */
export function getCatalogueSchemeById(id) {
  if (!id) return null;
  return SCHEMES_CATALOGUE.find((s) => s.id === String(id)) || null;
}

/**
 * Filter catalogue schemes by search term, category, and sorting
 */
export function filterCatalogueSchemes({ category = 'all', search = '', sort = 'title_asc' } = {}) {
  let list = [...SCHEMES_CATALOGUE];

  // 1. Category Filter
  if (category && category !== 'all') {
    list = list.filter((s) => s.category === category);
  }

  // 2. Search Text
  const term = String(search || '').trim().toLowerCase();
  if (term) {
    list = list.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(term);
      const matchTitleKn = (s.titleKn || '').includes(term);
      const matchDept = s.department.toLowerCase().includes(term);
      const matchDesc = s.shortDesc.toLowerCase().includes(term);
      const matchCat = s.categoryLabel.toLowerCase().includes(term);
      return matchTitle || matchTitleKn || matchDept || matchDesc || matchCat;
    });
  }

  // 3. Sorting
  if (sort === 'title_asc') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'title_desc') {
    list.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sort === 'dept_asc') {
    list.sort((a, b) => a.department.localeCompare(b.department));
  }

  return list;
}
