-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration 00002: Row Level Security (RLS) Policies & Integrity Guards
-- Enforces: Public read boundaries, Business Owner scoping, Franchise isolation,
-- and Anti-Tampering Database Triggers (zero privilege escalation).
-- Safe & Idempotent: Can be applied multiple times without duplicate errors.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SERVER-CONTROLLED ROLE RESOLVER (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(
    _user_id pg_catalog.uuid,
    _role pg_catalog.text,
    _city_id pg_catalog.text DEFAULT NULL
)
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
          AND (
            role = 'super_admin'
            OR (
                role = _role
                AND (city_id IS NULL OR _city_id IS NULL OR city_id = _city_id)
            )
          )
    );
$$;

-- Secure execution privileges
REVOKE ALL ON FUNCTION public.has_role(pg_catalog.uuid, pg_catalog.text, pg_catalog.text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(pg_catalog.uuid, pg_catalog.text, pg_catalog.text) TO anon, authenticated, service_role, postgres;

-- -----------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL APPLICATION TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. CITIES RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public may view active cities" ON public.cities;
CREATE POLICY "Public may view active cities"
    ON public.cities FOR SELECT
    USING (status != 'inactive' OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super Admins may manage cities" ON public.cities;
CREATE POLICY "Super Admins may manage cities"
    ON public.cities FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- -----------------------------------------------------------------------------
-- 4. CATEGORIES RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public may view categories" ON public.categories;
CREATE POLICY "Public may view categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Super Admins may manage categories" ON public.categories;
CREATE POLICY "Super Admins may manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- -----------------------------------------------------------------------------
-- 5. USER PROFILES RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users may view their own profile, Admins and Franchise may view members" ON public.user_profiles;
CREATE POLICY "Users may view their own profile, Admins and Franchise may view members"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

DROP POLICY IF EXISTS "Users may update their own profile details" ON public.user_profiles;
CREATE POLICY "Users may update their own profile details"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 6. USER ROLES RLS POLICIES (No public self-escalation)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users may view their own assigned roles" ON public.user_roles;
CREATE POLICY "Users may view their own assigned roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.has_role(auth.uid(), 'super_admin')
    );

DROP POLICY IF EXISTS "Only Super Admins may modify role assignments" ON public.user_roles;
CREATE POLICY "Only Super Admins may modify role assignments"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- -----------------------------------------------------------------------------
-- 7. BUSINESS LISTINGS RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses"
    ON public.businesses FOR SELECT
    USING (
        status = 'active'
        OR auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
        OR public.has_role(auth.uid(), 'data_entry_staff', city_id)
    );

DROP POLICY IF EXISTS "Owners can submit new business listing" ON public.businesses;
CREATE POLICY "Owners can submit new business listing"
    ON public.businesses FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id))
    );

DROP POLICY IF EXISTS "Owners can update own business, Franchise can moderate" ON public.businesses;
CREATE POLICY "Owners can update own business, Franchise can moderate"
    ON public.businesses FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    )
    WITH CHECK (
        auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

DROP POLICY IF EXISTS "Owners can delete own business, Franchise can delete" ON public.businesses;
CREATE POLICY "Owners can delete own business, Franchise can delete"
    ON public.businesses FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

-- -----------------------------------------------------------------------------
-- 8. DATABASE INTEGRITY TRIGGERS: PREVENT FORBIDDEN COLUMN TAMPERING (SECURITY INVOKER)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_business_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    -- If caller is not Super Admin or City Franchise for this city:
    IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', NEW.city_id)) THEN
        NEW.owner_id := auth.uid();
        NEW.status := 'pending';         -- Force pending approval lifecycle
        NEW.is_verified := false;        -- Forbid self-granting verified badge
        NEW.is_featured := false;        -- Forbid self-granting featured badge
        NEW.rating := 0.0;               -- New listings start unrated
        NEW.reviews_count := 0;
        NEW.views_count := 0;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_business_insert() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_business_insert() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS trg_guard_business_insert ON public.businesses;
CREATE TRIGGER trg_guard_business_insert
    BEFORE INSERT ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.guard_business_insert();

CREATE OR REPLACE FUNCTION public.guard_business_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    -- If caller is ordinary owner (not Super Admin or Franchise):
    IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', OLD.city_id)) THEN
        -- Prevent changing owner or city boundary
        IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
            RAISE EXCEPTION 'Security Violation: Cannot transfer business ownership directly.';
        END IF;
        IF NEW.city_id IS DISTINCT FROM OLD.city_id THEN
            RAISE EXCEPTION 'Security Violation: Cannot transfer business across city territories.';
        END IF;

        -- Prevent approving own listing
        IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'active' THEN
            RAISE EXCEPTION 'Security Violation: Business owners cannot approve their own listings.';
        END IF;

        -- Prevent changing verification or metrics
        IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
            RAISE EXCEPTION 'Security Violation: Business owners cannot alter verification status.';
        END IF;
        IF NEW.rating IS DISTINCT FROM OLD.rating OR NEW.reviews_count IS DISTINCT FROM OLD.reviews_count THEN
            RAISE EXCEPTION 'Security Violation: Business ratings cannot be altered directly.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_business_update() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_business_update() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS trg_guard_business_update ON public.businesses;
CREATE TRIGGER trg_guard_business_update
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.guard_business_update();

-- -----------------------------------------------------------------------------
-- 9. CUSTOMER ENQUIRIES RLS POLICIES (Strict Private Lead Isolation)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Business owners and customers can view relevant enquiries" ON public.customer_enquiries;
CREATE POLICY "Business owners and customers can view relevant enquiries"
    ON public.customer_enquiries FOR SELECT
    TO authenticated
    USING (
        customer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = customer_enquiries.business_id
              AND b.owner_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

DROP POLICY IF EXISTS "Authenticated users may submit enquiries" ON public.customer_enquiries;
CREATE POLICY "Authenticated users may submit enquiries"
    ON public.customer_enquiries FOR INSERT
    TO authenticated
    WITH CHECK (
        customer_id = auth.uid()
        AND length(trim(customer_name)) >= 2
        AND length(trim(customer_phone)) >= 10
        AND length(trim(message)) >= 5
    );

DROP POLICY IF EXISTS "Business owners may update enquiry status (read/replied)" ON public.customer_enquiries;
CREATE POLICY "Business owners may update enquiry status (read/replied)"
    ON public.customer_enquiries FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = customer_enquiries.business_id
              AND b.owner_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'super_admin')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = customer_enquiries.business_id
              AND b.owner_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'super_admin')
    );

