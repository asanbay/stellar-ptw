-- =====================================================
-- PRODUCTION RLS ПОЛИТИКИ (AUTH-BASED)
-- Применять после настройки аутентификации
-- =====================================================

-- ВАЖНО: Этот файл содержит production-ready политики безопасности
-- Применяйте только после настройки Supabase Auth
-- Для пилота используйте политики из complete_schema.sql

-- =====================================================
-- 1. УДАЛЕНИЕ ПУБЛИЧНЫХ ПОЛИТИК
-- =====================================================

-- Departments
DROP POLICY IF EXISTS "Enable read access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.departments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.departments;

-- Personnel
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.personnel;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.personnel;

-- FAQ
DROP POLICY IF EXISTS "Enable read access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.faq;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.faq;

-- Permits
DROP POLICY IF EXISTS "Enable read access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.permits;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.permits;

-- Permit Workers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.permit_workers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.permit_workers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.permit_workers;

-- Combined Work Log
DROP POLICY IF EXISTS "Enable read access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.combined_work_log;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.combined_work_log;

-- Announcements
DROP POLICY IF EXISTS "Enable read access for all users" ON public.announcements;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.announcements;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.announcements;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.announcements;

-- User Profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.user_profiles;

-- =====================================================
-- 2. HELPER FUNCTION ДЛЯ ПРОВЕРКИ РОЛЕЙ
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- =====================================================
-- 3. AUTH-BASED ПОЛИТИКИ
-- =====================================================

-- ============ DEPARTMENTS ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

-- Только админы могут создавать, изменять и удалять
CREATE POLICY "Admins can insert departments"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update departments"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============ PERSONNEL ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read personnel"
  ON public.personnel FOR SELECT
  TO authenticated
  USING (true);

-- Только админы могут создавать, изменять и удалять
CREATE POLICY "Admins can insert personnel"
  ON public.personnel FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update personnel"
  ON public.personnel FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete personnel"
  ON public.personnel FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============ FAQ ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read faq"
  ON public.faq FOR SELECT
  TO authenticated
  USING (true);

-- Только админы могут создавать, изменять и удалять
CREATE POLICY "Admins can insert faq"
  ON public.faq FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update faq"
  ON public.faq FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete faq"
  ON public.faq FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============ PERMITS ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read permits"
  ON public.permits FOR SELECT
  TO authenticated
  USING (true);

-- Авторизованные пользователи могут создавать наряды (с собой как created_by)
CREATE POLICY "Authenticated users can create permits"
  ON public.permits FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Можно обновлять свои наряды или если админ
CREATE POLICY "Users can update own permits or admins can update any"
  ON public.permits FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

-- Можно удалять свои наряды или если админ
CREATE POLICY "Users can delete own permits or admins can delete any"
  ON public.permits FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

-- ============ PERMIT WORKERS ============
-- Чтение доступно всем авторизованным
CREATE POLICY "Authenticated users can read permit workers"
  ON public.permit_workers FOR SELECT
  TO authenticated
  USING (true);

-- Можно добавлять рабочих только к своим нарядам или если админ
CREATE POLICY "Users can insert workers to own permits or admins to any"
  ON public.permit_workers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permits 
      WHERE id = permit_id 
      AND (created_by = auth.uid() OR public.is_admin())
    )
  );

-- Можно удалять рабочих только из своих нарядов или если админ
CREATE POLICY "Users can delete workers from own permits or admins from any"
  ON public.permit_workers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permits 
      WHERE id = permit_id 
      AND (created_by = auth.uid() OR public.is_admin())
    )
  );

-- ============ COMBINED WORK LOG ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read combined work log"
  ON public.combined_work_log FOR SELECT
  TO authenticated
  USING (true);

-- Авторизованные пользователи могут создавать записи
CREATE POLICY "Authenticated users can create combined work entries"
  ON public.combined_work_log FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Можно обновлять свои записи или если админ
CREATE POLICY "Users can update own entries or admins can update any"
  ON public.combined_work_log FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

-- Можно удалять свои записи или если админ
CREATE POLICY "Users can delete own entries or admins can delete any"
  ON public.combined_work_log FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

-- ============ ANNOUNCEMENTS ============
-- Все авторизованные пользователи могут читать
CREATE POLICY "Authenticated users can read announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

-- Только админы могут создавать, изменять и удалять
CREATE POLICY "Admins can insert announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============ USER PROFILES ============
-- Пользователи могут читать только свой профиль, админы - все
CREATE POLICY "Users can read own profile, admins can read all"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Суперадмины могут создавать профили
CREATE POLICY "Super admins can insert user profiles"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

-- Пользователи могут обновлять свой профиль (кроме роли), админы - всё
CREATE POLICY "Users can update own profile, admins can update any"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    -- Пользователь не может изменить свою роль
    (id = auth.uid() AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

-- Только суперадмины могут удалять профили
CREATE POLICY "Super admins can delete user profiles"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- 4. КОММЕНТАРИИ И ДОКУМЕНТАЦИЯ
-- =====================================================

COMMENT ON FUNCTION public.get_user_role() IS 'Возвращает роль текущего пользователя';
COMMENT ON FUNCTION public.is_admin() IS 'Проверяет, является ли пользователь админом или супер-админом';
COMMENT ON FUNCTION public.is_super_admin() IS 'Проверяет, является ли пользователь супер-админом';

-- =====================================================
-- ИНСТРУКЦИИ ПО ПРИМЕНЕНИЮ
-- =====================================================

/*
ПЕРЕД ПРИМЕНЕНИЕМ ЭТИХ ПОЛИТИК:

1. Настройте Supabase Auth (Email/Password или другой провайдер)

2. Создайте таблицу user_profiles если её нет:
   CREATE TABLE public.user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     username VARCHAR(100) NOT NULL,
     role VARCHAR(20) DEFAULT 'user',
     full_name VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

3. Создайте триггер для автоматического создания профиля:
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, username, role)
     VALUES (NEW.id, NEW.email, 'user');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

4. Создайте первого супер-админа вручную:
   UPDATE public.user_profiles SET role = 'super_admin' WHERE id = 'YOUR_USER_ID';

5. Примените этот файл:
   psql -h your-db.supabase.co -U postgres -d postgres < production_rls_policies.sql

6. Обновите клиентский код для использования Supabase Auth:
   - Добавьте SignIn/SignUp компоненты
   - Обновите supabase client для работы с сессиями
   - Передавайте auth.uid() в created_by при создании записей
*/
