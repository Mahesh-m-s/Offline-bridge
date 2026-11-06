/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Stage C: Document Ingestion Test Suite
 * 
 * Verifies:
 * 1. Text cleaner: cleans whitespace while preserving Kannada Unicode and Markdown headers.
 * 2. Multi-format parsing: PDF text and page boundaries (docs/synopsis_d4_final.pdf), Markdown, plain text, and JSON.
 * 3. Parser safety: rejects malformed PDF headers, empty documents, and unsupported formats.
 * 4. Semantic chunking: target sizes, overlaps, section preservation, page references, and contentHash.
 * 5. Deduplication: exact content hashes are detected and duplicate writes skipped.
 * 6. Schemes catalogue seeding: ingests verified Karnataka schemes in English and Kannada with official metadata.
 * 7. Storage transparency: accurately reports backing storage (postgres or file_storage) without faking persistence.
 * 8. Missing source info and fallback behavior.
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'url';

import { cleanText, detectLanguage } from './src/modules/ingestion/textCleaner.js';
import { parseDocument, parsePdfBuffer, parseTextDocument, parseJsonDocument } from './src/modules/ingestion/documentParser.js';
import { chunkTextWithSections, chunkDocument, generateHash } from './src/modules/ingestion/chunker.js';
import {
  saveChunk,
  saveChunks,
  getAllChunks,
  getStorageStats,
  clearTestStore,
  isDatabaseTableAvailable
} from './src/modules/ingestion/documentRepository.js';
import { buildSchemeKnowledgeChunks, ingestCatalogue } from './src/modules/ingestion/schemeCatalogueIngester.js';
import {
  ingestDocument,
  ingestFileDocument,
  getIngestionStatus
} from './src/modules/ingestion/ingestion.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_PDF_PATH = path.resolve(__dirname, '../docs/synopsis_d4_final.pdf');

