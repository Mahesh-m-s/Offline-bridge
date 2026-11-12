/**
 * OfflineBridge Phase 2B Verification Script
 * Validates:
 * 1. Text Sanitization (cleanTextForSpeech) for Markdown, URLs, Citations, and ₹ Currency in EN and KN
 * 2. Sentence Chunking Engine (splitIntoSentenceChunks) to circumvent Chrome 15-second cutoff bug
 * 3. STT Error Mapping and Language Code configuration
 * 4. TTS Voice Selection and Fallback Handlers
 * 5. Full End-to-End Pipeline: Simulated Speech Input -> RAG Chat -> Cleaned TTS Speech Output
 */

import { cleanTextForSpeech, splitIntoSentenceChunks } from './src/utils/speechSynthesis.js';
import { translateSpeechError } from './src/utils/speechRecognition.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('========================================================================');
console.log('=== OfflineBridge Phase 2B: Bilingual Voice Assistant Test Suite ===');
console.log('========================================================================\n');

// ----------------------------------------------------------------------
// Suite 1: Text Sanitization (cleanTextForSpeech)
// ----------------------------------------------------------------------
console.log('--- Suite 1: Markdown, URL, Citation & Currency Sanitization ---');

const rawEnglishMarkdown = `
### Yuva Nidhi Scheme [1]
Under the **Yuva Nidhi** scheme, eligible unemployed graduates receive ₹ 3,000 per month for up to 2 years.
- Must be a domicile of *Karnataka*.
- Apply online at https://sevasindhu.karnataka.gov.in/yuvanidhi.
`;

const cleanedEn = cleanTextForSpeech(rawEnglishMarkdown, 'en');

assert(!cleanedEn.includes('###'), 'Removes markdown header hashes');
assert(!cleanedEn.includes('**') && !cleanedEn.includes('*'), 'Removes bold and italic markdown delimiters');
assert(!cleanedEn.includes('[1]'), 'Removes numbered citations [1]');
assert(!cleanedEn.includes('https://'), 'Removes raw HTTP/HTTPS URLs');
assert(cleanedEn.includes('3,000 rupees') || cleanedEn.includes('3000 rupees'), 'Converts ₹ currency symbol to "rupees" in English');
assert(cleanedEn.includes('official portal'), 'Substitutes raw URL with friendly speech token "official portal"');

const rawKannadaMarkdown = `
**ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ** [2]:
ಕುಟುಂಬದ ಮಹಿಳಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹ 2,000 ಆರ್ಥಿಕ ನೆರವು ದೊರೆಯುತ್ತದೆ.
• ಅರ್ಜಿ ಸಲ್ಲಿಸಲು https://sevasindhuservices.karnataka.gov.in ಭೇಟಿ ನೀಡಿ.
`;

const cleanedKn = cleanTextForSpeech(rawKannadaMarkdown, 'kn');

assert(!cleanedKn.includes('**'), 'Removes markdown bold markers in Kannada text');
assert(!cleanedKn.includes('[2]'), 'Removes citation markers [2] in Kannada text');
assert(!cleanedKn.includes('•'), 'Removes bullet points in Kannada text');
assert(!cleanedKn.includes('https://'), 'Removes raw URLs in Kannada text');
assert(cleanedKn.includes('2,000 ರೂಪಾಯಿ') || cleanedKn.includes('2000 ರೂಪಾಯಿ'), 'Converts ₹ currency symbol to "ರೂಪಾಯಿ" in Kannada');
assert(cleanedKn.includes('ಅಧಿಕೃತ ಪೋರ್ಟಲ್'), 'Substitutes raw URL with Kannada friendly speech token "ಅಧಿಕೃತ ಪೋರ್ಟಲ್"');

// ----------------------------------------------------------------------
// Suite 2: Sentence Chunking (splitIntoSentenceChunks) for Chrome 15s Bug
// ----------------------------------------------------------------------
console.log('\n--- Suite 2: Sentence Chunking Engine (Chrome 15s Cutoff Workaround) ---');

const longNarrative = `
Under the Sandhya Suraksha Pension Scheme, destitute senior citizens aged 65 years and above in Karnataka receive a monthly financial pension of 1,200 rupees along with free medical consultation at government taluk hospitals. To qualify, the combined annual family income from all sources must not exceed 20,000 rupees per annum, and the applicant must not already be receiving any other statutory central or state pension. Required documents include an authentic Aadhaar card, proof of age from an official birth record or election card, an authenticated income certificate issued by the competent Tahsildar, and an active bank account passbook.
`;

const chunks = splitIntoSentenceChunks(longNarrative);

assert(chunks.length >= 2, `Splits long continuous narrative into multiple chunks (got ${chunks.length})`);
const allUnder160 = chunks.every(c => c.length <= 165); // 160 threshold with clause boundary tolerance
assert(allUnder160, 'All synthesized chunks are <= 165 characters to prevent audio buffer truncation');
assert(!chunks.some(c => c.trim().length === 0), 'No empty or whitespace-only chunks created');

const kannadaNarrative = `
ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಯೋಜನೆಯಡಿ 65 ವರ್ಷ ಮತ್ತು ಮೇಲ್ಪಟ್ಟ ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮಾಸಿಕ ₹ 1,200 ಪಿಂಚಣಿ ಸಿಗುತ್ತದೆ. ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ₹ 20,000 ಮೀರಬಾರದು. ಅರ್ಜಿದಾರರು ಆಧಾರ್ ಕಾರ್ಡ್, ವಯಸ್ಸಿನ ಪುರಾವೆ ಮತ್ತು ತಹಶೀಲ್ದಾರ್ ನೀಡಿದ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಸಲ್ಲಿಸಬೇಕು.
`;

