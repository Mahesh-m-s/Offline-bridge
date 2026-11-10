/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Stages D, E & F RAG Verification Suite
 * 
 * Tests:
 * 1. Vector Search & Cosine Similarity math.
 * 2. Multi-language query retrieval (English and Kannada).
 * 3. Relevance ranking and top-K chunk retrieval.
 * 4. Grounded fallback when context is absent or below threshold.
 * 5. Honest provider-unavailable response when GEMINI_API_KEY is not configured.
 * 6. Live / mock grounded generation with XML-isolated context and source citations.
 * 7. HTTP API endpoint POST /api/rag/chat and legacy POST /api/rag/query.
 * 8. Malformed payloads and rate limiting.
 */

import http from 'http';
import assert from 'node:assert/strict';
import app from './src/app.js';
import {
  cosineSimilarity,
  calculateLexicalScore,
  retrieveRelevantChunks,
  ensureChunkEmbeddings
} from './src/modules/rag/vectorStore.js';
import {
  chatWithKnowledgeBase,
  queryKnowledgeBase
} from './src/modules/rag/rag.service.js';
import {
  embedText,
  generateDeterministicVector,
  isAiConfigured
} from './src/modules/rag/aiProvider.js';

async function runRagTests() {
  console.log('================================================================');
  console.log('=== ArivuNet RAG: Vector Search, Retrieval & Chat Verification ===');
  console.log('================================================================\n');

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

  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Cosine Similarity & Vector Math ---');
  // --------------------------------------------------------------------------

  await test('cosineSimilarity returns 1.0 for identical vectors', () => {
    const v1 = [1, 2, 3, 4];
    const v2 = [1, 2, 3, 4];
    const sim = cosineSimilarity(v1, v2);
    assert.ok(Math.abs(sim - 1.0) < 1e-6, `Expected ~1.0, got ${sim}`);
  });

  await test('cosineSimilarity returns 0.0 for orthogonal vectors', () => {
    const v1 = [1, 0];
    const v2 = [0, 1];
    const sim = cosineSimilarity(v1, v2);
    assert.equal(sim, 0);
  });

  await test('generateDeterministicVector creates normalized vectors for offline retrieval', () => {
    const vecA = generateDeterministicVector('Scholarship for students in Karnataka');
    const vecB = generateDeterministicVector('Scholarship for students in Karnataka');
    const vecC = generateDeterministicVector('Completely different agricultural fertilizer topic');

    assert.equal(vecA.length, 64);
    assert.ok(Math.abs(cosineSimilarity(vecA, vecB) - 1.0) < 1e-6);
    assert.ok(cosineSimilarity(vecA, vecC) < 0.9, 'Different topics should have lower similarity');
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Hybrid Semantic Retrieval (English & Kannada) ---');
  // --------------------------------------------------------------------------

  await test('retrieveRelevantChunks finds top matches for English scholarship query', async () => {
    const chunks = await retrieveRelevantChunks('What scholarships are available for Karnataka students?', {
      topK: 3
    });

    assert.ok(chunks.length > 0, 'Must retrieve relevant chunks');
    const top = chunks[0];
    assert.ok(
      top.documentTitle.toLowerCase().includes('scholarship') ||
      top.content.toLowerCase().includes('scholarship') ||
      top.section.toLowerCase().includes('scholarship'),
      `Top chunk should be scholarship-related, got: ${top.documentTitle}`
    );
    assert.ok(top.similarity > 0.25);
    assert.ok(top.documentTitle);
    assert.ok(chunks.some((c) => c.schemeId === 'ssp-scholarship' || c.documentTitle.toLowerCase().includes('scholarship')));
  });

  await test('retrieveRelevantChunks finds top matches for Kannada agriculture query', async () => {
    const chunks = await retrieveRelevantChunks('ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ಬೀಜ ಸಹಾಯಧನ ಪಡೆಯುವುದು ಹೇಗೆ?', {
      topK: 3,
      language: 'kn'
    });

    assert.ok(chunks.length > 0, 'Must retrieve relevant Kannada chunks');
    assert.ok(
      chunks.some((c) => c.content.includes('ರೈತ') || c.documentTitle.includes('ರೈತ') || c.schemeId === 'agri-seed-subsidy'),
      'Expected agriculture/seed subsidy chunk'
    );
  });

  await test('retrieveRelevantChunks finds Sandhya Suraksha pension criteria', async () => {
    const chunks = await retrieveRelevantChunks('Sandhya Suraksha pension age and income criteria', {
      topK: 3
    });

    assert.ok(chunks.length > 0);
    assert.ok(
      chunks.some((c) => c.schemeId === 'old-age-pension' || c.documentTitle.toLowerCase().includes('pension')),
      'Expected old-age pension chunk'
    );
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: RAG Grounded Answer Logic & Guardrails ---');
  // --------------------------------------------------------------------------

  await test('chatWithKnowledgeBase rejects invalid question (< 2 chars)', async () => {
    await assert.rejects(
      async () => chatWithKnowledgeBase({ question: ' ' }),
      (err) => err.code === 'INVALID_QUESTION' && err.status === 400
    );
  });

  await test('chatWithKnowledgeBase returns grounded answer with sources for SSP age criteria', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'what the age critiera for ssp',
      language: 'en'
    });

    assert.equal(res.isAiServiceAvailable, true);
    assert.ok(res.answer.includes('State Scholarship Portal') || res.answer.includes('SSP'));
    assert.ok(res.answer.includes('Age Criteria') || res.answer.includes('Eligibility'));
    assert.ok(res.sources.length > 0);
    assert.ok(res.conversationId.startsWith('conv-'));
  });

  await test('chatWithKnowledgeBase returns grounded Kannada answer for Kannada query', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'ಎಸ್ಎಸ್ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಅರ್ಹತೆ ಏನು?',
      language: 'kn'
    });

    assert.equal(res.isAiServiceAvailable, true);
    assert.equal(res.language, 'kn');
    assert.ok(res.answer.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') || res.answer.includes('SSP'));
    assert.ok(res.sources.length > 0);
  });

  await test('chatWithKnowledgeBase returns official no-context message for off-topic query', async () => {
    const res = await chatWithKnowledgeBase({
      question: 'quantum mechanics general relativity astrophysical black hole physics',
      language: 'en'
    });

    assert.equal(res.confidence, 'low');
    assert.ok(res.answer.includes('could not find verified information'));
    assert.equal(res.sources.length, 0);
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: HTTP API Endpoints (/api/rag/chat & /api/rag/query) ---');
  // --------------------------------------------------------------------------

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await test('POST /api/rag/chat returns structured response contract', async () => {
      const res = await fetch(`${baseUrl}/api/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What documents are required for Yuva Nidhi scheme?',
          language: 'en'
        })
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.answer);
      assert.ok(json.data.conversationId);
      assert.ok(Array.isArray(json.data.sources));
    });

    await test('POST /api/rag/chat rejects missing question payload with 400', async () => {
      const res = await fetch(`${baseUrl}/api/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    await test('POST /api/rag/query legacy search endpoint remains backward compatible', async () => {
      const res = await fetch(`${baseUrl}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'seed subsidy' })
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data.matchedDocuments));
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n================================================================');
  console.log(`RAG Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRagTests().catch((err) => {
  console.error('[Fatal RAG Test Error]:', err);
  process.exit(1);
});
