# KAARYAN LABS — PHASE V3.5.3
## VELLORE ADS (TN-23): FINAL SUPABASE MIGRATION SECURITY FIX REPORT

**Project:** KAARYAN LABS Multi-City Platform (`remix-client.new.project`)  
**Scope:** Strictly `/city/vellore` (TN-23)  
**Protected Territories:** Chittoor Ads (`AP-03`), Bengaluru Ads (`KA-01`)  
**Lead Auditor:** Senior Full-Stack Engineer, Supabase Database Security Architect & QA Lead  
**Audit Date:** November 12, 2026  
**Target Migration:** `supabase/migrations/20261112000001_community_notices_and_events.sql`  
**Staging Project Ref:** `tbwtxnszyddvpgqvxwow` (Dependencies Verified Ready)  
**Production/Dev Ref:** `gpqbppjqqndzuvksrtjb` (Protected Policy)  
**Final Staging Gate Status:** **APPROVED (GO FOR STAGING EXECUTION)**  

---

## 1. Executive Summary

Phase V3.5.3 hardens and corrects the proposed Supabase database migration for the **Vellore Community Noticeboard** and **Local Events Calendar** modules prior to staging execution.

Following confirmation that the staging environment (`tbwtxnszyddvpgqvxwow`) satisfies core prerequisites (`public.cities`, `public.user_roles`, `public.has_role()`, and Vellore city record `'vellore'`), this phase resolves critical database authorization, submission integrity, contact privacy, and anti-tampering vulnerabilities.

### Key Milestones Achieved:
1. **Authoritative Database Roles (Zero JWT Spoofing):**
   - Completely eliminated reliance on client-manipulable JWT claims (`auth.jwt() ->> 'role'` and `auth.jwt() ->> 'city_id'`).
   - Introduced `public.is_vellore_franchise(_user_id)` helper that enforces exact `role = 'city_franchise' AND city_id = 'vellore'`, terminating permissive `NULL-city` matching.
2. **Submission Anti-Tampering & Least Privilege:**
   - Enforced database `WITH CHECK` conditions and `BEFORE INSERT` triggers preventing external submitters from injecting `status = 'published'`, `priority = 'pinned'/'urgent'`, `is_featured = true`, `moderated_by`, or administrative timestamps.
   - Separated discrete RLS policies for `UPDATE` and `DELETE`, granting modification privileges exclusively to Super Admins and Vellore Franchise operators.
3. **Contact Privacy Guard (Engine-Level Defense):**
   - Defaulted `show_contact` to `false` in database schema, client submission payload, and UI modal state.
   - Built server-side trigger `handle_community_notice_contact_privacy()` that nullifies public `contact_phone` and `contact_email` when consent is `false`, safely routing private details to `submitter_phone` and `submitter_email`.
   - PostgREST column-level permissions revoke `submitter_*` fields from role `anon`.
4. **Server-Side Anti-Spam & Rate Limiting:**
   - Database triggers enforce a 5-minute idempotency window to reject rapid duplicate submissions directly at the PostgreSQL engine level.
5. **Strict City Confinement:**
   - Table constraints `chk_community_notices_vellore_only` and `chk_local_events_vellore_only` enforce `city_id = 'vellore'`, completely insulating Chittoor and Bengaluru.

---

## 2. Files Modified

| File | Purpose of Modification |
| :--- | :--- |
| `supabase/migrations/20261112000001_community_notices_and_events.sql` | Rewrote migration with strict role helper, anti-tampering triggers, privacy handler, separate UPDATE/DELETE RLS, and column-level PostgREST grants. |
| `src/types/database.types.ts` | Added `submitter_phone` and `submitter_email` to `community_notices` (Row, Insert, Update) and typed `is_vellore_franchise` function. |
| `src/components/vellore/NoticeSubmissionModal.tsx` | Changed default state of `showContact` from `true` to `false`. |
| `src/services/communityService.ts` | Updated notice insert payload to supply `submitter_*` fields and mapped franchise moderation reader to include submitter contact. |
| `scripts/verify-vellore-v3-5-1-staging.ts` | Updated assertion patterns to validate security-hardened grants and role resolvers. |
| `scripts/verify-vellore-v3-5-3-security.ts` | **(NEW)** Comprehensive negative security test suite with 39 explicit assertions. |

---

## 3. Security Issues Corrected

### 3.1 Elimination of Standalone JWT Authorization
- **Vulnerability:** Relying on `auth.jwt() ->> 'role' = 'super_admin'` or `auth.jwt() ->> 'city_id' = city_id` in RLS policies allowed potential bypass if JWT claims were manipulated or contained unverified custom claims.
- **Correction:** Removed all `auth.jwt()` references from the migration. Authorization now queries the authoritative `public.user_roles` table via `public.has_role(auth.uid(), 'super_admin')` and `public.is_vellore_franchise(auth.uid())`.

