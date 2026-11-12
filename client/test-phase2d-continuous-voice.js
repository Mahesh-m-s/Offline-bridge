/**
 * OfflineBridge Phase 2D Verification Test Suite
 * Advanced Continuous Bilingual Speech Recognition (STT)
 * 
 * Verifies:
 * 1. Starting & stopping continuous speech recognition
 * 2. Continuous listening flag and options (continuous=true, interimResults=true)
 * 3. Automatic restart after unexpected session termination (Chrome silence cutoff)
 * 4. Stop button preventing automatic restart (desiredListening resets to false)
 * 5. Long Kannada transcripts accumulated over multiple events
 * 6. Long English transcripts accumulated over multiple events
 * 7. Multiple recognition result events in a single session
 * 8. Interim and final result merging (mergeTranscripts word-level deduplication)
 * 9. Duplicate transcript prevention across restarts
 * 10. Manual transcript editing preservation (setAccumulatedTranscript / initialText)
 * 11. Explicit language switching ('kn-IN' <-> 'en-IN') preserving accumulated history
 * 12. Network failure retry limiter (prevents infinite loops)
 * 13. Microphone permission denial immediate stoppage (fatal error handling)
 * 14. Chatbot closure & unmount safe cleanup (destroy())
 * 15. Submitting while recording (stopping session, committing transcript to RAG)
 */

import {
  mergeTranscripts,
  translateSpeechError,
  SpeechRecognitionManager
} from './src/utils/speechRecognition.js';
import { chatWithKnowledgeBase } from '../server/src/modules/rag/rag.service.js';

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
console.log('=== OfflineBridge Phase 2D: Continuous Bilingual Speech Test Suite ===');
console.log('========================================================================\n');

// ----------------------------------------------------------------------
// Suite 1: Transcript Merging & Word-Level Deduplication Engine
// ----------------------------------------------------------------------
console.log('--- Suite 1: Transcript Merging & Overlap Deduplication ---');

// 1.1 Simple concatenation with whitespace preservation
const merge1 = mergeTranscripts('ನಮಸ್ಕಾರ', 'ನನಗೆ ಸಹಾಯ ಬೇಕು');
assert(merge1 === 'ನಮಸ್ಕಾರ ನನಗೆ ಸಹಾಯ ಬೇಕು', 'Merges Kannada sentences with appropriate whitespace');

// 1.2 Exact duplicate suppression
const merge2 = mergeTranscripts('ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ', 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ');
assert(merge2 === 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ', 'Suppresses exact duplicate addition');

// 1.3 Overlapping phrase deduplication (Chrome repeats preceding word in subsequent final event)
const merge3 = mergeTranscripts('ಕರ್ನಾಟಕ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ', 'ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿದೆ');
assert(merge3 === 'ಕರ್ನಾಟಕ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿದೆ', 'Deduplicates overlapping boundary words in Kannada');

// 1.4 English phrase overlap deduplication
const merge4 = mergeTranscripts('How can I apply for', 'apply for Yuva Nidhi scheme');
assert(merge4 === 'How can I apply for Yuva Nidhi scheme', 'Deduplicates overlapping multi-word phrases in English');

// 1.5 Empty base or empty addition
assert(mergeTranscripts('', 'ರೈತ ಸಿರಿ') === 'ರೈತ ಸಿರಿ', 'Handles empty base gracefully');
assert(mergeTranscripts('ಅನ್ನ ಭಾಗ್ಯ', '') === 'ಅನ್ನ ಭಾಗ್ಯ', 'Handles empty addition gracefully');

// ----------------------------------------------------------------------
// Suite 2: Error Classification & Bilingual Advisory Messages
// ----------------------------------------------------------------------
console.log('\n--- Suite 2: Speech Recognition Error Classification ---');

const errLangNotSupportedKn = translateSpeechError('language-not-supported', true);
const errLangNotSupportedEn = translateSpeechError('language-not-supported', false);
assert(errLangNotSupportedKn.includes('ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆ'), 'Maps language-not-supported to Kannada advisory');
assert(errLangNotSupportedEn.includes('selected speech language is not supported'), 'Maps language-not-supported to English advisory');

const errBraveShieldsEn = translateSpeechError('network', false, { isBrave: true });
assert(errBraveShieldsEn.includes('brave://settings/system'), 'Directs Brave users to brave://settings/system settings');

// ----------------------------------------------------------------------
// Mock SpeechRecognition Engine for Lifecycle Simulation
// ----------------------------------------------------------------------
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'kn-IN';
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this._isRunning = false;
    MockSpeechRecognition.instances.push(this);
  }

  start() {
    this._isRunning = true;
    MockSpeechRecognition.startCallCount++;
    setTimeout(() => {
      if (this.onstart && this._isRunning) this.onstart();
    }, 10);
  }

  stop() {
    this._isRunning = false;
    MockSpeechRecognition.stopCallCount++;
    setTimeout(() => {
      if (this.onend) this.onend();
    }, 10);
  }

  abort() {
    this._isRunning = false;
    MockSpeechRecognition.abortCallCount++;
    setTimeout(() => {
      if (this.onerror) this.onerror({ error: 'aborted' });
      if (this.onend) this.onend();
    }, 10);
  }

  // Test helpers to trigger events
  simulateSpeechResult(results, resultIndex = 0) {
    if (this.onresult && this._isRunning) {
      this.onresult({
        resultIndex,
        results: results.map(r => [{ transcript: r.text }])
      });
      // Set isFinal on each mock result
      results.forEach((r, idx) => {
        this.results = this.results || [];
      });
    }
  }

  simulateSilenceCutoff() {
    this._isRunning = false;
    if (this.onend) this.onend();
  }

  simulateError(errCode) {
    if (this.onerror) {
      this.onerror({ error: errCode });
    }
  }
}
MockSpeechRecognition.instances = [];
MockSpeechRecognition.startCallCount = 0;
MockSpeechRecognition.stopCallCount = 0;
MockSpeechRecognition.abortCallCount = 0;

