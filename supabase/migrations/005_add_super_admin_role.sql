-- 1. Update user_profiles role check constraint to include 'super_admin'
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. Update RLS policies to give super_admin full access
-- We'll use a recursive policy or just explicit checks.
-- Since we already have "Enable all access for authenticated users" which is very permissive,
-- we might want to restrict 'user' and 'admin' in the future, but for now,
-- we just ensure 'super_admin' is recognized.

-- However, if we want to implement "Super Admin sees everything" while others might see less,
-- we should start by defining what 'user' and 'admin' can see.
-- Currently, the policy is "ALL TO authenticated USING (true)".
-- This means everyone sees everything.
-- To implement the requirement "Main Administrator sees all passwords and so on" (metaphorically, meaning full control),
-- we should prepare the ground for stricter policies for normal users.

-- For this migration, we will just ensure the role exists.
-- The application logic will handle the "Super Admin" UI features.

-- Let's also add a column to store "is_super_admin" flag if we wanted, but role is enough.

-- 3. Create a function to easily promote a user to super_admin (for development/setup)
CREATE OR REPLACE FUNCTION make_super_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles
  SET role = 'super_admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
