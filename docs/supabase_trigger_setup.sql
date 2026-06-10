-- =========================================================================
-- TRIGGER: Auto-create public.users record saat user baru daftar
-- Jalankan ini di Supabase Dashboard > SQL Editor
-- =========================================================================

-- 1. Fungsi yang dijalankan otomatis saat user baru dibuat di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Buat record business baru untuk user ini
  INSERT INTO public.businesses (name, address, accounting_system)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'businessName', 'Bisnis Saya'),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    'syariah'
  )
  RETURNING id INTO new_business_id;

  -- Buat record user di public.users yang terhubung ke auth.users
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

-- 2. Pasang trigger ke tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tambahkan policy INSERT untuk businesses (agar trigger bisa insert)
DROP POLICY IF EXISTS "Allow trigger to insert businesses" ON public.businesses;
CREATE POLICY "Allow trigger to insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (true);

-- 4. Tambahkan policy INSERT untuk users (agar trigger bisa insert)  
DROP POLICY IF EXISTS "Allow trigger to insert users" ON public.users;
CREATE POLICY "Allow trigger to insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- 5. Tambahkan policy UPDATE untuk users (untuk updateProfile)
DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;
CREATE POLICY "Allow users to update own data"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- =========================================================================
-- VERIFIKASI: Cek apakah trigger sudah terpasang
-- =========================================================================
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
