import { getPool } from '../../db/pool.js';
import { recordAuditLog } from '../audit/audit.service.js';

export async function getAllSchemes() {
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
  return result.rows;
}

export async function getSchemeById(id) {
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
  return result.rows[0] || null;
}

export async function upsertScheme(schemeData, actorUser, ipAddress = null) {
  const pool = getPool();
  const {
    id,
    title,
    department,
    category,
    description,
    eligibilityCriteria,
    eligibilityRules = {},
    isActive = true
  } = schemeData;

  const query = `
    INSERT INTO schemes (
      id, title, department, category, description, eligibility_criteria, eligibility_rules, is_active, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      department = EXCLUDED.department,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      eligibility_criteria = EXCLUDED.eligibility_criteria,
      eligibility_rules = EXCLUDED.eligibility_rules,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const result = await pool.query(query, [
    id,
    title,
    department,
    category,
    description,
    eligibilityCriteria,
    JSON.stringify(eligibilityRules),
    isActive
  ]);

  const scheme = result.rows[0];

  await recordAuditLog({
    actorId: actorUser?.id,
    actorRole: actorUser?.role,
    action: 'SCHEME_UPSERTED',
    resourceType: 'scheme',
    resourceId: id,
    ipAddress,
    metadata: { title, department, category }
  });

  return scheme;
}

