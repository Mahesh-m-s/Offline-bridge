import { getPool } from '../../db/pool.js';
import { recordAuditLog } from '../audit/audit.service.js';

export async function submitGrievance({
  userId = null,
  category,
  description,
  villagePanchayat,
  contactPhone = null,
  clientSubmissionId = null,
  sourceProvenance = {},
  ipAddress = null
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    if (clientSubmissionId) {
      const existing = await client.query(
        'SELECT * FROM grievances WHERE client_submission_id = $1',
        [clientSubmissionId]
      );
      if (existing.rows.length > 0) {
        return { isDuplicate: true, grievance: existing.rows[0] };
      }
    }

    await client.query('BEGIN');

    const query = `
      INSERT INTO grievances (
        user_id, category, description, village_panchayat, contact_phone,
        status, client_submission_id, source_provenance
      ) VALUES ($1, $2, $3, $4, $5, 'submitted', $6, $7)
      RETURNING *;
    `;

    const result = await client.query(query, [
      userId,
      category,
      description.trim(),
      villagePanchayat.trim(),
      contactPhone ? contactPhone.trim() : null,
      clientSubmissionId,
      JSON.stringify(sourceProvenance)
    ]);

    const grievance = result.rows[0];

    await recordAuditLog({
      actorId: userId,
      actorRole: userId ? 'citizen' : 'anonymous',
      action: 'GRIEVANCE_SUBMITTED',
      resourceType: 'grievance',
      resourceId: grievance.id,
      ipAddress,
      metadata: { category, villagePanchayat, clientSubmissionId },
      client
    });

    await client.query('COMMIT');

    return { isDuplicate: false, grievance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getMyGrievances(userId) {
  const pool = getPool();
  const query = `
    SELECT id, category, description, village_panchayat, status, created_at, updated_at
    FROM grievances
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

export async function listGrievances({ category = null, status = null, limit = 50, offset = 0 }) {
  const pool = getPool();
  const whereClauses = [];
  const params = [];

  if (category) {
    params.push(category);
    whereClauses.push(`category = $${params.length}`);
  }

  if (status) {
    params.push(status);
    whereClauses.push(`status = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitSql = `LIMIT $${params.length}`;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetSql = `OFFSET $${params.length}`;

  const query = `
    SELECT g.id, g.user_id, g.category, g.description, g.village_panchayat, g.contact_phone,
           g.status, g.created_at, g.updated_at, u.full_name as complainant_name
    FROM grievances g
    LEFT JOIN users u ON g.user_id = u.id
    ${whereSql}
    ORDER BY g.created_at DESC
    ${limitSql} ${offsetSql}
  `;

  const countQuery = `SELECT COUNT(*) as total FROM grievances ${whereSql}`;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, whereClauses.length))
  ]);

  return {
    grievances: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0, 10)
  };
}

export async function updateGrievanceStatus({ grievanceId, status, remarks, officerUser, ipAddress = null }) {
  const pool = getPool();
  const query = `
    UPDATE grievances
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, grievanceId]);

  if (result.rows.length === 0) {
    const err = new Error(`Grievance with ID '${grievanceId}' not found.`);
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const updated = result.rows[0];

  await recordAuditLog({
    actorId: officerUser.id,
    actorRole: officerUser.role,
    action: 'GRIEVANCE_STATUS_UPDATED',
    resourceType: 'grievance',
    resourceId: grievanceId,
    ipAddress,
    metadata: { status, remarks }
  });

  return updated;
}

export async function getGrievanceById(grievanceId, requestingUser = null) {
  const pool = getPool();
  const query = `
    SELECT g.id, g.user_id, g.category, g.description, g.village_panchayat, g.contact_phone,
           g.status, g.client_submission_id, g.created_at, g.updated_at,
           u.full_name as complainant_name
    FROM grievances g
    LEFT JOIN users u ON g.user_id = u.id
    WHERE g.id::text = $1 OR g.client_submission_id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [grievanceId.trim()]);
  const grv = result.rows[0];
  if (!grv) return null;

  // 1. Authenticated Access: Citizen, Official, Admin
  if (requestingUser) {
    if (requestingUser.role === 'citizen' && grv.user_id && String(grv.user_id) !== String(requestingUser.id)) {
      const err = new Error('Access forbidden. You do not have permission to view another citizen’s grievance.');
      err.code = 'FORBIDDEN';
      err.status = 403;
      throw err;
    }
    // Officials and Admins have authorized access to view full grievance
    return grv;
  }

  // 2. Unauthenticated Public Tracking: Zero PII, Only approved progress info
  return {
    id: grv.id,
    client_submission_id: grv.client_submission_id,
    status: grv.status,
    category: grv.category,
    created_at: grv.created_at,
    updated_at: grv.updated_at,
    status_history: [
      {
        status: grv.status,
        remarks: 'Public grievance progress recorded in Janaspandana registry.',
        created_at: grv.updated_at || grv.created_at
      }
    ],
    isPublicTracking: true
  };
}