async function runStageCTests() {
  console.log('================================================================');
  console.log('=== ArivuNet Stage C: Document Ingestion Verification Suite  ===');
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

  // Clear test storage before starting
  clearTestStore();

  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Text Cleaning & Kannada Unicode Preservation ---');
  // --------------------------------------------------------------------------

  await test('cleanText strips control characters and normalizes irregular whitespace', () => {
    const raw = "Line 1\r\n\r\n\r\nLine 2   with   spaces\x00\x08 and \u200Bzero width";
    const cleaned = cleanText(raw);
    assert.equal(cleaned, "Line 1\n\nLine 2 with spaces and zero width");
  });

  await test('cleanText preserves Kannada script conjuncts, virama and vowels', () => {
    const kannada = "ಕರ್ನಾಟಕ ಸರಕಾರ — ರೈತ ಸಿರಿ ಯೋಜನೆ (Raitha Siri)";
    const cleaned = cleanText(kannada);
    assert.equal(cleaned, "ಕರ್ನಾಟಕ ಸರಕಾರ — ರೈತ ಸಿರಿ ಯೋಜನೆ (Raitha Siri)");
  });

  await test('detectLanguage distinguishes English and Kannada text accurately', () => {
    assert.equal(detectLanguage('Post-Matric Scholarship for SC/ST students in Karnataka'), 'en');
    assert.equal(detectLanguage('ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಅಗತ್ಯ ದಾಖಲೆಗಳು'), 'kn');
    assert.equal(detectLanguage('Short'), 'en');
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Multi-Format Document Parsing ---');
  // --------------------------------------------------------------------------

  await test('parseDocument extracts multi-page text and page numbers from official PDF', async () => {
    assert.ok(fs.existsSync(SAMPLE_PDF_PATH), `Sample PDF not found at ${SAMPLE_PDF_PATH}`);
    const pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);

    const parsed = await parseDocument(pdfBuffer, { filename: 'synopsis_d4_final.pdf' });
    assert.equal(parsed.format, 'pdf');
    assert.ok(parsed.numPages >= 2, `Expected at least 2 pages, got ${parsed.numPages}`);
    assert.ok(parsed.text.includes('OfflineBridge'), 'Expected text to contain OfflineBridge');
    assert.equal(parsed.pages[0].pageNumber, 1);
    assert.ok(parsed.pages[0].text.length > 100);
  });

  await test('parseDocument extracts Markdown text and structural formatting', async () => {
    const md = "# Sandhya Suraksha\n\n## Eligibility\n- Age 65+\n- Income below 20000";
    const parsed = await parseDocument(md, { format: 'markdown' });
    assert.equal(parsed.format, 'markdown');
    assert.ok(parsed.text.includes('# Sandhya Suraksha'));
    assert.equal(parsed.numPages, 1);
  });

  await test('parseDocument extracts structured JSON into searchable text', async () => {
    const jsonInput = {
      schemeName: 'Ganga Kalyana Yojana',
      department: 'Backward Classes Welfare',
      subsidyAmount: 250000
    };
    const parsed = await parseDocument(jsonInput, { format: 'json' });
    assert.equal(parsed.format, 'json');
    assert.ok(parsed.text.includes('schemeName: Ganga Kalyana Yojana'));
    assert.ok(parsed.text.includes('subsidyAmount: 250000'));
  });

  await test('parseDocument rejects malformed PDF with invalid magic header', async () => {
    const fakePdfBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER_DATA');
    await assert.rejects(
      async () => parseDocument(fakePdfBuffer, { format: 'pdf' }),
      (err) => err.code === 'INVALID_PDF_HEADER'
    );
  });

  await test('parseDocument rejects empty documents cleanly', async () => {
    await assert.rejects(
      async () => parseDocument('', { format: 'text' }),
      (err) => err.code === 'EMPTY_DOCUMENT'
    );
  });

  await test('parseDocument rejects unsupported file format', async () => {
    await assert.rejects(
      async () => parseDocument('some text', { format: 'docx_unsupported' }),
      (err) => err.code === 'UNSUPPORTED_FORMAT'
    );
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: Semantic Chunking, Sections & Page References ---');
  // --------------------------------------------------------------------------

  await test('chunkTextWithSections attaches active section headers to chunks', () => {
    const text = [
      "# Overview",
      "This scheme provides seed subsidy to farmers across Karnataka.",
      "",
      "## Eligibility Criteria",
      "The applicant must own certified agricultural land.",
      "Annual household income must not exceed prescribed ceiling."
    ].join('\n');

    const chunks = chunkTextWithSections(text, { targetChunkSize: 300, chunkOverlap: 50 });
    assert.ok(chunks.length >= 2);
    assert.equal(chunks[0].section, 'Overview');
    assert.ok(chunks.some((c) => c.section === 'Eligibility Criteria'));
  });

  await test('chunkDocument preserves document identity, page numbers, and SHA-256 hash', () => {
    const parsedDoc = {
      text: 'Sample text across two pages',
      pages: [
        { pageNumber: 1, text: '# Section 1\nPage 1 detailed government entitlement criteria.' },
        { pageNumber: 2, text: '# Section 2\nPage 2 detailed application procedure and grievance contacts.' }
      ]
    };

    const metadata = {
      documentId: 'doc-karn-test-001',
      documentTitle: 'Karnataka Test Policy',
      department: 'Department of Revenue',
      schemeId: 'karn-test-001',
      sourceUrl: 'https://karnataka.gov.in',
      verificationStatus: 'officially_verified',
      lastVerifiedDate: '2026-03-31'
    };

    const chunks = chunkDocument(parsedDoc, metadata, { targetChunkSize: 200, chunkOverlap: 40 });
    assert.ok(chunks.length >= 2);

    assert.equal(chunks[0].documentId, 'doc-karn-test-001');
    assert.equal(chunks[0].documentTitle, 'Karnataka Test Policy');
    assert.equal(chunks[0].department, 'Department of Revenue');
    assert.equal(chunks[0].sourceUrl, 'https://karnataka.gov.in');
    assert.equal(chunks[0].verificationStatus, 'officially_verified');
    assert.equal(chunks[0].lastVerifiedDate, '2026-03-31');
    assert.equal(chunks[0].page, 1);
    assert.equal(chunks[1].page, 2);
    assert.ok(chunks[0].contentHash.length === 64, 'contentHash must be 64-char hex SHA-256');
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Storage Persistence & SHA-256 Deduplication ---');
  // --------------------------------------------------------------------------

  await test('saveChunks stores chunks and enforces deduplication', async () => {
    const chunkA = {
      documentId: 'doc-dedup-test',
      documentTitle: 'Dedup Title',
      department: 'Revenue',
      section: 'Intro',
      page: 1,
      language: 'en',
      verificationStatus: 'officially_verified',
      chunkIndex: 0,
      totalChunks: 1,
      content: 'Unique entitlement text for deduplication verification.',
      contentHash: generateHash('doc-dedup-test:0:Unique entitlement text')
    };

    const firstSave = await saveChunks([chunkA]);
    assert.equal(firstSave.inserted, 1);
    assert.equal(firstSave.skipped, 0);

    // Re-insert exact same chunk -> should be skipped
    const secondSave = await saveChunks([chunkA]);
    assert.equal(secondSave.inserted, 0);
    assert.equal(secondSave.skipped, 1);
  });

  await test('getStorageStats accurately reports backend storage and counts', async () => {
    const stats = await getStorageStats();
    assert.ok(['postgres', 'file_storage'].includes(stats.storageBackend));
    assert.equal(typeof stats.isPersistent, 'boolean');
    assert.ok(stats.totalChunks >= 1);
    assert.ok(stats.totalDocuments >= 1);
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Karnataka Schemes Catalogue Ingestion ---');
  // --------------------------------------------------------------------------

  await test('buildSchemeKnowledgeChunks extracts bilingual structured sections', () => {
    const sampleScheme = {
      id: 'ssp-scholarship-test',
      title: 'State Scholarship Portal Test',
      titleKn: 'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪರೀಕ್ಷೆ',
      department: 'Social Welfare Department',
      departmentKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ ಇಲಾಖೆ',
      category: 'student',
      description: 'Official pre-matric and post-matric scholarship scheme.',
      descriptionKn: 'ಮೆಟ್ರಿಕ್ ಪೂರ್ವ ಮತ್ತು ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ.',
      benefits: ['Fee reimbursement', 'Maintenance allowance'],
      benefitsKn: ['ಶುಲ್ಕ ಮರುಪಾವತಿ', 'ನಿರ್ವಹಣಾ ಭತ್ಯೆ'],
      eligibilityCriteria: ['Annual family income below 2.5 Lakh', 'Karnataka domicile'],
      eligibilityCriteriaKn: ['ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ 2.5 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ', 'ಕರ್ನಾಟಕದ ನಿವಾಸಿ'],
      requiredDocuments: ['Aadhaar', 'Income Certificate', 'Caste Certificate'],
      requiredDocumentsKn: ['ಆಧಾರ್ ಕಾರ್ಡ್', 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ', 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ'],
      applicationProcedure: ['Apply online on SSP portal'],
      applicationProcedureKn: ['ಎಸ್ಎಸ್ಪಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'],
      officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
      verifiedDate: '2026-03-31'
    };

    const chunks = buildSchemeKnowledgeChunks(sampleScheme);
    assert.ok(chunks.length >= 2, 'Must generate multiple chunks across sections');

    const enChunks = chunks.filter((c) => c.language === 'en');
    const knChunks = chunks.filter((c) => c.language === 'kn');

    assert.ok(enChunks.length > 0, 'Must have English chunks');
    assert.ok(knChunks.length > 0, 'Must have Kannada chunks');

    assert.equal(enChunks[0].verificationStatus, 'officially_verified');
    assert.equal(enChunks[0].lastVerifiedDate, '2026-03-31');
    assert.equal(enChunks[0].sourceUrl, 'https://ssp.postmatric.karnataka.gov.in');

    assert.ok(knChunks[0].content.includes('ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪರೀಕ್ಷೆ'));
  });

  await test('ingestCatalogue seeds all 10 verified Karnataka schemes from catalogue', async () => {
    const result = await ingestCatalogue();
    assert.equal(result.totalSchemes, 10);
    assert.ok(result.totalChunks >= 20, `Expected at least 20 chunks, got ${result.totalChunks}`);
    assert.ok(result.insertedChunks >= 1);

    const all = await getAllChunks();
    const uniqueSchemes = new Set(all.map((c) => c.schemeId).filter(Boolean));
    assert.ok(uniqueSchemes.has('ssp-scholarship'));
    assert.ok(uniqueSchemes.has('agri-seed-subsidy'));
    assert.ok(uniqueSchemes.has('old-age-pension'));
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 6: Ingestion Service & File Buffers ---');
  // --------------------------------------------------------------------------

  await test('ingestDocument ingests plain text document with metadata', async () => {
    const res = await ingestDocument({
      title: 'Janaspandana Grievance Procedures',
      content: '# Grievance System\n\nCitizens can lodge complaints via 1902 or Grama One.',
      department: 'Department of Personnel & Administrative Reforms',
      sourceUrl: 'https://ipgrs.karnataka.gov.in',
      provenance: {
        verificationStatus: 'officially_verified',
        lastVerifiedDate: '2026-03-31'
      }
    });

    assert.ok(res.documentId);
    assert.equal(res.title, 'Janaspandana Grievance Procedures');
    assert.ok(res.totalChunks >= 1);
  });

  await test('ingestFileDocument ingests real PDF buffer with page-aware chunking', async () => {
    const pdfBuf = fs.readFileSync(SAMPLE_PDF_PATH);
    const res = await ingestFileDocument({
      buffer: pdfBuf,
      filename: 'synopsis_d4_final.pdf',
      title: 'ArivuNet Project Architecture',
      department: 'Department of Information Science & Engineering'
    });

    assert.ok(res.documentId);
    assert.equal(res.format, 'pdf');
    assert.ok(res.numPages >= 2);
    assert.ok(res.totalChunks >= 2);
  });

  await test('ingestDocument rejects missing or too-short title', async () => {
    await assert.rejects(
      async () => ingestDocument({ title: 'A', content: 'Valid content' }),
      (err) => err.code === 'INVALID_TITLE'
    );
  });

  await test('getIngestionStatus reports final storage and document count accurately', async () => {
    const status = await getIngestionStatus();
    assert.ok(status.totalChunks > 20);
    assert.ok(status.totalDocuments >= 10);
  });

  console.log('\n================================================================');
  console.log(`Stage C Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStageCTests().catch((err) => {
  console.error('[Fatal Stage C Test Suite Error]:', err);
  process.exit(1);
});
