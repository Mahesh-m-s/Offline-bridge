-- ==============================================================================
-- ArivuNet (ಅರಿವುನೆಟ್) — Initial Database DDL Schema
-- Repeatable, non-destructive migration script.
-- Uses CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.
-- Does NOT contain DROP TABLE, TRUNCATE, or data-destructive commands.
-- ==============================================================================

-- Enable UUID generator extension if supported
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores citizen and operator profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(32) NOT NULL DEFAULT 'citizen',
  village_panchayat VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. SCHEMES TABLE
-- Stores government assistance schemes, eligibility rules, and department data
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schemes (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  eligibility_criteria TEXT,
  eligibility_rules JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(is_active);

-- ------------------------------------------------------------------------------
-- 3. APPLICATIONS TABLE
-- Stores citizen applications linked to schemes with a proper foreign key
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scheme_id VARCHAR(64) NOT NULL REFERENCES schemes(id) ON DELETE RESTRICT,
  local_draft_id VARCHAR(100),
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. APPLICATION STATUS HISTORY TABLE
-- Provides an extensible audit trail for application workflow transitions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL,
  remarks TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_history_app ON application_status_history(application_id);

-- ------------------------------------------------------------------------------
-- 5. GRIEVANCES TABLE
-- Stores citizen public grievance reports
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  village_panchayat VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(20),
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_panchayat ON grievances(village_panchayat);
