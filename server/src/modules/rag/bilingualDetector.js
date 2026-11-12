/**
 * ArivuNet (ಅರಿವುನೆಟ್) / OfflineBridge — Bilingual Language & Kanglish Detector
 * 
 * Provides robust language and intent detection across:
 * - English text
 * - Kannada script (\u0C80-\u0CFF)
 * - Mixed Kannada-English code-switching
 * - Kanglish (Kannada transliterated into Latin characters)
 * - Explicit language directives ("in Kannada", "English nalli", "ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ")
 * 
 * Safety & Precision:
 * - Separates input script/language from desired response language.
 * - Detects explicit instructions before applying automatic classification.
 * - Protects proper nouns, scheme names, and technical terms from misclassification.
 */

// Common Kanglish phonetic words used in conversational queries in Karnataka
const KANGLISH_KEYWORDS = [
  'yenu', 'enu', 'hege', 'hego', 'madoke', 'madodu', 'maduvudu', 'madalu',
  'madbeku', 'beku', 'bekku', 'bekagide', 'kodi', 'heli', 'thilisi', 'tilisi',
  'yojanege', 'yojane', 'yojana', 'arhathe', 'arhathege', 'arha', 'arharu',
  'dakhalegalu', 'dakhale', 'patragalu', 'salisuvudu', 'salisoke', 'arji',
  'padiyuvudu', 'padedu', 'siguthe', 'sigutte', 'nanna', 'namage', 'yaru', 'yaaru',
  'aagidya', 'agidya', 'aagide', 'agide', 'ilva', 'ideya', 'iddare',
  'bhoomi', 'pahani', 'khata', 'haage', 'yaavudu', 'yaava', 'ellaru',
  'sulabha', 'hosa', 'thumba', 'tumba', 'sarkara', 'sarakaara', 'jana',
  'kannadadalli', 'kannadanalli', 'gotthilla', 'gottilla', 'ondhu', 'eradu'
];

// Explicit request patterns for English response
const EXPLICIT_ENGLISH_PATTERNS = [
  /\b(in\s+english|to\s+english|into\s+english|tell\s+me\s+in\s+english|explain\s+in\s+english|answer\s+in\s+english|reply\s+in\s+english|write\s+in\s+english)\b/i,
  /\b(english\s*nalli|englishdalli|english\s*dalli|english\s*ge)\b/i,
  /\benglish\b\s*(ನಲ್ಲಿ|ನಲ್ಲೇ|ನಲ್ಲಿಯೇ|ಗೆ)?\s*(ಹೇಳಿ|ವಿವರಿಸಿ|ಉತ್ತರಿಸಿ|ತಿಳಿಸಿ|ಮಾಹಿತಿ)/i,
  /\benglish\s*ನಲ್ಲಿ/i,
  /ಇಂಗ್ಲಿಷ್\s*(ನಲ್ಲೇ|ನಲ್ಲಿ|ನಲ್ಲಿಯೇ|ಗೆ)\s*(ಹೇಳಿ|ವಿವರಿಸಿ|ಉತ್ತರಿಸಿ|ತಿಳಿಸಿ|ಮಾಹಿತಿ\s*ನೀಡಿ)?/i,
  /ಇಂಗ್ಲಿಷ್‌ನಲ್ಲೇ|ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ|ಇಂಗ್ಲಿಷ್ನಲ್ಲಿ|ಇಂಗ್ಲಿಷಿನಲ್ಲಿ/i
];

// Explicit request patterns for Kannada response
const EXPLICIT_KANNADA_PATTERNS = [
  /\b(in\s+kannada|in\s+kannad|to\s+kannada|into\s+kannada|tell\s+me\s+in\s+kannada|explain\s+in\s+kannada|answer\s+in\s+kannada|reply\s+in\s+kannada|write\s+in\s+kannada)\b/i,
  /\b(kannada\s*nalli|kannadadalli|kannada\s*dalli|kannada\s*ge)\b/i,
  /\bkannada\b\s*(ನಲ್ಲಿ|ನಲ್ಲೇ|ನಲ್ಲಿಯೇ|ಗೆ)?\s*(ಹೇಳಿ|ವಿವರಿಸಿ|ಉತ್ತರಿಸಿ|ತಿಳಿಸಿ|ಮಾಹಿತಿ)/i,
  /\bkannada\s*ನಲ್ಲಿ/i,
  /ಕನ್ನಡ\s*(ನಲ್ಲೇ|ನಲ್ಲಿ|ನಲ್ಲಿಯೇ|ಗೆ)\s*(ಹೇಳಿ|ವಿವರಿಸಿ|ಉತ್ತರಿಸಿ|ತಿಳಿಸಿ|ಮಾಹಿತಿ\s*ನೀಡಿ)?/i,
  /ಕನ್ನಡದಲ್ಲೇ|ಕನ್ನಡದಲ್ಲಿ|ಕನ್ನಡದಲ್ಲೂ/i
];

