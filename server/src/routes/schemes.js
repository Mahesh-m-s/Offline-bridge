import { Router } from 'express';
import { env } from '../config/env.js';
import { getPool } from '../db/pool.js';

const router = Router();

// Validation regex for scheme ID: alphanumeric, hyphen, underscore, 1-64 characters
const SCHEME_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Middleware: Reject non-GET methods on /schemes and /schemes/:id
 * Enforces strictly read-only access.
 */
router.all(['/schemes', '/schemes/:id'], (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} is not allowed on ${req.baseUrl}${req.path}. This endpoint is strictly read-only.`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }
  next();
});

/**
 * GET /api/schemes
 * Returns all active schemes from PostgreSQL.
 * If PostgreSQL is unconfigured or unavailable, returns HTTP 503 with DATABASE_UNAVAILABLE.
 */
router.get('/schemes', async (req, res) => {
  // 1. Check if database configuration is present
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. PostgreSQL is not configured or not running.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  // 2. Query schemes from PostgreSQL using parameterized query
  try {
    const pool = getPool();
    const query = `
      SELECT 
        id, 
        title, 
        department, 
        category, 
        description, 
        eligibility_criteria, 
        eligibility_rules, 
        is_active, 
        created_at, 
        updated_at
      FROM schemes
      WHERE is_active = true
      ORDER BY title ASC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    // Log safe diagnostic message internally without leaking credentials or stack traces
    console.warn('[ArivuNet Schemes API] Database query error on GET /schemes:', err.message);

    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query schemes from PostgreSQL.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }
});

/**
 * GET /api/schemes/:id
 * Returns a single scheme by its ID.
 * Validates the ID parameter format and handles missing schemes or database unavailability.
 */
router.get('/schemes/:id', async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  if (!id || !SCHEME_ID_REGEX.test(id)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid scheme ID format. Scheme ID must be 1 to 64 alphanumeric characters, hyphens, or underscores.',
        code: 'INVALID_SCHEME_ID'
      }
    });
  }

  // 2. Check if database configuration is present
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. PostgreSQL is not configured or not running.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  // 3. Query single scheme using parameterized query (never concatenating user input)
  try {
    const pool = getPool();
    const query = `
      SELECT 
        id, 
        title, 
        department, 
        category, 
        description, 
        eligibility_criteria, 
        eligibility_rules, 
        is_active, 
        created_at, 
        updated_at
      FROM schemes
      WHERE id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Scheme with ID '${id}' was not found.`,
          code: 'SCHEME_NOT_FOUND'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    // Log safe diagnostic message internally without leaking credentials
    console.warn(`[ArivuNet Schemes API] Database query error for scheme ID '${id}':`, err.message);

    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query scheme from PostgreSQL.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }
});

export default router;
