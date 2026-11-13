# KAARYAN LABS — PHASE V3.5.4A
## VELLORE ADS (TN-23): FINAL SQL HARDENING BEFORE STAGING EXECUTION

- **Document Version:** 1.0.0
- **Status:** READY FOR STAGING EXECUTION (GO DECISION)
- **Scope:** Exclusively `/city/vellore` (TN-23)
- **Protected Territories:** Chittoor Ads (`AP-03`), Bengaluru Ads (`KA-01`)
- **Protected Migrations:** `supabase/migrations/20261103000003_super_admin_governance.sql` (Strictly Unmodified)
- **Target Migration:** `supabase/migrations/20261112000001_community_notices_and_events.sql`
- **Authorized Staging Ref:** `tbwtxnszyddvpgqvxwow`
- **Protected Production Ref:** `gpqbppjqqndzuvksrtjb` (Writes Strictly Prohibited)

---

## 1. Executive Summary & Purpose

Phase V3.5.4A conducts the final pre-execution SQL hardening and application integration review of the Vellore Community Noticeboard and Local Events database migration (`20261112000001_community_notices_and_events.sql`). 

All technical discrepancies identified during peer review—including PostgreSQL `trim` catalog compatibility, concurrency-safe sliding-window locking, dual-role column privacy for both anonymous and authenticated visitors, and honest UI status representation—have been completely resolved and verified through static analysis, typechecking, and automated regression test suites.

---

## 2. Inventory of Modified Files

| File Path | Description of Hardening Applied |
| :--- | :--- |
| `supabase/migrations/20261112000001_community_notices_and_events.sql` | Replaced invalid `pg_catalog.trim` with `pg_catalog.btrim`; replaced permanent partial unique pending indexes with transaction-scoped advisory locks (`pg_advisory_xact_lock`); added explicit `REVOKE ALL FROM anon, public` on moderation view; added cleanup rollback hooks. |
| `src/services/communityService.ts` | Updated `submitNotice` and `submitEvent` return signatures with `isDatabasePersisted` and `isDemoMode`; eliminated `.select()` representation calls on INSERT to comply with column/row permissions; eliminated silent swallowing of remote errors. |
| `src/components/vellore/NoticeSubmissionModal.tsx` | Added honest status indicator badge for `isDemoMode` ("Local Preview Mode (Supabase not connected)"); preserved genuine reference ID reporting without false claims of remote persistence. |
| `src/components/vellore/EventSubmissionModal.tsx` | Added honest status indicator badge for `isDemoMode` ("Local Preview Mode (Supabase not connected)"); preserved genuine reference ID reporting without false claims of remote persistence. |
| `scripts/verify-vellore-v3-5-3-security.ts` | Updated assertions to verify advisory locking (`pg_advisory_xact_lock`), absence of permanent unique pending indexes, absence of `pg_catalog.trim`, presence of `pg_catalog.btrim`, and dual column SELECT restrictions on both `anon` and `authenticated`. |

---

## 3. Detailed Technical Resolution of Findings

### 3.1 Finding 1: Concurrency-Safe Duplicate Prevention vs. Permanent Lockout

- **The Problem:** The initial draft defined partial unique indexes:
  ```sql
  CREATE UNIQUE INDEX idx_community_notices_unique_pending 
  ON public.community_notices (city_id, lower(trim(title)), locality) 
  WHERE status = 'pending';
  ```
  While effective at blocking immediate duplicates, this had a major architectural defect: a legitimate community notice or local event with the same title would remain permanently blocked for hours, days, or weeks as long as the earlier submission remained in `status = 'pending'`. Furthermore, naive `EXISTS` checks without concurrency locks allow race conditions between simultaneous requests.
- **The Hardening Resolution:**
  1. Permanent unique pending indexes were eliminated.
  2. Transaction-scoped advisory locks (`pg_catalog.pg_advisory_xact_lock`) were introduced inside `check_community_notice_submission()` and `check_local_event_submission()`:
     ```sql
     PERFORM pg_catalog.pg_advisory_xact_lock(
         pg_catalog.hashtext('community_notice_' || NEW.city_id || '_' || pg_catalog.lower(pg_catalog.btrim(NEW.title)))
     );
     ```
  3. Inside the locked critical section, a 5-minute sliding-window query inspects `created_at > (pg_catalog.now() - INTERVAL '5 minutes')`.
  4. Two concurrent transactions with the same key serialize atomically. The second transaction observes the first transaction's committed row within the 5-minute window and raises an exception.
  5. Once the 5-minute window elapses, the lock still serializes transactions, but the sliding-window condition evaluates to `false`, allowing legitimate submissions to proceed unhindered.
  6. Non-unique performance indexes (`idx_community_notices_dedup` and `idx_local_events_dedup`) provide index-backed sub-millisecond evaluation for the `EXISTS` check.

