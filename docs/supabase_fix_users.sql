-- =========================================================================
-- FIX COMPLETE: Trigger + Perbaikan user yang sudah terdaftar
-- Jalankan di: Supabase > SQL Editor
-- =========================================================================

-- STEP 1: Buat fungsi trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Buat business baru untuk user ini
  INSERT INTO public.businesses (name, address, accounting_system)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'businessName', 'Bisnis Saya'),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    'syariah'
  )
  RETURNING id INTO new_business_id;

  -- Buat user record di public.users
  INSERT INTO public.users (id, name, email, role, business_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'ownerName', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin',
    new_business_id
  );

  RETURN NEW;
END;
$$;

-- STEP 2: Pasang trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Policies agar trigger bisa insert
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow trigger to insert businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Allow trigger to insert businesses" ON public.businesses FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow trigger to insert users' AND tablename = 'users') THEN
    CREATE POLICY "Allow trigger to insert users" ON public.users FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to update own data' AND tablename = 'users') THEN
    CREATE POLICY "Allow users to update own data" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());
  END IF;
END $$;

-- STEP 4: *** PERBAIKAN *** Masukkan user yang sudah daftar tapi belum ada di public.users
-- Ini akan memproses semua auth.users yang belum ada di public.users
DO $$
DECLARE
  auth_user RECORD;
  new_business_id UUID;
BEGIN
  FOR auth_user IN 
    SELECT * FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.users)
  LOOP
    -- Buat business untuk user ini
    INSERT INTO public.businesses (name, address, accounting_system)
    VALUES (
      COALESCE(auth_user.raw_user_meta_data->>'businessName', 'Bisnis Saya'),
      COALESCE(auth_user.raw_user_meta_data->>'address', ''),
      'syariah'
    )
    RETURNING id INTO new_business_id;

    -- Buat user record
    INSERT INTO public.users (id, name, email, role, business_id)
    VALUES (
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'ownerName', split_part(auth_user.email, '@', 1)),
      auth_user.email,
      'admin',
      new_business_id
    );

    RAISE NOTICE 'Fixed user: %', auth_user.email;
  END LOOP;
END $$;

-- STEP 5: Verifikasi hasilnya
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  b.name AS business_name
FROM public.users u
LEFT JOIN public.businesses b ON b.id = u.business_id;
