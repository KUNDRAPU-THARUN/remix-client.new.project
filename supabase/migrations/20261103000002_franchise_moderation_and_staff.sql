-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration: 20261103000002_franchise_moderation_and_staff.sql
-- Status: PROPOSED FOR STAKEHOLDER REVIEW (DO NOT APPLY REMOTELY WITHOUT APPROVAL)
-- Description:
--   1. Privileged audit_logs INSERT policy for verified franchise operators & super admins.
--   2. Atomic, secure database RPC function for business listing moderation (no self-approvals, FOR UPDATE lock).
--   3. Territory-scoped staff directory access policy on public.user_roles.
--   4. Dynamic local content tables (city_theatres, city_banners) with city isolation.
--   5. Performance indexes for city filtering, audit history, and local content.
--
-- DEPLOYMENT PROCEDURE (STAGING FIRST):
--   Step 1: Open Supabase Dashboard -> SQL Editor on Staging Project.
--   Step 2: Execute this migration script in full.
--   Step 3: Run 'scripts/verify-phase-6b-backend.ts' against Staging.
--   Step 4: Verify that moderate_business_listing RPC succeeds and prevents self-approval.
--   Step 5: Apply to Production only after QA Sign-off.
--
-- ROLLBACK PROCEDURE:
--   DROP FUNCTION IF EXISTS public.moderate_business_listing(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT);
--   DROP POLICY IF EXISTS "Privileged staff can insert audit logs" ON public.audit_logs;
--   DROP POLICY IF EXISTS "City Franchise can view staff in assigned city" ON public.user_roles;
--   DROP TABLE IF EXISTS public.city_banners;
--   DROP TABLE IF EXISTS public.city_theatres;
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. AUDIT LOGS PRIVILEGED INSERT POLICY
-- -----------------------------------------------------------------------------
-- Existing RLS on public.audit_logs only defined a SELECT policy.
-- This policy allows verified Super Admins and City Franchise operators to log
-- administrative actions directly within their assigned territory.
DROP POLICY IF EXISTS "Privileged staff can insert audit logs" ON public.audit_logs;
CREATE POLICY "Privileged staff can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR (
        city_id IS NOT NULL 
        AND public.has_role(auth.uid(), 'city_franchise', city_id)
    )
);

