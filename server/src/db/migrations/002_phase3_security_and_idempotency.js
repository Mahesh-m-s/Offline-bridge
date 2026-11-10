/**
 * Migration 002: Phase 3 Security, Idempotency, Audit Logs, and RAG Knowledge Base
 * Additive and reversible schema migration for server-side auth, idempotency, and provenance.
 */

export const id = '002_phase3_security_and_idempotency';

export async function up(client) {
  await client.query(`
    -- 1. Users table additions: password_hash, is_active, role check constraint
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('citizen', 'official', 'admin'));
      END IF;
    END $$;

    -- 2. Applications table additions: client_submission_id, source_provenance, unique constraint
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS client_submission_id VARCHAR(100);
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS source_provenance JSONB DEFAULT '{}'::jsonb;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_applications_client_submission_id'
      ) THEN
        ALTER TABLE applications ADD CONSTRAINT uq_applications_client_submission_id UNIQUE (client_submission_id);
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_applications_client_sub_id ON applications(client_submission_id);
    CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);

    -- 3. Grievances table additions: client_submission_id, source_provenance, unique constraint
    ALTER TABLE grievances ADD COLUMN IF NOT EXISTS client_submission_id VARCHAR(100);
    ALTER TABLE grievances ADD COLUMN IF NOT EXISTS source_provenance JSONB DEFAULT '{}'::jsonb;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_grievances_client_submission_id'
      ) THEN
        ALTER TABLE grievances ADD CONSTRAINT uq_grievances_client_submission_id UNIQUE (client_submission_id);
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_grievances_client_sub_id ON grievances(client_submission_id);

    -- 4. Audit Logs Table (stores security-relevant and administrative events without secrets)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_role VARCHAR(32),
      action VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64) NOT NULL,
      resource_id VARCHAR(100),
      ip_address VARCHAR(45),
      status VARCHAR(16) NOT NULL DEFAULT 'success',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

    -- 5. Knowledge Documents Table (stores ingested scheme rules and advisory documents for RAG)
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      source_url TEXT,
      provenance JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_knowledge_docs_scheme ON knowledge_documents(scheme_id);
  `);
}

export async function down(client) {
  await client.query(`
    -- 1. Drop knowledge documents and audit logs
    DROP TABLE IF EXISTS knowledge_documents CASCADE;
    DROP TABLE IF EXISTS audit_logs CASCADE;

    -- 2. Drop constraints & columns on grievances
    ALTER TABLE grievances DROP CONSTRAINT IF EXISTS uq_grievances_client_submission_id;
    DROP INDEX IF EXISTS idx_grievances_client_sub_id;
    ALTER TABLE grievances DROP COLUMN IF EXISTS source_provenance;
    ALTER TABLE grievances DROP COLUMN IF EXISTS client_submission_id;

    -- 3. Drop constraints & columns on applications
    ALTER TABLE applications DROP CONSTRAINT IF EXISTS uq_applications_client_submission_id;
    DROP INDEX IF EXISTS idx_applications_user_status;
    DROP INDEX IF EXISTS idx_applications_client_sub_id;
    ALTER TABLE applications DROP COLUMN IF EXISTS source_provenance;
    ALTER TABLE applications DROP COLUMN IF EXISTS client_submission_id;

    -- 4. Drop constraints & columns on users
    ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
    ALTER TABLE users DROP COLUMN IF EXISTS is_active;
    ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
  `);
}

