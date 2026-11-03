-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration: 20261103000003_super_admin_governance.sql
-- Status: PROPOSED FOR STAKEHOLDER REVIEW (DO NOT APPLY REMOTELY WITHOUT APPROVAL)
-- Description:
--   1. Privileged user_profiles UPDATE policy for verified Super Admins (account suspension & activation).
--   2. Multi-city governance performance indexes for audit trails and role resolution.
--   3. Explicit read permissions for Super Admins on local content tables.
--
-- DEPLOYMENT PROCEDURE (STAGING FIRST):
--   Step 1: Open Supabase Dashboard -> SQL Editor on Staging Project.
--   Step 2: Execute this migration script in full.
--   Step 3: Run 'scripts/verify-phase-7b-admin.ts' against Staging.
--   Step 4: Verify that Super Admin can update user account_status in public.user_profiles.
--   Step 5: Apply to Production only after QA Sign-off.
--
-- ROLLBACK PROCEDURE:
--   DROP POLICY IF EXISTS "Super Admins may update all user profiles" ON public.user_profiles;
--   DROP INDEX IF EXISTS idx_user_roles_composite;
--   DROP INDEX IF EXISTS idx_audit_logs_created_desc;
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
-- 2. COMPOSITE PERFORMANCE & GOVERNANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_roles_composite 
ON public.user_roles (user_id, role, city_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_desc 
ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_city_status 
ON public.customer_enquiries (city_id, status);

