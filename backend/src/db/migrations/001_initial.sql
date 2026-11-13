CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen','officer','supervisor','admin')),
  department_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_department_id_fkey') THEN
    ALTER TABLE users ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ref TEXT UNIQUE,
  is_synthetic BOOLEAN NOT NULL DEFAULT false,
  citizen_id UUID REFERENCES users(id),
  original_text TEXT NOT NULL,
  normalized_text TEXT NOT NULL DEFAULT '',
  detected_language TEXT NOT NULL DEFAULT 'unknown',
  category TEXT NOT NULL DEFAULT 'other',
  department_id UUID REFERENCES departments(id),
  urgency TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Created',
  needs_human_review BOOLEAN NOT NULL DEFAULT false,
  area TEXT,
  location GEOGRAPHY(POINT,4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS complaint_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  original_text TEXT NOT NULL,
  detected_language TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  predicted_category TEXT NOT NULL,
  predicted_department TEXT NOT NULL,
  predicted_urgency TEXT NOT NULL,
  category_confidence REAL NOT NULL,
  department_confidence REAL NOT NULL,
  urgency_confidence REAL NOT NULL,
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_name TEXT NOT NULL DEFAULT 'civic-lens-baseline',
  model_version TEXT NOT NULL DEFAULT 'v0.1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  human_correction JSONB,
  officer_reason TEXT,
  final_decision JSONB,
  decided_by UUID REFERENCES users(id)
);
CREATE OR REPLACE FUNCTION prevent_ai_decision_delete() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'ai_decisions is append-only'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS ai_decisions_no_delete ON ai_decisions;
DROP TRIGGER IF EXISTS ai_decisions_append_only ON ai_decisions;
CREATE TRIGGER ai_decisions_append_only BEFORE UPDATE OR DELETE ON ai_decisions FOR EACH ROW EXECUTE FUNCTION prevent_ai_decision_delete();
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  status TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS issue_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT,
  category TEXT NOT NULL,
  complaint_count INTEGER NOT NULL DEFAULT 0,
  affected_streets JSONB NOT NULL DEFAULT '[]'::jsonb,
  first_reported TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS cluster_members (
  cluster_id UUID REFERENCES issue_clusters(id),
  complaint_id UUID REFERENCES complaints(id),
  PRIMARY KEY(cluster_id, complaint_id)
);
CREATE TABLE IF NOT EXISTS sla_policies (
  category TEXT NOT NULL,
  urgency TEXT NOT NULL,
  hours INTEGER NOT NULL CHECK (hours > 0),
  PRIMARY KEY(category, urgency)
);
CREATE TABLE IF NOT EXISTS sla_tracking (
  complaint_id UUID PRIMARY KEY REFERENCES complaints(id),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  escalation_state TEXT NOT NULL DEFAULT 'none'
);
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  officer_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  before_media_path TEXT,
  after_media_path TEXT,
  location GEOGRAPHY(POINT,4326),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id),
  citizen_id UUID REFERENCES users(id),
  accepted BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  complaint_id UUID REFERENCES complaints(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);
CREATE INDEX IF NOT EXISTS complaints_location_idx ON complaints USING GIST(location);
