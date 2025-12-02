-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'oklch(0.55 0.22 25)',
  emoji VARCHAR(10) DEFAULT '🏢',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  role VARCHAR(50),
  custom_duties JSONB DEFAULT '[]',
  custom_qualifications JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question JSONB NOT NULL,
  answer JSONB NOT NULL,
  category VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Permits table (наряды-допуски)
CREATE TABLE IF NOT EXISTS public.permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_number VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  responsible_person_id UUID REFERENCES personnel(id) ON DELETE SET NULL,
  issuer_id UUID REFERENCES personnel(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES personnel(id) ON DELETE SET NULL,
  foreman_id UUID REFERENCES personnel(id) ON DELETE SET NULL,
  safety_measures JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  hazards JSONB DEFAULT '[]',
  work_scope TEXT,
  daily_admissions JSONB DEFAULT '[]',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  is_combined_work BOOLEAN DEFAULT false,
  combined_work_journal_ref VARCHAR(100),
  issued_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Permit workers (связь наряда с рабочими)
CREATE TABLE IF NOT EXISTS public.permit_workers (
  permit_id UUID REFERENCES permits(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (permit_id, worker_id)
);

-- Combined work log (журнал совмещенных работ)
CREATE TABLE IF NOT EXISTS public.combined_work_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  person_id UUID REFERENCES personnel(id) ON DELETE SET NULL,
  work_description TEXT NOT NULL,
  location VARCHAR(255),
  ptw_numbers JSONB DEFAULT '[]',
  organizations JSONB DEFAULT '[]',
  work_types JSONB DEFAULT '[]',
  safety_measures JSONB DEFAULT '[]',
  hours NUMERIC(5,2) DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_work_log ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Allow public read/write for now to fix sync issues)
-- Departments
DROP POLICY IF EXISTS "Enable read access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.departments;
CREATE POLICY "Enable read access for all users" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.departments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.departments FOR DELETE USING (true);

-- Personnel
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.personnel;
CREATE POLICY "Enable read access for all users" ON public.personnel FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.personnel FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.personnel FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.personnel FOR DELETE USING (true);

-- FAQ
DROP POLICY IF EXISTS "Enable read access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.faq;
CREATE POLICY "Enable read access for all users" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.faq FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.faq FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.faq FOR DELETE USING (true);

-- Permits
DROP POLICY IF EXISTS "Enable read access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.permits;
CREATE POLICY "Enable read access for all users" ON public.permits FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.permits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.permits FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.permits FOR DELETE USING (true);

-- Permit Workers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.permit_workers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.permit_workers;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.permit_workers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.permit_workers;
CREATE POLICY "Enable read access for all users" ON public.permit_workers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.permit_workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.permit_workers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.permit_workers FOR DELETE USING (true);

-- Combined Work Log
DROP POLICY IF EXISTS "Enable read access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.combined_work_log;
CREATE POLICY "Enable read access for all users" ON public.combined_work_log FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.combined_work_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.combined_work_log FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.combined_work_log FOR DELETE USING (true);

-- 5. Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create Triggers
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personnel_updated_at ON personnel;
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faq_updated_at ON faq;
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permits_updated_at ON permits;
CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON permits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_combined_work_log_updated_at ON combined_work_log;
CREATE TRIGGER update_combined_work_log_updated_at BEFORE UPDATE ON combined_work_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