### 3.2 Elimination of Permissive NULL-City Matching
- **Vulnerability:** `public.has_role()` in early platform migrations contained `(city_id IS NULL OR _city_id IS NULL OR city_id = _city_id)`. If an operator role had `city_id = NULL`, it evaluated to `true` for all cities.
- **Correction:** Implemented `public.is_vellore_franchise(_user_id)`:
  ```sql
  SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role = 'city_franchise'
        AND city_id = 'vellore'
  );
  ```
  This requires an exact, non-null match for `'vellore'`.

### 3.3 Defense Against Submission Parameter Tampering
- **Vulnerability:** External submitters could potentially pass `"priority": "pinned"`, `"is_featured": true`, or `"status": "published"` in POST requests to PostgREST.
- **Correction:** 
  1. RLS `WITH CHECK` enforces `status = 'pending'`, `priority = 'standard'`, `is_featured = false`, and `moderated_by IS NULL`.
  2. `BEFORE INSERT` triggers `check_community_notice_submission()` and `check_local_event_submission()` sanitize incoming records for non-admin callers, forcing safe defaults.

### 3.4 Contact Privacy Protection
- **Vulnerability:** Hiding phone numbers on the frontend with `{notice.showContact && ...}` still transmitted private contact details in the API network payload.
- **Correction:**
  1. Default `show_contact` to `false`.
  2. Trigger `handle_community_notice_contact_privacy()` sets `contact_phone = NULL` and `contact_email = NULL` when `show_contact = false`.
  3. Contact info is stored in `submitter_phone` and `submitter_email` for authorized franchise moderation.
  4. PostgREST `GRANT SELECT (...) TO anon` explicitly omits `submitter_phone` and `submitter_email`.

---

## 4. Authorization Policy Matrix

| Table | Operation | Target Role | Policy Name | Enforcement Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| `community_notices` | `SELECT` | `anon`, `authenticated` | "Public can view published notices" | `status = 'published' AND city_id = 'vellore' AND publish_date <= now() AND (expiry_date IS NULL OR expiry_date > now())` |
| `community_notices` | `SELECT` | `authenticated` | "Franchise and admin can view all notices" | `public.has_role(auth.uid(), 'super_admin') OR (public.is_vellore_franchise(auth.uid()) AND city_id = 'vellore')` |
| `community_notices` | `INSERT` | `anon`, `authenticated` | "Public can submit pending notices" | `WITH CHECK (status = 'pending' AND priority = 'standard' AND moderated_by IS NULL AND city_id = 'vellore')` |
| `community_notices` | `UPDATE` | `authenticated` | "Franchise and admin can update notices" | Restricted strictly to Super Admin and Vellore Franchise |
| `community_notices` | `DELETE` | `authenticated` | "Franchise and admin can delete notices" | Restricted strictly to Super Admin and Vellore Franchise |
| `local_events` | `SELECT` | `anon`, `authenticated` | "Public can view published events" | `status = 'published' AND city_id = 'vellore'` |
| `local_events` | `SELECT` | `authenticated` | "Franchise and admin can view all events" | Restricted strictly to Super Admin and Vellore Franchise |
| `local_events` | `INSERT` | `anon`, `authenticated` | "Public can submit pending events" | `WITH CHECK (status = 'pending' AND is_featured = false AND moderated_by IS NULL AND city_id = 'vellore')` |
| `local_events` | `UPDATE` | `authenticated` | "Franchise and admin can update events" | Restricted strictly to Super Admin and Vellore Franchise |
| `local_events` | `DELETE` | `authenticated` | "Franchise and admin can delete events" | Restricted strictly to Super Admin and Vellore Franchise |

---

## 5. Comprehensive Quality & Security Test Results

All verification suites across the platform were executed. Zero regressions and zero failures were recorded across **456 platform assertions**.

