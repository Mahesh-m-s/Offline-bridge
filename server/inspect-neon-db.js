import { getPool, closePool } from './src/db/pool.js';

async function inspectNeonDatabase() {
  console.log('=== Neon PostgreSQL Read-Only State Inspection ===\n');

  const pool = getPool();

  try {
    // 1. Current Database & Schema Context
    const contextRes = await pool.query(`
      SELECT 
        current_database() AS database_name, 
        current_schema() AS schema_name, 
        version() AS pg_version
    `);
    const ctx = contextRes.rows[0];
    console.log(`[Context] Database Name: ${ctx.database_name}`);
    console.log(`[Context] Current Schema: ${ctx.schema_name}`);
    console.log(`[Context] PostgreSQL Version: ${ctx.pg_version.split(' on ')[0]}\n`);

    // 2. Existing Tables in the current schema
    const tablesRes = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = current_schema() 
      ORDER BY table_name;
    `);
    console.log(`[Tables in '${ctx.schema_name}'] Total: ${tablesRes.rows.length}`);
    if (tablesRes.rows.length === 0) {
      console.log('  -> No user tables exist in this schema. (Schema is completely fresh)');
    } else {
      tablesRes.rows.forEach((r) => {
        console.log(`  - ${r.table_name} (${r.table_type})`);
      });
    }
    console.log('');

    // 3. Existing Extensions installed
    const extensionsRes = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname;
    `);
    console.log(`[Extensions Installed] Total: ${extensionsRes.rows.length}`);
    extensionsRes.rows.forEach((r) => {
      console.log(`  - ${r.extname} (v${r.extversion})`);
    });
    console.log('');

    // 4. Existing Indexes in the current schema
    const indexesRes = await pool.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = current_schema() 
      ORDER BY tablename, indexname;
    `);
    console.log(`[Indexes in '${ctx.schema_name}'] Total: ${indexesRes.rows.length}`);
    if (indexesRes.rows.length === 0) {
      console.log('  -> No user indexes exist in this schema.');
    } else {
      indexesRes.rows.forEach((r) => {
        console.log(`  - Table: ${r.tablename} | Index: ${r.indexname}`);
      });
    }
    console.log('');

    // 5. Check if any ArivuNet tables exist
    const targetTables = ['users', 'schemes', 'applications', 'application_status_history', 'grievances'];
    const existingTableNames = tablesRes.rows.map((r) => r.table_name);
    const conflicts = targetTables.filter((t) => existingTableNames.includes(t));

    console.log(`[ArivuNet Target Table Pre-Check]`);
    console.log(`  Target tables: ${targetTables.join(', ')}`);
    console.log(`  Existing conflicts found: ${conflicts.length === 0 ? 'None (0 conflicts)' : conflicts.join(', ')}`);

  } catch (err) {
    const sanitizedMsg = (err.message || 'Unknown error')
      .replace(/:\/\/[^@]+@/, '://[REDACTED]@')
      .replace(/password=[^\s&]+/gi, 'password=[REDACTED]');
    console.error(`\n[Inspection Error] Failed to inspect database: ${sanitizedMsg}`);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

inspectNeonDatabase();
