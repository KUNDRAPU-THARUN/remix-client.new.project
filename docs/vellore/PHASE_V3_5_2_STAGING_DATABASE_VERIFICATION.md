# KAARYAN LABS — PHASE V3.5.2
## VELLORE ADS (TN-23): STAGING MIGRATION & LIVE DATABASE VERIFICATION REPORT

**Project:** KAARYAN LABS Multi-City Platform (`remix-client.new.project`)  
**Scope:** Strictly `/city/vellore` (TN-23)  
**Protected Territories:** Chittoor Ads (`AP-03`), Bengaluru Ads (`KA-01`)  
**Lead Auditor:** Senior Supabase PostgreSQL Engineer, Application Security Specialist & QA Lead  
**Audit Date:** November 12, 2026  
**Target Staging Project:** `tbwtxnszyddvpgqvxwow`  
**Target Production / Dev Project:** `gpqbppjqqndzuvksrtjb`  
**Final Production Recommendation:** **CONDITIONAL GO (HOLD PENDING STAGING QA SIGN-OFF)**  

---

## 1. Executive Summary & Audit Scope

Phase V3.5.2 conducts the formal pre-migration database audit, staging environment availability assessment, PostgreSQL 15+ security review, and client integration verification for the **Vellore Community Noticeboard** and **Local Events Calendar** modules introduced in Phase V3.5.

### Strict Governance Rules Enforced:
1. **Zero Production Writes:** The production/dev database (`gpqbppjqqndzuvksrtjb`) was strictly protected; no test writes or migration executions were performed against production.
2. **Untouched Governance Migration:** `supabase/migrations/20261103000003_super_admin_governance.sql` is strictly preserved and unmodified.
3. **Territorial Isolation:** Chittoor Ads (`AP-03`) and Bengaluru Ads (`KA-01`) routing, components, and permissions remain 100% untouched.
4. **Credential Security:** Zero secret keys, service-role tokens, or passwords are logged, committed, or exposed.
5. **No Automatic Commits/Pushes:** Working tree changes are preserved without automatic git commit or deployment.
6. **Rigorous Evidence Classification:**
   - `STATIC VERIFIED`: Verified through code review, AST inspection, static types, build execution, and mock contract suites.
   - `STAGING LIVE VERIFIED`: Verified through live network calls and database writes against Staging (`tbwtxnszyddvpgqvxwow`).
   - `BLOCKED`: Workflows requiring resources not provisioned in the local environment (staging credentials).
   - `NOT TESTED`: Prohibited actions (e.g., executing test mutations on production).
   - `FAILED`: Any test failing to meet defined assertions.

---

## 2. Staging Environment Availability Assessment

### 2.1 Local Environment Inspection
An inspection of the workspace configuration files (`.env.local`, `supabase/.temp/project-ref`, and `supabase/.temp/linked-project.json`) revealed the following:

| Configuration Resource | Detected Target | Target Ref | Status |
| :--- | :--- | :--- | :--- |
| **`.env.local`** | Production / Dev Instance | `gpqbppjqqndzuvksrtjb` | Active (Read/Write Blocked for Safety) |
| **`supabase/.temp/project-ref`** | `kaaryan-localads-dev` | `gpqbppjqqndzuvksrtjb` | Cached CLI Link |
| **`supabase/.temp/linked-project.json`** | Organization `obtpeberxvvylmzhmoec` | `gpqbppjqqndzuvksrtjb` | Linked Project Cache |
| **Staging Environment** | Authorized Staging Project | `tbwtxnszyddvpgqvxwow` | **Not Configured Locally** |

### 2.2 Finding & Availability Conclusion
- **Staging Access Status:** **BLOCKED (Credentials Not Provisioned in Local Session)**.
- Staging Supabase project URL (`https://tbwtxnszyddvpgqvxwow.supabase.co`) and anon/service keys are not configured in the developer environment.
- In strict adherence to project safety protocols:
  > *"If staging access is unavailable, document exact manual steps and stop before migration execution."*  
  > *"Never claim database integration is complete until an authorized staging environment has been tested successfully."*
- Therefore, live database write operations against staging are paused until credentials are provided or the migration is manually applied via the Supabase Dashboard SQL Editor.

---

## 3. Migration SQL Security Review & Analysis

The proposed migration file `supabase/migrations/20261112000001_community_notices_and_events.sql` was evaluated against PostgreSQL 15+ standards, OWASP top 10 security guidelines, and Supabase RLS best practices.