| Verification Suite | Test Script / Command | Scope | Assertions | Result | Classification |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Phase V3.5.3 Security Suite** | `scripts/verify-vellore-v3-5-3-security.ts` | Negative security, anti-tampering, privacy, role resolution | 39 | **39 / 39 PASS** | `STATIC VERIFIED` |
| **TypeScript Typecheck** | `npm run lint` (`tsc --noEmit`) | Full Project Codebase | - | **0 errors** | `STATIC VERIFIED` |
| **Production Build & Prerender** | `npm run build` | Bundle + 7 HTML entrypoints | 7 routes | **PASS** | `STATIC VERIFIED` |
| **Phase V3.5 Community Suite** | `scripts/verify-vellore-v3-5-community.ts` | Routing, URLs, Modals, Anti-XSS | 37 | **37 / 37 PASS** | `STATIC VERIFIED` |
| **Phase V3.5.1 Staging Simulation** | `scripts/verify-vellore-v3-5-1-staging.ts` | Lifecycle simulation, RLS check | 34 | **34 / 34 PASS** | `STATIC VERIFIED` |
| **Three-City Region Lock Security** | `scripts/verify-three-city-region-lock.ts` | Multi-city security gates | 81 | **81 / 81 PASS** | `STATIC VERIFIED` |
| **Unified Login Security** | `scripts/verify-unified-login-security.ts` | 4-portal access matrix | 69 | **69 / 69 PASS** | `STATIC VERIFIED` |
| **Phase V3.4 Enquiry Suite** | `scripts/verify-vellore-v3-4-enquiry.ts` | WhatsApp CTAs, privacy notices | 43 | **43 / 43 PASS** | `STATIC VERIFIED` |
| **Phase V3.4.1 Live Suite** | `scripts/verify-vellore-v3-4-1-live.ts` | Lead routing, franchise queries | 35 | **35 / 35 PASS** | `STATIC VERIFIED` |
| **Phase V3.3 Directory Suite** | `scripts/verify-vellore-v3-3-directory.ts` | Operating hours, galleries | 68 | **68 / 68 PASS** | `STATIC VERIFIED` |
| **Phase V3.2 Features Suite** | `scripts/verify-vellore-v3-2-features.ts` | About, Contact, Biz routes | 50 | **50 / 50 PASS** | `STATIC VERIFIED` |
| **Staging Live Writes** | PostgREST network operations | Staging (`tbwtxnszyddvpgqvxwow`) | - | **PAUSED** | `BLOCKED (No Local Staging Creds)` |
| **Production Live Writes** | Mutation operations | Prod (`gpqbppjqqndzuvksrtjb`) | - | **HELD** | `NOT TESTED (Protected Policy)` |
| **TOTAL PLATFORM ASSERTIONS** | - | - | **456** | **456 / 456 PASS** | **100% STATIC COMPLIANCE** |

---

## 6. Remaining Limitations & Boundaries

1. **Local Staging Credentials:** The local `.env.local` remains bound to `gpqbppjqqndzuvksrtjb`. Live automated execution against `tbwtxnszyddvpgqvxwow` is held until staging credentials are added or manual SQL execution is completed in the dashboard.
2. **Graceful Client Fallback:** If Supabase is unreachable or unmigrated, `communityService.ts` maintains offline preview mode with local persistence, guaranteeing zero UI crashes.

---

## 7. Staging Readiness Decision

### **DECISION: APPROVED (GO FOR STAGING EXECUTION)**

The proposed migration `supabase/migrations/20261112000001_community_notices_and_events.sql` is fully hardened, verified, and ready for deployment to the Staging project (`tbwtxnszyddvpgqvxwow`).

Production deployment (`gpqbppjqqndzuvksrtjb`) remains **ON HOLD** pending successful execution and sign-off on Staging.

---

## 8. Exact Staging Execution Instructions

### Step 1: Open Staging Dashboard
Navigate to [Supabase Staging Dashboard](https://supabase.com/dashboard/project/tbwtxnszyddvpgqvxwow) -> **SQL Editor** -> **+ New Query**.

### Step 2: Execute Migration DDL
Copy and run the complete contents of:
`supabase/migrations/20261112000001_community_notices_and_events.sql`

### Step 3: Run Post-Migration Schema Verification
```sql
-- 1. Verify tables and RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('community_notices', 'local_events');

-- 2. Verify helper function
SELECT routine_name, routine_type FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'is_vellore_franchise';

-- 3. Verify triggers
SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table IN ('community_notices', 'local_events');
```

### Step 4: Safe Rollback Script (If Reversal is Ever Required)
```sql
DROP TRIGGER IF EXISTS trg_local_event_submission ON public.local_events;
DROP FUNCTION IF EXISTS public.check_local_event_submission();
DROP POLICY IF EXISTS "Franchise and admin can delete events" ON public.local_events;
DROP POLICY IF EXISTS "Franchise and admin can update events" ON public.local_events;
DROP POLICY IF EXISTS "Public can submit pending events" ON public.local_events;
DROP POLICY IF EXISTS "Franchise and admin can view all events" ON public.local_events;
DROP POLICY IF EXISTS "Public can view published events" ON public.local_events;
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
DROP TABLE IF EXISTS public.community_notices CASCADE;

DROP FUNCTION IF EXISTS public.is_vellore_franchise(pg_catalog.uuid);
```
