-- =========================================================================
-- COMPLETE DATABASE SCHEMA INITIALIZATION FOR Supabase (PostgreSQL)
-- UMKMoo's Platform
-- =========================================================================

-- 1. TYPE & ENUM DEFINITIONS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'akuntan', 'logistik');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accounting_system_type') THEN
        CREATE TYPE accounting_system_type AS ENUM ('syariah', 'konvensional');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('penjualan', 'pengeluaran', 'retur');
    END If;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE payment_method_type AS ENUM ('cash', 'qris', 'e-wallet', 'transfer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zakat_status') THEN
        CREATE TYPE zakat_status AS ENUM ('PENDING_APPROVAL', 'SUCCESS');
    END IF;
END $$;

-- 2. CREATE TABLE: businesses
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    logo_url TEXT,
    accounting_system accounting_system_type DEFAULT 'syariah' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CREATE TABLE: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'kasir' NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CREATE TABLE: verified_mosques (Zakat Recipient)
CREATE TABLE IF NOT EXISTS public.verified_mosques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CREATE TABLE: zakat_payments
CREATE TABLE IF NOT EXISTS public.zakat_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    mosque_id UUID REFERENCES public.verified_mosques(id) ON DELETE SET NULL,
    approved_by_owner BOOLEAN DEFAULT FALSE NOT NULL,
    approved_by_accountant BOOLEAN DEFAULT FALSE NOT NULL,
    status zakat_status DEFAULT 'PENDING_APPROVAL' NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_payments ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
CREATE POLICY "Allow public read businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow users to read own data" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Allow authenticated read mosques" ON public.verified_mosques FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to view their business zakat payments" 
ON public.zakat_payments FOR SELECT TO authenticated 
USING (business_id IN (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Allow users to insert zakat payments" 
ON public.zakat_payments FOR INSERT TO authenticated 
WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Allow owner and accountant to update zakat status" 
ON public.zakat_payments FOR UPDATE TO authenticated 
USING (business_id IN (SELECT business_id FROM public.users WHERE id = auth.uid()))
WITH CHECK (business_id IN (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- 8. SEED DATA
INSERT INTO public.verified_mosques (name, address, is_verified)
VALUES 
    ('Masjid Agung Al-Azhar', 'Jakarta Selatan', true),
    ('Masjid Istiqlal', 'Jakarta Pusat', true),
    ('Masjid Raya Bandung', 'Bandung', true),
    ('Masjid Jogokariyan', 'Yogyakarta', true)
ON CONFLICT DO NOTHING;