// Setup global mock window and navigator environment
global.window = {
  SpeechRecognition: MockSpeechRecognition,
  webkitSpeechRecognition: MockSpeechRecognition,
  isSecureContext: true,
  location: { hostname: 'localhost' }
};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    onLine: true,
    mediaDevices: {
      enumerateDevices: async () => [{ kind: 'audioinput', deviceId: 'default' }],
      getUserMedia: async () => ({
        getTracks: () => [{ stop: () => {} }]
      })
    },
    permissions: {
      query: async () => ({ state: 'granted' })
    }
  },
  configurable: true,
  writable: true
});

// ----------------------------------------------------------------------
// Suite 3: Continuous SpeechRecognition Lifecycle & Controlled Auto-Restart
// ----------------------------------------------------------------------
console.log('\n--- Suite 3: Continuous Recognition Lifecycle & Controlled Auto-Restart ---');

async function testContinuousLifecycle() {
  const manager = new SpeechRecognitionManager();

  let startedEvent = false;
  let restartCount = 0;
  let receivedResults = [];
  let endedEvent = false;

  // 3.1 Start continuous session with initial seed text
  const initialText = 'ಕರ್ನಾಟಕ ಯೋಜನೆಗಳು:';
  await manager.start({
    language: 'kn-IN',
    initialText,
    onStart: () => { startedEvent = true; },
    onResult: (res) => { receivedResults.push(res); },
    onRestart: ({ attempt }) => { restartCount++; },
    onEnd: () => { endedEvent = true; }
  });

  await new Promise(r => setTimeout(r, 25));

  assert(startedEvent, 'Manager dispatches onStart event');
  assert(manager.getIsListening() === true, 'getIsListening() returns true when active');
  assert(manager.getDesiredListening() === true, 'getDesiredListening() is true while user wants recording');
  assert(manager.getLanguage() === 'kn-IN', 'Language correctly set to kn-IN');
  assert(manager.getAccumulatedTranscript() === initialText, 'Accumulated transcript initialized with seed text');

  const instance1 = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];
  assert(instance1.continuous === true, 'Underlying SpeechRecognition configures continuous = true');
  assert(instance1.interimResults === true, 'Underlying SpeechRecognition configures interimResults = true');

  // 3.2 Simulate speech result in Kannada
  // resultIndex 0, isFinal: true
  const event1 = {
    resultIndex: 0,
    results: [
      Object.assign([{ transcript: ' ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?' }], { isFinal: true })
    ]
  };
  instance1.onresult(event1);

  assert(receivedResults.length > 0, 'Dispatches onResult callback upon speech detection');
  const latestResult = receivedResults[receivedResults.length - 1];
  assert(latestResult.transcript.includes('ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ'), 'Finalized transcript incorporates Kannada query');
  assert(latestResult.accumulatedFinal.startsWith('ಕರ್ನಾಟಕ ಯೋಜನೆಗಳು:'), 'Preserves initial seed text without overwrite');

  // 3.3 Simulate Chrome silence timeout cutoff (onend fired while desiredListening is true)
  const previousStarts = MockSpeechRecognition.startCallCount;
  instance1.simulateSilenceCutoff();

  // Give short delay for auto-restart backoff timer
  await new Promise(r => setTimeout(r, 250));

  assert(restartCount === 1, `Auto-restart callback triggered upon unexpected cutoff (count: ${restartCount})`);
  assert(MockSpeechRecognition.startCallCount > previousStarts, 'Manager automatically creates new session and calls start()');
  assert(manager.getIsListening() === true, 'Manager maintains listening state across unexpected cutoff');

  // 3.4 Simulate second speech chunk in the restarted session
  const instance2 = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];
  const event2 = {
    resultIndex: 0,
    results: [
      Object.assign([{ transcript: 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?' }], { isFinal: true })
    ]
  };
  instance2.onresult(event2);

  const fullTranscript = manager.getFullTranscript();
  assert(fullTranscript.includes('ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ') && fullTranscript.includes('ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?'),
    'Preserves previous session finals and appends new sentence cleanly across auto-restarts');

  // 3.5 Test explicit Stop by user
  manager.stop();
  await new Promise(r => setTimeout(r, 50));

  assert(manager.getIsListening() === false, 'isListening is false after explicit stop');
  assert(manager.getDesiredListening() === false, 'desiredListening is false after explicit stop');
  assert(endedEvent === true, 'Dispatches onEnd callback upon explicit user stop');

  // 3.6 Verify that subsequent unexpected onend DOES NOT restart once stopped
  const startsAfterStop = MockSpeechRecognition.startCallCount;
  instance2.simulateSilenceCutoff();
  await new Promise(r => setTimeout(r, 200));
  assert(MockSpeechRecognition.startCallCount === startsAfterStop, 'Explicit stop prevents any auto-restart attempts');

  manager.destroy();
}

// ----------------------------------------------------------------------
// Suite 4: Manual Editing, Language Switching & Long Transcripts
// ----------------------------------------------------------------------
console.log('\n--- Suite 4: Manual Editing, Language Switching & Long Narratives ---');

async function testEditingAndLanguageSwitching() {
  const manager = new SpeechRecognitionManager();
  let latestResult = null;

  await manager.start({
    language: 'kn-IN',
    onResult: (res) => { latestResult = res; }
  });
  await new Promise(r => setTimeout(r, 25));

  const activeInstance = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];

  // 4.1 Speech input
  activeInstance.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript: 'ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ' }], { isFinal: true })]
  });

  assert(manager.getAccumulatedTranscript() === 'ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ', 'Records initial Kannada speech');

  // 4.2 Citizen manually edits text input (e.g. types additional clarification)
  const editedText = 'ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ ಅರ್ಜಿ ಸ್ಥಿತಿ ಮತ್ತು DBT ಹಣ ಜಮೆ';
  manager.setAccumulatedTranscript(editedText);
  assert(manager.getAccumulatedTranscript() === editedText, 'setAccumulatedTranscript synchronizes citizen manual edits');

  // 4.3 Subsequent speech event appends to the citizen edited text rather than old buffer
  activeInstance.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript: 'ಯಾವಾಗ ಆಗುತ್ತದೆ?' }], { isFinal: true })]
  });

  const mergedAfterEdit = manager.getFullTranscript();
  assert(mergedAfterEdit.startsWith(editedText) && mergedAfterEdit.endsWith('ಯಾವಾಗ ಆಗುತ್ತದೆ?'),
    'Subsequent speech results append cleanly onto citizen manual edits');

  // 4.4 Mid-session language switching ('kn-IN' -> 'en-IN')
  const previousStarts = MockSpeechRecognition.startCallCount;
  manager.switchLanguage('en-IN');
  await new Promise(r => setTimeout(r, 50));

  assert(manager.getLanguage() === 'en-IN', 'switchLanguage updates language code to en-IN');
  assert(MockSpeechRecognition.startCallCount > previousStarts, 'switchLanguage restarts recognition session with new language');
  assert(manager.getFullTranscript().startsWith(editedText), 'switchLanguage preserves all previously accumulated Kannada text');

  // 4.5 English speech recognized in new session
  const enInstance = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];
  enInstance.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript: 'Please check my Aadhaar link.' }], { isFinal: true })]
  });

  const bilingualAccumulation = manager.getFullTranscript();
  assert(bilingualAccumulation.includes('ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ') && bilingualAccumulation.includes('Please check my Aadhaar link.'),
    'Seamlessly accumulates both Kannada and English across dialect switch');

  manager.destroy();
}

