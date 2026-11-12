/**
 * OfflineBridge — Phase 2A Bilingual RAG Intelligence & Cross-Lingual Verification Suite
 * 
 * Comprehensive test suite verifying the 10 core requirements:
 * 1. English query -> English response.
 * 2. Kannada query -> Kannada response.
 * 3. English query explicitly requesting Kannada ("Explain in Kannada").
 * 4. Kannada query explicitly requesting English ("English nalli heli").
 * 5. Kanglish query -> appropriate Kannada response ("Yuva Nidhi yojanege eligibility criteria yenu?").
 * 6. Kannada query retrieving English-only scheme documents (ArivuNet Architecture / Janaspandana).
 * 7. English query retrieving Kannada documents (cross-lingual retrieval).
 * 8. Proper government scheme names and technical terminology (Bhoomi, RTC, Nadakacheri, DBT).
 * 9. Irrelevant queries returning appropriate fallback responses (no hallucination).
 * 10. Existing English RAG functionality remaining intact.
 * 
 * Verifies both deterministic fallback mode and generative capabilities.
 */

import assert from 'node:assert/strict';
import {
  detectLanguageIntent,
  expandKanglishQuery
} from './src/modules/rag/bilingualDetector.js';
import {
  retrieveRelevantChunks,
  calculateLexicalScore,
  cosineSimilarity
} from './src/modules/rag/vectorStore.js';
import {
  chatWithKnowledgeBase,
  synthesizeGroundedAnswer
} from './src/modules/rag/rag.service.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    if (err.stack && process.env.DEBUG) console.error(err.stack);
    failed++;
  }
}

