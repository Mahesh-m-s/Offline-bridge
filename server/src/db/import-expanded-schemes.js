/**
 * OfflineBridge — Government Scheme & Service Ingestion Pipeline
 * Safe, idempotent ingestion of verified government welfare schemes and citizen services.
 * Synchronizes PostgreSQL, RAG knowledge documents, and embeddings.
 */

import { getPool, closePool } from './pool.js';
import { upsertScheme, getAllSchemes } from '../modules/schemes/schemes.service.js';
import { EXPANDED_GOV_SCHEMES } from '../data/expandedGovSchemes.js';
import { SCHEMES_CATALOGUE } from '../data/schemesCatalogue.js';
import { buildSchemeKnowledgeChunks } from '../modules/ingestion/schemeCatalogueIngester.js';
import { saveChunks } from '../modules/ingestion/documentRepository.js';
import { ensureChunkEmbeddings } from '../modules/rag/vectorStore.js';

export async function runIngestion() {
  console.log('================================================================');
  console.log('=== OfflineBridge: Government Scheme Ingestion Pipeline      ===');
  console.log('================================================================\n');

  const pool = getPool();

  // 1. Snapshot pre-ingestion database count
  const initialRes = await pool.query('SELECT count(*) as count FROM schemes;');
  const initialCount = parseInt(initialRes.rows[0].count, 10);
  console.log(`[Step 1] Initial schemes count in PostgreSQL: ${initialCount}`);

  // Get list of existing IDs
  const existingIdsRes = await pool.query('SELECT id FROM schemes;');
  const existingIdSet = new Set(existingIdsRes.rows.map(r => r.id));

  // Combine catalogues to ensure complete coverage
  const allCandidateSchemes = [...SCHEMES_CATALOGUE];
  for (const exp of EXPANDED_GOV_SCHEMES) {
    if (!allCandidateSchemes.some(s => s.id === exp.id)) {
      allCandidateSchemes.push(exp);
    }
  }

  console.log(`[Step 2] Total candidates to process: ${allCandidateSchemes.length}`);

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const systemActor = { id: null, role: 'system_ingestion' };

  // 2. Ingest into PostgreSQL schemes table
  console.log('\n[Step 3] Ingesting schemes into PostgreSQL:');
  for (const item of allCandidateSchemes) {
    const isNew = !existingIdSet.has(item.id);
    const eligibilityCriteriaText = Array.isArray(item.eligibilityCriteria)
      ? item.eligibilityCriteria.join('\n')
      : (item.eligibilityCriteria || '');

    try {
      await upsertScheme({
        id: item.id,
        title: item.title,
        department: item.department,
        category: item.category,
        description: item.description || item.shortDesc || '',
        eligibilityCriteria: eligibilityCriteriaText,
        eligibilityRules: item.eligibilityRules || {},
        isActive: item.isActive !== false
      }, systemActor, '127.0.0.1');

      if (isNew) {
        importedCount++;
        console.log(`  + Imported: ${item.id} — "${item.title}"`);
      } else {
        updatedCount++;
        console.log(`  ~ Updated: ${item.id} — "${item.title}"`);
      }
    } catch (err) {
      console.error(`  ✗ Error upserting ${item.id}:`, err.message);
      skippedCount++;
    }
  }

  // 3. Verify post-ingestion database count
  const finalRes = await pool.query('SELECT count(*) as count FROM schemes;');
  const finalCount = parseInt(finalRes.rows[0].count, 10);
  console.log(`\n[Step 4] Final schemes in PostgreSQL: ${finalCount} (Initial: ${initialCount}, Newly Imported: ${importedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount})`);

  // 4. Synchronize RAG Knowledge Base
  console.log('\n[Step 5] Synchronizing RAG knowledge base documents:');
  const allChunks = [];
  for (const scheme of allCandidateSchemes) {
    const chunks = buildSchemeKnowledgeChunks(scheme);
    allChunks.push(...chunks);
  }
  console.log(`   Generated ${allChunks.length} bilingual knowledge chunks across ${allCandidateSchemes.length} schemes.`);

  const saveResult = await saveChunks(allChunks);
  console.log(`   RAG Storage: ${saveResult.inserted} inserted, ${saveResult.skipped} already present/deduplicated.`);

  // 5. Generate & Synchronize Embeddings
  console.log('\n[Step 6] Generating and updating chunk embeddings in vector store:');
  const embedResult = await ensureChunkEmbeddings();
  console.log(`   Total chunks: ${embedResult.totalChunks}, Vector embeddings stored: ${embedResult.embeddedChunks}, AI Live Provider: ${embedResult.isAiConfigured}`);

  console.log('\n================================================================');
  console.log('=== Ingestion Summary ===');
  console.log(`- Previous Scheme Count: ${initialCount}`);
  console.log(`- Newly Imported Schemes: ${importedCount}`);
  console.log(`- Updated Existing Schemes: ${updatedCount}`);
  console.log(`- Skipped / Failed: ${skippedCount}`);
  console.log(`- Final Scheme Count in DB: ${finalCount}`);
  console.log(`- Total RAG Knowledge Chunks: ${embedResult.totalChunks}`);
  console.log('================================================================\n');

  return {
    initialCount,
    importedCount,
    updatedCount,
    skippedCount,
    finalCount,
    ragChunks: embedResult.totalChunks
  };
}

if (process.argv[1]?.endsWith('import-expanded-schemes.js')) {
  runIngestion()
    .catch((err) => {
      console.error('Fatal ingestion error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await closePool();
    });
}

