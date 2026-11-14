# KAARYAN LABS — PHASE V3.7.2B TECHNICAL REPORT
## VELLORE COMMUNITY NOTICEBOARD PRODUCTION API QUERY & PRIVACY FIX
### Zero Database Mutations · Explicit Column Projections · Citizen Privacy Protection

**Project:** `remix-client.new.project`<br/>
**Framework:** React 19 + TypeScript + Vite + Tailwind CSS + Supabase + Vercel<br/>
**Production Supabase Project:** `gpqbppjqqndzuvksrtjb`<br/>
**Staging Supabase Project:** `tbwtxnszyddvpgqvxwow`<br/>
**Target Territory:** Vellore Ads (`TN-23`) Exclusively<br/>
**Reference Reconciliation Report:** `docs/vellore/PHASE_V3_7_2A_DATABASE_RECONCILIATION.md`<br/>
**Execution Timestamp:** 2026-11-14T22:30:00+05:30<br/>
**Phase Status:** ✅ COMPLETE — 18/18 API CHECKS PASSED — 100% REGRESSION SUITES PASSED

---

## 1. Executive Summary & Objective

In Phase V3.7.1, an automated diagnostic scan reported an `HTTP 401 Unauthorized` response when querying public community notices from the production PostgREST API (`gpqbppjqqndzuvksrtjb.supabase.co`).

Phase V3.7.2A established that:
1. The production database schema and migrations are **fully valid, healthy, and correct**.
2. Migration `20261112000001_community_notices_and_events.sql` had intentionally deployed **PostgreSQL Column-Level Security (CLS)** on table `public.community_notices` to safeguard citizen privacy, granting `SELECT` on 16 specific display columns to role `anon`, while revoking access to sensitive submitter columns (`submitter_phone`, `submitter_email`).
3. The frontend service `src/services/communityService.ts` was issuing a wildcard query (`.select('*')`). When PostgreSQL encountered the wildcard request from an unauthenticated user (`anon`), it raised PostgreSQL error code `42501 (INSUFFICIENT_PRIVILEGE)` because `anon` lacks privileges on the omitted columns. PostgREST correctly mapped this error to `HTTP 401 Unauthorized`.

**Phase V3.7.2B Objective:**
Permanently resolve the frontend query failure by implementing explicit public column projection, without altering the database schema, without modifying RLS policies or column grants, and while strictly preserving citizen contact privacy and multi-city territorial isolation.

---

## 2. Root Cause Analysis

### 2.1 Database Column Grants (`20261112000001_community_notices_and_events.sql`)

Lines 443–452 of migration `20261112000001_community_notices_and_events.sql` establish strict column-level grants:

```sql
REVOKE ALL ON TABLE public.community_notices FROM anon, authenticated;

GRANT SELECT (
  id, city_id, title, category, content, locality,
  organizer_name, contact_phone, contact_email, show_contact,
  status, priority, publish_date, expiry_date,
  created_at, updated_at
) ON TABLE public.community_notices TO anon;
```

Private columns deliberately omitted from `anon` grants:
- `submitter_phone` — Citizen's private phone number (stored exclusively for franchise verification)
- `submitter_email` — Citizen's private email address (stored exclusively for franchise verification)
- `moderator_notes` — Internal moderation audit notes
- `reviewed_by` — Admin UUID responsible for moderation
- `reviewed_at` — Timestamp of administrative review

### 2.2 The Wildcard Query Failure

Prior to Phase V3.7.2B, `src/services/communityService.ts` contained:

```typescript
// BEFORE: Provoked HTTP 401 Unauthorized (PostgreSQL 42501 INSUFFICIENT_PRIVILEGE)
let query = supabase
  .from('community_notices')
  .select('*')
  .eq('city_id', cityId)
  .eq('status', 'published')
  .order('priority', { ascending: false })
  .order('publish_date', { ascending: false });
```