/**
 * Rich Bilingual Concepts for Hybrid Semantic & Lexical Retrieval
 * Maps English terminology, Kannada Unicode script, and Kanglish phonetic variants
 * to unified semantic concept groups for cross-lingual matching.
 */
export const BILINGUAL_CONCEPTS = [
  {
    id: 'ssp_scholarship',
    isCoreScheme: true,
    terms: [
      'ssp', 'scholarship', 'scholarships', 'post-matric', 'post matric', 'student stipend',
      'ಎಸ್ಎಸ್ಪಿ', 'ವಿದ್ಯಾರ್ಥಿವೇತನ', 'ಮೆಟ್ರಿಕ್ ನಂತರದ', 'ವಿದ್ಯಾರ್ಥಿ ವೇತನ', 'ಶಿಷ್ಯವೇತನ',
      'vidyarthi', 'vidyarthivetana', 'vetana', 'shishyavetana'
    ]
  },
  {
    id: 'yuva_nidhi',
    isCoreScheme: true,
    terms: [
      'yuva nidhi', 'yuvanidhi', 'yuva', 'nidhi', 'graduate stipend', 'diploma stipend', 'unemployment allowance',
      'ಯುವ ನಿಧಿ', 'ಯುವನಿಧಿ', 'ಪದವೀಧರ', 'ಡಿಪ್ಲೊಮಾ', 'ನಿರುದ್ಯೋಗ ಭತ್ಯೆ', 'ಮಾಸಾಶನ',
      'padavidhara', 'masashana', 'bhatye'
    ]
  },
  {
    id: 'raitha_siri',
    isCoreScheme: true,
    terms: [
      'raitha siri', 'raithasiri', 'seed subsidy', 'fertilizer subsidy', 'millet', 'farmer assistance', 'agriculture',
      'ರೈತ ಸಿರಿ', 'ರೈತಸಿರಿ', 'ರೈತ', 'ಬಿತ್ತನೆ ಬೀಜ', 'ರಸಗೊಬ್ಬರ', 'ಸಿರಿಧಾನ್ಯ', 'ಕೃಷಿ',
      'bittane', 'beeja', 'bija', 'gobbera', 'gobbarada', 'siridhanya'
    ]
  },
  {
    id: 'sandhya_suraksha',
    isCoreScheme: true,
    terms: [
      'sandhya suraksha', 'sandhyasuraksha', 'senior citizen pension', 'old age pension', 'pension scheme', 'monthly pension',
      'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ', 'ಸಂಧ್ಯಾಸುರಕ್ಷಾ', 'ಹಿರಿಯ ನಾಗರಿಕ', 'ವೃದ್ಧಾಪ್ಯ ವೇತನ', 'ಪಿಂಚಣಿ', 'ಮಾಸಾಶನ',
      'hiriyara', 'vriddhapya', 'pinchani'
    ]
  },
  {
    id: 'gruha_lakshmi',
    isCoreScheme: true,
    terms: [
      'gruha lakshmi', 'gruhalakshmi', 'women head', 'dbt 2000', 'guarantee scheme', 'female head',
      'ಗೃಹ ಲಕ್ಷ್ಮಿ', 'ಗೃಹಲಕ್ಷ್ಮಿ', 'ಮಹಿಳಾ ಯಜಮಾನಿ', 'ಮಾಸಿಕ 2000', 'ಡಿಬಿಟಿ',
      'mahila', 'yajamani', 'tingala'
    ]
  },
  {
    id: 'ration_card',
    isCoreScheme: true,
    terms: [
      'ration card', 'ration', 'ahara', 'bpl card', 'priority ration', 'food and civil supplies', 'fair price',
      'ಪಡಿತರ ಚೀಟಿ', 'ಪಡಿತರ', 'ಆಹಾರ ಇಲಾಖೆ', 'ಬಿಪಿಎಲ್', 'ಪಡಿತರ ಕಾರ್ಡ್',
      'padithara', 'paditara', 'chiti', 'bpl'
    ]
  },
  {
    id: 'kaveri_ec',
    isCoreScheme: true,
    terms: [
      'kaveri', 'kaveri 2.0', 'encumbrance certificate', 'ec', 'property deed', 'stamps registration',
      'ಕಾವೇರಿ', 'ಕಾವೇರಿ 2.0', 'ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ', 'ನೋಂದಣಿ', 'ಸ್ಥಿರಾಸ್ತಿ',
      'rinabhara', 'nondani', 'pramanapatra'
    ]
  },
  {
    id: 'basava_vasathi',
    isCoreScheme: true,
    terms: [
      'basava vasathi', 'basava vasati', 'housing grant', 'pucca house', 'rural housing', 'rghcl',
      'ಬಸವ ವಸತಿ', 'ವಸತಿ ಯೋಜನೆ', 'ಪಕ್ಕಾ ಮನೆ', 'ಗ್ರಾಮೀಣ ವಸತಿ',
      'mane', 'vasati', 'nirmāna'
    ]
  },
  {
    id: 'arogya_karnataka',
    isCoreScheme: true,
    terms: [
      'arogya karnataka', 'sast', 'ayushman bharat', 'health assurance', 'cashless treatment', 'hospital grant',
      'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ', 'ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ', 'ಚಿಕಿತ್ಸೆ', 'ಆಸ್ಪತ್ರೆ',
      'arogya', 'chikitse', 'aspatre'
    ]
  },
  {
    id: 'ambedkar_artisan',
    isCoreScheme: true,
    terms: [
      'ambedkar', 'artisan subsidy', 'rural micro enterprise', 'cottage industry', 'handicraft',
      'ಗ್ರಾಮೀಣ ಕರಕುಶಲ', 'ಕಿರು ಉದ್ಯಮ', 'ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್', 'ಸಹಾಯಧನ',
      'karakushala', 'kiru udyama'
    ]
  },
  {
    id: 'offlinebridge_architecture',
    isCoreScheme: true,
    terms: [
      'offlinebridge', 'offline bridge', 'project architecture', 'system architecture', 'indexeddb', 'service worker', 'pwa architecture', 'offline-first architecture',
      'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್', 'ಆರ್ಕಿಟೆಕ್ಚರ್', 'ಅರಿವುನೆಟ್ ತಂತ್ರಜ್ಞಾನ', 'ಅರಿವುನೆಟ್ ಆರ್ಕಿಟೆಕ್ಚರ್', 'ತಂತ್ರಜ್ಞಾನ ವಿನ್ಯಾಸ'
    ]
  },
  {
    id: 'janaspandana_grievance',
    isCoreScheme: true,
    terms: [
      'janaspandana', 'grievance', 'complaint', 'toll free 1902', 'civic issue', 'redressal',
      'ಜನಸ್ಪಂದನ', 'ದೂರು', 'ಸಹಾಯವಾಣಿ 1902', 'ದೂರು ಪರಿಹಾರ',
      'duru', 'sahayavani', 'janaspandana'
    ]
  },
  {
    id: 'bhoomi_rtc',
    isCoreScheme: true,
    terms: [
      'bhoomi', 'rtc', 'pahani', 'record of rights', 'tenancy and crops', 'land records',
      'ಭೂಮಿ', 'ಆರ್‌ಟಿಸಿ', 'ಪಹಣಿ', 'ಹಕ್ಕು ದಾಖಲೆ', 'ಜಮೀನು',
      'bhoomi', 'rtc', 'pahani', 'jaminu', 'khata'
    ]
  },
  {
    id: 'intent_eligibility',
    isCoreScheme: false,
    terms: [
      'eligibility', 'eligible', 'criteria', 'qualify', 'qualification', 'who can apply', 'age limit', 'income limit',
      'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು', 'ಅರ್ಹತೆ', 'ಅರ್ಹರು', 'ಯಾರು ಅರ್ಹರು', 'ವಯೋಮಿತಿ', 'ಆದಾಯ ಮಿತಿ',
      'arhathe', 'arha', 'arharu', 'vayassu', 'varsha', 'aadhaya', 'aadaaya'
    ]
  },
  {
    id: 'intent_documents',
    isCoreScheme: false,
    terms: [
      'documents', 'document', 'required documents', 'certificate', 'proof', 'records',
      'ಅಗತ್ಯ ದಾಖಲೆಗಳು', 'ದಾಖಲೆಗಳು', 'ದಾಖಲೆ', 'ಪ್ರಮಾಣಪತ್ರ', 'ಪುರಾವೆ',
      'dakhalegalu', 'dakhale', 'patragalu', 'patra', 'pramana'
    ]
  },
  {
    id: 'intent_benefits',
    isCoreScheme: false,
    terms: [
      'benefits', 'benefit', 'amount', 'subsidy', 'financial assistance', 'stipend', 'grant', 'allowance',
      'ಸೌಲಭ್ಯಗಳು', 'ಸೌಲಭ್ಯ', 'ಆರ್ಥಿಕ ನೆರವು', 'ಸಹಾಯಧನ', 'ಹಣ', 'ಅನುದಾನ', 'ಲಾಭ',
      'sahayadhana', 'hana', 'labha', 'stipend'
    ]
  },
  {
    id: 'intent_procedure',
    isCoreScheme: false,
    terms: [
      'procedure', 'how to apply', 'process', 'steps', 'portal', 'application',
      'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ', 'ವಿಧಾನ', 'ಅರ್ಜಿ', 'ಕ್ರಮ', 'ಹೇಗೆ ಅರ್ಜಿ',
      'arji', 'madoke', 'salisu', 'salisuvudu', 'hege apply'
    ]
  }
];

