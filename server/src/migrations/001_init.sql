CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','operator','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_kn TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  eligibility_rules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  benefit TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  form_id UUID NOT NULL REFERENCES service_forms(id),
  data_json JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
  sync_status TEXT NOT NULL DEFAULT 'synced',
  reference_no TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','rejected')),
  reference_no TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('submission','grievance')),
  entity_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grievances_user_created ON grievances(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_data_gin ON submissions USING GIN(data_json);
CREATE INDEX IF NOT EXISTS idx_schemes_rules_gin ON schemes USING GIN(eligibility_rules_json);