Because `.select('*')` expands in PostgREST to `SELECT * FROM community_notices`, PostgreSQL rejected the query with `42501: permission denied for table community_notices` (due to missing column permissions on `submitter_phone` / `submitter_email`). PostgREST returned:

```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "permission denied for table community_notices"
}
```

---

## 3. Code Modifications

File Modified: `src/services/communityService.ts`

### 3.1 Definition of Public Column Projection

An exported constant was added defining the exact 16 public display columns granted to `anon`:

```typescript
/**
 * Public column projection for community_notices.
 *
 * In migration 20261112000001_community_notices_and_events.sql, PostgreSQL column-level
 * grants were established: anon has SELECT only on display columns.
 * Submitter PII (submitter_phone, submitter_email) and internal moderation columns
 * are strictly restricted to authenticated franchise/admin roles.
 *
 * Requesting select('*') provokes PostgreSQL error 42501 (INSUFFICIENT_PRIVILEGE)
 * which PostgREST translates into HTTP 401 Unauthorized.
 * Explicitly selecting PUBLIC_COMMUNITY_NOTICE_COLUMNS guarantees HTTP 200 OK.
 */
export const PUBLIC_COMMUNITY_NOTICE_COLUMNS =
  'id, city_id, title, category, content, locality, organizer_name, contact_phone, contact_email, show_contact, status, priority, publish_date, expiry_date, created_at, updated_at';
```

### 3.2 Updating Public Query Functions

1. **`getNotices(cityId, category)`**:
   Replaced `.select('*')` with `.select(PUBLIC_COMMUNITY_NOTICE_COLUMNS)`.

2. **`getNoticeById(id)`**:
   Added a live Supabase query using `PUBLIC_COMMUNITY_NOTICE_COLUMNS` filtering on `status = 'published'` prior to falling back to mock or local storage.

3. **`getAllNoticesForFranchise(cityId)`**:
   Updated the public table fallback from `.select('*')` to `.select(PUBLIC_COMMUNITY_NOTICE_COLUMNS)`.

### 3.3 Enhanced Error Handling & Zero Mock Notice Fabrication

The error handling logic in `getNotices()` was restructured to differentiate between:
1. **Empty database responses (`data: []`)**: Returns `[]` cleanly. The frontend UI renders its designed empty state (*"No Notices Found — Post the First Notice"*).
2. **PostgREST / Network errors**: Logs the specific HTTP error code and status, and returns `[]` without fabricating fake mock notices into the production user experience.

---

## 4. Privacy & Consent Verification

| Column Name | Database Type | Granted to `anon`? | Transmitted in API Response? | Notes |
|:---|:---|:---:|:---:|:---|
| `id` | `uuid` | ✅ Yes | ✅ Yes | Primary identifier |
| `city_id` | `text` | ✅ Yes | ✅ Yes | Territory identifier (`vellore`) |
| `title` | `text` | ✅ Yes | ✅ Yes | Public notice headline |
| `category` | `text` | ✅ Yes | ✅ Yes | Notice category |
| `content` | `text` | ✅ Yes | ✅ Yes | Public notice body |
| `locality` | `text` | ✅ Yes | ✅ Yes | Vellore area (e.g. Katpadi, Gandhinagar) |
| `organizer_name` | `text` | ✅ Yes | ✅ Yes | Organizer or organization name |
| `contact_phone` | `text` | ✅ Yes | ✅ Yes | Publicly consented phone |
| `contact_email` | `text` | ✅ Yes | ✅ Yes | Publicly consented email |
| `show_contact` | `boolean` | ✅ Yes | ✅ Yes | Boolean flag controlling UI display |
| `status` | `text` | ✅ Yes | ✅ Yes | Filtered to `published` |
| `priority` | `integer` | ✅ Yes | ✅ Yes | Notice ranking (0-3) |
| `publish_date` | `timestamptz` | ✅ Yes | ✅ Yes | Active timestamp |
| `expiry_date` | `timestamptz` | ✅ Yes | ✅ Yes | Expiry timestamp |
| `created_at` | `timestamptz` | ✅ Yes | ✅ Yes | Creation timestamp |
| `updated_at` | `timestamptz` | ✅ Yes | ✅ Yes | Last modification timestamp |
| **`submitter_phone`** | `text` | ❌ **REVOKED** | ❌ **BLOCKED (401 / 42501)** | **Citizen private PII** |
| **`submitter_email`** | `text` | ❌ **REVOKED** | ❌ **BLOCKED (401 / 42501)** | **Citizen private PII** |
| **`moderator_notes`** | `text` | ❌ **REVOKED** | ❌ **BLOCKED (401 / 42501)** | **Internal moderation** |
| **`reviewed_by`** | `uuid` | ❌ **REVOKED** | ❌ **BLOCKED (401 / 42501)** | **Admin identity** |
| **`reviewed_at`** | `timestamptz` | ❌ **REVOKED** | ❌ **BLOCKED (401 / 42501)** | **Admin timestamp** |