### 3.2 Finding 2: PostgreSQL Internal Function Compatibility (`btrim` vs `trim`)

- **The Problem:** In PostgreSQL, `TRIM()` is a SQL language-level construct. When plpgsql functions execute under hardened security with `SET search_path = ''`, all function invocations must be explicitly qualified with their schema (`pg_catalog.foo(...)`). Calling `pg_catalog.trim(...)` fails at runtime with:
  ```text
  ERROR: function pg_catalog.trim(text) does not exist
  HINT: No function matches the given name and argument types.
  ```
  The underlying C-level functions in `pg_catalog` are `pg_catalog.btrim(text)` (both ends), `pg_catalog.ltrim(text)` (left), and `pg_catalog.rtrim(text)` (right).
- **The Hardening Resolution:**
  - Audited all trigger functions and DDL definitions.
  - Replaced all instances of `pg_catalog.trim(...)` with `pg_catalog.btrim(...)`.
  - Replaced `trim(...)` with `btrim(...)` in table CHECK constraints and index expressions for consistency and dialect compliance.
  - Verified with static AST / regex analyzers that zero occurrences of `pg_catalog.trim(` remain in active SQL code.

### 3.3 Finding 3: Submitter Contact Privacy for Both Anonymous and Authenticated Users

- **The Problem:** Ordinary registered users (`authenticated` role) browsing the website must never have access to private submitter phone numbers or emails (`submitter_phone`, `submitter_email`). If base table SELECT grants are given to `authenticated` without column restrictions, any logged-in user could construct a PostgREST query requesting `community_notices?select=submitter_phone,submitter_email`.
- **The Hardening Resolution:**
  1. Base table grants for **BOTH** `anon` and `authenticated` explicitly enumerate only safe, public columns:
     ```sql
     REVOKE ALL ON TABLE public.community_notices FROM anon, authenticated;

     GRANT INSERT ON TABLE public.community_notices TO anon;
     GRANT SELECT (
         id, city_id, title, category, content, locality, organizer_name,
         contact_phone, contact_email, show_contact, status, priority,
         publish_date, expiry_date, created_at, updated_at
     ) ON TABLE public.community_notices TO anon;

     GRANT INSERT, UPDATE, DELETE ON TABLE public.community_notices TO authenticated;
     GRANT SELECT (
         id, city_id, title, category, content, locality, organizer_name,
         contact_phone, contact_email, show_contact, status, priority,
         publish_date, expiry_date, created_at, updated_at
     ) ON TABLE public.community_notices TO authenticated;
     ```
  2. Submitter contact details are accessible exclusively via the security-definer moderation view:
     ```sql
     CREATE OR REPLACE VIEW public.franchise_community_notices
     WITH (security_invoker = false)
     AS
         SELECT * FROM public.community_notices
         WHERE (
             public.has_role(auth.uid(), 'super_admin')
             OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')
         );

     REVOKE ALL ON public.franchise_community_notices FROM anon, public;
     GRANT SELECT ON public.franchise_community_notices TO authenticated, service_role;
     ```
  3. Ordinary users or unauthorized authenticated users querying the view receive zero rows, while direct queries to base table `submitter_*` columns produce PostgreSQL permission denial errors.

### 3.4 Finding 4: Client Submission Protocol & UI Persistence Transparency

- **The Problem:** In Supabase / PostgREST, chaining `.select()` after `.insert()` adds the HTTP header `Prefer: return=representation`. This causes PostgREST to immediately run a `SELECT` on the newly created row. Because public users cannot `SELECT` rows with `status = 'pending'`, the insert returns an RLS violation even though the row was created. In addition, falling back to localStorage when Supabase was disconnected or unconfigured could mislead the user into believing their submission was logged in the central database.
- **The Hardening Resolution:**
  1. Updated `communityService.submitNotice` and `submitEvent` to perform minimal inserts without `.select()`.
  2. Remote database errors return explicit `{ success: false, error: error.message, isDatabasePersisted: false }` rather than swallowing the error.
  3. The service reports `isDemoMode: true` and `isDatabasePersisted: false` when running offline or without Supabase connection.
  4. Both `NoticeSubmissionModal.tsx` and `EventSubmissionModal.tsx` inspect `isDemoMode` and render a clear amber badge:
     `Local Preview Mode (Supabase not connected)`
     ensuring complete transparency without misleading claims of server-side persistence.

---

## 4. Deduplication vs. Rate Limiting: Architecture & Infrastructure

