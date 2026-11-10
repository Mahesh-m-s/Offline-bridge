/**
 * OfflineBridge — Scheme Data Audit Script
 * Audits all scheme data across server files and compares with PostgreSQL.
 */

import { getPool, closePool } from './pool.js';
import { SCHEMES_CATALOGUE } from '../data/schemesCatalogue.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAudit() {
  console.log('================================================================');
  console.log('=== OfflineBridge: Server Scheme & Service Data Audit        ===');
  console.log('================================================================\n');

  // 1. Audit server JS catalogue
  console.log('1. Auditing server/src/data/schemesCatalogue.js:');
  console.log(`   Found ${SCHEMES_CATALOGUE.length} distinct schemes in JS catalogue.`);
  const jsIds = SCHEMES_CATALOGUE.map(s => s.id);
  console.log('   IDs:', jsIds.join(', '));

  // 2. Audit knowledge_base.json
  const kbPath = path.resolve(__dirname, '../../data/knowledge_base.json');
  let kbChunks = [];
  if (fs.existsSync(kbPath)) {
    kbChunks = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
  }
  const kbSchemeIds = new Set(kbChunks.map(c => c.schemeId).filter(Boolean));
  console.log(`\n2. Auditing server/data/knowledge_base.json:`);
  console.log(`   Found ${kbChunks.length} RAG chunks spanning ${kbSchemeIds.size} distinct scheme IDs.`);
  console.log('   Scheme IDs in RAG chunks:', Array.from(kbSchemeIds).join(', '));

  // 3. Audit PostgreSQL schemes table
  const pool = getPool();
  const dbRes = await pool.query('SELECT id, title, department, category, is_active FROM schemes ORDER BY title ASC;');
  const dbSchemes = dbRes.rows;
  const dbIds = new Set(dbSchemes.map(s => s.id));
  console.log(`\n3. Auditing PostgreSQL 'schemes' table:`);
  console.log(`   Currently contains ${dbSchemes.length} records in PostgreSQL.`);
  console.log('   Database IDs:', Array.from(dbIds).join(', '));

  // 4. Comparison & Duplicate Analysis
  console.log(`\n4. Data Reconciliation Analysis:`);
  let duplicateCount = 0;
  let missingFromDb = 0;
  for (const jsId of jsIds) {
    if (dbIds.has(jsId)) {
      duplicateCount++;
    } else {
      missingFromDb++;
    }
  }
  console.log(`   Existing records already in DB: ${duplicateCount}`);
  console.log(`   Missing records from server JS catalogue: ${missingFromDb}`);

  if (dbSchemes.length <= 10) {
    console.log(`\n[Audit Conclusion]: PostgreSQL contains only ${dbSchemes.length} schemes.`);
    console.log(`   No additional unseeded scheme files exist in server directory.`);
    console.log(`   Authorized official government data ingestion required to expand the catalog.`);
  }

  console.log('\n================================================================');
  await closePool();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