### Contact Display Consent Rule
When `show_contact` is `false`, the UI components (`VelloreCommunityPage.tsx`, `NoticeModal.tsx`) strictly mask `contact_phone` and `contact_email`, displaying *"Contact withheld upon request"*. When `show_contact` is `true`, public contacts are rendered with clickable `tel:` and `mailto:` links.

---

## 5. Local Events Service Inspection

An audit of `src/services/communityService.ts` for Local Events confirmed:
- Migration `20261112000001_community_notices_and_events.sql` lines 455–456 executed:
  `GRANT SELECT ON TABLE public.local_events TO anon;`
- Table `local_events` does not contain citizen private submitter fields (events are created by franchise managers or verified venue coordinators).
- Both `.select('*')` and explicit projections return **HTTP 200 OK** without error.

---

## 6. Production & Staging Read-Only Verification

A dedicated automated test suite was constructed: `scripts/verify-vellore-v3-7-2b-community-api.ts`.
Executed against live production (`gpqbppjqqndzuvksrtjb`) and staging (`tbwtxnszyddvpgqvxwow`).

### Test Results Breakdown:

```
================================================================================
KAARYAN LABS — PHASE V3.7.2B
COMMUNITY NOTICEBOARD API & PRIVACY VERIFICATION
================================================================================

[SUITE 1: SOURCE CODE STATIC VERIFICATION]
  ✅ [PASS] Assertion 1: PUBLIC_COMMUNITY_NOTICE_COLUMNS constant is exported
  ✅ [PASS] Assertion 2: All 16 public display columns are present in projection
  ✅ [PASS] Assertion 3: submitter_phone is NOT in public projection
  ✅ [PASS] Assertion 4: submitter_email is NOT in public projection
  ✅ [PASS] Assertion 5: getNotices() does not use wildcard select('*')
  ✅ [PASS] Assertion 5b: getNotices() explicitly uses PUBLIC_COMMUNITY_NOTICE_COLUMNS

[SUITE 2: PRODUCTION POSTGREST API READ-ONLY VERIFICATION (gpqbppjqqndzuvksrtjb)]
  ✅ [PASS] Assertion 6: Production public notices query returned HTTP 200 (status: 200, count: 0)
  ✅ [PASS] Assertion 7: Query requesting submitter_phone correctly returned HTTP 401 (42501: permission denied for table community_notices)
  ✅ [PASS] Assertion 8: Query requesting submitter_email correctly returned HTTP 401 (42501: permission denied for table community_notices)
  ✅ [PASS] Assertion 9: Anonymous query for pending notices returns 0 rows (RLS guard active)
  ✅ [PASS] Assertion 10: Anonymous access to franchise_community_notices view is denied (status: 401)

[SUITE 3: STAGING POSTGREST API READ-ONLY VERIFICATION (tbwtxnszyddvpgqvxwow)]
  ✅ [PASS] Assertion 11: Staging public notices query returned HTTP 200 (status: 200, count: 0)

[SUITE 4: SERVICE LAYER BEHAVIOR VERIFICATION]
  ✅ [PASS] Assertion 12: communityService.getNotices('vellore') returned an array
  ✅ [PASS] Assertion 13: Zero unpublished notices returned to public caller

[SUITE 5: TERRITORIAL ISOLATION (CHITTOOR & BENGALURU)]
  ✅ [PASS] Assertion 14: communityService.getNotices('chittoor') returned 0 items
  ✅ [PASS] Assertion 15: communityService.getNotices('bengaluru') returned 0 items
  ✅ [PASS] Assertion 16: Chittoor community feature flag is false
  ✅ [PASS] Assertion 17: Bengaluru community feature flag is false

================================================================================
PHASE V3.7.2B SUMMARY: 18 / 18 ASSERTIONS PASSED (0 FAILED)
================================================================================
```

