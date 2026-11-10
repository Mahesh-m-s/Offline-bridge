import { env } from '../../config/env.js';
import { 
  getSchemes, 
  getSchemeById, 
  getSchemeStats, 
  getIngestionJobs, 
  getAuditHealth, 
  upsertScheme 
} from './schemes.service.js';
import { runIncrementalIngestion } from '../ingestion/incrementalIngester.js';

/**
 * GET /api/schemes
 * Paginated, filtered, searchable schemes endpoint
 */
export async function handleGetAllSchemes(req, res) {
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. PostgreSQL is not configured or not running.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const search = req.query.search || req.query.q || null;
    const category = req.query.category || null;
    const serviceType = req.query.service_type || req.query.type || null;
    const sort = req.query.sort || 'title';
    const order = req.query.order || 'asc';

    const result = await getSchemes({
      page,
      limit,
      search,
      category,
      service_type: serviceType,
      sort,
      order
    });

    return res.status(200).json({
      success: true,
      data: result.schemes,
      pagination: result.pagination,
      count: result.schemes.length
    });
  } catch (err) {
    console.warn('[OfflineBridge Schemes API] Database query error on GET /schemes:', err.message);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query schemes from PostgreSQL.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }
}

/**
 * GET /api/schemes/stats
 * Aggregate live statistics from PostgreSQL
 */
export async function handleGetSchemeStats(req, res) {
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. PostgreSQL is not configured or not running.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  try {
    const stats = await getSchemeStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.warn('[OfflineBridge Schemes API] Database query error on GET /schemes/stats:', err.message);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query scheme statistics.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }
}

/**
 * GET /api/schemes/ingestion-jobs
 * Ingestion jobs history for administrator monitoring
 */
export async function handleGetIngestionJobs(req, res) {
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const jobs = await getIngestionJobs(limit);
    return res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (err) {
    console.warn('[OfflineBridge Schemes API] Error fetching ingestion jobs:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch ingestion jobs history.',
        code: 'SERVER_ERROR'
      }
    });
  }
}

/**
 * GET /api/schemes/audit-health
 * Data health, outdated schemes, and verification status metrics
 */
export async function handleGetAuditHealth(req, res) {
  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  try {
    const health = await getAuditHealth();
    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (err) {
    console.warn('[OfflineBridge Schemes API] Error fetching data health:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch scheme data health metrics.',
        code: 'SERVER_ERROR'
      }
    });
  }
}

/**
 * POST /api/schemes/trigger-ingestion
 * Administrator trigger for incremental sync
 */
export async function handleTriggerIngestion(req, res) {
  try {
    const triggeredBy = req.user?.username || req.user?.role || 'admin';
    const result = await runIncrementalIngestion({
      jobType: 'admin_triggered_sync',
      triggeredBy
    });
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[OfflineBridge Schemes API] Error triggering ingestion:', err);
    return res.status(500).json({
      success: false,
      error: {
        message: err.message,
        code: 'INGESTION_ERROR'
      }
    });
  }
}

export async function handleGetSchemeById(req, res) {
  const { id } = req.params;

  if (!env.isDbConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. PostgreSQL is not configured or not running.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }

  try {
    const scheme = await getSchemeById(id);
    if (!scheme) {
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
      data: scheme
    });
  } catch (err) {
    console.warn(`[OfflineBridge Schemes API] Database query error for scheme ID '${id}':`, err.message);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query scheme from PostgreSQL.',
        code: 'DATABASE_UNAVAILABLE'
      }
    });
  }
}

export async function handleCreateOrUpdateScheme(req, res, next) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const scheme = await upsertScheme(req.body, req.user, ipAddress);
    return res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (err) {
    next(err);
  }
}