/**
 * Detect language intent of a question string.
 * 
 * @param {string} text - Raw user query
 * @returns {{
 *   inputLanguage: 'en' | 'kn' | 'kanglish',
 *   responseLanguage: 'en' | 'kn',
 *   explicitRequest: 'en' | 'kn' | null,
 *   isKanglish: boolean,
 *   confidence: 'high' | 'medium' | 'low'
 * }}
 */
export function detectLanguageIntent(text) {
  if (!text || typeof text !== 'string') {
    return {
      inputLanguage: 'en',
      responseLanguage: 'en',
      explicitRequest: null,
      isKanglish: false,
      confidence: 'low'
    };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Explicit Language Instructions Detection (Highest Priority)
  let explicitRequest = null;

  for (const pattern of EXPLICIT_ENGLISH_PATTERNS) {
    if (pattern.test(raw)) {
      explicitRequest = 'en';
      break;
    }
  }

  if (!explicitRequest) {
    for (const pattern of EXPLICIT_KANNADA_PATTERNS) {
      if (pattern.test(raw)) {
        explicitRequest = 'kn';
        break;
      }
    }
  }

  // 2. Character Script Breakdown
  const kannadaChars = (raw.match(/[\u0C80-\u0CFF]/g) || []).length;
  const latinChars = (raw.match(/[a-zA-Z]/g) || []).length;
  const totalLength = Math.max(raw.length, 1);

  // 3. Kanglish Transliteration Token Count
  const tokens = (lower.match(/[a-z]+/g) || []);
  let kanglishMatches = 0;
  for (const tok of tokens) {
    if (KANGLISH_KEYWORDS.includes(tok)) {
      kanglishMatches++;
    }
  }

  // 4. Input Language Classification
  let inputLanguage = 'en';
  let isKanglish = false;

  if (kannadaChars >= 3 || (kannadaChars / totalLength) > 0.08) {
    if (latinChars > 8 && kannadaChars > 8) {
      // Mixed bilingual code-switching
      inputLanguage = 'kanglish';
      isKanglish = true;
    } else {
      inputLanguage = 'kn';
    }
  } else if (kanglishMatches >= 1) {
    inputLanguage = 'kanglish';
    isKanglish = true;
  } else {
    inputLanguage = 'en';
  }

  // 5. Response Language Determination
  let responseLanguage;
  if (explicitRequest) {
    responseLanguage = explicitRequest;
  } else if (inputLanguage === 'kn' || inputLanguage === 'kanglish') {
    // Kanglish and Kannada default to natural Kannada responses
    responseLanguage = 'kn';
  } else {
    responseLanguage = 'en';
  }

  // 6. Confidence Scoring
  let confidence = 'high';
  if (explicitRequest) {
    confidence = 'high';
  } else if (inputLanguage === 'kanglish' && kanglishMatches === 1 && kannadaChars === 0) {
    confidence = 'medium';
  }

  return {
    inputLanguage,
    responseLanguage,
    explicitRequest,
    isKanglish,
    confidence
  };
}

/**
 * Check if text contains a term, using word boundary checks for short terms (<= 4 chars)
 * to prevent false positives inside words (e.g. 'ec' matching 'mechanics').
 * 
 * @param {string} text
 * @param {string} term
 * @returns {boolean}
 */
export function textMatchesTerm(text, term) {
  if (!text || !term) return false;
  const t = term.toLowerCase();
  if (t.length <= 4) {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'iu');
    return regex.test(text);
  }
  return text.toLowerCase().includes(t);
}

/**
 * Expand a user's query with related bilingual terms without modifying original intent.
 * Used to enhance lexical search for Kanglish terms.
 * 
 * @param {string} query
 * @returns {string} Expanded query terms
 */
export function expandKanglishQuery(query) {
  if (!query || typeof query !== 'string') return '';

  const lower = query.toLowerCase();
  const matchedExpansions = [];

  for (const concept of BILINGUAL_CONCEPTS) {
    const hasTerm = concept.terms.some((t) => textMatchesTerm(lower, t));
    if (hasTerm) {
      // Add first 2 representative terms from concept for balanced query expansion
      matchedExpansions.push(concept.terms[0], concept.terms[1]);
    }
  }

  if (matchedExpansions.length === 0) return query;

  return `${query} ${Array.from(new Set(matchedExpansions)).join(' ')}`.trim();
}