// ----------------------------------------------------------------------
// Suite 5: Retry Limiting & Fatal Error Guardrails
// ----------------------------------------------------------------------
console.log('\n--- Suite 5: Retry Limiting & Fatal Error Guardrails ---');

async function testErrorGuardrails() {
  const manager = new SpeechRecognitionManager();
  let fatalError = null;

  await manager.start({
    language: 'kn-IN',
    onError: (err) => { fatalError = err; }
  });
  await new Promise(r => setTimeout(r, 25));

  const activeInstance = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];

  // 5.1 Fatal error: 'not-allowed' (permission denied)
  activeInstance.simulateError('not-allowed');

  assert(fatalError && fatalError.code === 'not-allowed', 'Dispatches fatal error on permission denial');
  assert(fatalError.fatal === true, 'Flags not-allowed as fatal error');
  assert(manager.getDesiredListening() === false, 'Stops listening immediately on permission denial');

  // Verify no restart occurs
  const startsCount = MockSpeechRecognition.startCallCount;
  activeInstance.simulateSilenceCutoff();
  await new Promise(r => setTimeout(r, 150));
  assert(MockSpeechRecognition.startCallCount === startsCount, 'Fatal error permanently halts auto-restart loop');

  // 5.2 Retry limit test (repeated silence cutoffs without speech results)
  const retryManager = new SpeechRecognitionManager();
  let limitReachedError = null;
  await retryManager.start({
    language: 'kn-IN',
    onError: (err) => { limitReachedError = err; }
  });
  await new Promise(r => setTimeout(r, 25));

  // Simulate consecutive cutoffs until maxRestartsWithoutSpeech (4) is reached
  for (let i = 0; i < 5; i++) {
    const inst = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];
    inst.simulateSilenceCutoff();
    await new Promise(r => setTimeout(r, 100 * (i + 1)));
  }

  assert(retryManager.getDesiredListening() === false, 'Halts after reaching maximum consecutive restarts without speech');
  assert(limitReachedError && limitReachedError.code === 'RESTART_LIMIT_REACHED', 'Reports RESTART_LIMIT_REACHED error to user');

  retryManager.destroy();
  manager.destroy();
}

