import { env } from '../../config/env.js';
import { getAllSchemes, getSchemeById, upsertScheme } from './schemes.service.js';

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
    const schemes = await getAllSchemes();
    return res.status(200).json({
      success: true,
      data: schemes,
      count: schemes.length
    });
  } catch (err) {
    console.warn('[ArivuNet Schemes API] Database query error on GET /schemes:', err.message);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service unavailable. Unable to query schemes from PostgreSQL.',
        code: 'DATABASE_UNAVAILABLE'
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
    console.warn(`[ArivuNet Schemes API] Database query error for scheme ID '${id}':`, err.message);
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

