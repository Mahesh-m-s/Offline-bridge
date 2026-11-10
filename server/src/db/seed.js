import { env } from '../config/env.js';
import { checkDbConnection, closePool } from './pool.js';
import { upsertScheme, getAllSchemes } from '../modules/schemes/schemes.service.js';
import { SCHEMES_CATALOGUE } from '../data/schemesCatalogue.js';

export async function seed() {
  console.log('[ArivuNet Seed] Checking database connectivity for seed...');

  if (!env.isDbConfigured()) {
    console.log('[ArivuNet Seed] Notice: PostgreSQL is not configured. Seed skipped safely.');
    return;
  }

  const check = await checkDbConnection();
  if (!check.isConnected) {
    console.warn(`[ArivuNet Seed] Cannot connect to PostgreSQL: ${check.message}. Seed skipped.`);
    return;
  }

  try {
    const existing = await getAllSchemes();
    if (existing && existing.length > 0) {
      console.log(`[ArivuNet Seed] Schemes table already contains ${existing.length} record(s). Skipping seed.`);
      return;
    }

    console.log(`[ArivuNet Seed] Seeding ${SCHEMES_CATALOGUE.length} official Karnataka schemes...`);
    const systemActor = { id: null, role: 'system' };

    for (const item of SCHEMES_CATALOGUE) {
      const eligibilityCriteriaText = Array.isArray(item.eligibilityCriteria)
        ? item.eligibilityCriteria.join('\n')
        : (item.eligibilityCriteria || '');

      await upsertScheme({
        id: item.id,
        title: item.title,
        department: item.department,
        category: item.category,
        description: item.shortDesc || item.description || '',
        eligibilityCriteria: eligibilityCriteriaText,
        eligibilityRules: item.eligibilityRules || {},
        isActive: true
      }, systemActor, '127.0.0.1');
    }

    console.log(`[ArivuNet Seed] Successfully seeded ${SCHEMES_CATALOGUE.length} schemes into PostgreSQL.`);
  } catch (err) {
    console.warn('[ArivuNet Seed] Notice: Seeding failed:', err.message);
  }
}

// Only execute directly when run as script
if (process.argv[1]?.endsWith('seed.js')) {
  seed()
    .catch((err) => {
      console.error('[ArivuNet Seed] Unexpected error during seed:', err);
    })
    .finally(async () => {
      await closePool();
    });
}

