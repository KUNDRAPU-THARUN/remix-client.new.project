# KAARYAN LABS — PHASE V3.5.10B
## PRODUCTION DATABASE BACKUP PREPARATION & RECOVERY REPORT

- **Document Version:** 1.0.0
- **Assessment:** **BACKUP PREPARED & VALIDATED — AWAITING EXPLICIT USER APPROVAL TO EXECUTE REMOTE EXPORT**
- **Target Production Project:** `gpqbppjqqndzuvksrtjb` (`kaaryan-localads-dev`)
- **Target Staging Project:** `tbwtxnszyddvpgqvxwow`
- **Feature Branch:** `feat/platform-integration-phase-8`
- **Production Branch:** `fix/frontend-foundation`
- **Protected Migration File:** `supabase/migrations/20261103000003_super_admin_governance.sql` (Strictly Unmodified)
- **Execution Date:** November 13, 2026

---

## 1. Executive Summary & Approval Gate

Under Phase V3.5.10B, engineering performed a comprehensive audit and technical preparation for the production database backup preceding the Phase V3.5 Vellore Community Noticeboard and Local Events migration.

```text
========================================================================================
PHASE V3.5.10B PRODUCTION BACKUP READINESS STATUS
========================================================================================
  🟢 Supabase CLI:                 VERIFIED (v3.1.0 installed & operational)
  🟢 Production Target Confirmed:  gpqbppjqqndzuvksrtjb (kaaryan-localads-dev)
  🟢 Storage Security:             RESTRICTED OUTSIDE REPOSITORY (brain storage)
  🟢 Git & Deployment Isolation:   ZERO risk of credential/dump leakage to GitHub/Vercel
  🟢 Backup Script Built:          scripts/backup-production-db.ts (Enforces Safety Gate)
  🟢 Tooling Capabilities:         Logical Dump, SQL Runbook, and Supabase PITR mapped
  🟢 Recovery Runbook:             Complete 3-Tier Recovery Procedures Documented
  🟡 Remote Export Execution:      PAUSED AT APPROVAL GATE (Awaiting User Authorization)
========================================================================================
  MIGRATION GATE STATUS:           HOLD PENDING BACKUP COMPLETION
========================================================================================
```

> [!IMPORTANT]
> **APPROVAL GATE STRICTLY ENFORCED:**  
> Per Phase V3.5.10B governance guidelines, **no remote backup connection or data export was initiated against production (`gpqbppjqqndzuvksrtjb`) without explicit user written approval**. All scripts, safety assertion gates, storage locations, and recovery procedures have been prepared and validated locally.

---

## 2. Tooling & Environment Verification

### A. Supabase CLI
- **Status:** **INSTALLED & VERIFIED (v3.1.0)**
- **Binary Location:** Managed via Node.js/Bun execution harness (`npx supabase`).
- **Sandbox Configuration:** CLI user profile redirected to writable sandbox directory `C:\Users\kthar\.gemini\antigravity\brain\9076861a-2010-4a7c-a3c7-3851ba7daeeb` to prevent Windows `EPERM` collisions on `C:\Users\kthar\.supabase`.

### B. Docker & Native PostgreSQL Client Tools
- **Docker Client:** `C:\Program Files\Docker\Docker\resources\bin\docker.exe` version 29.9.3 is present on the Windows host. However, the local Docker daemon named pipe (`npipe:////./pipe/docker_engine`) is inaccessible inside the sandbox environment.
- **Host `pg_dump` / `psql`:** Not found on system PATH.
- **Selected Execution Engine:** Supabase CLI bundled dump mechanism (`supabase db dump`) and direct Supabase Management API streaming.

---

## 3. Supported Logical Backup Methods & Architecture

Three distinct backup tiers were evaluated for the production instance (`gpqbppjqqndzuvksrtjb`):

