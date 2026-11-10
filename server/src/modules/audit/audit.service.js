import { getPool } from '../../db/pool.js';
import { env } from '../../config/env.js';

/**
 * Strips sensitive keys (passwords, tokens, credentials) from metadata
 */
function sanitizeMetadata(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const sensitiveKeys = ['password', 'password_hash', 'token', 'secret', 'jwt', 'authorization', 'access_token'];
  const sanitized = {};

  for (const [key, val] of Object.entries(obj)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeMetadata(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Record an audit log entry for privileged actions or security events
 */
export async function recordAuditLog({
  actorId = null,
  actorRole = null,
  action,
  resourceType,
  resourceId = null,
  ipAddress = null,
  status = 'success',
  metadata = {},
  client = null
}) {
  if (!env.isDbConfigured()) return;

  const safeMeta = sanitizeMetadata(metadata);
  const query = `
    INSERT INTO audit_logs (
      actor_id, actor_role, action, resource_type, resource_id, ip_address, status, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const params = [
    actorId,
    actorRole,
    action,
    resourceType,
    resourceId ? String(resourceId) : null,
    ipAddress,
    status,
    JSON.stringify(safeMeta)
  ];

  try {
    if (client) {
      await client.query(query, params);
    } else {
      const pool = getPool();
      await pool.query(query, params);
    }
  } catch (err) {
    // Audit log write failure should not crash the primary operational flow
    console.warn('[ArivuNet Audit] Failed to record audit log:', err.message);
  }
}

/**
 * Retrieve audit logs (Admin only)
 */
export async function getAuditLogs({ limit = 50, offset = 0, action = null, actorId = null }) {
  const pool = getPool();
  const whereClauses = [];
  const params = [];

  if (action) {
    params.push(action);
    whereClauses.push(`action = $${params.length}`);
  }

  if (actorId) {
    params.push(actorId);
    whereClauses.push(`actor_id = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitSql = `LIMIT $${params.length}`;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetSql = `OFFSET $${params.length}`;

  const query = `
    SELECT id, actor_id, actor_role, action, resource_type, resource_id, ip_address, status, metadata, created_at
    FROM audit_logs
    ${whereSql}
    ORDER BY created_at DESC
    ${limitSql} ${offsetSql}
  `;

  const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereSql}`;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, whereClauses.length))
  ]);

  return {
    logs: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0, 10)
  };
}