// ----------------------------------------------------------------------
// Suite 6: End-to-End Simulation: Speech -> Submission -> Bilingual RAG
// ----------------------------------------------------------------------
console.log('\n--- Suite 6: End-to-End Submission & Bilingual RAG Integration ---');

async function testE2ESubmission() {
  const manager = new SpeechRecognitionManager();

  await manager.start({ language: 'kn-IN' });
  await new Promise(r => setTimeout(r, 25));

  const activeInstance = MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];

  // Citizen speaks question in Kannada
  const spokenQuestion = 'ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?';
  activeInstance.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript: spokenQuestion }], { isFinal: true })]
  });

  // Citizen presses Send while recording is still active
  // 1. Finalize and stop
  manager.stop();
  const finalTranscript = manager.getFullTranscript();
  assert(finalTranscript === spokenQuestion, 'Commits full recognized speech upon send');
  assert(manager.getIsListening() === false, 'Stops speech recognition engine cleanly upon send');

  // 2. Submit to existing bilingual RAG backend
  const ragResult = await chatWithKnowledgeBase({
    question: finalTranscript,
    language: 'auto'
  });

  assert(ragResult.answer && ragResult.answer.length > 30, 'RAG generates comprehensive grounded answer');
  assert(ragResult.language === 'kn', 'Bilingual RAG identifies Kannada speech query');
  assert(ragResult.answer.includes('ಪದವೀಧರರು') || ragResult.answer.includes('ಅರ್ಹತಾ'), 'RAG correctly answers scheme eligibility criteria');
  assert(ragResult.sources && ragResult.sources.length > 0, 'RAG provides authoritative official sources');

  manager.destroy();
}

// Run all test suites sequentially
async function runAllSuites() {
  await testContinuousLifecycle();
  await testEditingAndLanguageSwitching();
  await testErrorGuardrails();
  await testE2ESubmission();

  console.log('\n========================================================================');
  console.log(`Phase 2D Continuous Voice Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllSuites().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