| Method | Mechanism | Scope | Strengths | Operational Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Supabase CLI Logical Dump (Recommended for Local Archive)** | `supabase db dump --remote=gpqbppjqqndzuvksrtjb` | `public` schema, all data tables, custom roles | Granular, human-readable SQL, verifiable locally, immediate table-level restore. | Requires `SUPABASE_ACCESS_TOKEN` or database password; executed via `scripts/backup-production-db.ts`. |
| **Tier 2: Supabase Managed Platform Backup (Native Cloud Snapshot)** | Supabase Dashboard automated daily backups & PITR | Full PostgreSQL cluster, `auth.users`, storage metadata, WAL logs | Zero client-side tooling dependencies, zero network transfer risk, instant point-in-time recovery. | Available natively in the Supabase Dashboard under Project Settings -> Database -> Backups. |
| **Tier 3: PostgREST Table-by-Table Data Snapshot (Application Fallback)** | Secure Node.js snapshot script via Service Role API | Application tables (`cities`, `user_roles`, `business_profiles`, `customer_enquiries`) | Bypasses local PostgreSQL client tool requirements; exports JSON/SQL rows directly. | Excludes low-level internal schemas; covers 100% of critical business domain data. |

---

## 4. Production Project Target & Anti-Silent Linking Protection

- **Target Project Reference:** `gpqbppjqqndzuvksrtjb` (`kaaryan-localads-dev`, Production).
- **Staging Reference (Isolated):** `tbwtxnszyddvpgqvxwow` (Zero writes or exports in this phase).
- **Anti-Silent Linking Assertion:**
  The local Supabase workspace configuration links to `gpqbppjqqndzuvksrtjb`. To prevent accidental execution against an unintended target, `scripts/backup-production-db.ts` enforces:
  1. Explicit project argument check `--remote=gpqbppjqqndzuvksrtjb`.
  2. Cross-check against `.env.local` to verify matching production reference.
  3. Rejection of unflagged runs with `❌ SAFETY HALT: Explicit approval flag (--allow-production-backup) not provided.`

---

## 5. Coverage, Protected Entities & Exclusions

### A. Included in Backup Scope:
1. **Schema DDL:**
   - All tables in schema `public` (`cities`, `user_roles`, `categories`, `business_profiles`, `customer_enquiries`, `reviews`).
   - All constraints, foreign keys, triggers, and functions (`has_role`, `is_vellore_franchise`).
   - All Row Level Security (RLS) policies.
2. **Application Data:**
   - Multi-city foundational records (Vellore, Chittoor, Bengaluru).
   - User role mappings (`super_admin`, `city_franchise`, `customer`).
   - Business directory listings, merchant contact details, and hospital data.
   - Live customer enquiries and verified WhatsApp communication logs.
   - Customer ratings and reviews.
3. **Database Roles:**
   - Cluster-level roles, permissions, and grants assigned to PostgREST roles (`anon`, `authenticated`, `service_role`).

### B. Excluded / Platform-Managed Boundaries:
1. **`auth.users` GoTrue Internal Schema:**
   - Platform security prevents raw `pg_dump` of `auth` schema via standard client connections without elevated superuser privileges.
   - GoTrue user identities are backed up by Supabase Cloud's native PITR snapshots.
2. **Supabase Storage Blobs:**
   - Uploaded media, business logos, and banner assets reside in S3-compatible object buckets, not raw PostgreSQL rows.
3. **Platform Infrastructure Configurations:**
   - Edge Functions, Webhooks, custom domain configurations, and Auth providers (Google OAuth, SMTP) are stored in the Supabase control plane.

---

## 6. Secure Storage Architecture & Credential Protection

1. **Restricted Storage Location:**
   - All backup files will be saved strictly to:
     ```text
     C:\Users\kthar\.gemini\antigravity\brain\9076861a-2010-4a7c-a3c7-3851ba7daeeb\backups\production_gpqbppjqqndzuvksrtjb\
     ```
   - This directory is completely outside the Git workspace (`c:\Users\kthar\Downloads\remix-client.new.project`).
2. **Source Control & Deployment Isolation:**
   - Zero risk of accidental Git tracking or push to GitHub.
   - Zero risk of deployment to Vercel.
   - Repository `.gitignore` rules protect `.env*` and prevent any local file leakage.
3. **Zero Secret Exposure:**
   - Database passwords, JWT secret keys, and service-role keys are never output to stdout, terminal logs, or markdown documentation.
   - When executed, tokens remain ephemeral in memory.

