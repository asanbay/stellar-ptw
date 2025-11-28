-- 1. Performance: Add indexes for Foreign Keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_personnel_department_id ON public.personnel(department_id);
CREATE INDEX IF NOT EXISTS idx_permits_responsible_person_id ON public.permits(responsible_person_id);
CREATE INDEX IF NOT EXISTS idx_permits_issuer_id ON public.permits(issuer_id);
CREATE INDEX IF NOT EXISTS idx_permits_supervisor_id ON public.permits(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_permits_foreman_id ON public.permits(foreman_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON public.permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_created_by ON public.permits(created_by);
CREATE INDEX IF NOT EXISTS idx_combined_work_log_person_id ON public.combined_work_log(person_id);
CREATE INDEX IF NOT EXISTS idx_combined_work_log_date ON public.combined_work_log(date);

-- 2. Automation: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_personnel_updated_at ON public.personnel;
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON public.personnel FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_permits_updated_at ON public.permits;
CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON public.permits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_faq_updated_at ON public.faq;
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON public.faq FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_combined_work_log_updated_at ON public.combined_work_log;
CREATE TRIGGER update_combined_work_log_updated_at BEFORE UPDATE ON public.combined_work_log FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Security: Enable Row Level Security (RLS)
-- Enabling RLS forces us to define policies.
-- We start with a permissive policy for authenticated users to maintain current functionality securely.

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_work_log ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow authenticated users to do everything)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'departments') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'personnel') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.personnel FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'permits') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.permits FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'announcements') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'faq') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.faq FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'combined_work_log') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.combined_work_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;
