import { getPool } from '../../db/pool.js';
import { recordAuditLog } from '../audit/audit.service.js';

// Safe allowlist for sorting columns to prevent SQL injection
const ALLOWED_SORT_COLUMNS = {
  title: 'title',
  department: 'department',
  category: 'category',
  service_type: 'service_type',
  service_code: 'service_code',
  sla_days: 'sla_days',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

/**
 * Query schemes with server-side pagination, search, category filtering, service_type filtering, and sorting.
 * 
 * @param {Object} [options]
 * @param {number} [options.page=1] - 1-based page index
 * @param {number} [options.limit=20] - Number of records per page (max 100)
 * @param {string} [options.search] - Case-insensitive keyword search
 * @param {string} [options.category] - Category filter ('all' or specific category)
 * @param {string} [options.service_type] - Service type filter ('all', 'scheme', 'service', 'certificate', 'welfare_benefit')
 * @param {string} [options.sort='title'] - Column to sort by
 * @param {string} [options.order='asc'] - Sort direction ('asc' or 'desc')
 * @returns {Promise<{
 *   schemes: Array<Object>,
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     totalRecords: number,
 *     totalPages: number,
 *     hasNextPage: boolean,
 *     hasPreviousPage: boolean
 *   }
 * }>}
 */
export async function getSchemes(options = {}) {
  const pool = getPool();

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const search = options.search ? String(options.search).trim() : null;
  const category = (options.category && options.category !== 'all') ? String(options.category).trim() : null;
  const serviceType = (options.service_type || options.serviceType) && 
    (options.service_type !== 'all' && options.serviceType !== 'all')
      ? String(options.service_type || options.serviceType).trim()
      : null;

  const sortColumn = ALLOWED_SORT_COLUMNS[options.sort?.toLowerCase()] || 'title';
  const sortDirection = options.order?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const whereConditions = ['is_active = true'];
  const params = [];

  if (category) {
    params.push(category);
    whereConditions.push(`category = $${params.length}`);
  }

  if (serviceType) {
    params.push(serviceType);
    whereConditions.push(`service_type = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const searchIdx = params.length;
    whereConditions.push(`(title ILIKE $${searchIdx} OR description ILIKE $${searchIdx} OR department ILIKE $${searchIdx} OR service_code ILIKE $${searchIdx})`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Main paginated query with window function for total record count
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const dataQuery = `
    SELECT 
      id, 
      title, 
      title_kn,
      department, 
      department_kn,
      category, 
      service_type,
      service_code,
      description, 
      description_kn,
      official_url,
      sla_days,
      verification_status,
      source_portal,
      last_verified_date,
      eligibility_criteria, 
      eligibility_rules, 
      is_active, 
      created_at, 
      updated_at,
      COUNT(*) OVER() AS full_count
    FROM schemes
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await pool.query(dataQuery, params);
  const rows = result.rows;

  let totalRecords = 0;
  if (rows.length > 0) {
    totalRecords = parseInt(rows[0].full_count, 10) || 0;
  } else if (page > 1) {
    // If offset went past results, get the actual count using the same filters
    const countParams = params.slice(0, limitIdx - 1);
    const countQuery = `SELECT COUNT(*) AS total FROM schemes ${whereClause}`;
    const countRes = await pool.query(countQuery, countParams);
    totalRecords = parseInt(countRes.rows[0].total, 10) || 0;
  }

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    schemes: rows.map((r) => {
      const { full_count, ...scheme } = r;
      return scheme;
    }),
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

/**
 * Backward compatibility: returns all active schemes array
 */
export async function getAllSchemes() {
  const result = await getSchemes({ page: 1, limit: 100 });
  return result.schemes;
}

export async function getSchemeById(id) {
  const pool = getPool();
  const query = `
    SELECT 
      id, 
      title, 
      title_kn,
      department, 
      department_kn,
      category, 
      service_type,
      service_code,
      description, 
      description_kn,
      official_url,
      sla_days,
      verification_status,
      source_portal,
      last_verified_date,
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

/**
 * Live aggregate statistics directly from PostgreSQL
 */
export async function getSchemeStats() {
  const pool = getPool();

  const totalRes = await pool.query(`
    SELECT 
      COUNT(*) AS total_count,
      COUNT(CASE WHEN is_active = true THEN 1 END) AS active_count
    FROM schemes;
  `);

  const categoryRes = await pool.query(`
    SELECT category, COUNT(*) AS count
    FROM schemes
    WHERE is_active = true
    GROUP BY category
    ORDER BY count DESC;
  `);

  const serviceTypeRes = await pool.query(`
    SELECT service_type, COUNT(*) AS count
    FROM schemes
    WHERE is_active = true
    GROUP BY service_type
    ORDER BY count DESC;
  `);

  const byCategory = {};
  for (const row of categoryRes.rows) {
    byCategory[row.category] = parseInt(row.count, 10);
  }

  const byServiceType = {};
  for (const row of serviceTypeRes.rows) {
    byServiceType[row.service_type] = parseInt(row.count, 10);
  }

  const total = parseInt(totalRes.rows[0]?.total_count, 10) || 0;
  const active = parseInt(totalRes.rows[0]?.active_count, 10) || 0;

  return {
    totalSchemes: total,
    activeSchemes: active,
    byCategory,
    byServiceType
  };
}

/**
 * Retrieve recent ingestion jobs history
 */
export async function getIngestionJobs(limit = 10) {
  const pool = getPool();
  const query = `
    SELECT 
      id, job_type, status, total_candidates, imported_count,
      updated_count, skipped_count, failed_count, error_log,
      started_at, completed_at, triggered_by
    FROM ingestion_jobs
    ORDER BY started_at DESC
    LIMIT $1;
  `;
  const result = await pool.query(query, [Math.min(50, Math.max(1, limit))]);
  return result.rows;
}

/**
 * Retrieve data health & audit metrics
 */
export async function getAuditHealth() {
  const pool = getPool();
  const statusRes = await pool.query(`
    SELECT verification_status, COUNT(*) AS count
    FROM schemes
    GROUP BY verification_status;
  `);

  const outdatedRes = await pool.query(`
    SELECT COUNT(*) AS outdated_count
    FROM schemes
    WHERE last_verified_date < CURRENT_DATE - INTERVAL '180 days';
  `);

  const portalRes = await pool.query(`
    SELECT source_portal, COUNT(*) AS count
    FROM schemes
    GROUP BY source_portal
    ORDER BY count DESC;
  `);

  const failedJobsRes = await pool.query(`
    SELECT COUNT(*) AS failed_jobs_count
    FROM ingestion_jobs
    WHERE status = 'failed' OR failed_count > 0;
  `);

  return {
    verificationStatus: Object.fromEntries(statusRes.rows.map(r => [r.verification_status, parseInt(r.count, 10)])),
    outdatedSchemes: parseInt(outdatedRes.rows[0]?.outdated_count, 10) || 0,
    sourcePortals: Object.fromEntries(portalRes.rows.map(r => [r.source_portal, parseInt(r.count, 10)])),
    failedJobsCount: parseInt(failedJobsRes.rows[0]?.failed_jobs_count, 10) || 0
  };
}

export async function upsertScheme(schemeData, actorUser, ipAddress = null) {
  const pool = getPool();
  const {
    id,
    title,
    titleKn,
    department,
    departmentKn,
    category,
    serviceType = 'scheme',
    serviceCode,
    description,
    descriptionKn,
    officialUrl,
    slaDays = 30,
    verificationStatus = 'verified',
    sourcePortal = 'karnataka_official',
    eligibilityCriteria,
    eligibilityRules = {},
    isActive = true
  } = schemeData;

  const query = `
    INSERT INTO schemes (
      id, title, title_kn, department, department_kn, category,
      service_type, service_code, description, description_kn,
      official_url, sla_days, verification_status, source_portal,
      last_verified_date, eligibility_criteria, eligibility_rules, is_active, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      CURRENT_DATE, $15, $16, $17, CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      title_kn = EXCLUDED.title_kn,
      department = EXCLUDED.department,
      department_kn = EXCLUDED.department_kn,
      category = EXCLUDED.category,
      service_type = EXCLUDED.service_type,
      service_code = EXCLUDED.service_code,
      description = EXCLUDED.description,
      description_kn = EXCLUDED.description_kn,
      official_url = EXCLUDED.official_url,
      sla_days = EXCLUDED.sla_days,
      verification_status = EXCLUDED.verification_status,
      source_portal = EXCLUDED.source_portal,
      eligibility_criteria = EXCLUDED.eligibility_criteria,
      eligibility_rules = EXCLUDED.eligibility_rules,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const result = await pool.query(query, [
    id,
    title,
    titleKn || title,
    department,
    departmentKn || department,
    category,
    serviceType,
    serviceCode || `SVC-${id.slice(0, 10).toUpperCase()}`,
    description,
    descriptionKn || '',
    officialUrl || 'https://sevasindhu.karnataka.gov.in',
    slaDays,
    verificationStatus,
    sourcePortal,
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
    metadata: { title, department, category, serviceType }
  });

  return scheme;
}