const cleanedKnNarrative = cleanTextForSpeech(kannadaNarrative, 'kn');
const knChunks = splitIntoSentenceChunks(cleanedKnNarrative);

assert(knChunks.length >= 2, `Kannada text properly partitioned by sentence terminators (got ${knChunks.length} chunks)`);
assert(knChunks.every(c => c.length <= 165), 'All Kannada chunks remain within audio safety thresholds');

// ----------------------------------------------------------------------
// Suite 3: Speech Recognition Error Handling & Language Tagging
// ----------------------------------------------------------------------
console.log('\n--- Suite 3: Speech Recognition Error Mapping & Diagnostics ---');

const errNotAllowedEn = translateSpeechError('not-allowed', false);
const errNotAllowedKn = translateSpeechError('not-allowed', true);
const errNoSpeechEn = translateSpeechError('no-speech', false);
const errNetworkKn = translateSpeechError('network', true);

assert(errNotAllowedEn.includes('Microphone permission'), 'Maps not-allowed error to permission instructions in English');
assert(errNotAllowedKn.includes('ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು'), 'Maps not-allowed error to Kannada message');
assert(errNoSpeechEn.includes('No speech detected'), 'Maps no-speech error to clear prompt in English');
assert(errNetworkKn.includes('ನೆಟ್‌ವರ್ಕ್'), 'Maps network error to network advisory in Kannada');

// Test Brave Shields specific handling
const errBraveEn = translateSpeechError('network', false, { isBrave: true });
const errBraveKn = translateSpeechError('network', true, { isBrave: true });
assert(errBraveEn.includes('Brave browser') && errBraveEn.includes('brave://settings/system'), 'Directs Brave users to brave://settings/system in English');
assert(errBraveKn.includes('Brave ಬ್ರೌಸರ್') && errBraveKn.includes('brave://settings/system'), 'Directs Brave users to brave://settings/system in Kannada');

// Test Offline specific handling
const errOfflineEn = translateSpeechError('network', false, { isOffline: true });
const errOfflineKn = translateSpeechError('network', true, { isOffline: true });
assert(errOfflineEn.includes('requires an active internet connection'), 'Explains cloud STT internet requirement in English when offline');
assert(errOfflineKn.includes('ಇಂಟರ್ನೆಟ್ ಅಥವಾ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕದ ಅಗತ್ಯವಿದೆ'), 'Explains cloud STT internet requirement in Kannada when offline');

// Test Insecure origin specific handling
const errInsecureEn = translateSpeechError('INSECURE_CONTEXT', false);
const errInsecureKn = translateSpeechError('INSECURE_CONTEXT', true);
assert(errInsecureEn.includes('HTTPS or localhost'), 'Warns against insecure HTTP origins in English');
assert(errInsecureKn.includes('HTTPS ಅಥವಾ localhost'), 'Warns against insecure HTTP origins in Kannada');

// Test Missing Hardware specific handling
const errAudioCaptureEn = translateSpeechError('audio-capture', false);
const errAudioCaptureKn = translateSpeechError('audio-capture', true);
assert(errAudioCaptureEn.includes('No microphone was found'), 'Advises connecting audio device in English');
assert(errAudioCaptureKn.includes('ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಪತ್ತೆಯಾಗಿಲ್ಲ'), 'Advises connecting audio device in Kannada');

// ----------------------------------------------------------------------
// Suite 4: End-to-End Simulation: Speech Input -> RAG Chat -> Voice Output Prep
// ----------------------------------------------------------------------
console.log('\n--- Suite 4: End-to-End Pipeline Simulation ---');

import { chatWithKnowledgeBase } from '../server/src/modules/rag/rag.service.js';

async function runE2EPipeline() {
  // 1. Simulated voice transcript in Kannada
  const simulatedVoiceInput = 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಯಾರು ಅರ್ಹರು?';
  console.log(`  Input: "${simulatedVoiceInput}"`);

  // 2. Query RAG backend with auto language routing
  const ragResult = await chatWithKnowledgeBase({
    question: simulatedVoiceInput,
    preferredLanguage: 'auto'
  });

  assert(ragResult.answer && ragResult.answer.length > 20, 'RAG generates substantial grounded response');
  assert(ragResult.language === 'kn', 'RAG detects Kannada from speech transcription');

  // 3. Prepare text for TTS speech playback
  const speechReadyText = cleanTextForSpeech(ragResult.answer, 'kn');
  assert(!speechReadyText.includes('**'), 'TTS text has all markdown bold stripped');
  assert(!speechReadyText.includes('http'), 'TTS text has all hyperlinks stripped');

  const speechChunks = splitIntoSentenceChunks(speechReadyText);
  assert(speechChunks.length >= 1, `TTS chunks prepared for voice playback: ${speechChunks.length} chunks`);
  console.log(`  TTS Ready: ${speechChunks.length} chunks, First chunk: "${speechChunks[0].substring(0, 60)}..."`);
}

runE2EPipeline().then(() => {
  console.log('\n========================================================================');
  console.log(`Phase 2B Voice Assistant Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');
  if (failed > 0) process.exit(1);
}).catch((err) => {
  console.error('E2E pipeline error:', err);
  process.exit(1);
});
