-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration 00001: Initial PostgreSQL Schema & Relational Model
-- Cities: Chittoor (AP-03), Vellore (TN-23), Bengaluru (KA-01)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. CITIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cities (
    id TEXT PRIMARY KEY,                       -- 'chittoor', 'vellore', 'bengaluru'
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,                        -- e.g. 'Chittoor'
    state TEXT NOT NULL,                       -- e.g. 'Andhra Pradesh'
    brand_name TEXT NOT NULL,                  -- e.g. 'ChittoorAds'
    domain TEXT NOT NULL,                      -- e.g. 'chittoorads.com'
    code TEXT NOT NULL,                        -- e.g. 'AP-03', 'TN-23', 'KA-01'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Linked to auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_verification')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- 3. USER ROLES & CITY MEMBERSHIPS TABLE (Server-Controlled Access Control)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE, -- NULL means global / all cities
    role TEXT NOT NULL CHECK (role IN ('customer', 'business_owner', 'data_entry_staff', 'city_franchise', 'super_admin')),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_user_role_city UNIQUE (user_id, role, city_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_city ON public.user_roles(role, city_id);

-- -----------------------------------------------------------------------------
-- 4. BUSINESS CATEGORIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,                       -- e.g. 'restaurants', 'hotels-lodges'
    name TEXT NOT NULL,
    name_te TEXT NOT NULL,                     -- Telugu translation
    name_ta TEXT,                              -- Tamil translation
    name_kn TEXT,                              -- Kannada translation
    icon TEXT NOT NULL,                        -- Lucide icon name or emoji
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- 5. BUSINESS LISTINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE,                     -- 'c-001', 'v-001', 'b-001' for stable seed mapping
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,                    -- e.g. 'gandhi-road', 'katpadi', 'indiranagar'
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'suspended')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INT NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    price_range TEXT DEFAULT 'Best Market Rate',
    timings TEXT DEFAULT 'Daily: 9:00 AM - 8:00 PM',
    services TEXT[] NOT NULL DEFAULT '{}',
    badge TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_businesses_city_status ON public.businesses(city_id, status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_locality ON public.businesses(locality);

-- -----------------------------------------------------------------------------
-- 6. BUSINESS IMAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    image_url TEXT,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_business_images_business_id ON public.business_images(business_id);

-- -----------------------------------------------------------------------------
-- 7. CUSTOMER ENQUIRIES TABLE (Private lead data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_business ON public.customer_enquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_city ON public.customer_enquiries(city_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_customer ON public.customer_enquiries(customer_id);

-- -----------------------------------------------------------------------------
-- 8. CLASSIFIED ADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classified_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE,
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    condition TEXT NOT NULL,
    locality TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    image_url TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_classifieds_city_status ON public.classified_ads(city_id, status);

-- -----------------------------------------------------------------------------
-- 9. REVIEWS AND SAVED BUSINESSES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_quality INT CHECK (service_quality >= 1 AND service_quality <= 5),
    value_for_money INT CHECK (value_for_money >= 1 AND value_for_money <= 5),
    cleanliness INT CHECK (cleanliness >= 1 AND cleanliness <= 5),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_business_status ON public.reviews(business_id, status);

CREATE TABLE IF NOT EXISTS public.saved_businesses (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, business_id)
);

-- -----------------------------------------------------------------------------
-- 10. AUDIT LOGS TABLE (Privileged actions tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,                      -- e.g. 'LISTING_APPROVAL', 'ROLE_ASSIGNMENT'
    entity_type TEXT NOT NULL,                -- e.g. 'business', 'user_role'
    entity_id TEXT NOT NULL,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_city ON public.audit_logs(city_id);

-- -----------------------------------------------------------------------------
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION (SECURITY INVOKER)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = pg_catalog.timezone('utc', pg_catalog.now());
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS update_cities_modtime ON public.cities;
CREATE TRIGGER update_cities_modtime
    BEFORE UPDATE ON public.cities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_user_profiles_modtime ON public.user_profiles;
CREATE TRIGGER update_user_profiles_modtime
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_businesses_modtime ON public.businesses;
CREATE TRIGGER update_businesses_modtime
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- ATOMIC USER PROFILES & ROLES INITIALIZATION TRIGGER (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, email, phone, city_id)
    VALUES (
        new.id,
        pg_catalog.coalesce(new.raw_user_meta_data->>'display_name', pg_catalog.split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone',
        pg_catalog.coalesce(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone;

    INSERT INTO public.user_roles (user_id, role, city_id)
    VALUES (
        new.id,
        CASE WHEN (new.raw_user_meta_data->>'role') = 'business_owner' THEN 'business_owner' ELSE 'customer' END,
        pg_catalog.coalesce(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (user_id, role, city_id) DO NOTHING;

    RETURN new;
END;
$$;

-- Secure execution privileges: Prevent untrusted client execution
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, postgres, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

