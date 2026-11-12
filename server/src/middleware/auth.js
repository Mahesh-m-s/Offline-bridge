import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getPool } from '../db/pool.js';

/**
 * Authentication Middleware
 * Validates Bearer JWT from Authorization header, verifies active user account status,
 * and attaches verified req.user.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required. Missing or malformed Bearer token.',
        code: 'UNAUTHENTICATED'
      }
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token missing.',
        code: 'UNAUTHENTICATED'
      }
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error: {
        message: isExpired ? 'Authentication token has expired. Please log in again.' : 'Invalid authentication token.',
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      }
    });
  }

  // Active User Account Verification: verify user exists and is_active is true
  try {
    if (payload.id && env.isDbConfigured()) {
      const pool = getPool();
      const userRes = await pool.query(
        'SELECT id, role, is_active FROM users WHERE id = $1 LIMIT 1',
        [payload.id]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User account not found or has been removed.',
            code: 'ACCOUNT_NOT_FOUND'
          }
        });
      }

      const dbUser = userRes.rows[0];
      if (dbUser.is_active === false) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'User account has been deactivated. Please contact platform administration.',
            code: 'ACCOUNT_DEACTIVATED'
          }
        });
      }

      // Synchronize role with authoritative DB state
      payload.role = dbUser.role;
    }
  } catch (dbErr) {
    // If pool is unavailable or query fails, check if this is an explicit account error
    if (dbErr.code === 'ACCOUNT_DEACTIVATED' || dbErr.code === 'ACCOUNT_NOT_FOUND') {
      throw dbErr;
    }
    console.warn('[Auth Middleware] User active status lookup notice:', dbErr.message);
  }

  req.user = payload;
  next();
}

/**
 * Optional Authentication Middleware
 * If token is provided and valid, verifies active account and attaches req.user;
 * otherwise proceeds with req.user = null.
 */
export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);

    // Verify active account if DB is configured
    if (payload.id && env.isDbConfigured()) {
      const pool = getPool();
      const userRes = await pool.query(
        'SELECT id, role, is_active FROM users WHERE id = $1 LIMIT 1',
        [payload.id]
      );
      if (userRes.rows.length === 0 || userRes.rows[0].is_active === false) {
        req.user = null;
        return next();
      }
      payload.role = userRes.rows[0].role;
    }

    req.user = payload;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Role-Based Access Control Middleware
 * 
 * @param {Array<string>|string} allowedRoles
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required before checking authorization.',
          code: 'UNAUTHENTICATED'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access forbidden. User role '${req.user.role}' lacks the required permissions.`,
          code: 'FORBIDDEN'
        }
      });
    }

    next();
  };
}

/**
 * Ownership or Privileged Role Access Control
 * 
 * Allows access if:
 * 1. The user's own ID matches the target resource's owner ID (or param), OR
 * 2. The user has one of the privileged roles (default: ['official', 'admin']).
 */
export function requireOwnershipOrRole(paramUserIdKey = 'id', privilegedRoles = ['official', 'admin']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required.',
          code: 'UNAUTHENTICATED'
        }
      });
    }

    const targetUserId = req.params[paramUserIdKey] || req.body?.user_id;
    const isOwner = targetUserId && String(req.user.id) === String(targetUserId);
    const hasPrivilege = privilegedRoles.includes(req.user.role);

    if (!isOwner && !hasPrivilege) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access forbidden. You cannot access or modify another citizen’s records.',
          code: 'FORBIDDEN'
        }
      });
    }

    next();
  };
}

