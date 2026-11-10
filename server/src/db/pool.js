import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

let poolInstance = null;

/**
 * Get or create the PostgreSQL connection pool
 * Does not establish connections eagerly until a query or check is executed.
 */
export function getPool() {
  if (!poolInstance) {
    const config = env.db.connectionString
      ? {
          connectionString: env.db.connectionString,
          ssl: env.db.ssl,
          max: env.db.max,
          idleTimeoutMillis: env.db.idleTimeoutMillis,
          connectionTimeoutMillis: env.db.connectionTimeoutMillis
        }
      : {
          host: env.db.host,
          port: env.db.port,
          database: env.db.database,
          user: env.db.user,
          password: env.db.password,
          ssl: env.db.ssl,
          max: env.db.max,
          idleTimeoutMillis: env.db.idleTimeoutMillis,
          connectionTimeoutMillis: env.db.connectionTimeoutMillis
        };

    poolInstance = new Pool(config);

    // Prevent unhandled errors from crashing the Node.js process on idle clients
    poolInstance.on('error', (err) => {
      console.warn('[ArivuNet DB Pool] Unexpected error on idle client:', err.message);
    });
  }

  return poolInstance;
}

/**
 * Diagnostic check to test database connectivity safely without throwing unhandled exceptions.
 * 
 * @returns {Promise<{ isConnected: boolean, message: string, timestamp?: string }>}
 */
export async function checkDbConnection() {
  if (!env.isDbConfigured()) {
    return {
      isConnected: false,
      message: 'PostgreSQL is not configured in .env. Connection check skipped safely.'
    };
  }

  try {
    const pool = getPool();
    // Query with client timeout
    const res = await pool.query('SELECT NOW() as current_time');
    return {
      isConnected: true,
      message: 'PostgreSQL database connected successfully.',
      timestamp: res.rows[0]?.current_time
    };
  } catch (err) {
    return {
      isConnected: false,
      message: `PostgreSQL connection check failed: ${err.message}`
    };
  }
}

/**
 * Gracefully close connection pool on server shutdown
 */
export async function closePool() {
  if (poolInstance) {
    try {
      await poolInstance.end();
      poolInstance = null;
      console.log('[ArivuNet DB Pool] Pool closed gracefully.');
    } catch (err) {
      console.warn('[ArivuNet DB Pool] Error closing pool:', err.message);
    }
  }
}
