/**
 * ArivuNet Reversible Database Migrator
 * Manages atomic execution of forward (up) and rollback (down) migrations.
 */

import * as m001 from './migrations/001_initial_schema.js';
import * as m002 from './migrations/002_phase3_security_and_idempotency.js';
import * as m003 from './migrations/003_service_types_and_ingestion_tables.js';

export const ALL_MIGRATIONS = [m001, m002, m003];

/**
 * Ensure migrations ledger table exists
 */
export async function initMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * List applied migration IDs
 */
export async function getAppliedMigrations(client) {
  await initMigrationsTable(client);
  const res = await client.query('SELECT id, applied_at FROM _schema_migrations ORDER BY applied_at ASC');
  return res.rows.map((r) => r.id);
}

/**
 * Apply pending migrations forward
 */
export async function migrateUp(client, migrations = ALL_MIGRATIONS) {
  await initMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  const results = [];

  for (const m of migrations) {
    if (!applied.includes(m.id)) {
      console.log(`[Migrator] Applying up: ${m.id}...`);
      await client.query('BEGIN');
      try {
        await m.up(client);
        await client.query('INSERT INTO _schema_migrations (id) VALUES ($1)', [m.id]);
        await client.query('COMMIT');
        results.push({ id: m.id, action: 'up', status: 'success' });
        console.log(`[Migrator] Applied: ${m.id}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Migrator] Failed applying ${m.id}:`, err.message);
        throw err;
      }
    } else {
      results.push({ id: m.id, action: 'skip', status: 'already_applied' });
    }
  }

  return results;
}

/**
 * Revert the latest or a target migration backward
 */
export async function migrateDown(client, targetId = null, migrations = ALL_MIGRATIONS) {
  await initMigrationsTable(client);
  const applied = await getAppliedMigrations(client);
  if (applied.length === 0) {
    return { status: 'no_migrations_to_revert' };
  }

  const idToRevert = targetId || applied[applied.length - 1];
  const migrationObj = migrations.find((m) => m.id === idToRevert);

  if (!migrationObj) {
    throw new Error(`Migration with ID '${idToRevert}' not found in registry.`);
  }

  console.log(`[Migrator] Rolling back (down): ${idToRevert}...`);
  await client.query('BEGIN');
  try {
    await migrationObj.down(client);
    await client.query('DELETE FROM _schema_migrations WHERE id = $1', [idToRevert]);
    await client.query('COMMIT');
    console.log(`[Migrator] Rolled back: ${idToRevert}`);
    return { id: idToRevert, action: 'down', status: 'success' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[Migrator] Failed reverting ${idToRevert}:`, err.message);
    throw err;
  }
}

