import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Authentication Middleware
 * Validates Bearer JWT from Authorization header and attaches req.user
 */
export function authenticate(req, res, next) {
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

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload;
    next();
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
}

/**
 * Optional Authentication Middleware
 * If token is provided and valid, attaches req.user; otherwise proceeds with req.user = null
 */
export function optionalAuthenticate(req, res, next) {
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