async function runBilingualRagTests() {
  console.log('========================================================================');
  console.log('=== OfflineBridge Phase 2A: Bilingual RAG & Cross-Lingual Test Suite ===');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  console.log('--- Suite 1: Language Detection & Intent Disambiguation ---');
  // --------------------------------------------------------------------------

  await test('1.1 Standard English query detected as en', () => {
    const res = detectLanguageIntent('What are the eligibility criteria for Yuva Nidhi?');
    assert.equal(res.inputLanguage, 'en');
    assert.equal(res.responseLanguage, 'en');
    assert.equal(res.explicitRequest, null);
    assert.equal(res.isKanglish, false);
  });

  await test('1.2 Standard Kannada query detected as kn', () => {
    const res = detectLanguageIntent('ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?');
    assert.equal(res.inputLanguage, 'kn');
    assert.equal(res.responseLanguage, 'kn');
    assert.equal(res.explicitRequest, null);
    assert.equal(res.isKanglish, false);
  });

  await test('1.3 English query explicitly requesting Kannada directs responseLanguage to kn', () => {
    const res = detectLanguageIntent('Please explain Sandhya Suraksha scheme in Kannada');
    assert.equal(res.inputLanguage, 'en');
    assert.equal(res.responseLanguage, 'kn');
    assert.equal(res.explicitRequest, 'kn');
  });

  await test('1.4 Kannada query explicitly requesting English directs responseLanguage to en', () => {
    const res = detectLanguageIntent('ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಯೋಜನೆಯ ಬಗ್ಗೆ English ನಲ್ಲಿ ಹೇಳಿ');
    assert.equal(res.inputLanguage, 'kn');
    assert.equal(res.responseLanguage, 'en');
    assert.equal(res.explicitRequest, 'en');
  });

  await test('1.5 Kanglish transliteration detected and defaults to kn response', () => {
    const res = detectLanguageIntent('Yuva Nidhi yojanege eligibility criteria yenu?');
    assert.equal(res.inputLanguage, 'kanglish');
    assert.equal(res.responseLanguage, 'kn');
    assert.equal(res.isKanglish, true);
  });

  await test('1.6 Multi-token Kanglish with action verbs detected as kanglish', () => {
    const res = detectLanguageIntent('Pension scheme apply madoke documents yenu beku?');
    assert.equal(res.inputLanguage, 'kanglish');
    assert.equal(res.responseLanguage, 'kn');
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: Cross-Lingual & Hybrid Semantic Retrieval ---');
  // --------------------------------------------------------------------------

  await test('2.1 Kannada query retrieves English-only document (ArivuNet Architecture)', async () => {
    const chunks = await retrieveRelevantChunks('ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಬಗ್ಗೆ ತಿಳಿಸಿ', {
      topK: 3
    });
    assert.ok(chunks.length > 0, 'Must retrieve relevant chunks');
    assert.equal(chunks[0].documentTitle, 'ArivuNet Project Architecture');
    assert.ok(chunks[0].similarity >= 0.30, `Expected similarity >= 0.30, got ${chunks[0].similarity}`);
  });

  await test('2.2 English query retrieves Kannada scheme chunks when relevant', async () => {
    const chunks = await retrieveRelevantChunks('What are the seed subsidies for farmers in Raitha Siri?', {
      topK: 4
    });
    assert.ok(chunks.length > 0);
    const hasRaithaSiri = chunks.some(
      (c) => c.documentTitle.includes('Raitha Siri') || c.documentTitle.includes('ರೈತ ಸಿರಿ')
    );
    assert.ok(hasRaithaSiri, 'Expected Raitha Siri chunk in English or Kannada');
  });

  await test('2.3 Kanglish query retrieves relevant scheme without strict language blockage', async () => {
    const expanded = expandKanglishQuery('Yuva Nidhi yojanege eligibility criteria yenu?');
    const chunks = await retrieveRelevantChunks(expanded, {
      topK: 3
    });
    assert.ok(chunks.length > 0);
    assert.ok(
      chunks.some((c) => c.documentTitle.includes('Yuva Nidhi') || c.documentTitle.includes('ಯುವ ನಿಧಿ')),
      'Expected Yuva Nidhi scheme chunks'
    );
  });

  await test('2.4 Land records and technical query (Bhoomi RTC) matches relevant documents', async () => {
    const chunks = await retrieveRelevantChunks('Bhoomi RTC pahani download Grama One', {
      topK: 4
    });
    assert.ok(chunks.length > 0);
    assert.ok(
      chunks.some((c) => c.content.includes('RTC') || c.content.includes('ಆರ್‌ಟಿಸಿ') || c.content.includes('Bhoomi')),
      'Expected RTC or Bhoomi document mention'
    );
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: End-to-End Bilingual RAG Generation & Guardrails ---');
  // --------------------------------------------------------------------------

  await test('3.1 Scenario 1: English query -> English response with valid citations', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'What are the eligibility criteria for Yuva Nidhi?',
      language: 'auto'
    });
    assert.equal(res.language, 'en');
    assert.ok(res.answer.includes('Yuva Nidhi'));
    assert.ok(res.answer.includes('Eligibility Criteria') || res.answer.includes('Age'));
    assert.ok(res.sources.length > 0);
    assert.equal(res.confidence, 'high');
  });

  await test('3.2 Scenario 2: Kannada query -> Kannada response with valid citations', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?',
      language: 'auto'
    });
    assert.equal(res.language, 'kn');
    assert.ok(res.answer.includes('ಯುವ ನಿಧಿ'));
    assert.ok(res.answer.includes('ಅರ್ಹತಾ ಮಾನದಂಡಗಳು') || res.answer.includes('ಅರ್ಹತೆ'));
    assert.ok(res.sources.length > 0);
    assert.equal(res.confidence, 'high');
  });

  await test('3.3 Scenario 3: English query explicitly requesting Kannada returns Kannada answer', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'Please explain Sandhya Suraksha scheme in Kannada',
      language: 'auto'
    });
    assert.equal(res.language, 'kn');
    assert.ok(res.answer.includes('ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ'));
    assert.ok(res.sources.length > 0);
  });

  await test('3.4 Scenario 4: Kannada query explicitly requesting English returns English answer', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಯೋಜನೆಯ ಬಗ್ಗೆ English ನಲ್ಲಿ ಹೇಳಿ',
      language: 'auto'
    });
    assert.equal(res.language, 'en');
    assert.ok(res.answer.includes('Senior Citizen') || res.answer.includes('Sandhya Suraksha'));
    assert.ok(res.sources.length > 0);
  });

  await test('3.5 Scenario 5: Kanglish query returns grounded Kannada response', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'Yuva Nidhi yojanege eligibility criteria yenu?',
      language: 'auto'
    });
    assert.equal(res.language, 'kn');
    assert.ok(res.answer.includes('ಯುವ ನಿಧಿ'));
    assert.ok(res.sources.length > 0);
  });

  await test('3.6 Scenario 6: Kannada query on English-only doc (Architecture) returns translated Kannada response', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಬಗ್ಗೆ ತಿಳಿಸಿ',
      language: 'auto'
    });
    assert.equal(res.language, 'kn');
    assert.equal(res.sources[0].documentTitle, 'ArivuNet Project Architecture');
    assert.ok(res.answer.includes('ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್') || res.answer.includes('ಅರಿವುನೆಟ್'));
    assert.ok(res.sources.length > 0);
  });

  await test('3.7 Scenario 7: Unrelated and out-of-domain query triggers grounded no-context fallback', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'quantum mechanics general relativity astrophysical black hole physics',
      language: 'auto'
    });
    assert.equal(res.confidence, 'low');
    assert.equal(res.sources.length, 0);
    assert.ok(res.answer.includes('could not find verified information'));
  });

  await test('3.8 Scenario 8: Citations preserve authentic URLs and department provenance', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'What documents are required for Sandhya Suraksha pension?',
      language: 'en'
    });
    assert.ok(res.sources.length > 0);
    const source = res.sources[0];
    assert.ok(source.documentTitle);
    assert.ok(source.department);
    assert.ok(source.section);
    assert.ok(source.sourceUrl && source.sourceUrl.startsWith('https://'));
  });

  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`Bilingual RAG Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBilingualRagTests().catch((err) => {
  console.error('Fatal error during bilingual RAG test suite execution:', err);
  process.exit(1);
});