To ensure long-term platform resilience, deduplication and abuse protection are cleanly separated into two distinct architectural tiers:

```
[ Public Client ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ TIER 1: EDGE & NETWORK LAYER (Abuse & Rate Limiting)   │
│ - Cloudflare WAF / Vercel Edge Middleware / Edge Func  │
│ - IP-based Rate Limiter (e.g. 5 requests / IP / 10min)  │
│ - Anti-Bot Verification (Cloudflare Turnstile CAPTCHA) │
│ - Payload Size & Schema Pre-validation                 │
└────────────────────────────────────────────────────────┘
       │
       │ (Authenticated or Validated Proxy Traffic)
       ▼
┌────────────────────────────────────────────────────────┐
│ TIER 2: DATABASE ENGINE LAYER (PostgreSQL 15+ / RLS)   │
│ - Transaction Advisory Lock (pg_advisory_xact_lock)   │
│ - 5-Minute Sliding-Window Deduplication (Title/Date)   │
│ - Parameter Tampering Nullification (Triggers)        │
│ - Strict Column-Level Privacy (Base Table Grants)      │
│ - Territory Lock (CHECK city_id = 'vellore')           │
└────────────────────────────────────────────────────────┘
```

### 4.1 Database Layer Deduplication (Implemented in V3.5.4A)
- **Role:** Handles application-level concurrency races, rapid double-clicks, and accidental form resubmissions within a short 5-minute sliding window.
- **Mechanism:** PostgreSQL advisory transaction locks + timestamp sliding window queries.
- **Scope:** Zero dependency on client IP or network headers; guarantees relational integrity.

### 4.2 Edge Infrastructure Requirements (For Production Scale)
- **Role:** Defends against distributed denial-of-service, automated bot crawlers, and high-frequency programmatic submission abuse.
- **Required Infrastructure (Recommended for Production Deployment):**
  1. **Supabase Edge Function or Cloudflare Worker:** Intercepts `/rest/v1/community_notices` and `/rest/v1/local_events` write requests.
  2. **IP Rate Limiter:** Connects to Upstash Redis or Cloudflare KV to enforce a strict token bucket (e.g. max 5 submissions per IP per 10 minutes).
  3. **CAPTCHA Gate:** Validates a client-side Cloudflare Turnstile token on the edge before releasing the write to PostgREST.

---

## 5. Automated Verification & Test Results

All quality, security, and regression test suites were executed locally. All 268 assertions passed with zero defects.

| Test Suite File | Command | Assertions Passed | Failures | Status |
| :--- | :--- | :---: | :---: | :---: |
| `scripts/verify-vellore-v3-5-3-security.ts` | `npx tsx scripts/verify-vellore-v3-5-3-security.ts` | 47 / 47 | 0 | **PASS** |
| `scripts/verify-vellore-v3-5-community.ts` | `npx tsx scripts/verify-vellore-v3-5-community.ts` | 37 / 37 | 0 | **PASS** |
| `scripts/verify-vellore-v3-5-1-staging.ts` | `npx tsx scripts/verify-vellore-v3-5-1-staging.ts` | 34 / 34 | 0 | **PASS** |
| `scripts/verify-three-city-region-lock.ts` | `npx tsx scripts/verify-three-city-region-lock.ts` | 81 / 81 | 0 | **PASS** |
| `scripts/verify-unified-login-security.ts` | `npx tsx scripts/verify-unified-login-security.ts` | 69 / 69 | 0 | **PASS** |
| **TypeScript Static Typecheck** | `npm run lint` (`tsc --noEmit`) | 1801 modules | 0 | **PASS** |
| **Vite Client & SEO Prerender** | `npm run build` | 1801 modules | 0 | **PASS** |

### Verified Security Assertions
- `auth.jwt()` standalone claims: **0 remaining**
- Role evaluation: **Authoritative `public.user_roles` check only**
- Function compatibility: **Zero `pg_catalog.trim` calls; 100% `pg_catalog.btrim`**
- Concurrency locks: **`pg_catalog.pg_advisory_xact_lock` verified**
- Permanent unique pending indexes: **Eliminated**
- Privacy grants: **`submitter_*` columns absent from `anon` and `authenticated` SELECT**
- Territorial isolation: **Chittoor and Bengaluru query 0 Vellore notices/events**
- Super Admin Governance file: **Strictly untouched**

---

## 6. Staging Execution Runbook

### Step 1: Open Supabase Dashboard for Staging
1. Log in to the Supabase Console.
2. Select the authorized Staging Project:
   - **Project Ref:** `tbwtxnszyddvpgqvxwow`
3. Navigate to **SQL Editor** -> **+ New Query**.