---

## 7. Comprehensive Regression Verification

All existing project verification suites were executed:

1. **TypeScript Compilation & Linting (`npm run lint` / `tsc --noEmit`)**:
   - Result: **0 errors**. Full type safety confirmed.
2. **Production Build & SEO Prerender (`npm run build`)**:
   - Result: **0 errors**. 15 canonical HTML routes prerendered cleanly.
3. **Phase V3.5 Community Verification (`scripts/verify-vellore-v3-5-community.ts`)**:
   - Result: **37 / 37 PASSED (0 FAILED)**.
4. **Three-City Regional Lock Verification (`scripts/verify-three-city-region-lock.ts`)**:
   - Result: **81 / 81 PASSED (0 FAILED)**.
5. **Phase V3.6.9 Tourism & Navigation Regression (`scripts/verify-vellore-v3-6-9-navigation.ts`)**:
   - Result: **77 / 77 PASSED (0 FAILED)** across desktop, mobile drawer (320px–768px), back/forward history, and region isolation.

---

## 8. Preserved Repository State

Per strict governance constraints:
- **Baseline Modified Files Preserved:**
  1. `.vscode/launch.json`
  2. `CONTACT_AND_BRANDING_VERIFICATION.md`
  3. `PHASE_8C_TEST_ACCOUNT_READINESS.md`
  4. `VELLOREADS_LEGACY_FEATURE_AUDIT.md`
  5. `docs/vellore/PHASE_V3_1_LEGACY_FEATURE_PARITY_PLAN.md`
  6. `docs/vellore/PHASE_V3_2_1_DIAGNOSTICS_CLEANUP.md`
  7. `docs/vellore/PHASE_V3_2_ESSENTIAL_FEATURE_CORRECTIONS.md`
  8. `docs/vellore/v3_5_17_mobile_audit_data.json`
- **Protected Database Objects Preserved:**
  - `supabase/migrations/20261103000003_super_admin_governance.sql`
  - Zero SQL migrations executed.
  - Zero database tables, views, roles, or grants mutated.

---

## 9. Current Operational Status & Next Steps

### 9.1 Operational Status
- The Community Noticeboard API bug is **100% resolved** in frontend code.
- PostgREST public endpoint responds with **HTTP 200 OK**.
- Citizen PII (`submitter_phone`, `submitter_email`) is **100% protected** at the database engine level (PostgreSQL CLS).
- When notices are published in production, they will immediately appear in the UI without permission errors. Currently, the production table has 0 published notices, and the UI displays its clean empty state.

### 9.2 Blockers for Complete User Notice Visibility
To populate notices in production:
1. Provision the Vellore Franchise Account (`franchise_vellore` or franchise admin credentials).
2. Authenticate through the Franchise Portal (`/city/vellore/franchise`).
3. Approve submitted citizen notices or seed initial baseline community notices via the authorized moderation panel.

---

## 10. Conclusion & Sign-Off

Phase V3.7.2B is **complete**. The fix is verified, robust, privacy-compliant, and fully covered by automated regression tests. No git commits, pushes, PR merges, or deployments were performed per instructions.