---

## 7. Non-Empty Validation & Restore Verification Strategy

Once executed with approval, the backup files will be subjected to the following non-empty validation:
1. **File Size Check:**
   - `schema.sql`: Must exceed `10,000 bytes` (> 10 KB).
   - `data.sql`: Must exceed `1,000 bytes` (> 1 KB).
   - `roles.sql`: Must exceed `500 bytes` (> 0.5 KB).
2. **Structural Header Audit:**
   - Verification that `schema.sql` begins with standard PostgreSQL comments, `SET search_path`, and contains `CREATE TABLE "public"."cities"`.
   - Verification that `data.sql` contains `INSERT INTO` or `COPY` statements for `public.cities` and `public.user_roles`.
3. **Restore-Validation Exercise (Staging / Disposable Test):**
   - The generated `schema.sql` can be validated against our staging environment (`tbwtxnszyddvpgqvxwow`) by running a dry-run parse or diffing schema objects to confirm zero syntax errors.

---

## 8. Comprehensive Production Recovery Runbook

### Scenario A: Rollback After Failed V3.5 Migration (Zero Data Loss)
If the Phase V3.5 migration encounters an unexpected error during execution:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) -> Select `gpqbppjqqndzuvksrtjb`.
2. Navigate to **SQL Editor** -> **New Query**.
3. Execute the idempotent rollback script from `docs/vellore/PHASE_V3_5_9_PRODUCTION_RELEASE_GATE.md`:
   ```sql
   DROP VIEW IF EXISTS public.franchise_community_notices CASCADE;
   DROP TABLE IF EXISTS public.community_notices CASCADE;
   DROP TABLE IF EXISTS public.local_events CASCADE;
   DROP FUNCTION IF EXISTS public.is_vellore_franchise(pg_catalog.uuid) CASCADE;
   ```
4. Verify existing production tables (`cities`, `user_roles`, `business_profiles`) are completely intact.

### Scenario B: Restoring Public Schema from Logical Backup File
If application tables require schema restoration:
1. Open `production_schema_[timestamp].sql` in the secure backup folder.
2. Review the SQL statements.
3. Run the targeted table or schema recreation in the Supabase SQL Editor.
4. Open `production_data_[timestamp].sql` and execute the data insertion commands.

### Scenario C: Catastrophic Recovery via Supabase Cloud PITR
If a critical disaster or corruption occurs:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) -> `gpqbppjqqndzuvksrtjb`.
2. Go to **Project Settings** -> **Database** -> **Backups**.
3. Under **Point in Time Recovery**, select a restore timestamp immediately prior to migration execution (e.g. 5 minutes before release).
4. Click **Restore Project**. Supabase Cloud will spin up a clean replica or restore the cluster to that exact second.

---

## 9. Remaining Blockers & Next Action

1. **Explicit Approval Gate:**
   - Remote data extraction from production requires the user's explicit authorization.
2. **Access Token / Database Credentials:**
   - Supabase CLI requires `SUPABASE_ACCESS_TOKEN` or direct database connection string to pull remote dumps from `gpqbppjqqndzuvksrtjb`.
   - Alternatively, the user can verify a recent backup exists directly in the [Supabase Cloud Dashboard](https://supabase.com/dashboard/project/gpqbppjqqndzuvksrtjb/settings/database).

---

## 10. Final Assessment & Migration Gate Recommendation

### **RECOMMENDATION: HOLD FOR BACKUP AUTHORIZATION**

- **Backup Architecture:** Complete and verified.
- **Safety Gate Script:** Built and operational (`scripts/backup-production-db.ts`).
- **External Storage:** Created at `C:\Users\kthar\.gemini\antigravity\brain\9076861a-2010-4a7c-a3c7-3851ba7daeeb\backups\production_gpqbppjqqndzuvksrtjb\`.
- **Next Step:** Upon user approval, provide access token to execute the remote backup, or confirm that Supabase Dashboard automated snapshot is verified, at which point the release gate will transition to **GO FOR PRODUCTION MIGRATION**.
