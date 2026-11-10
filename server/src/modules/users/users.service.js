import { getPool } from '../../db/pool.js';
import { recordAuditLog } from '../audit/audit.service.js';

export async function getUserById(id) {
  const pool = getPool();
  const query = `
    SELECT id, full_name, phone, role, village_panchayat, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function listUsers({ role = null, limit = 50, offset = 0 }) {
  const pool = getPool();
  const whereClauses = [];
  const params = [];

  if (role) {
    params.push(role);
    whereClauses.push(`role = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitSql = `LIMIT $${params.length}`;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetSql = `OFFSET $${params.length}`;

  const query = `
    SELECT id, full_name, phone, role, village_panchayat, is_active, created_at, updated_at
    FROM users
    ${whereSql}
    ORDER BY created_at DESC
    ${limitSql} ${offsetSql}
  `;

  const countQuery = `SELECT COUNT(*) as total FROM users ${whereSql}`;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, whereClauses.length))
  ]);

  return {
    users: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0, 10)
  };
}

export async function updateUser(id, updates, actorUser, ipAddress = null) {
  const pool = getPool();
  const allowedFields = ['full_name', 'village_panchayat'];
  if (actorUser.role === 'admin') {
    allowedFields.push('is_active', 'role');
  }

  const setClauses = [];
  const params = [id];

  for (const [key, val] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      params.push(val);
      setClauses.push(`${key} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return getUserById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  const query = `
    UPDATE users
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING id, full_name, phone, role, village_panchayat, is_active, created_at, updated_at
  `;

  const result = await pool.query(query, params);
  const updated = result.rows[0];

  await recordAuditLog({
    actorId: actorUser.id,
    actorRole: actorUser.role,
    action: 'USER_UPDATED',
    resourceType: 'user',
    resourceId: id,
    ipAddress,
    metadata: updates
  });

  return updated;
}

