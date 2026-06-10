-- =========================================================================
-- FIX LOGIN: Konfirmasi email manual + nonaktifkan requirement
-- Jalankan di: Supabase > SQL Editor
-- =========================================================================

-- STEP 1: Konfirmasi semua user yang belum terkonfirmasi
-- (termasuk akun yang baru saja kamu daftarkan)
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- STEP 2: Verifikasi - lihat semua user di auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'businessName' AS business_name,
  raw_user_meta_data->>'ownerName' AS owner_name
FROM auth.users
ORDER BY created_at DESC;