-- -----------------------------------------------------------------------------
-- 10. BUSINESS IMAGES RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public may view images of active businesses" ON public.business_images;
CREATE POLICY "Public may view images of active businesses"
    ON public.business_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = business_images.business_id
              AND (
                b.status = 'active'
                OR b.owner_id = auth.uid()
                OR public.has_role(auth.uid(), 'super_admin')
                OR public.has_role(auth.uid(), 'city_franchise', b.city_id)
              )
        )
    );

DROP POLICY IF EXISTS "Owners and Admins may manage business images" ON public.business_images;
CREATE POLICY "Owners and Admins may manage business images"
    ON public.business_images FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = business_images.business_id
              AND (
                b.owner_id = auth.uid()
                OR public.has_role(auth.uid(), 'super_admin')
                OR public.has_role(auth.uid(), 'city_franchise', b.city_id)
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = business_images.business_id
              AND (
                b.owner_id = auth.uid()
                OR public.has_role(auth.uid(), 'super_admin')
                OR public.has_role(auth.uid(), 'city_franchise', b.city_id)
              )
        )
    );

-- -----------------------------------------------------------------------------
-- 11. CLASSIFIED ADS RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public may view active classifieds" ON public.classified_ads;
CREATE POLICY "Public may view active classifieds"
    ON public.classified_ads FOR SELECT
    USING (
        status = 'active'
        OR auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

DROP POLICY IF EXISTS "Users can create classified ads" ON public.classified_ads;
CREATE POLICY "Users can create classified ads"
    ON public.classified_ads FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update own classifieds" ON public.classified_ads;
CREATE POLICY "Owners can update own classifieds"
    ON public.classified_ads FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.has_role(auth.uid(), 'city_franchise', city_id)
    );

DROP POLICY IF EXISTS "Owners can delete own classifieds" ON public.classified_ads;
CREATE POLICY "Owners can delete own classifieds"
    ON public.classified_ads FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR public.has_role(auth.uid(), 'super_admin')
    );

-- -----------------------------------------------------------------------------
-- 12. REVIEWS AND SAVED BUSINESSES RLS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (
        status = 'approved'
        OR auth.uid() = user_id
        OR public.has_role(auth.uid(), 'super_admin')
    );

DROP POLICY IF EXISTS "Authenticated users can submit a review" ON public.reviews;
CREATE POLICY "Authenticated users can submit a review"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their saved businesses" ON public.saved_businesses;
CREATE POLICY "Users can manage their saved businesses"
    ON public.saved_businesses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 13. AUDIT LOGS RLS POLICIES (Super Admin and City Franchise View Only)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only privileged staff can view audit logs" ON public.audit_logs;
CREATE POLICY "Only privileged staff can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (city_id IS NOT NULL AND public.has_role(auth.uid(), 'city_franchise', city_id))
    );

-- -----------------------------------------------------------------------------
-- 14. STORAGE ACCESS HELPER FUNCTIONS & POLICIES (business-images)
-- Strictly Private Bucket: Pending images are confidential and not public.
-- Uses Security Definer helper functions to avoid ambiguous subquery table aliases
-- and cross-schema dependency errors on storage.objects.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_business_image(
    _object_name pg_catalog.text,
    _user_id pg_catalog.uuid DEFAULT NULL
)
RETURNS pg_catalog.bool
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
    _parts pg_catalog.text[];
    _city pg_catalog.text;
    _biz_ref pg_catalog.text;