### 3.1 Table Schema & Integrity Constraints

#### Table 1: `public.community_notices`
```sql
CREATE TABLE IF NOT EXISTS public.community_notices (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore' REFERENCES public.cities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('community', 'education', 'public_notice', 'public_notices', 'jobs', 'jobs_opportunities', 'lost_found', 'other')),
    content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 2000),
    locality TEXT NOT NULL,
    organizer_name TEXT NOT NULL CHECK (char_length(organizer_name) >= 2 AND char_length(organizer_name) <= 100),
    contact_phone TEXT CHECK (contact_phone IS NULL OR contact_phone ~ '^[0-9+ -]{10,15}$'),
    contact_email TEXT CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    show_contact BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived', 'expired')),
    priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'urgent', 'pinned', 'featured')),
    publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    expiry_date TIMESTAMPTZ,
    rejection_reason TEXT,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Table 2: `public.local_events`
```sql
CREATE TABLE IF NOT EXISTS public.local_events (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore' REFERENCES public.cities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('cultural', 'education', 'business', 'sports', 'entertainment', 'charity', 'other')),
    description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 3000),
    venue_name TEXT NOT NULL CHECK (char_length(venue_name) >= 3 AND char_length(venue_name) <= 150),
    venue_address TEXT NOT NULL CHECK (char_length(venue_address) >= 5 AND char_length(venue_address) <= 250),
    locality TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    time_display TEXT NOT NULL,
    organizer_name TEXT NOT NULL CHECK (char_length(organizer_name) >= 2 AND char_length(organizer_name) <= 100),
    organizer_contact TEXT,
    registration_url TEXT CHECK (registration_url IS NULL OR registration_url ~* '^https?://[^\s$.?#].[^\s]*$'),
    is_free BOOLEAN NOT NULL DEFAULT true,
    entry_fee TEXT,
    banner_image TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived', 'cancelled')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_local_events_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
```

### 3.2 Key Security & Integrity Findings

1. **Foreign Key Integrity (`REFERENCES public.cities(id) ON DELETE RESTRICT`):**
   - **Finding:** Every notice and event record is bound to a valid territory registered in `public.cities`.
   - **Benefit:** Guarantees zero orphan records and prevents deletion of an active city row while notices/events exist.
2. **Payload Bounds & Anti-Spam Constraints:**
   - **Finding:** Hard `CHECK` constraints on `char_length` enforce character bounds directly in the storage engine (e.g. titles: 5–120 chars; descriptions: 10–3000 chars).
   - **Benefit:** Protects against single-word spam, empty payloads, and database bloat attacks.
3. **Anti-XSS Protocol Guard:**
   - **Finding:** `registration_url` is constrained by POSIX regex `^https?://[^\s$.?#].[^\s]*$`.
   - **Benefit:** Eliminates injection of executable pseudo-protocols such as `javascript:alert(1)`, `data:text/html,...`, or `vbscript:`.
4. **Date Consistency Constraint:**
   - **Finding:** `chk_local_events_dates CHECK (end_date IS NULL OR end_date >= start_date)`.
   - **Benefit:** Prevents logical errors where events appear to conclude prior to their start time.
5. **PostgREST API Permissions:**
   - **Finding:** Explicit `GRANT SELECT, INSERT ON ... TO anon, authenticated;` and `GRANT UPDATE, DELETE ON ... TO authenticated;`.
   - **Benefit:** Prevents runtime `42501 (permission denied)` PostgREST errors.

### 3.3 Row Level Security (RLS) Policy Architecture

Row Level Security is explicitly activated on both tables:
```sql
ALTER TABLE public.community_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;
```

#### Policy Evaluation Matrix:

