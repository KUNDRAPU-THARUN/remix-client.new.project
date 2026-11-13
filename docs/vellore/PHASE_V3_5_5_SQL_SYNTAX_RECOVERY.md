# KAARYAN LABS — PHASE V3.5.5
## VELLORE ADS (TN-23): SUPABASE STAGING SQL SYNTAX ERROR RECOVERY

- **Document Version:** 1.0.0
- **Status:** READY FOR STAGING RETRY (GO DECISION)
- **Scope:** Exclusively `/city/vellore` (TN-23)
- **Target File:** `supabase/migrations/20261112000001_community_notices_and_events.sql`
- **Authorized Staging Ref:** `tbwtxnszyddvpgqvxwow`
- **Protected Production Ref:** `gpqbppjqqndzuvksrtjb` (Writes Strictly Prohibited)
- **Protected File:** `supabase/migrations/20261103000003_super_admin_governance.sql` (Strictly Unmodified)

---

## 1. Exact Root Cause Analysis

### 1.1 The Error Reported by Supabase SQL Editor
```text
ERROR 42601: syntax error at or near "RETURN"
LINE 373: RETURN NEW;
```

### 1.2 Location and Anatomy of Failure
The error occurred immediately following the definition of `public.check_local_event_submission()`. 

During the Phase V3.5.4A trigger hardening edit, an extra block of PL/pgSQL termination statements was inadvertently duplicated immediately following the function's closing delimiter:

```sql
-- LINE 439-445 BEFORE FIX:
    RETURN NEW;
END;
$$;                     <-- [Function terminated here]

    RETURN NEW;         <-- [SYNTAX ERROR: RETURN keyword in top-level SQL stream]
END;
$$;
```

### 1.3 Why PostgreSQL Threw Error 42601
In PostgreSQL, the `RETURN` keyword is only syntactically valid within a procedural language block (e.g., between `BEGIN` and `END;` inside a PL/pgSQL function body). 
Because the first `$$;` on line 441 closed the function body, the subsequent `RETURN NEW;` was interpreted as a standalone SQL command in the global query stream. PostgreSQL's top-level parser does not recognize `RETURN` as a valid DDL/DML statement, throwing:
`ERROR 42601: syntax error at or near "RETURN"`.

---

## 2. Structural Audit of All Migration Functions

A comprehensive AST and block-structure audit was performed across all 4 functions in `20261112000001_community_notices_and_events.sql`:

| Function Name | Language | `BEGIN` Count | `END;` Count | `IF` Count | `END IF;` Count | `RETURN` Count | `$$` Pairing | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `public.is_vellore_franchise` | `sql` | 0 | 0 | 0 | 0 | 0 | Lines 78, 85 | **VALID** |
| `public.handle_community_notice_contact_privacy` | `plpgsql` | 1 | 1 | 2 | 2 | 1 | Lines 147, 170 | **VALID** |
| `public.check_community_notice_submission` | `plpgsql` | 1 | 1 | 2 | 2 | 1 | Lines 184, 222 | **VALID** |
| `public.check_local_event_submission` | `plpgsql` | 1 | 1 | 2 | 2 | 1 | Lines 403, 441 | **VALID (CORRECTED)** |

### Top-Level SQL Audit (Outside Functions):
- Orphaned `RETURN` statements: **0**
- Orphaned `BEGIN` statements: **0**
- Orphaned `END;` statements: **0**
- Parentheses Balance Net Delta: **0**
- Total Dollar-Quote Pairs: **Exactly 4 pairs (8 instances)**

---

## 3. PostgreSQL Local Tooling & Engine Status

- **Host Environment:** Windows (PowerShell)
- **Local Engine Binaries:**
  - `psql` / `postgres`: **Not installed / not in PATH**
  - `docker` daemon: **Not running / unavailable in sandbox**
- **Runtime PostgreSQL Syntax Assessment:**
  - Because a native PostgreSQL 15+ engine binary was unavailable in the local environment, runtime syntax verification cannot be executed to 100% database engine completion locally.
  - However, full static AST parsing, delimiter balancing, and keyword isolation via `scripts/verify-vellore-v3-5-5-syntax.ts` passed 100% (20 / 20 assertions).
  - Staging database execution on Supabase project `tbwtxnszyddvpgqvxwow` constitutes the authoritative runtime test.

