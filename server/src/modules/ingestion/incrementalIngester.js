/**
 * OfflineBridge — Incremental Ingestion Engine & Duplicate Detection
 * 
 * Ingests authoritative government citizen services, welfare schemes, and statutory certificates.
 * Provides:
 * - Content-based SHA-256 duplicate detection.
 * - Source-provenance recording in 'scheme_sources'.
 * - Job auditing and error capture in 'ingestion_jobs'.
 * - Batch synchronization with PostgreSQL and RAG vector store.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../../db/pool.js';
import { chunkDocument } from './chunker.js';
import { saveChunks } from './documentRepository.js';
import { ensureChunkEmbeddings } from '../rag/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOGUE_FILE = path.resolve(__dirname, '../../data/authoritativeCatalogue.json');

/**
 * Compute SHA-256 hash for deduplication
 */
function computeHash(item) {
  const payload = JSON.stringify({
    id: item.id,
    serviceCode: item.serviceCode,
    department: item.department,
    title: item.title,
    serviceType: item.serviceType || item.service_type
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Run the incremental ingestion pipeline
 * 
 * @param {object} [options]
 * @param {string} [options.jobType='bulk_authoritative_ingest']
 * @param {string} [options.triggeredBy='system']
 * @returns {Promise<object>} Ingestion metrics
 */
export async function runIncrementalIngestion(options = {}) {
  const { jobType = 'bulk_authoritative_ingest', triggeredBy = 'system' } = options;
  const pool = getPool();

  console.log('================================================================');
  console.log('=== OfflineBridge: Incremental Government Ingestion Engine   ===');
  console.log('================================================================\n');

  // 1. Read catalogue file
  if (!fs.existsSync(CATALOGUE_FILE)) {
    throw new Error(`Catalogue file not found at ${CATALOGUE_FILE}. Run compiler script first.`);
  }

  const raw = fs.readFileSync(CATALOGUE_FILE, 'utf-8');
  const candidateRecords = JSON.parse(raw);
  console.log(`[Step 1] Loaded ${candidateRecords.length} candidates from authoritative catalogue.`);

  // 2. Start ingestion job entry in database
  const jobRes = await pool.query(`
    INSERT INTO ingestion_jobs (job_type, status, total_candidates, triggered_by, started_at)
    VALUES ($1, 'running', $2, $3, CURRENT_TIMESTAMP)
    RETURNING id;
  `, [jobType, candidateRecords.length, triggeredBy]);
  const jobId = jobRes.rows[0].id;
  console.log(`[Step 2] Started Ingestion Job: ${jobId}`);

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errorLog = [];

  // 3. Snapshot existing schemes and source hashes from DB
  const existingRes = await pool.query(`
    SELECT id, service_code, service_type, verification_status FROM schemes;
  `);
  const existingMap = new Map(existingRes.rows.map((r) => [r.id, r]));

  const sourceHashRes = await pool.query(`
    SELECT scheme_id, content_hash FROM scheme_sources WHERE content_hash IS NOT NULL;
  `);
  const existingHashMap = new Map(sourceHashRes.rows.map((r) => [r.scheme_id, r.content_hash]));

  console.log(`[Step 3] Existing database state: ${existingMap.size} schemes, ${existingHashMap.size} source hashes.`);

  // 4. Ingest / Upsert schemes into PostgreSQL in a batch-conscious manner
  console.log('\n[Step 4] Ingesting candidate records with SHA-256 duplicate detection...');

  const newlyActiveSchemeIds = [];

  for (const item of candidateRecords) {
    const hash = computeHash(item);
    const exists = existingMap.has(item.id);
    const existingHash = existingHashMap.get(item.id);

    // If scheme exists and content hash hasn't changed, skip gracefully
    if (exists && existingHash === hash) {
      skippedCount++;
      continue;
    }

    const serviceType = item.serviceType || item.service_type || 'scheme';
    const serviceCode = item.serviceCode || item.service_code || `SVC-${item.id.slice(0, 10).toUpperCase()}`;
    const slaDays = parseInt(item.slaDays ?? item.sla_days ?? 30, 10);
    const sourcePortal = item.sourcePortal || item.source_portal || 'karnataka_official';
    const officialUrl = item.officialUrl || item.official_url || 'https://sevasindhu.karnataka.gov.in';
    const verificationStatus = item.verificationStatus || item.verification_status || 'officially_verified';

    const eligibilityText = Array.isArray(item.eligibilityCriteria)
      ? item.eligibilityCriteria.join('\n')
      : (item.eligibilityCriteria || '');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert scheme
      await client.query(`
        INSERT INTO schemes (
          id, title, title_kn, department, department_kn, category,
          service_type, service_code, description, description_kn,
          official_url, sla_days, verification_status, source_portal,
          last_verified_date, eligibility_criteria, eligibility_rules, is_active, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          CURRENT_DATE, $15, $16, true, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          title_kn = EXCLUDED.title_kn,
          department = EXCLUDED.department,
          department_kn = EXCLUDED.department_kn,
          category = EXCLUDED.category,
          service_type = EXCLUDED.service_type,
          service_code = EXCLUDED.service_code,
          description = EXCLUDED.description,
          description_kn = EXCLUDED.description_kn,
          official_url = EXCLUDED.official_url,
          sla_days = EXCLUDED.sla_days,
          verification_status = EXCLUDED.verification_status,
          source_portal = EXCLUDED.source_portal,
          eligibility_criteria = EXCLUDED.eligibility_criteria,
          eligibility_rules = EXCLUDED.eligibility_rules,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        item.id,
        item.title,
        item.titleKn || item.title,
        item.department,
        item.departmentKn || item.department,
        item.category || 'citizen',
        serviceType,
        serviceCode,
        item.description || item.shortDesc || '',
        item.descriptionKn || item.shortDescKn || '',
        officialUrl,
        slaDays,
        verificationStatus,
        sourcePortal,
        eligibilityText,
        JSON.stringify(item.eligibilityRules || {})
      ]);

      // Upsert source provenance record
      await client.query(`
        INSERT INTO scheme_sources (
          scheme_id, source_name, source_url, source_portal,
          document_reference, verification_status, content_hash, metadata, last_synced_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;
      `, [
        item.id,
        `Government of Karnataka (${sourcePortal.toUpperCase()})`,
        officialUrl,
        sourcePortal,
        `Sakala Service Code: ${serviceCode}`,
        verificationStatus,
        hash,
        JSON.stringify({
          slaDays,
          category: item.category,
          serviceType
        })
      ]);

      await client.query('COMMIT');

      newlyActiveSchemeIds.push(item.id);
      if (!exists) {
        importedCount++;
      } else {
        updatedCount++;
      }
    } catch (err) {
      await client.query('ROLLBACK');
      failedCount++;
      errorLog.push({ id: item.id, error: err.message });
      console.error(`  ✗ Error upserting ${item.id}:`, err.message);
    } finally {
      client.release();
    }
  }

  console.log(`[Step 4 Complete] Processed: ${candidateRecords.length} | Imported: ${importedCount} | Updated: ${updatedCount} | Skipped: ${skippedCount} | Failed: ${failedCount}`);

  // 5. Generate RAG knowledge chunks for all newly imported/updated records
  console.log('\n[Step 5] Building and synchronizing RAG knowledge base chunks...');
  const chunksToSave = [];

  for (const item of candidateRecords) {
    const officialUrl = item.officialUrl || item.official_url || 'https://sevasindhu.karnataka.gov.in';
    const sla = item.slaDays ?? item.sla_days ?? 30;
    const serviceType = item.serviceType || item.service_type || 'scheme';
    const serviceCode = item.serviceCode || item.service_code || '';

    // 1. English Chunk
    const enText = [
      `# ${item.title}`,
      `Service Code: ${serviceCode}`,
      `Service Type: ${serviceType.toUpperCase()}`,
      `Department: ${item.department}`,
      `Category: ${item.categoryLabel || item.category}`,
      `Guaranteed Delivery SLA: ${sla} Days under Sakala Act`,
      `Official Portal: ${officialUrl}`,
      '',
      `## Overview`,
      item.description || item.shortDesc || '',
      '',
      `## Eligibility Criteria`,
      Array.isArray(item.eligibilityCriteria) ? item.eligibilityCriteria.map((c) => `- ${c}`).join('\n') : (item.eligibilityCriteria || 'Standard Karnataka residency criteria.'),
      '',
      `## Required Documents Checklist`,
      Array.isArray(item.requiredDocuments) ? item.requiredDocuments.map((d) => `- ${d}`).join('\n') : (item.requiredDocuments || 'Aadhaar Card and address proof.'),
      '',
      `## Application Procedure`,
      Array.isArray(item.applicationProcedure) ? item.applicationProcedure.map((p) => `- ${p}`).join('\n') : 'Apply online via Seva Sindhu or visit nearest Grama One centre.'
    ].join('\n');

    const enParsed = {
      text: enText,
      pages: [{ pageNumber: 1, text: enText }]
    };

    const enChunks = chunkDocument(enParsed, {
      documentId: `scheme-${item.id}-en`,
      documentTitle: item.title,
      department: item.department,
      schemeId: item.id,
      sourceUrl: officialUrl,
      language: 'en',
      verificationStatus: 'officially_verified',
      lastVerifiedDate: '2026-03-31'
    });
    chunksToSave.push(...enChunks);

    // 2. Kannada Chunk (if Kannada title is available)
    if (item.titleKn) {
      const knText = [
        `# ${item.titleKn}`,
        `ಸೇವಾ ಕೋಡ್: ${serviceCode}`,
        `ಸೇವಾ ವರ್ಗೀಕರಣ: ${serviceType.toUpperCase()}`,
        `ಇಲಾಖೆ: ${item.departmentKn || item.department}`,
        `ವರ್ಗ: ${item.categoryLabelKn || item.category}`,
        `ಸಕಾಲ ಖಾತರಿ ಅವಧಿ: ${sla} ದಿನಗಳು`,
        `ಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${officialUrl}`,
        '',
        `## ವಿವರಣೆ`,
        item.descriptionKn || item.description || '',
        '',
        `## ಅರ್ಹತಾ ಮಾನದಂಡಗಳು`,
        Array.isArray(item.eligibilityCriteriaKn) ? item.eligibilityCriteriaKn.map((c) => `- ${c}`).join('\n') : (item.eligibilityCriteria || 'ಕರ್ನಾಟಕದ ನಿವಾಸಿಗಳು.'),
        '',
        `## ಅಗತ್ಯ ದಾಖಲೆಗಳು`,
        Array.isArray(item.requiredDocumentsKn) ? item.requiredDocumentsKn.map((d) => `- ${d}`).join('\n') : 'ಅರ್ಜಿದಾರರ ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ವಿಳಾಸ ದಾಖಲೆ.',
        '',
        `## ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ`,
        Array.isArray(item.applicationProcedureKn) ? item.applicationProcedureKn.map((p) => `- ${p}`).join('\n') : 'ಸೇವಾ ಸಿಂಧು ಅಥವಾ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.'
      ].join('\n');

      const knParsed = {
        text: knText,
        pages: [{ pageNumber: 1, text: knText }]
      };

      const knChunks = chunkDocument(knParsed, {
        documentId: `scheme-${item.id}-kn`,
        documentTitle: item.titleKn,
        department: item.departmentKn || item.department,
        schemeId: item.id,
        sourceUrl: officialUrl,
        language: 'kn',
        verificationStatus: 'officially_verified',
        lastVerifiedDate: '2026-03-31'
      });
      chunksToSave.push(...knChunks);
    }
  }

  console.log(`   Generated ${chunksToSave.length} bilingual chunks across ${candidateRecords.length} records.`);

  // Save chunks in batches of 200 to prevent query parameter explosion
  const BATCH_SIZE = 200;
  let savedChunkCount = 0;
  for (let i = 0; i < chunksToSave.length; i += BATCH_SIZE) {
    const slice = chunksToSave.slice(i, i + BATCH_SIZE);
    const saveRes = await saveChunks(slice);
    savedChunkCount += (saveRes.inserted || 0);
  }
  console.log(`   Persisted ${savedChunkCount} new chunks into RAG storage.`);

  // 6. Update vector store embeddings
  console.log('\n[Step 6] Generating & caching vector embeddings for RAG retrieval...');
  const embedRes = await ensureChunkEmbeddings();
  console.log(`   Vector store updated: ${embedRes.totalChunks} total chunks indexed.`);

  // 7. Complete the ingestion job entry
  const finalStatus = failedCount === 0 ? 'completed' : (importedCount > 0 ? 'partial' : 'failed');
  await pool.query(`
    UPDATE ingestion_jobs SET
      status = $1,
      imported_count = $2,
      updated_count = $3,
      skipped_count = $4,
      failed_count = $5,
      error_log = $6,
      completed_at = CURRENT_TIMESTAMP
    WHERE id = $7;
  `, [
    finalStatus,
    importedCount,
    updatedCount,
    skippedCount,
    failedCount,
    JSON.stringify(errorLog),
    jobId
  ]);

  // 8. Snapshot final database counts
  const finalCountRes = await pool.query(`
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN service_type = 'scheme' THEN 1 END) AS schemes_count,
      COUNT(CASE WHEN service_type = 'service' THEN 1 END) AS services_count,
      COUNT(CASE WHEN service_type = 'certificate' THEN 1 END) AS certificates_count,
      COUNT(CASE WHEN service_type = 'welfare_benefit' THEN 1 END) AS welfare_count
    FROM schemes;
  `);

  const summary = {
    jobId,
    status: finalStatus,
    candidateTotal: candidateRecords.length,
    imported: importedCount,
    updated: updatedCount,
    skipped: skippedCount,
    failed: failedCount,
    dbTotal: parseInt(finalCountRes.rows[0].total, 10),
    breakdown: {
      schemes: parseInt(finalCountRes.rows[0].schemes_count, 10),
      services: parseInt(finalCountRes.rows[0].services_count, 10),
      certificates: parseInt(finalCountRes.rows[0].certificates_count, 10),
      welfareBenefits: parseInt(finalCountRes.rows[0].welfare_count, 10)
    },
    ragTotalChunks: embedRes.totalChunks
  };

  console.log('\n================================================================');
  console.log('=== Ingestion Execution Summary ===');
  console.log(`- Job ID: ${jobId} (${finalStatus})`);
  console.log(`- Total Records in PostgreSQL: ${summary.dbTotal}`);
  console.log(`  * Schemes: ${summary.breakdown.schemes}`);
  console.log(`  * Citizen Services: ${summary.breakdown.services}`);
  console.log(`  * Statutory Certificates: ${summary.breakdown.certificates}`);
  console.log(`  * Welfare Benefits: ${summary.breakdown.welfareBenefits}`);
  console.log(`- Newly Imported: ${importedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Skipped (Deduplicated): ${skippedCount}`);
  console.log(`- Failed: ${failedCount}`);
  console.log(`- Total RAG Knowledge Chunks: ${summary.ragTotalChunks}`);
  console.log('================================================================\n');

  return summary;
}

if (process.argv[1]?.endsWith('incrementalIngester.js')) {
  runIncrementalIngestion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal incremental ingestion error:', err);
      process.exit(1);
    });
}

