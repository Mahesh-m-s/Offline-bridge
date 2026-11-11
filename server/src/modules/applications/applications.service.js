import { getPool } from '../../db/pool.js';
import { recordAuditLog } from '../audit/audit.service.js';

/**
 * Transactional and Idempotent Application Submission
 */
export async function submitApplication({
  userId,
  schemeId,
  localDraftId = null,
  formData = {},
  clientSubmissionId = null,
  sourceProvenance = {},
  ipAddress = null
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Idempotency pre-check if clientSubmissionId provided
    if (clientSubmissionId) {
      const existingRes = await client.query(
        'SELECT * FROM applications WHERE client_submission_id = $1',
        [clientSubmissionId]
      );
      if (existingRes.rows.length > 0) {
        return {
          isDuplicate: true,
          application: existingRes.rows[0]
        };
      }
    }

    // 2. Validate scheme exists
    const schemeCheck = await client.query(
      'SELECT id, title FROM schemes WHERE id = $1 AND is_active = true',
      [schemeId]
    );
    if (schemeCheck.rows.length === 0) {
      const err = new Error(`Scheme with ID '${schemeId}' does not exist or is inactive.`);
      err.code = 'INVALID_SCHEME';
      err.status = 400;
      throw err;
    }

    // 3. Begin Transaction
    await client.query('BEGIN');

    // 4. Insert application row
    const insertAppQuery = `
      INSERT INTO applications (
        user_id, scheme_id, local_draft_id, form_data, status, client_submission_id, source_provenance
      ) VALUES ($1, $2, $3, $4, 'submitted', $5, $6)
      RETURNING *;
    `;

    const appRes = await client.query(insertAppQuery, [
      userId,
      schemeId,
      localDraftId,
      JSON.stringify(formData),
      clientSubmissionId,
      JSON.stringify(sourceProvenance)
    ]);

    const application = appRes.rows[0];

    // 5. Insert initial status history in same transaction
    const insertHistoryQuery = `
      INSERT INTO application_status_history (
        application_id, status, remarks, changed_by
      ) VALUES ($1, 'submitted', $2, $3)
      RETURNING *;
    `;

    await client.query(insertHistoryQuery, [
      application.id,
      'Initial application submitted via ArivuNet.',
      userId
    ]);

    // 6. Record audit log in transaction
    await recordAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'APPLICATION_SUBMITTED',
      resourceType: 'application',
      resourceId: application.id,
      ipAddress,
      metadata: { schemeId, clientSubmissionId },
      client
    });

    // 7. Commit Transaction
    await client.query('COMMIT');

    return {
      isDuplicate: false,
      application
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Transactional Application Status Update (Official & Admin only)
 */
export async function updateApplicationStatus({
  applicationId,
  newStatus,
  remarks,
  officerUser,
  ipAddress = null
}) {
  const allowedStatuses = ['under_review', 'approved', 'rejected'];
  if (!allowedStatuses.includes(newStatus)) {
    const err = new Error(`Invalid target status. Status must be one of: ${allowedStatuses.join(', ')}.`);
    err.code = 'INVALID_STATUS';
    err.status = 400;
    throw err;
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fetch existing application
    const existingRes = await client.query(
      'SELECT id, status, user_id, scheme_id FROM applications WHERE id = $1 FOR UPDATE',
      [applicationId]
    );

    if (existingRes.rows.length === 0) {
      const err = new Error(`Application with ID '${applicationId}' not found.`);
      err.code = 'APPLICATION_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const previousStatus = existingRes.rows[0].status;

    // Update application
    const updateQuery = `
      UPDATE applications
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const updateRes = await client.query(updateQuery, [newStatus, applicationId]);
    const updatedApp = updateRes.rows[0];

    // Insert history record
    const historyQuery = `
      INSERT INTO application_status_history (
        application_id, status, remarks, changed_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const historyRes = await client.query(historyQuery, [
      applicationId,
      newStatus,
      remarks.trim(),
      officerUser.id
    ]);

    // Record audit log
    await recordAuditLog({
      actorId: officerUser.id,
      actorRole: officerUser.role,
      action: 'APPLICATION_STATUS_UPDATED',
      resourceType: 'application',
      resourceId: applicationId,
      ipAddress,
      metadata: { previousStatus, newStatus, remarks: remarks.trim() },
      client
    });

    await client.query('COMMIT');

    return {
      application: updatedApp,
      historyEntry: historyRes.rows[0]
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get Application by ID or clientSubmissionId with authorization checks
 */
export async function getApplicationById(applicationId, requestingUser = null) {
  const pool = getPool();

  const query = `
    SELECT 
      a.id, a.user_id, a.scheme_id, a.local_draft_id, a.form_data, a.status,
      a.client_submission_id, a.source_provenance, a.created_at, a.updated_at,
      s.title as scheme_title, s.department as scheme_department,
      u.full_name as applicant_name, u.phone as applicant_phone, u.village_panchayat
    FROM applications a
    JOIN schemes s ON a.scheme_id = s.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id::text = $1 OR a.client_submission_id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [applicationId.trim()]);
  const app = result.rows[0];

  if (!app) return null;

  // Enforce ownership if authenticated as citizen: Citizen can ONLY view full form details of their own application
  if (requestingUser && requestingUser.role === 'citizen' && String(app.user_id) !== String(requestingUser.id)) {
    const err = new Error('Access forbidden. You do not have permission to view another citizen’s application.');
    err.code = 'FORBIDDEN';
    err.status = 403;
    throw err;
  }

  // Fetch status history
  const historyQuery = `
    SELECT h.id, h.status, h.remarks, h.created_at, u.full_name as changed_by_name, u.role as changed_by_role
    FROM application_status_history h
    LEFT JOIN users u ON h.changed_by = u.id
    WHERE h.application_id = $1
    ORDER BY h.created_at ASC
  `;
  const historyRes = await pool.query(historyQuery, [app.id]);
  app.status_history = historyRes.rows;

  return app;
}

/**
 * Get all applications for the authenticated citizen
 */
export async function getMyApplications(userId) {
  const pool = getPool();
  const query = `
    SELECT 
      a.id, a.scheme_id, a.local_draft_id, a.status, a.client_submission_id,
      a.created_at, a.updated_at,
      s.title as scheme_title, s.department as scheme_department
    FROM applications a
    JOIN schemes s ON a.scheme_id = s.id
    WHERE a.user_id = $1
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * List all applications with filtering for Officials and Admins
 */
export async function listApplications({ status = null, schemeId = null, limit = 50, offset = 0 }) {
  const pool = getPool();
  const whereClauses = [];
  const params = [];

  if (status) {
    params.push(status);
    whereClauses.push(`a.status = $${params.length}`);
  }

  if (schemeId) {
    params.push(schemeId);
    whereClauses.push(`a.scheme_id = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitSql = `LIMIT $${params.length}`;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetSql = `OFFSET $${params.length}`;

  const query = `
    SELECT 
      a.id, a.user_id, a.scheme_id, a.status, a.client_submission_id,
      a.created_at, a.updated_at,
      s.title as scheme_title, s.department as scheme_department,
      u.full_name as applicant_name, u.phone as applicant_phone, u.village_panchayat
    FROM applications a
    JOIN schemes s ON a.scheme_id = s.id
    LEFT JOIN users u ON a.user_id = u.id
    ${whereSql}
    ORDER BY a.created_at DESC
    ${limitSql} ${offsetSql}
  `;

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM applications a 
    ${whereSql}
  `;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, whereClauses.length))
  ]);

  return {
    applications: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0, 10)
  };
}

