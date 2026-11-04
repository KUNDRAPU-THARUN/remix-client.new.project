# KAARYAN LABS — PHASE 8B STAGING ACTIVATION CHECKLIST
## Staging Governance, Database Preflight & Activation Gate

**Project:** `remix-client.new.project`  
**Current Development Branch:** `feat/platform-integration-phase-8`  
**Date:** November 4, 2026  
**Author:** Principal Full-Stack Architect, Senior Supabase Engineer, PostgreSQL Security Specialist & Release Lead  

---

### PURPOSE

This checklist establishes a strict operational barrier to protect database integrity across all regional hubs (Chittoor `AP-03`, Vellore `TN-23`, Bengaluru `KA-01`). It clearly delineates operations completed during Phase 8B preflight from privileged actions that remain strictly blocked pending stakeholder authorization.

---

### PART A — READ-ONLY PREFLIGHT (COMPLETED)

- [x] **1. Git Branch Integrity:** Confirmed clean working branch `feat/platform-integration-phase-8` tracking `origin/feat/platform-integration-phase-8`.
- [x] **2. Environment Separation Audit:**
  - Audited `.env.local` and `src/lib/supabase.ts`.
  - Confirmed only one active remote Supabase project: `kaaryan-localads-dev` (`gpqbppjqqndzuvksrtjb`).
  - Confirmed that **no isolated staging project** exists in the organization (`obtpeberxvvylmzhmoec`).
  - Identified cross-environment risk: Dev, Preview, and Production currently point to the same remote PostgreSQL instance.
- [x] **3. Supabase CLI & Connection Diagnostics:**
  - Supabase CLI version verified at `3.0.0`.
  - Remote PostgreSQL session pooler verified operational on port 5432 (`db.gpqbppjqqndzuvksrtjb.supabase.co`).
  - Schema cache refreshed and responsive.
- [x] **4. Database Schema & Migration Audit:**
  - Checked local migration files `20261101000001` through `20261103000003`.
  - Audited remote migration history via `supabase migration list --remote`.
  - Verified remote existence of core tables: `cities`, `categories`, `user_profiles`, `user_roles`, `businesses`, `business_images`, `customer_enquiries`, `general_service_requests`, `classified_ads`, `audit_logs`, `city_theatres`, `city_banners`.
  - Verified that `moderate_business_listing` RPC is active on remote PostgreSQL.
  - Verified that `admin_set_user_status` and `admin_assign_user_role` RPCs are **not yet installed** on the remote database.
- [x] **5. Migration 000003 Security Hardening:**
  - Hardened `supabase/migrations/20261103000003_super_admin_governance.sql`.
  - Added explicit `REVOKE ALL ON FUNCTION ... FROM PUBLIC;` for all 3 functions.
  - Added explicit `GRANT EXECUTE ON FUNCTION ... TO authenticated, service_role;`.
  - Verified anti-self-lockout and profile integrity triggers.
- [x] **6. Truthful Error Handling in Administrative Services:**
  - Updated `src/services/adminService.ts`: `updateCityStatus` and `updateUserStatus` now return truthful `{ success: false, error: ... }` when the database rejects an operation, eliminating false-positive success toasts.
- [x] **7. Four-Portal Browser CDP & Responsiveness Testing:**
  - Verified zero horizontal overflow across 6 standard viewports (360px, 390px, 768px, 1024px, 1440px, 1920px).
  - Verified 100% brand separation (Chittoor CA, Vellore VA, Bengaluru BA).
  - Verified unauthenticated visitors are blocked from `/dashboard`, `/city/:cityId/franchise`, and `/admin`.
- [x] **8. Build & Type Checking Verification:**
  - `npm run lint` (`tsc --noEmit`) passes with **exit code 0**.
  - `npm run build` (`vite build && tsx scripts/prerender-seo.ts`) compiles in **2.08s** with **exit code 0**.

---

### PART B — EXPLICIT APPROVAL GATE (CURRENT STATUS: BLOCKED)

Before any remote database mutation or staging activation occurs, the following explicit details must be reviewed and approved by the project owner:

| Parameter | Current Value / Proposed Target | Status |
| :--- | :--- | :--- |
| **Supabase Project Reference** | `gpqbppjqqndzuvksrtjb` (`kaaryan-localads-dev`) | ⚠️ Unconfirmed Staging Separation |
| **Target Environment** | Staging / Development Pooler | **BLOCKED** (Awaiting Dedicated Staging Ref) |
| **Pending Migration Script** | `supabase/migrations/20261103000003_super_admin_governance.sql` | **HELD LOCALLY** (Not Applied Remotely) |
| **Expected Schema Alterations** | 1 Trigger (`protect_user_profile_integrity`), 2 RPCs (`admin_set_user_status`, `admin_assign_user_role`), 1 Policy (`user_profiles`), 3 Indexes | Reviewed & Verified |
| **Potential Risk Impact** | Low (additive stored procedures & performance indexes; zero breaking changes to existing tables) | Assessed |
| **Rollback Strategy** | Scripted rollback commands in migration header | Prepared |
| **Live Admin Test Credentials** | `TEST_SUPER_ADMIN_EMAIL` & `TEST_SUPER_ADMIN_PASSWORD` | **NOT PROVISIONED** in `.env.local` |

> [!CAUTION]
> **NO REMOTE MIGRATIONS WILL BE EXECUTED WITHOUT SEPARATE EXPLICIT APPROVAL.**
> Remote writes to `gpqbppjqqndzuvksrtjb` remain frozen.

---

### PART C — POST-APPROVAL ACTIVATION PLAN (FUTURE PHASE 8C / STAGING DEPLOYMENT)

*To be executed only after stakeholder approval:*

1. **Staging Environment Setup:**
   - [ ] Provision a dedicated Supabase staging project or branch (e.g., `kaaryan-localads-staging`).
   - [ ] Configure isolated staging keys in `.env.staging` and Vercel Preview environment variables.
2. **Execute Remote Migration:**
   - [ ] Run `npx supabase db push --remote` or apply `20261103000003_super_admin_governance.sql` via Supabase SQL Editor.
3. **Verify Staging Database Objects:**
   - [ ] Verify `admin_set_user_status` RPC installation in schema cache.
   - [ ] Verify `admin_assign_user_role` RPC installation in schema cache.
   - [ ] Verify `trg_protect_user_profile_integrity` trigger execution on `user_profiles`.
   - [ ] Verify execution privileges are granted strictly to `authenticated` and `service_role`.
4. **End-to-End Privileged Testing:**
   - [ ] Provision a dedicated test admin account in the isolated staging environment.
   - [ ] Execute `scripts/verify-phase-7c-admin.ts` to unblock Category 9 (Live Authenticated Session).
   - [ ] Validate real-time audit logging in `audit_logs` table.
5. **Production Release Sign-Off:**
   - [ ] Merge `feat/platform-integration-phase-8` into `main` after staging sign-off.