BEGIN
    _parts := pg_catalog.string_to_array(_object_name, '/');
    IF pg_catalog.array_length(_parts, 1) < 2 THEN
        RETURN false;
    END IF;

    _city := _parts[1];
    _biz_ref := _parts[2];

    -- 1. Super admin has global visibility
    IF _user_id IS NOT NULL AND public.has_role(_user_id, 'super_admin') THEN
        RETURN true;
    END IF;

    -- 2. City franchise can view images within their assigned city
    IF _user_id IS NOT NULL AND public.has_role(_user_id, 'city_franchise', _city) THEN
        RETURN true;
    END IF;

    -- 3. Public can view images if associated business is approved ('active')
    IF EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE (b.id::text = _biz_ref OR b.legacy_id = _biz_ref)
          AND b.status = 'active'
    ) THEN
        RETURN true;
    END IF;

    -- 4. Owner can view their own pending/draft images
    IF _user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE (b.id::text = _biz_ref OR b.legacy_id = _biz_ref)
          AND b.owner_id = _user_id
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_business_image(pg_catalog.text, pg_catalog.uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_business_image(pg_catalog.text, pg_catalog.uuid) TO anon, authenticated, service_role, postgres;

CREATE OR REPLACE FUNCTION public.can_upload_business_image(
    _object_name pg_catalog.text,
    _user_id pg_catalog.uuid
)
RETURNS pg_catalog.bool
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
    _parts pg_catalog.text[];
    _city pg_catalog.text;
    _biz_ref pg_catalog.text;
BEGIN
    IF _user_id IS NULL THEN
        RETURN false;
    END IF;

    _parts := pg_catalog.string_to_array(_object_name, '/');
    -- Path must follow {city_id}/{business_id}/{filename}
    IF pg_catalog.array_length(_parts, 1) < 3 THEN
        RETURN false;
    END IF;

    _city := _parts[1];
    _biz_ref := _parts[2];

    -- 1. Super admin can upload anywhere
    IF public.has_role(_user_id, 'super_admin') THEN
        RETURN true;
    END IF;

    -- 2. City franchise can upload within their city
    IF public.has_role(_user_id, 'city_franchise', _city) THEN
        RETURN true;
    END IF;

    -- 3. Any authenticated user can upload to 'new' listing folder
    IF _biz_ref = 'new' THEN
        RETURN true;
    END IF;

    -- 4. Business owner can upload to their existing business folder
    IF EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE (b.id::text = _biz_ref OR b.legacy_id = _biz_ref)
          AND b.owner_id = _user_id
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.can_upload_business_image(pg_catalog.text, pg_catalog.uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_upload_business_image(pg_catalog.text, pg_catalog.uuid) TO authenticated, service_role, postgres;

-- -----------------------------------------------------------------------------
-- STORAGE BUCKET & STORAGE.OBJECTS RLS POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-images',
    'business-images',
    false, -- STRICTLY PRIVATE BUCKET
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- SELECT: Public can ONLY view images of ACTIVE (approved) businesses.
-- Pending images are confidential and viewable ONLY by their owner or moderators.
DROP POLICY IF EXISTS "Active business images are readable, pending are private" ON storage.objects;
DROP POLICY IF EXISTS "Public can view business images" ON storage.objects;
CREATE POLICY "Active business images are readable, pending are private"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'business-images'
        AND (
            (auth.uid())::text = owner_id
            OR auth.uid() = owner
            OR public.can_access_business_image(name, auth.uid())
        )
    );

-- INSERT: Authenticated users can upload to their own business path or 'new' listing folder
DROP POLICY IF EXISTS "Authorized owners can upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
CREATE POLICY "Authorized owners can upload business images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'business-images'
        AND ((auth.uid())::text = owner_id OR auth.uid() = owner)
        AND public.can_upload_business_image(name, auth.uid())
    );

-- UPDATE: Users can only update their own files (no overwriting another owner's files)
DROP POLICY IF EXISTS "Users can only update their own business images" ON storage.objects;
CREATE POLICY "Users can only update their own business images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'business-images'
        AND (
            (auth.uid())::text = owner_id
            OR auth.uid() = owner
            OR public.has_role(auth.uid(), 'super_admin')
        )
    )
    WITH CHECK (
        bucket_id = 'business-images'
        AND (
            (auth.uid())::text = owner_id
            OR auth.uid() = owner
            OR public.has_role(auth.uid(), 'super_admin')
        )
    );

-- DELETE: Users can only delete their own files
DROP POLICY IF EXISTS "Users can only delete their own business images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their business images" ON storage.objects;
CREATE POLICY "Users can only delete their own business images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'business-images'
        AND (
            (auth.uid())::text = owner_id
            OR auth.uid() = owner
            OR public.has_role(auth.uid(), 'super_admin')
        )
    );