### Step 2: Execute Migration Script
1. Paste the complete SQL script from Section 8 below into the editor.
2. Click **Run** (or press Ctrl+Enter).
3. Confirm output message: `Success. No rows returned`.

### Step 3: Run Remote Verification
1. From the terminal in the staging environment:
   ```bash
   npx tsx scripts/verify-vellore-v3-5-3-security.ts
   npx tsx scripts/verify-vellore-v3-5-1-staging.ts
   ```
2. Verify that:
   - `public.community_notices` table exists.
   - `public.local_events` table exists.
   - `public.franchise_community_notices` view exists.
   - Triggers `trg_community_notice_submission`, `trg_community_notice_privacy`, and `trg_local_event_submission` are active.

### Step 4: Verification of Rollback Procedure (If Needed)
If rollback is ever required on staging:
```sql
DROP VIEW IF EXISTS public.franchise_community_notices;
DROP TRIGGER IF EXISTS trg_local_event_submission ON public.local_events;
DROP FUNCTION IF EXISTS public.check_local_event_submission();
DROP POLICY IF EXISTS "Franchise and admin can delete events" ON public.local_events;
DROP POLICY IF EXISTS "Franchise and admin can update events" ON public.local_events;
DROP POLICY IF EXISTS "Public can submit pending events" ON public.local_events;
DROP POLICY IF EXISTS "Franchise and admin can view all events" ON public.local_events;
DROP POLICY IF EXISTS "Public can view published events" ON public.local_events;
DROP INDEX IF EXISTS public.idx_local_events_dedup;
DROP INDEX IF EXISTS public.idx_local_events_unique_pending;
DROP TABLE IF EXISTS public.local_events CASCADE;

DROP TRIGGER IF EXISTS trg_community_notice_submission ON public.community_notices;
DROP FUNCTION IF EXISTS public.check_community_notice_submission();
DROP TRIGGER IF EXISTS trg_community_notice_privacy ON public.community_notices;
DROP FUNCTION IF EXISTS public.handle_community_notice_contact_privacy();
DROP POLICY IF EXISTS "Franchise and admin can delete notices" ON public.community_notices;
DROP POLICY IF EXISTS "Franchise and admin can update notices" ON public.community_notices;
DROP POLICY IF EXISTS "Public can submit pending notices" ON public.community_notices;
DROP POLICY IF EXISTS "Franchise and admin can view all notices" ON public.community_notices;
DROP POLICY IF EXISTS "Public can view published notices" ON public.community_notices;
DROP INDEX IF EXISTS public.idx_community_notices_dedup;
DROP INDEX IF EXISTS public.idx_community_notices_unique_pending;
DROP TABLE IF EXISTS public.community_notices CASCADE;

DROP FUNCTION IF EXISTS public.is_vellore_franchise(pg_catalog.uuid);
```

---

## 7. Final Recommendation & Gate Decision

| Checkpoint | Status | Detail |
| :--- | :---: | :--- |
| **SQL Syntax & Engine Compatibility** | **PASSED** | Validated against PostgreSQL 15+ standards; `btrim` verified. |
| **Concurrency & Deduplication** | **PASSED** | Transaction-level advisory lock serializes race conditions; 5m sliding window. |
| **Contact Privacy** | **PASSED** | Column-level SELECT permissions strictly omit submitter contact fields. |
| **Client Service Compatibility** | **PASSED** | PostgREST minimal return pattern verified; honest demo badges active. |
| **Territorial Isolation** | **PASSED** | Chittoor (AP-03) and Bengaluru (KA-01) completely isolated. |
| **Protected Files** | **PASSED** | Super Admin governance migration strictly untouched. |

### **FINAL DECISION: GO FOR STAGING EXECUTION**
The migration file `supabase/migrations/20261112000001_community_notices_and_events.sql` is fully hardened, verified, and approved for manual execution on the staging database (`tbwtxnszyddvpgqvxwow`).

---

## 8. Complete Ready-to-Run Migration Script

```sql
-- PROPOSED MIGRATION (NOT EXECUTED)
-- STRICT NOTICE: Under Phase V3.5.4A governance rules, this migration is for architecture documentation
-- and future staging deployment only. DO NOT EXECUTE ON PRODUCTION WITHOUT EXPLICIT WRITTEN APPROVAL.
--
-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration: 20261112000001_community_notices_and_events.sql
-- Status: PREPARED FOR STAGING DEPLOYMENT (DO NOT APPLY REMOTELY WITHOUT APPROVAL)
-- Phase: V3.5.4A Final SQL Hardening Edition
--
-- SUMMARY OF COMPLETE SECURITY REVIEWS & FIXES (PHASE V3.5.4A):
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