-- -----------------------------------------------------------------------------
-- 2. ATOMIC BUSINESS MODERATION RPC (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
-- Executes listing moderation, validation guards, and audit trail insertion in
-- a single atomic database transaction. Guarantees:
--   - Caller must be authenticated (auth.uid() is never trusted from client arguments)
--   - Caller must hold 'super_admin' or 'city_franchise' for the business's city
--   - Row is locked with FOR UPDATE to prevent concurrent race conditions
--   - Business owner CANNOT self-approve, self-verify, or self-feature (anti-tampering)
--   - Cross-city moderation is strictly rejected
--   - Rejection requires at least 3 characters of reason
--   - Status transition is atomic with the audit log entry
CREATE OR REPLACE FUNCTION public.moderate_business_listing(
    _listing_id UUID,
    _action TEXT,                    -- 'approve', 'reject', 'verify_toggle', 'feature_toggle'
    _new_status TEXT DEFAULT NULL,   -- 'active', 'rejected', 'suspended'
    _is_verified BOOLEAN DEFAULT NULL,
    _is_featured BOOLEAN DEFAULT NULL,
    _rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    _caller_id UUID;
    _biz public.businesses%ROWTYPE;
    _final_status TEXT;
    _final_verified BOOLEAN;
    _final_featured BOOLEAN;
    _final_badge TEXT;
    _audit_action TEXT;
    _audit_details JSONB;
BEGIN
    -- 1. Cryptographic caller identity validation from JWT
    _caller_id := auth.uid();
    IF _caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Required: You must be signed in to moderate listings.';
    END IF;

    -- 2. Business retrieval with row-level lock (prevents concurrent race conditions)
    SELECT * INTO _biz 
    FROM public.businesses 
    WHERE id = _listing_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing Not Found: Business with ID % does not exist.', _listing_id;
    END IF;

    -- 3. Server-side territory authorization (never trust browser-supplied city)
    IF NOT (public.has_role(_caller_id, 'super_admin') OR public.has_role(_caller_id, 'city_franchise', _biz.city_id)) THEN
        RAISE EXCEPTION 'Access Denied: You do not have franchise moderation privileges for territory % (%)', _biz.city_id, _biz.name;
    END IF;

    -- 4. Anti-Tampering: Forbid owner self-approval, self-verification, or self-featuring
    IF _biz.owner_id = _caller_id AND _action IN ('approve', 'verify_toggle', 'feature_toggle') THEN
        RAISE EXCEPTION 'Security Violation: Business owners cannot self-approve, self-verify, or self-feature their own listings.';
    END IF;

    -- 5. Process validated action
    IF _action = 'approve' THEN
        _final_status := 'active';
        _final_verified := COALESCE(_is_verified, true);
        _final_featured := COALESCE(_is_featured, _biz.is_featured);
        _final_badge := NULL;
        _audit_action := 'LISTING_APPROVAL';
        _audit_details := jsonb_build_object(
            'previous_status', _biz.status,
            'is_verified', _final_verified,
            'is_featured', _final_featured
        );

    ELSIF _action = 'reject' THEN
        IF _rejection_reason IS NULL OR char_length(trim(_rejection_reason)) < 3 THEN
            RAISE EXCEPTION 'Validation Error: A specific rejection reason (at least 3 characters) is required.';
        END IF;
        _final_status := 'rejected';
        _final_verified := false;
        _final_featured := false;
        _final_badge := 'Rejected: ' || substring(trim(_rejection_reason) from 1 for 40);
        _audit_action := 'LISTING_REJECTION';
        _audit_details := jsonb_build_object(
            'previous_status', _biz.status,
            'reason', trim(_rejection_reason)
        );

    ELSIF _action = 'verify_toggle' THEN
        _final_status := _biz.status;
        _final_verified := COALESCE(_is_verified, NOT _biz.is_verified);
        _final_featured := _biz.is_featured;
        _final_badge := _biz.badge;
        _audit_action := 'VERIFY_TOGGLE';
        _audit_details := jsonb_build_object(
            'previous_verified', _biz.is_verified,
            'is_verified', _final_verified
        );

    ELSIF _action = 'feature_toggle' THEN
        _final_status := _biz.status;
        _final_verified := _biz.is_verified;
        _final_featured := COALESCE(_is_featured, NOT _biz.is_featured);
        _final_badge := _biz.badge;
        _audit_action := 'FEATURE_TOGGLE';
        _audit_details := jsonb_build_object(
            'previous_featured', _biz.is_featured,
            'is_featured', _final_featured
        );

    ELSE
        RAISE EXCEPTION 'Invalid Action: % is not a recognized moderation action.', _action;
    END IF;

    -- 6. Atomic Business Update
    UPDATE public.businesses
    SET
        status = _final_status,
        is_verified = _final_verified,
        is_featured = _final_featured,
        badge = _final_badge,
        updated_at = timezone('utc', now())
    WHERE id = _biz.id;

    -- 7. Atomic Audit Log Creation
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        city_id,
        details,
        created_at
    ) VALUES (
        _caller_id,
        _audit_action,
        'business',
        _biz.id::text,
        _biz.city_id,
        _audit_details,
        timezone('utc', now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'business_id', _biz.id,
        'city_id', _biz.city_id,
        'new_status', _final_status,
        'is_verified', _final_verified,
        'is_featured', _final_featured,
        'action', _audit_action
    );
END;
$$;

-- Secure execution privileges
REVOKE ALL ON FUNCTION public.moderate_business_listing(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_business_listing(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. STAFF DIRECTORY RLS POLICY ON USER_ROLES
-- -----------------------------------------------------------------------------
-- Allows authorized City Franchise operators to view roles assigned within their
-- own city territory (enabling the local staff directory while preserving global privacy).
DROP POLICY IF EXISTS "City Franchise can view staff in assigned city" ON public.user_roles;
CREATE POLICY "City Franchise can view staff in assigned city"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    city_id IS NOT NULL 
    AND public.has_role(auth.uid(), 'city_franchise', city_id)
);

-- -----------------------------------------------------------------------------
-- 4. DYNAMIC LOCAL CONTENT REFERENCE TABLES (THEATRES, ATTRACTIONS, BANNERS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.city_theatres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    screen_type TEXT NOT NULL DEFAULT '2D / Dolby Atmos',
    locality TEXT NOT NULL,
    current_movie TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'Tamil',
    showtimes TEXT[] NOT NULL DEFAULT '{}',
    ticket_status TEXT NOT NULL DEFAULT 'Available' CHECK (ticket_status IN ('Available', 'Fast Filling', 'Sold Out')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.city_theatres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active city theatres" ON public.city_theatres;
CREATE POLICY "Public can view active city theatres"
ON public.city_theatres FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id));

DROP POLICY IF EXISTS "Franchise can manage city theatres" ON public.city_theatres;
CREATE POLICY "Franchise can manage city theatres"
ON public.city_theatres FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id))
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id));

CREATE TABLE IF NOT EXISTS public.city_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    target_url TEXT,
    placement TEXT NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero', 'sidebar', 'footer')),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.city_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active city banners" ON public.city_banners;
CREATE POLICY "Public can view active city banners"
ON public.city_banners FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id));

DROP POLICY IF EXISTS "Franchise can manage city banners" ON public.city_banners;
CREATE POLICY "Franchise can manage city banners"
ON public.city_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id))
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id));

-- -----------------------------------------------------------------------------
-- 5. PERFORMANCE AND ISOLATION INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_businesses_city_status ON public.businesses (city_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_city_created ON public.audit_logs (city_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_theatres_city_active ON public.city_theatres (city_id, is_active);
CREATE INDEX IF NOT EXISTS idx_city_banners_city_active ON public.city_banners (city_id, is_active);