| Table | Operation | Target Role | Policy Condition | Security Invariant |
| :--- | :--- | :--- | :--- | :--- |
| `community_notices` | `SELECT` | `anon`, `authenticated` | `status = 'published' AND publish_date <= now() AND (expiry_date IS NULL OR expiry_date > now())` | Public consumers can never observe `pending`, `rejected`, or expired notices. |
| `community_notices` | `INSERT` | `anon`, `authenticated` | `WITH CHECK (status = 'pending')` | External submitters cannot inject auto-approved or `published` notices. |
| `community_notices` | `ALL` | `authenticated` (Franchise/Admin) | `public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id) OR auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'city_id' = city_id` | Franchise moderation is strictly partitioned by `city_id`. Cross-city moderation is blocked. Super Admin has platform-wide access. |
| `local_events` | `SELECT` | `anon`, `authenticated` | `status = 'published'` | Unapproved events remain completely invisible to the public. |
| `local_events` | `INSERT` | `anon`, `authenticated` | `WITH CHECK (status = 'pending')` | External submissions must start in `pending` moderation. |
| `local_events` | `ALL` | `authenticated` (Franchise/Admin) | `public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'city_franchise', city_id) OR auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'city_id' = city_id` | Enforces territorial boundary on event moderation. |

---

## 4. Pre-Flight Staging Schema Validation Query

Before executing the migration script on the Staging project (`tbwtxnszyddvpgqvxwow`), run this diagnostic query in the Supabase SQL Editor:

```sql
-- =============================================================================
-- KAARYAN LABS — PRE-FLIGHT SCHEMA CHECK FOR STAGING (tbwtxnszyddvpgqvxwow)
-- Run this in Supabase SQL Editor before applying migration 20261112000001
-- =============================================================================

-- 1. Check if target tables already exist
SELECT 
    expected.table_name,
    CASE 
        WHEN t.table_name IS NOT NULL THEN 'CONFLICT: Table already exists'
        ELSE 'OK: Ready for creation'
    END AS table_status
FROM (VALUES ('community_notices'), ('local_events')) AS expected(table_name)
LEFT JOIN information_schema.tables t 
    ON t.table_schema = 'public' AND t.table_name = expected.table_name;

-- 2. Check if foreign key target (public.cities) exists and contains active cities
SELECT 
    id, 
    name, 
    code, 
    status 
FROM public.cities 
WHERE id IN ('vellore', 'chittoor', 'bengaluru');

-- 3. Check if public.has_role function exists with required parameters
SELECT 
    routine_name, 
    routine_type, 
    data_type AS return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'has_role';

-- 4. Check if RLS is enabled on existing platform tables
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cities', 'listings', 'customer_enquiries');
```

### Expected Pre-Flight Outputs:
1. `table_status` for both `community_notices` and `local_events` must report `'OK: Ready for creation'`.
2. `public.cities` must return rows for `'vellore'`, `'chittoor'`, and `'bengaluru'`.
3. `public.has_role` must return `routine_type = 'FUNCTION'` and `return_type = 'boolean'`.

---

## 5. Step-by-Step Staging Execution & Verification Guide

When access to the Staging project (`tbwtxnszyddvpgqvxwow`) is granted, follow this step-by-step procedure:

### Phase A: Migration Execution
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/tbwtxnszyddvpgqvxwow).
2. Navigate to **SQL Editor** -> **+ New Query**.
3. Paste the contents of `supabase/migrations/20261112000001_community_notices_and_events.sql`.
4. Click **Run** and verify execution completes with `"Success. No rows returned"`.

### Phase B: Post-Migration Schema Verification
Run the following verification query on Staging:
```sql
-- Verify created tables
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('community_notices', 'local_events');

-- Verify created indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' AND tablename IN ('community_notices', 'local_events');

-- Verify RLS policies
SELECT tablename, policyname, cmd, roles FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('community_notices', 'local_events');
```
*Pass Criteria:* Both tables report `rowsecurity = true`. 4 indexes and 6 policies are reported.

### Phase C: Live Lifecycle & Moderation Test Matrix

Execute the test operations using PostgREST or Supabase JS client with Staging credentials:

