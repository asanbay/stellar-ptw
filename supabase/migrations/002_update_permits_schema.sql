-- Update permits table to align with PTW application data model
ALTER TABLE public.permits
  DROP CONSTRAINT IF EXISTS permits_status_check;

ALTER TABLE public.permits
  ADD CONSTRAINT permits_status_check
  CHECK (status IN ('draft', 'issued', 'in-progress', 'suspended', 'completed', 'closed', 'cancelled'));

ALTER TABLE public.permits
  ADD COLUMN IF NOT EXISTS work_scope TEXT,
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS foreman_id UUID REFERENCES personnel(id),
  ADD COLUMN IF NOT EXISTS daily_admissions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_combined_work BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS combined_work_journal_ref TEXT,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.permits
  ALTER COLUMN worker_ids SET DEFAULT '[]'::jsonb,
  ALTER COLUMN safety_measures SET DEFAULT '[]'::jsonb,
  ALTER COLUMN equipment SET DEFAULT '[]'::jsonb,
  ALTER COLUMN hazards SET DEFAULT '[]'::jsonb;

ALTER TABLE public.permits
  ALTER COLUMN daily_admissions SET DEFAULT '[]'::jsonb,
  ALTER COLUMN attachments SET DEFAULT '[]'::jsonb;

-- Update combined_work_log table to support application data shape
ALTER TABLE public.combined_work_log
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS ptw_numbers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS organizations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS work_types JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS safety_measures JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.combined_work_log
  ALTER COLUMN work_description SET DEFAULT '';
