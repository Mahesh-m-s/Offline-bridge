/**
 * Migration 003: Service Types, Source Provenance, and Ingestion Governance
 * Expands the government data model to distinguish:
 * - Schemes, services, certificates, and welfare benefits
 * - Preserves SLA days, service codes, official URLs, and verification dates
 * - Adds scheme_sources and ingestion_jobs tables for transparent ingestion tracking
 */

export const id = '003_service_types_and_ingestion_tables';

export async function up(client) {
  // 1. Expand 'schemes' table with service taxonomy, bilingual details, SLA, and verification metadata
  await client.query(`
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS service_type VARCHAR(32) NOT NULL DEFAULT 'scheme';
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS service_code VARCHAR(64);
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS title_kn VARCHAR(300);
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS department_kn VARCHAR(250);
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS description_kn TEXT;
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS official_url TEXT;
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 0;
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS verification_status VARCHAR(32) NOT NULL DEFAULT 'verified';
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS source_portal VARCHAR(100) DEFAULT 'karnataka_official';
    ALTER TABLE schemes ADD COLUMN IF NOT EXISTS last_verified_date DATE DEFAULT CURRENT_DATE;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_schemes_service_type'
      ) THEN
        ALTER TABLE schemes ADD CONSTRAINT chk_schemes_service_type 
          CHECK (service_type IN ('scheme', 'service', 'certificate', 'welfare_benefit'));
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_schemes_service_type ON schemes(service_type);
    CREATE INDEX IF NOT EXISTS idx_schemes_service_code ON schemes(service_code);
    CREATE INDEX IF NOT EXISTS idx_schemes_verification_status ON schemes(verification_status);
    CREATE INDEX IF NOT EXISTS idx_schemes_source_portal ON schemes(source_portal);
  `);

  // 2. Classify existing 25 records cleanly into the 4-way taxonomy
  await client.query(`
    -- Certificates
    UPDATE schemes SET service_type = 'certificate', service_code = 'RD0038', sla_days = 21, source_portal = 'nadakacheri' WHERE id = 'caste-income-cert';
    UPDATE schemes SET service_type = 'certificate', service_code = 'RD0001', sla_days = 21, source_portal = 'nadakacheri' WHERE id = 'domicile-certificate';

    -- Citizen Services
    UPDATE schemes SET service_type = 'service', service_code = 'FCS001', sla_days = 15, source_portal = 'sevasindhu' WHERE id = 'ration-card-update';
    UPDATE schemes SET service_type = 'service', service_code = 'STP002', sla_days = 3, source_portal = 'kaveri' WHERE id = 'kaveri-ec-services';

    -- Welfare Benefits
    UPDATE schemes SET service_type = 'welfare_benefit', service_code = 'ENG001', sla_days = 30, source_portal = 'sevasindhu' WHERE id = 'gruha-jyothi';
    UPDATE schemes SET service_type = 'welfare_benefit', service_code = 'TRN001', sla_days = 0, source_portal = 'sevasindhu' WHERE id = 'shakti-scheme';
    UPDATE schemes SET service_type = 'welfare_benefit', service_code = 'FCS002', sla_days = 30, source_portal = 'ahara' WHERE id = 'anna-bhagya';
    UPDATE schemes SET service_type = 'welfare_benefit', service_code = 'WCD002', sla_days = 0, source_portal = 'sevasindhu' WHERE id = 'matru-poorna';
    UPDATE schemes SET service_type = 'welfare_benefit', service_code = 'HFW001', sla_days = 7, source_portal = 'arogya' WHERE id = 'arogya-karnataka';

    -- Welfare Schemes (All remaining defaults to 'scheme')
    UPDATE schemes SET service_type = 'scheme', service_code = 'AGR001', sla_days = 30, source_portal = 'raitamitra' WHERE id = 'agri-seed-subsidy';
    UPDATE schemes SET service_type = 'scheme', service_code = 'AGR002', sla_days = 30, source_portal = 'pmkisan' WHERE id = 'pm-kisan';
    UPDATE schemes SET service_type = 'scheme', service_code = 'AGR003', sla_days = 45, source_portal = 'pmfby' WHERE id = 'pm-fasal-bima';
    UPDATE schemes SET service_type = 'scheme', service_code = 'AGR004', sla_days = 45, source_portal = 'raitamitra' WHERE id = 'krishi-bhagya';
    UPDATE schemes SET service_type = 'scheme', service_code = 'AHV001', sla_days = 30, source_portal = 'ahvs' WHERE id = 'ksheera-siri';
    UPDATE schemes SET service_type = 'scheme', service_code = 'REV002', sla_days = 45, source_portal = 'dssp' WHERE id = 'old-age-pension';
    UPDATE schemes SET service_type = 'scheme', service_code = 'WCD001', sla_days = 30, source_portal = 'sevasindhu' WHERE id = 'gruha-lakshmi';
    UPDATE schemes SET service_type = 'scheme', service_code = 'DIT001', sla_days = 30, source_portal = 'sevasindhu' WHERE id = 'yuva-nidhi';
    UPDATE schemes SET service_type = 'scheme', service_code = 'SWD001', sla_days = 60, source_portal = 'ssp' WHERE id = 'ssp-scholarship';
    UPDATE schemes SET service_type = 'scheme', service_code = 'BCW001', sla_days = 45, source_portal = 'bcwd' WHERE id = 'vidya-siri';
    UPDATE schemes SET service_type = 'scheme', service_code = 'MIN001', sla_days = 60, source_portal = 'kmdc' WHERE id = 'swavalambi-sarathi';
    UPDATE schemes SET service_type = 'scheme', service_code = 'IND001', sla_days = 60, source_portal = 'adcl' WHERE id = 'msme-artisan-subsidy';
    UPDATE schemes SET service_type = 'scheme', service_code = 'IND002', sla_days = 60, source_portal = 'cmegp' WHERE id = 'cmegp-subsidy';
    UPDATE schemes SET service_type = 'scheme', service_code = 'HSG001', sla_days = 90, source_portal = 'rghcl' WHERE id = 'rural-housing-assist';
    UPDATE schemes SET service_type = 'scheme', service_code = 'HSG002', sla_days = 90, source_portal = 'pmayg' WHERE id = 'pm-awas-gramin';
    UPDATE schemes SET service_type = 'scheme', service_code = 'SWD002', sla_days = 90, source_portal = 'kmdc' WHERE id = 'ganga-kalyana';
  `);

  // 3. Create 'scheme_sources' table to preserve source provenance and URLs
  await client.query(`
    CREATE TABLE IF NOT EXISTS scheme_sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scheme_id VARCHAR(64) NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
      source_name VARCHAR(120) NOT NULL,
      source_url TEXT NOT NULL,
      source_portal VARCHAR(64) NOT NULL,
      document_reference VARCHAR(255),
      verification_status VARCHAR(32) NOT NULL DEFAULT 'verified',
      content_hash VARCHAR(64),
      last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_scheme_sources_scheme ON scheme_sources(scheme_id);
    CREATE INDEX IF NOT EXISTS idx_scheme_sources_portal ON scheme_sources(source_portal);
    CREATE INDEX IF NOT EXISTS idx_scheme_sources_hash ON scheme_sources(content_hash);
  `);

  // Seed source records for existing 25 schemes
  await client.query(`
    INSERT INTO scheme_sources (scheme_id, source_name, source_url, source_portal, verification_status)
    SELECT id, 
           CASE 
             WHEN source_portal = 'nadakacheri' THEN 'Atalji Janasnehi Kendra (Nada Kacheri)'
             WHEN source_portal = 'sevasindhu' THEN 'Seva Sindhu Karnataka'
             WHEN source_portal = 'kaveri' THEN 'Department of Stamps and Registration (Kaveri 2.0)'
             WHEN source_portal = 'ssp' THEN 'State Scholarship Portal (SSP Karnataka)'
             WHEN source_portal = 'raitamitra' THEN 'Department of Agriculture (Raitamitra)'
             WHEN source_portal = 'pmkisan' THEN 'PM-KISAN National Portal'
             WHEN source_portal = 'pmfby' THEN 'Pradhan Mantri Fasal Bima Yojana Portal'
             WHEN source_portal = 'ahara' THEN 'Food, Civil Supplies and Consumer Affairs (Ahara)'
             WHEN source_portal = 'arogya' THEN 'Suvarna Arogya Suraksha Trust (SAST)'
             WHEN source_portal = 'dssp' THEN 'Directorate of Social Security and Pensions'
             ELSE 'Government of Karnataka Official Portal'
           END,
           COALESCE(official_url, 'https://sevasindhu.karnataka.gov.in'),
           source_portal,
           'verified'
    FROM schemes
    ON CONFLICT DO NOTHING;
  `);

  // 4. Create 'ingestion_jobs' table to track automated syncs, diffs, and failures
  await client.query(`
    CREATE TABLE IF NOT EXISTS ingestion_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_type VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'running',
      total_candidates INTEGER NOT NULL DEFAULT 0,
      imported_count INTEGER NOT NULL DEFAULT 0,
      updated_count INTEGER NOT NULL DEFAULT 0,
      skipped_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      error_log JSONB DEFAULT '[]'::jsonb,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE,
      triggered_by VARCHAR(64) DEFAULT 'system'
    );

    CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started ON ingestion_jobs(started_at DESC);
  `);
}

export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS ingestion_jobs;
    DROP TABLE IF EXISTS scheme_sources;
    ALTER TABLE schemes DROP CONSTRAINT IF EXISTS chk_schemes_service_type;
    ALTER TABLE schemes DROP COLUMN IF EXISTS service_type;
    ALTER TABLE schemes DROP COLUMN IF EXISTS service_code;
    ALTER TABLE schemes DROP COLUMN IF EXISTS title_kn;
    ALTER TABLE schemes DROP COLUMN IF EXISTS department_kn;
    ALTER TABLE schemes DROP COLUMN IF EXISTS description_kn;
    ALTER TABLE schemes DROP COLUMN IF EXISTS official_url;
    ALTER TABLE schemes DROP COLUMN IF EXISTS sla_days;
    ALTER TABLE schemes DROP COLUMN IF EXISTS verification_status;
    ALTER TABLE schemes DROP COLUMN IF EXISTS source_portal;
    ALTER TABLE schemes DROP COLUMN IF EXISTS last_verified_date;
  `);
}