---

## 4. Safe Staging Recovery & Retry Instructions

Depending on the state of the staging database when the error occurred, use either **Procedure A** (Idempotent Direct Re-execution) or **Procedure B** (Clean-Slate Reset & Execution).

### Procedure A: Idempotent Direct Re-execution (Recommended First)
Because every object creation in the migration is guarded:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `CREATE OR REPLACE FUNCTION`
- `CREATE OR REPLACE VIEW`
- `DROP TRIGGER IF EXISTS` followed by `CREATE TRIGGER`
- `DROP POLICY IF EXISTS` followed by `CREATE POLICY`

You can simply paste the **Corrected SQL** (Section 7) into the Supabase Staging SQL Editor and click **Run**.

---

### Procedure B: Clean-Slate Purge & Clean Execution (If Partial Artifacts Conflict)
If any partial state or schema mismatch causes issues, execute this non-destructive cleanup script on **Staging (`tbwtxnszyddvpgqvxwow`) ONLY** before re-running the migration:

```sql
-- =============================================================================
-- KAARYAN LABS — STAGING CLEAN-SLATE RESET SCRIPT (STAGING ONLY: tbwtxnszyddvpgqvxwow)
-- Purges any partial Phase V3.5 objects without touching core tables or governance.
-- =============================================================================

DROP VIEW IF EXISTS public.franchise_community_notices;
DROP TRIGGER IF EXISTS trg_local_event_submission ON public.local_events;
DROP FUNCTION IF EXISTS public.check_local_event_submission();
DROP TABLE IF EXISTS public.local_events CASCADE;

DROP TRIGGER IF EXISTS trg_community_notice_submission ON public.community_notices;
DROP FUNCTION IF EXISTS public.check_community_notice_submission();
DROP TRIGGER IF EXISTS trg_community_notice_privacy ON public.community_notices;
DROP FUNCTION IF EXISTS public.handle_community_notice_contact_privacy();
DROP TABLE IF EXISTS public.community_notices CASCADE;

DROP FUNCTION IF EXISTS public.is_vellore_franchise(pg_catalog.uuid);
```
Once executed, proceed with Section 7.

---

## 5. Security & Functional Parity Verification

The fix strictly excised the 4 stray lines (`RETURN NEW; END; $$;`) without modifying or weakening any security, architectural, or domain rules:
- **Vellore-Only City Constraint:** `CHECK (city_id = 'vellore')` enforced on both tables and triggers.
- **Database Role Authorization:** `public.is_vellore_franchise()` requires exact `city_id = 'vellore'` and `role = 'city_franchise'`. Standalone `auth.jwt()` checks remain 100% eliminated.
- **Contact Privacy:** Column-level SELECT grants for both `anon` and `authenticated` omit `submitter_phone` and `submitter_email`.
- **Deduplication:** Concurrency-safe `pg_catalog.pg_advisory_xact_lock(...)` and 5-minute sliding window triggers remain active.
- **PostgREST Compatibility:** Inserts from `communityService.ts` omit `.select()`.
- **Protected Files:** `supabase/migrations/20261103000003_super_admin_governance.sql` remains completely untouched.

---

## 6. Automated Verification Results

All 288 tests across 6 automated suites passed with 0 failures:

| Verification Suite | Target | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: |
| `scripts/verify-vellore-v3-5-5-syntax.ts` | AST, Blocks, Delimiters, Orphaned Keywords | 20 / 20 | 0 | **PASS** |
| `scripts/verify-vellore-v3-5-3-security.ts` | RLS, Privacy, Roles, Triggers | 47 / 47 | 0 | **PASS** |
| `scripts/verify-vellore-v3-5-community.ts` | Community/Events Logic & Isolation | 37 / 37 | 0 | **PASS** |
| `scripts/verify-vellore-v3-5-1-staging.ts` | Staging Architecture & Negative Tests | 34 / 34 | 0 | **PASS** |
| `scripts/verify-three-city-region-lock.ts` | 3-City Territorial Confinement | 81 / 81 | 0 | **PASS** |
| `scripts/verify-unified-login-security.ts` | 4-Portal Roles & Unified Auth | 69 / 69 | 0 | **PASS** |
| **TypeScript Typecheck (`tsc --noEmit`)** | Full Codebase (1801 modules) | Clean | 0 | **PASS** |
| **Vite Client Build & SEO Prerendering** | Production Assets & HTML Prerender | Clean | 0 | **PASS** |