| Step | Operation | Role / Token | Expected Outcome | Verification Query |
| :--- | :--- | :--- | :--- | :--- |
| **ST-01** | Insert Notice | `anon` | Record inserted with `status = 'pending'` | `INSERT INTO community_notices (id, city_id, title, category, content, locality, organizer_name) VALUES ('test-stg-01', 'vellore', 'Blood Donation Camp CMC', 'community', 'Annual camp at CMC auditorium Katpadi', 'Katpadi', 'Red Cross Unit');` |
| **ST-02** | Public Read Check | `anon` | Returns 0 rows (pending record hidden) | `SELECT * FROM community_notices WHERE id = 'test-stg-01';` (Must return 0 records) |
| **ST-03** | Franchise Moderation | `authenticated` (Vellore Franchise) | Record retrieved and updated to `'published'` | `UPDATE community_notices SET status = 'published', moderated_by = 'test-mod' WHERE id = 'test-stg-01';` |
| **ST-04** | Public Visibility Check | `anon` | Record is now returned in public query | `SELECT id, title, status FROM community_notices WHERE id = 'test-stg-01';` (Must return 1 record) |
| **ST-05** | Cross-City Isolation | `anon` | Chittoor query returns 0 Vellore records | `SELECT * FROM community_notices WHERE city_id = 'chittoor' AND id = 'test-stg-01';` (Must return 0 records) |
| **ST-06** | Negative URL Check | `anon` | Database rejects `javascript:` URL | `INSERT INTO local_events (id, city_id, title, category, description, venue_name, venue_address, locality, start_date, time_display, organizer_name, registration_url) VALUES ('test-bad-url', 'vellore', 'Bad URL Event', 'cultural', 'Testing XSS prevention in database', 'Auditorium', 'Main Rd', 'Katpadi', now(), '10:00 AM', 'Test Org', 'javascript:alert(1)');` -> **Must throw constraint error**. |
| **ST-07** | Cleanup | `service_role` | Remove test rows | `DELETE FROM community_notices WHERE id = 'test-stg-01';` |

---

## 6. Client Integration & Type Safety Verification

### 6.1 Database Types Synchronization
`src/types/database.types.ts` has been synchronized with the proposed schema:
- `Database['public']['Tables']['community_notices']`:
  - `Row`, `Insert`, `Update` types defined with matching nullability, enums, and timestamps.
- `Database['public']['Tables']['local_events']`:
  - `Row`, `Insert`, `Update` types defined with proper string, boolean, and date fields.
- `Database['public']['Functions']['has_role']`:
  - Typed with args `_user_id: string`, `_role: string`, `_city_id?: string | null` returning `boolean`.

### 6.2 Service Defensive Resilience
`src/services/communityService.ts` was audited and confirmed to implement:
1. **Defensive Remote Synchronization:** Attempts Supabase PostgREST queries if credentials are active; gracefully falls back to local storage and seed mock data if the database table is unmigrated or unreachable.
2. **Anti-Spam Deduplication:** Enforces a 5-minute idempotency window to block rapid resubmissions.
3. **URL Protocol Sanitization:** Client-side validator `isValidWebUrl()` permits only `http://` and `https://` before sending payloads to Supabase.
4. **Honest Delivery Signals:** When operating in local/demo mode, references are explicitly flagged, and fictional server delivery confirmations are eliminated.

---

## 7. Quality & Regression Verification Results

All automated verification suites across the platform were executed. Zero failures were recorded.

| Test Suite | File / Command | Scope | Assertions | Result | Evidence Classification |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **TypeScript Typecheck** | `npm run lint` (`tsc --noEmit`) | Entire Project | Full codebase | **0 errors** | `STATIC VERIFIED` |
| **Production Build & Prerender** | `npm run build` | Bundle + 7 HTML prerenders | 7 routes | **PASS** | `STATIC VERIFIED` |
| **Phase V3.5 Community Suite** | `scripts/verify-vellore-v3-5-community.ts` | Routing, URLs, Modals, Anti-XSS | 37 | **37 / 37 PASS** | `STATIC VERIFIED` |
| **Phase V3.5.1 Staging Simulation** | `scripts/verify-vellore-v3-5-1-staging.ts` | Lifecycle simulation, RLS check | 34 | **34 / 34 PASS** | `STATIC VERIFIED` |
| **Phase V3.4 Enquiry Suite** | `scripts/verify-vellore-v3-4-enquiry.ts` | WhatsApp CTAs, privacy notices | 43 | **43 / 43 PASS** | `STATIC VERIFIED` |
| **Phase V3.4.1 Live Suite** | `scripts/verify-vellore-v3-4-1-live.ts` | Lead routing, franchise queries | 35 | **35 / 35 PASS** | `STATIC VERIFIED` |
| **Phase V3.3 Directory Suite** | `scripts/verify-vellore-v3-3-directory.ts` | Operating hours, galleries | 68 | **68 / 68 PASS** | `STATIC VERIFIED` |
| **Phase V3.2 Features Suite** | `scripts/verify-vellore-v3-2-features.ts` | About, Contact, Biz routes | 50 | **50 / 50 PASS** | `STATIC VERIFIED` |
| **Region Lock Security** | `scripts/verify-three-city-region-lock.ts` | Multi-city security gates | 81 | **81 / 81 PASS** | `STATIC VERIFIED` |
| **Unified Login Security** | `scripts/verify-unified-login-security.ts` | 4-portal access matrix | 69 | **69 / 69 PASS** | `STATIC VERIFIED` |
| **Staging Live Writes** | PostgREST network operations | Staging (`tbwtxnszyddvpgqvxwow`) | - | **PAUSED** | `BLOCKED (No Local Staging Creds)` |
| **Production Live Writes** | Mutation operations | Prod (`gpqbppjqqndzuvksrtjb`) | - | **HELD** | `NOT TESTED (Protected Policy)` |
| **TOTAL AUTOMATED CHECKS** | - | - | **417** | **417 / 417 PASS** | **100% STATIC COMPLIANCE** |

