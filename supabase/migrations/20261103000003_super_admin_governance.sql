-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration: 20261103000003_super_admin_governance.sql
-- Status: PROPOSED FOR STAKEHOLDER REVIEW (DO NOT APPLY REMOTELY WITHOUT APPROVAL)
-- Description:
--   1. Privileged user_profiles UPDATE policy for verified Super Admins.
--   2. Integrity trigger on user_profiles preventing ordinary users from altering account_status or identity.
--   3. Secure atomic RPC public.admin_set_user_status with audit logging.
--   4. Secure atomic RPC public.admin_assign_user_role with anti-lockout protection.
--   5. Multi-city governance performance indexes for audit trails and role resolution.
--
-- DEPLOYMENT PROCEDURE (STAGING FIRST):
--   Step 1: Open Supabase Dashboard -> SQL Editor on Staging Project.
--   Step 2: Execute this migration script in full.
--   Step 3: Run 'scripts/verify-phase-7c-admin.ts' against Staging.
--   Step 4: Verify that Super Admin can update user account_status in public.user_profiles.
--   Step 5: Verify that ordinary users CANNOT alter their own account_status.
--   Step 6: Apply to Production only after QA Sign-off.
--
-- ROLLBACK PROCEDURE:
--   DROP TRIGGER IF EXISTS trg_protect_user_profile_integrity ON public.user_profiles;
--   DROP FUNCTION IF EXISTS public.protect_user_profile_integrity();
--   DROP FUNCTION IF EXISTS public.admin_set_user_status(UUID, TEXT);
--   DROP FUNCTION IF EXISTS public.admin_assign_user_role(UUID, TEXT, TEXT);
--   DROP POLICY IF EXISTS "Super Admins may update all user profiles" ON public.user_profiles;
--   DROP INDEX IF EXISTS idx_user_roles_composite;
--   DROP INDEX IF EXISTS idx_audit_logs_created_desc;
--   DROP INDEX IF EXISTS idx_customer_enquiries_city_status;
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SUPER ADMIN USER PROFILES UPDATE POLICY
-- -----------------------------------------------------------------------------
-- Existing RLS on public.user_profiles only allowed users to update their own profile (auth.uid() = id).
-- This policy allows verified Super Admins to manage user accounts (e.g. suspension, reactivation).
DROP POLICY IF EXISTS "Super Admins may update all user profiles" ON public.user_profiles;
CREATE POLICY "Super Admins may update all user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- -----------------------------------------------------------------------------
-- 2. USER PROFILE INTEGRITY & ANTI-TAMPERING TRIGGER
-- -----------------------------------------------------------------------------
-- Prevents ordinary users from self-activating suspended accounts
-- and prevents unauthorized modification of immutable identity fields.
CREATE OR REPLACE FUNCTION public.protect_user_profile_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent altering auth user ID
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Security Violation: Cannot modify user identity ID.';
    END IF;

    -- Prevent altering creation timestamp
    IF NEW.created_at <> OLD.created_at THEN
        NEW.created_at := OLD.created_at;
    END IF;

    -- Prevent non-super-admins from changing account_status
    IF NEW.account_status <> OLD.account_status THEN
        IF NOT public.has_role(auth.uid(), 'super_admin') THEN
            RAISE EXCEPTION 'Security Violation: Only Super Administrators may modify account status.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_profile_integrity ON public.user_profiles;
CREATE TRIGGER trg_protect_user_profile_integrity
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_user_profile_integrity();

-- -----------------------------------------------------------------------------
-- 3. SECURE RPC: ATOMIC USER STATUS MANAGEMENT
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
    _target_user_id UUID,
    _new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    _caller_id UUID;
    _old_status TEXT;
BEGIN
    _caller_id := auth.uid();
    IF _caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Required: Must be logged in to modify user status.';
    END IF;

    IF NOT public.has_role(_caller_id, 'super_admin') THEN
        RAISE EXCEPTION 'Access Denied: Only Super Administrators may modify user account status.';
    END IF;

    IF _new_status NOT IN ('active', 'suspended', 'pending_verification') THEN
        RAISE EXCEPTION 'Validation Error: Invalid status %. Must be active, suspended, or pending_verification.', _new_status;
    END IF;

    IF _target_user_id = _caller_id AND _new_status = 'suspended' THEN
        RAISE EXCEPTION 'Security Violation: Super Administrators cannot suspend their own account.';
    END IF;

    SELECT account_status INTO _old_status FROM public.user_profiles WHERE id = _target_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not Found: Target user profile % does not exist.', _target_user_id;
    END IF;

    UPDATE public.user_profiles
    SET account_status = _new_status,
        updated_at = timezone('utc', now())
    WHERE id = _target_user_id;

    -- Atomic audit log
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
        CASE WHEN _new_status = 'suspended' THEN 'USER_SUSPENDED' ELSE 'USER_ACTIVATED' END,
        'user_profile',
        _target_user_id::text,
        NULL,
        jsonb_build_object('old_status', _old_status, 'new_status', _new_status),
        timezone('utc', now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', _target_user_id,
        'old_status', _old_status,
        'new_status', _new_status
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. SECURE RPC: ATOMIC USER ROLE ASSIGNMENT
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_assign_user_role(
    _target_user_id UUID,
    _role TEXT,
    _city_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    _caller_id UUID;
    _old_role TEXT;
BEGIN
    _caller_id := auth.uid();
    IF _caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Required: Must be logged in to modify user roles.';
    END IF;

    IF NOT public.has_role(_caller_id, 'super_admin') THEN
        RAISE EXCEPTION 'Access Denied: Only Super Administrators may assign user roles.';
    END IF;

    IF _role NOT IN ('customer', 'business_owner', 'data_entry_staff', 'city_franchise', 'super_admin') THEN
        RAISE EXCEPTION 'Validation Error: Invalid role %.', _role;
    END IF;

    IF _city_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.cities WHERE id = _city_id) THEN
            RAISE EXCEPTION 'Validation Error: Target city % does not exist.', _city_id;
        END IF;
    END IF;

    SELECT role INTO _old_role FROM public.user_roles WHERE user_id = _target_user_id LIMIT 1;

    -- Replace existing roles atomically
    DELETE FROM public.user_roles WHERE user_id = _target_user_id;

    INSERT INTO public.user_roles (
        user_id,
        role,
        city_id,
        assigned_by,
        created_at
    ) VALUES (
        _target_user_id,
        _role,
        _city_id,
        _caller_id,
        timezone('utc', now())
    );

    -- Atomic audit log
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
        'ROLE_CHANGE',
        'user_role',
        _target_user_id::text,
        _city_id,
        jsonb_build_object('old_role', _old_role, 'new_role', _role, 'city_id', _city_id),
        timezone('utc', now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', _target_user_id,
        'role', _role,
        'city_id', _city_id
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. COMPOSITE PERFORMANCE & GOVERNANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_roles_composite 
ON public.user_roles (user_id, role, city_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_desc 
ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_city_status 
ON public.customer_enquiries (city_id, status);