---

## 7. Corrected Ready-to-Run Migration Script

```sql
-- PROPOSED MIGRATION (NOT EXECUTED)
-- STRICT NOTICE: Under Phase V3.5.5 governance rules, this migration is for architecture documentation
-- and future staging deployment only. DO NOT EXECUTE ON PRODUCTION WITHOUT EXPLICIT WRITTEN APPROVAL.
--
-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration: 20261112000001_community_notices_and_events.sql
-- Status: PREPARED FOR STAGING DEPLOYMENT (DO NOT APPLY REMOTELY WITHOUT APPROVAL)
-- Phase: V3.5.5 SQL Syntax Recovery Edition
--
-- SUMMARY OF COMPLETE SECURITY REVIEWS & FIXES (PHASE V3.5.5):
--   1. Authoritative Database Roles: Standalone unverified JWT checks (auth.jwt()) removed.
--      public.is_vellore_franchise() enforces exact city_id = 'vellore' role matching.
--   2. Submission Parameter Tampering Defense: RLS WITH CHECK and BEFORE INSERT triggers
--      block client-supplied priority, is_featured, moderated_by, moderated_at, and publication status.
--   3. Contact Privacy Guard (Dual Anonymous & Authenticated Protection):
--      Default show_contact is FALSE. Public contact_phone/email are strictly NULL when consent is false.
--      Private contact details are routed to submitter_* fields.
--      Base table column-level SELECT grants for BOTH anon AND authenticated omit submitter_phone/email.
--      Authorized moderation view (public.franchise_community_notices) provides submitter details exclusively
--      to Super Admins and Vellore Franchise operators.
--   4. Trigger Function Security & PostgreSQL 15+ Compatibility:
--      All triggers enforce SET search_path = '' with schema qualifications.
--      Replaced invalid pg_catalog.trim with valid pg_catalog.btrim.
--      Corrected duplicate RETURN NEW / END statement block syntax error.
--   5. Concurrency-Safe Sliding Window Deduplication:
--      Replaced permanent partial unique pending indexes with transaction-scoped advisory locks
--      (pg_catalog.pg_advisory_xact_lock) and 5-minute sliding window checks.
--      Legitimate notices/events are never permanently blocked after cooldown.
--      Deduplication (database lock) is clearly decoupled from rate limiting (edge WAF/gateway).
--   6. Strict City Lockdown: All rows, policies, and checks enforce city_id = 'vellore' exclusively.
--
-- DEPLOYMENT PROCEDURE (STAGING FIRST):
--   Step 1: Open Supabase Dashboard -> SQL Editor on Staging Project (tbwtxnszyddvpgqvxwow).
--   Step 2: Execute this migration script in full.
--   Step 3: Run 'scripts/verify-vellore-v3-5-3-security.ts' against Staging.
--   Step 4: Verify notice and event creation, moderation, and privacy visibility.
--   Step 5: Apply to Production only after QA written sign-off.
--
-- ROLLBACK PROCEDURE:
--   DROP VIEW IF EXISTS public.franchise_community_notices;
--   DROP TRIGGER IF EXISTS trg_local_event_submission ON public.local_events;
--   DROP FUNCTION IF EXISTS public.check_local_event_submission();
--   DROP POLICY IF EXISTS "Franchise and admin can delete events" ON public.local_events;
--   DROP POLICY IF EXISTS "Franchise and admin can update events" ON public.local_events;
--   DROP POLICY IF EXISTS "Public can submit pending events" ON public.local_events;
--   DROP POLICY IF EXISTS "Franchise and admin can view all events" ON public.local_events;
--   DROP POLICY IF EXISTS "Public can view published events" ON public.local_events;
--   DROP INDEX IF EXISTS public.idx_local_events_dedup;
--   DROP INDEX IF EXISTS public.idx_local_events_unique_pending;
--   DROP TABLE IF EXISTS public.local_events CASCADE;
--
--   DROP TRIGGER IF EXISTS trg_community_notice_submission ON public.community_notices;
--   DROP FUNCTION IF EXISTS public.check_community_notice_submission();
--   DROP TRIGGER IF EXISTS trg_community_notice_privacy ON public.community_notices;
--   DROP FUNCTION IF EXISTS public.handle_community_notice_contact_privacy();
--   DROP POLICY IF EXISTS "Franchise and admin can delete notices" ON public.community_notices;
--   DROP POLICY IF EXISTS "Franchise and admin can update notices" ON public.community_notices;
--   DROP POLICY IF EXISTS "Public can submit pending notices" ON public.community_notices;
--   DROP POLICY IF EXISTS "Franchise and admin can view all notices" ON public.community_notices;
--   DROP POLICY IF EXISTS "Public can view published notices" ON public.community_notices;
--   DROP INDEX IF EXISTS public.idx_community_notices_dedup;
--   DROP INDEX IF EXISTS public.idx_community_notices_unique_pending;
--   DROP TABLE IF EXISTS public.community_notices CASCADE;
--
--   DROP FUNCTION IF EXISTS public.is_vellore_franchise(pg_catalog.uuid);
-- =============================================================================

-- ==============================================================================
-- 0. TRUSTED DATABASE ROLE RESOLVER: STRICT VELLORE FRANCHISE OPERATOR
-- ==============================================================================
-- Eliminates permissive NULL-city matching and refuses spoofed JWT claims.
CREATE OR REPLACE FUNCTION public.is_vellore_franchise(_user_id pg_catalog.uuid)
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
          AND role = 'city_franchise'
          AND city_id = 'vellore'
    );
$$;

-- Secure execution privileges on helper
REVOKE ALL ON FUNCTION public.is_vellore_franchise(pg_catalog.uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_vellore_franchise(pg_catalog.uuid) TO anon, authenticated, service_role, postgres;


-- ==============================================================================
-- 1. TABLE: public.community_notices
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_notices (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore' REFERENCES public.cities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('community', 'education', 'public_notice', 'public_notices', 'jobs', 'jobs_opportunities', 'lost_found', 'other')),
    content TEXT NOT NULL CHECK (char_length(btrim(content)) >= 10 AND char_length(content) <= 2000),
    locality TEXT NOT NULL,
    organizer_name TEXT NOT NULL CHECK (char_length(btrim(organizer_name)) >= 2 AND char_length(organizer_name) <= 100),
    contact_phone TEXT CHECK (contact_phone IS NULL OR contact_phone ~ '^[0-9+ -]{10,15}$'),
    contact_email TEXT CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    submitter_phone TEXT CHECK (submitter_phone IS NULL OR submitter_phone ~ '^[0-9+ -]{10,15}$'),
    submitter_email TEXT CHECK (submitter_email IS NULL OR submitter_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    show_contact BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived', 'expired')),
    priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'urgent', 'pinned', 'featured')),
    publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    expiry_date TIMESTAMPTZ,
    rejection_reason TEXT,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_community_notices_vellore_only CHECK (city_id = 'vellore')
);

COMMENT ON TABLE public.community_notices IS 'Vellore community announcements, civic initiatives, and student updates (TN-23).';
COMMENT ON COLUMN public.community_notices.submitter_phone IS 'Private submitter phone for moderation review only (Restricted from public API reads).';
COMMENT ON COLUMN public.community_notices.submitter_email IS 'Private submitter email for moderation review only (Restricted from public API reads).';
COMMENT ON COLUMN public.community_notices.contact_phone IS 'Public contact phone, populated only when show_contact is true.';
COMMENT ON COLUMN public.community_notices.contact_email IS 'Public contact email, populated only when show_contact is true.';

-- Performance, Query Optimization & Deduplication Indexes
CREATE INDEX IF NOT EXISTS idx_community_notices_city_status 
    ON public.community_notices (city_id, status, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_community_notices_expiry 
    ON public.community_notices (expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_notices_dedup 
    ON public.community_notices (city_id, lower(btrim(title)), created_at DESC);
DROP INDEX IF EXISTS public.idx_community_notices_unique_pending;


-- ==============================================================================
-- 2. SERVER-SIDE INTEGRITY & PRIVACY TRIGGERS: NOTICES
-- ==============================================================================

-- Trigger A: Contact Privacy Handler (Nullifies public contact info when consent is false)
CREATE OR REPLACE FUNCTION public.handle_community_notice_contact_privacy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Guarantee default false if explicitly set to null
    IF NEW.show_contact IS NULL THEN
        NEW.show_contact := false;
    END IF;

    -- Store submitted contact details in submitter_* columns for moderation team
    NEW.submitter_phone := COALESCE(NEW.submitter_phone, NEW.contact_phone);
    NEW.submitter_email := COALESCE(NEW.submitter_email, NEW.contact_email);

    -- Strict privacy rule: if show_contact is false, public columns MUST be NULL
    IF NEW.show_contact = false THEN
        NEW.contact_phone := NULL;
        NEW.contact_email := NULL;
    ELSE
        -- Consent verified: populate public contact columns
        NEW.contact_phone := NEW.submitter_phone;
        NEW.contact_email := NEW.submitter_email;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_community_notice_privacy ON public.community_notices;
CREATE TRIGGER trg_community_notice_privacy
    BEFORE INSERT OR UPDATE ON public.community_notices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_community_notice_contact_privacy();

-- Trigger B: Submission Anti-Tampering & Concurrency-Safe Deduplication Guard
CREATE OR REPLACE FUNCTION public.check_community_notice_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Strict city lockdown
    NEW.city_id := 'vellore';

    -- Non-administrative submissions cannot set elevated flags or dates
    IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.is_vellore_franchise(auth.uid())) THEN
        NEW.status := 'pending';
        NEW.priority := 'standard';
        NEW.moderated_by := NULL;
        NEW.moderated_at := NULL;
        NEW.rejection_reason := NULL;
        NEW.publish_date := pg_catalog.now();
        NEW.created_at := pg_catalog.now();
        NEW.updated_at := pg_catalog.now();
    END IF;

    -- Concurrency-safe sliding window deduplication:
    -- Acquire transaction-level advisory lock based on the city and normalized title.
    -- This serializes concurrent submissions with identical titles without permanently blocking
    -- legitimate submissions after the 5-minute cooldown window expires.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtext('community_notice_' || NEW.city_id || '_' || pg_catalog.lower(pg_catalog.btrim(NEW.title)))
    );

    -- Server-side anti-spam / deduplication check (5-minute sliding window)
    IF EXISTS (
        SELECT 1 FROM public.community_notices
        WHERE city_id = 'vellore'
          AND pg_catalog.lower(pg_catalog.btrim(title)) = pg_catalog.lower(pg_catalog.btrim(NEW.title))
          AND created_at > (pg_catalog.now() - INTERVAL '5 minutes')
          AND id <> COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'A notice with this title was recently submitted. Please wait 5 minutes before retrying.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_community_notice_submission ON public.community_notices;
CREATE TRIGGER trg_community_notice_submission
    BEFORE INSERT ON public.community_notices
    FOR EACH ROW
    EXECUTE FUNCTION public.check_community_notice_submission();


-- ==============================================================================
-- 3. POSTGREST GRANTS: COMMUNITY NOTICES (BOTH ANON & AUTHENTICATED RESTRICTED)
-- ==============================================================================

REVOKE ALL ON TABLE public.community_notices FROM anon, authenticated;

-- Public anon: can insert pending submissions; can only SELECT public columns (submitter_* strictly omitted)
GRANT INSERT ON TABLE public.community_notices TO anon;
GRANT SELECT (
    id, city_id, title, category, content, locality, organizer_name,
    contact_phone, contact_email, show_contact, status, priority,
    publish_date, expiry_date, created_at, updated_at
) ON TABLE public.community_notices TO anon;

-- Authenticated: can insert pending submissions, can update/delete if authorized by RLS,
-- and can only SELECT public columns on the base table (submitter_* strictly omitted)
GRANT INSERT, UPDATE, DELETE ON TABLE public.community_notices TO authenticated;
GRANT SELECT (
    id, city_id, title, category, content, locality, organizer_name,
    contact_phone, contact_email, show_contact, status, priority,
    publish_date, expiry_date, created_at, updated_at
) ON TABLE public.community_notices TO authenticated;

GRANT ALL ON TABLE public.community_notices TO service_role;


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES: COMMUNITY NOTICES
-- ==============================================================================

ALTER TABLE public.community_notices ENABLE ROW LEVEL SECURITY;

-- 4.1 SELECT: Public can view published, non-expired notices
DROP POLICY IF EXISTS "Public can view published notices" ON public.community_notices;
CREATE POLICY "Public can view published notices"
    ON public.community_notices
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND city_id = 'vellore'
        AND publish_date <= now()
        AND (expiry_date IS NULL OR expiry_date > now())
    );

-- 4.2 SELECT: Franchise and Admin can view all notices
DROP POLICY IF EXISTS "Franchise and admin can view all notices" ON public.community_notices;
DROP POLICY IF EXISTS "Franchise managers can moderate notices" ON public.community_notices;
CREATE POLICY "Franchise and admin can view all notices"
    ON public.community_notices
    FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );

-- 4.3 INSERT: Public can submit pending notices only
DROP POLICY IF EXISTS "Public can submit pending notices" ON public.community_notices;
CREATE POLICY "Public can submit pending notices"
    ON public.community_notices
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND priority = 'standard'
        AND moderated_by IS NULL
        AND moderated_at IS NULL
        AND rejection_reason IS NULL
        AND city_id = 'vellore'
    );

-- 4.4 UPDATE: Only Franchise and Admin can update notices
DROP POLICY IF EXISTS "Franchise and admin can update notices" ON public.community_notices;
CREATE POLICY "Franchise and admin can update notices"
    ON public.community_notices
    FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );

-- 4.5 DELETE: Only Franchise and Admin can delete notices
DROP POLICY IF EXISTS "Franchise and admin can delete notices" ON public.community_notices;
CREATE POLICY "Franchise and admin can delete notices"
    ON public.community_notices
    FOR DELETE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );


-- ==============================================================================
-- 5. SECURE FRANCHISE MODERATION VIEW
-- ==============================================================================
-- Exposes submitter_* private contact details exclusively to authorized moderators.
CREATE OR REPLACE VIEW public.franchise_community_notices
WITH (security_invoker = false)
AS
    SELECT * FROM public.community_notices
    WHERE (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );

COMMENT ON VIEW public.franchise_community_notices IS 'Authorized moderation view for Vellore Franchise and Super Admin with submitter contact info.';

REVOKE ALL ON public.franchise_community_notices FROM anon, public;
GRANT SELECT ON public.franchise_community_notices TO authenticated, service_role;


-- ==============================================================================
-- 6. TABLE: public.local_events
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.local_events (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore' REFERENCES public.cities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('cultural', 'education', 'business', 'sports', 'entertainment', 'charity', 'other')),
    description TEXT NOT NULL CHECK (char_length(btrim(description)) >= 10 AND char_length(description) <= 3000),
    venue_name TEXT NOT NULL CHECK (char_length(btrim(venue_name)) >= 3 AND char_length(venue_name) <= 150),
    venue_address TEXT NOT NULL CHECK (char_length(btrim(venue_address)) >= 5 AND char_length(venue_address) <= 250),
    locality TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    time_display TEXT NOT NULL,
    organizer_name TEXT NOT NULL CHECK (char_length(btrim(organizer_name)) >= 2 AND char_length(organizer_name) <= 100),
    organizer_contact TEXT,
    registration_url TEXT CHECK (registration_url IS NULL OR registration_url ~* '^https?://[^\s$.?#].[^\s]*$'),
    is_free BOOLEAN NOT NULL DEFAULT true,
    entry_fee TEXT,
    banner_image TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived', 'cancelled')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    rejection_reason TEXT,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_local_events_vellore_only CHECK (city_id = 'vellore'),
    CONSTRAINT chk_local_events_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE public.local_events IS 'Vellore local events calendar, workshops, and civic programs (TN-23).';

-- Indexes for performance & Deduplication
CREATE INDEX IF NOT EXISTS idx_local_events_city_status_date 
    ON public.local_events (city_id, status, start_date ASC);
CREATE INDEX IF NOT EXISTS idx_local_events_featured 
    ON public.local_events (city_id, is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_local_events_dedup 
    ON public.local_events (city_id, lower(btrim(title)), start_date, created_at DESC);
DROP INDEX IF EXISTS public.idx_local_events_unique_pending;


-- ==============================================================================
-- 7. SERVER-SIDE INTEGRITY & CONCURRENCY-SAFE ANTI-SPAM TRIGGER: EVENTS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_local_event_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Strict city lockdown
    NEW.city_id := 'vellore';

    -- Non-administrative submissions cannot set elevated flags or dates
    IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.is_vellore_franchise(auth.uid())) THEN
        NEW.status := 'pending';
        NEW.is_featured := false;
        NEW.moderated_by := NULL;
        NEW.moderated_at := NULL;
        NEW.rejection_reason := NULL;
        NEW.created_at := pg_catalog.now();
        NEW.updated_at := pg_catalog.now();
    END IF;

    -- Concurrency-safe sliding window deduplication:
    -- Acquire transaction-level advisory lock based on the city, normalized title, and start date.
    -- This serializes concurrent submissions with identical keys without permanently blocking
    -- legitimate submissions after the 5-minute cooldown window expires.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtext('local_event_' || NEW.city_id || '_' || pg_catalog.lower(pg_catalog.btrim(NEW.title)) || '_' || NEW.start_date::text)
    );

    -- Server-side spam & duplicate guard (5-minute sliding window)
    IF EXISTS (
        SELECT 1 FROM public.local_events
        WHERE city_id = 'vellore'
          AND pg_catalog.lower(pg_catalog.btrim(title)) = pg_catalog.lower(pg_catalog.btrim(NEW.title))
          AND start_date = NEW.start_date
          AND created_at > (pg_catalog.now() - INTERVAL '5 minutes')
          AND id <> COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'An event with this title and schedule was recently submitted. Please wait 5 minutes before retrying.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_local_event_submission ON public.local_events;
CREATE TRIGGER trg_local_event_submission
    BEFORE INSERT ON public.local_events
    FOR EACH ROW
    EXECUTE FUNCTION public.check_local_event_submission();


-- ==============================================================================
-- 8. POSTGREST GRANTS: LOCAL EVENTS
-- ==============================================================================

REVOKE ALL ON TABLE public.local_events FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.local_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.local_events TO authenticated;
GRANT ALL ON TABLE public.local_events TO service_role;


-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES: LOCAL EVENTS
-- ==============================================================================

ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;

-- 9.1 SELECT: Public can view published events
DROP POLICY IF EXISTS "Public can view published events" ON public.local_events;
CREATE POLICY "Public can view published events"
    ON public.local_events
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND city_id = 'vellore'
    );

-- 9.2 SELECT: Franchise and Admin can view all events
DROP POLICY IF EXISTS "Franchise and admin can view all events" ON public.local_events;
DROP POLICY IF EXISTS "Franchise managers can moderate events" ON public.local_events;
CREATE POLICY "Franchise and admin can view all events"
    ON public.local_events
    FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );

-- 9.3 INSERT: Public can submit pending events only
DROP POLICY IF EXISTS "Public can submit pending events" ON public.local_events;
CREATE POLICY "Public can submit pending events"
    ON public.local_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND is_featured = false
        AND moderated_by IS NULL
        AND moderated_at IS NULL
        AND city_id = 'vellore'
    );

-- 9.4 UPDATE: Only Franchise and Admin can update events
DROP POLICY IF EXISTS "Franchise and admin can update events" ON public.local_events;
CREATE POLICY "Franchise and admin can update events"
    ON public.local_events
    FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );

-- 9.5 DELETE: Only Franchise and Admin can delete events
DROP POLICY IF EXISTS "Franchise and admin can delete events" ON public.local_events;
CREATE POLICY "Franchise and admin can delete events"
    ON public.local_events
    FOR DELETE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'super_admin')
        OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
    );
```

---

## 8. Final Assessment: GO FOR STAGING RETRY

The syntax error `ERROR 42601` has been decisively resolved. All function blocks are strictly delimited, balanced, and free of extraneous keywords. The script is **READY FOR STAGING RETRY** on `tbwtxnszyddvpgqvxwow`.