---

## 8. Safe Rollback Procedure

If rollback of migration `20261112000001_community_notices_and_events.sql` is required at any point on Staging or Production, execute the following script in the Supabase SQL Editor:

```sql
-- =============================================================================
-- KAARYAN LABS — SAFE ROLLBACK SCRIPT FOR PHASE V3.5
-- Target Tables: public.community_notices, public.local_events
-- =============================================================================

-- 1. Drop Noticeboard RLS Policies
DROP POLICY IF EXISTS "Franchise managers can moderate notices" ON public.community_notices;
DROP POLICY IF EXISTS "Public can submit pending notices" ON public.community_notices;
DROP POLICY IF EXISTS "Public can view published notices" ON public.community_notices;

-- 2. Drop Noticeboard Indexes & Table
DROP INDEX IF EXISTS public.idx_community_notices_city_status;
DROP INDEX IF EXISTS public.idx_community_notices_expiry;
DROP TABLE IF EXISTS public.community_notices CASCADE;

-- 3. Drop Local Events RLS Policies
DROP POLICY IF EXISTS "Franchise managers can moderate events" ON public.local_events;
DROP POLICY IF EXISTS "Public can submit pending events" ON public.local_events;
DROP POLICY IF EXISTS "Public can view published events" ON public.local_events;

-- 4. Drop Local Events Indexes & Table
DROP INDEX IF EXISTS public.idx_local_events_city_status_date;
DROP INDEX IF EXISTS public.idx_local_events_featured;
DROP TABLE IF EXISTS public.local_events CASCADE;
```

---

## 9. Cross-City Territorial Safety Assessment

### 9.1 Isolation Invariants Verified:
1. **Chittoor Ads (`AP-03`):**
   - Feature flags `hasCommunityNoticeboard: false` and `hasLocalEvents: false` remain active.
   - Navigating to `/city/chittoor/community` or `/city/chittoor/events` displays the territory isolation notice and provides a return link to Chittoor Home.
   - Chittoor franchise operators cannot view or moderate Vellore notices or events.
2. **Bengaluru Ads (`KA-01`):**
   - Feature flags `hasCommunityNoticeboard: false` and `hasLocalEvents: false` remain active.
   - Navigating to `/city/bengaluru/community` or `/city/bengaluru/events` displays the territory isolation notice.
   - Bengaluru franchise operators cannot view or moderate Vellore notices or events.
3. **Vellore Ads (`TN-23`):**
   - Only Vellore has `hasCommunityNoticeboard: true` and `hasLocalEvents: true`.
   - All notices and events default to `city_id = 'vellore'`.

---

## 10. Production Release Gate Recommendation

### **FINAL STATUS: CONDITIONAL GO (HOLD PENDING STAGING QA SIGN-OFF)**

| Gate Component | Status | Required Action Prior to Production |
| :--- | :---: | :--- |
| **Codebase & Types** | **GO** | Fully verified; 0 lint errors, build succeeds cleanly. |
| **Static SEO Prerender** | **GO** | 7 HTML entrypoints generated including `/community` and `/events`. |
| **Security & RLS** | **GO** | PostgreSQL 15+ constraints, RLS, and role grants verified statically. |
| **Staging Migration** | **HOLD** | Apply migration to `tbwtxnszyddvpgqvxwow` and execute 7-step checklist. |
| **Production Migration** | **HOLD** | Do NOT execute on `gpqbppjqqndzuvksrtjb` until Staging QA sign-off is granted. |
| **Git Deployment** | **READY** | Commit and push to `feat/platform-integration-phase-8` upon stakeholder approval. |
