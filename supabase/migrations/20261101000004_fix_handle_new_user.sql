-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration 00004: Fix Auth User Provisioning Trigger (handle_new_user)
-- Fixes permission denied and default resolution errors on auth signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, email, phone, city_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone;

    INSERT INTO public.user_roles (user_id, role, city_id)
    VALUES (
        new.id,
        CASE WHEN (new.raw_user_meta_data->>'role') = 'business_owner' THEN 'business_owner' ELSE 'customer' END,
        COALESCE(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (user_id, role, city_id) DO NOTHING;

    RETURN new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO public, anon, authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

