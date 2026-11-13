# KAARYAN LABS — PHASE V3.5.8
## VELLORE ADS (TN-23): LIVE STAGING POSTGREST API VERIFICATION RESULTS

- **Document Version:** 1.0.0
- **Assessment:** **GO FOR PRODUCTION RELEASE GATE**
- **Territory Scope:** Exclusively `/city/vellore` (TN-23)
- **Staging Project Reference:** `tbwtxnszyddvpgqvxwow` (`https://tbwtxnszyddvpgqvxwow.supabase.co`)
- **Protected Production Reference:** `gpqbppjqqndzuvksrtjb` (Zero Writes Performed)
- **Protected Governance File:** `supabase/migrations/20261103000003_super_admin_governance.sql` (Strictly Unmodified)
- **Execution Date:** November 13, 2026

---

## 1. Executive Summary & Verification Classification

Under Phase V3.5.8, genuine live HTTP and PostgREST API integration testing was conducted directly against the authorized Supabase Staging environment (`tbwtxnszyddvpgqvxwow`). 

All 12 required live API operations spanning 4 distinct user personas were executed against PostgreSQL 15+ engine tables, Row Level Security (RLS) policies, database triggers, and moderation views.

```text
========================================================================
PHASE V3.5.8 LIVE STAGING API TEST SUMMARY
========================================================================
  🟢 LIVE VERIFIED:   12 / 12 (100% Passed)
  ✅ STATIC VERIFIED: 0 (Separated per Task D instructions)
  🟡 BLOCKED:         0
  🛡️ NOT TESTED:      0 (All 12 live API operations fully executed)
  ❌ FAILED:          0
  TOTAL TESTS:        12
========================================================================
```

---

## 2. Environment Isolation & Safety Enforcement (Task A)

1. **Unmodified Local Environment:** `.env.local` remains strictly bound to development/production (`gpqbppjqqndzuvksrtjb`) and was not modified.
2. **Dedicated Staging Configuration:** Created `.env.staging.local` containing only the staging URL (`https://tbwtxnszyddvpgqvxwow.supabase.co`) and staging publishable/anon key.
3. **Source Control Protection:** Verified via `git check-ignore .env.staging.local` that the staging configuration is completely ignored by Git under `.env*` rules.
4. **Safety Assertion Gate:** The test runner (`scripts/run-vellore-v3-5-8-staging-tests.ts`) enforces strict pre-flight checks:
   - Validates that `VITE_SUPABASE_URL` explicitly contains `tbwtxnszyddvpgqvxwow`.
   - Halts immediately if `gpqbppjqqndzuvksrtjb` is referenced.
   - Requires the deliberate staging write flag `--allow-staging-writes`.
   - Prevents all authentication tokens and secrets from being output to stdout.

---

## 3. Staging User Roles & Authenticated Personas Tested

All personas were authenticated through canonical Supabase GoTrue authentication (admin `generate_link` + public `auth/v1/verify`), obtaining genuine, cryptographically signed user JWTs. No service-role key was used for persona authorization tests.

| Persona | Identity Email | Database Role (`public.user_roles`) | Assigned Territory (`city_id`) | Auth Mechanism |
| :--- | :--- | :---: | :---: | :---: |
| **Anonymous Visitor** | Unauthenticated | `anon` | None | Staging Anon Key |
| **Ordinary Customer** | `k.tharunkumar0507@gmail.com` | `customer` | `chittoor` | Authentic GoTrue User JWT |
| **Vellore Franchise** | `ktharunkumart@gmail.com` | `city_franchise` | `vellore` | Authentic GoTrue User JWT |
| **Other-City Franchise** | `kumarfranchise@gmail.com` | `city_franchise` | `chittoor` | Authentic GoTrue User JWT |
| **Super Admin** | `tharunsuperadmin@gmail.com` | `super_admin` | `NULL` (Global) | Authentic GoTrue User JWT |

---

## 4. Live API Test Results Matrix (Task C)

| Test # | Operation / Requirement | Persona Used | HTTP Method & Endpoint | Status | Result / Detail |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **1** | Anonymous Public SELECT | Anonymous (`anon`) | `GET /rest/v1/community_notices?status=eq.published` | **200 OK** | **LIVE VERIFIED:** Returns approved records; zero pending leaks. |
| **2** | Anonymous Pending Notice Submission | Anonymous (`anon`) | `POST /rest/v1/community_notices` | **201 Created** | **LIVE VERIFIED:** Minimal return pattern (`Prefer: return=minimal`); Ref ID: `syn-test-not-1794514591284`. |
| **3** | Anonymous Pending Event Submission | Anonymous (`anon`) | `POST /rest/v1/local_events` | **201 Created** | **LIVE VERIFIED:** Minimal return pattern; Ref ID: `syn-test-evt-1794514591284`. |
| **4** | Pending Records Hidden from Public | Anonymous (`anon`) | `GET /rest/v1/community_notices?id=eq.syn-test-...` | **200 OK** | **LIVE VERIFIED:** Returns `[]` (0 rows). RLS policy `"Public can view published notices"` strictly enforced. |
| **5** | Customer Cannot Self-Publish | Ordinary Customer | `PATCH /rest/v1/community_notices?id=eq.syn-test-...` | **403 Forbidden** | **LIVE VERIFIED:** Table grant and RLS reject update attempt (`code: 42501 permission denied`). |
| **6** | Customer Cannot Access Private Contact | Ordinary Customer | `GET /rest/v1/community_notices?select=submitter_phone` | **403 Forbidden** | **LIVE VERIFIED:** Column-level SELECT grant enforced (`code: 42501 permission denied`). |
| **7** | Customer Cannot Access Moderator View | Ordinary Customer | `GET /rest/v1/franchise_community_notices?select=*` | **200 OK** | **LIVE VERIFIED:** Returns `[]` (0 rows). View filter `is_vellore_franchise OR super_admin` enforced. |
| **8** | Vellore Franchise View & Approve | Vellore Franchise | `GET /rest/v1/franchise_community_notices`<br>`PATCH /rest/v1/community_notices` | **200 OK**<br>**204 No Content** | **LIVE VERIFIED:** View returns pending row with `submitter_phone`; PATCH updates notice status to `published`. |
| **9** | Other-City Franchise (Chittoor) Blocked | Chittoor Franchise | `GET /rest/v1/franchise_community_notices`<br>`PATCH /rest/v1/local_events` | **200 OK (0 rows)**<br>**204 (0 modified)** | **LIVE VERIFIED:** Chittoor franchise receives 0 rows; attempted update does not publish event (remains `pending`). |
| **10** | Super Admin Global Moderation Authority | Super Admin | `GET /rest/v1/franchise_community_notices`<br>`PATCH /rest/v1/local_events` | **200 OK (1 row)**<br>**204 No Content** | **LIVE VERIFIED:** Super Admin views pending queue and successfully publishes pending event. |
| **11** | Duplicate Rejection via Advisory Lock | Anonymous (`anon`) | `POST /rest/v1/community_notices`<br>`POST /rest/v1/local_events` | **400 Bad Request**<br>**400 Bad Request** | **LIVE VERIFIED:** Notice rejected: `"A notice with this title was recently submitted..."`; Event rejected similarly. |
| **12** | Approved Records Visible to Anonymous | Anonymous (`anon`) | `GET /rest/v1/community_notices?id=eq.syn-test-...`<br>`GET /rest/v1/local_events?id=eq.syn-test-...` | **200 OK (1 row)**<br>**200 OK (1 row)** | **LIVE VERIFIED:** Both approved notice and approved event immediately visible in public API reads. |

---

## 5. PostgREST Representation & Permission Architectural Insight

A vital technical behavior was validated during live PostgREST testing:
- **Finding:** Because `GRANT SELECT` on `community_notices` strictly omits `submitter_phone` and `submitter_email` for `authenticated` and `anon` roles, any mutation (`INSERT`, `UPDATE`, `DELETE`) with header `Prefer: return=representation` causes PostgREST to execute `RETURNING *`. PostgreSQL rejects `RETURNING *` with `code: 42501 permission denied` because the client role lacks SELECT privileges on the private submitter columns.
- **Enforced Solution:** All mutations originating from client services must use `Prefer: return=minimal`. This matches our client implementation in `communityService.ts` and guarantees clean HTTP 201/204 responses without representation errors.

---

## 6. Synthetic Record Lifecycle & Database Cleanup

All synthetic test records generated during the live test execution were completely cleaned up via authorized admin API calls:
- Notice Cleanup: `DELETE /rest/v1/community_notices?id=eq.syn-test-not-1794514591284` -> **HTTP 204 No Content**
- Event Cleanup: `DELETE /rest/v1/local_events?id=eq.syn-test-evt-1794514591284` -> **HTTP 204 No Content**
- Confirmed zero residual test records in `community_notices` and `local_events` on staging.

---

## 7. Remaining Security & Infrastructure Recommendations

1. **Edge IP Rate Limiting (Production Deployment):**
   - Database advisory locks and sliding-window triggers successfully eliminate concurrency races and double-click duplicates.
   - For high-traffic production, an Edge Function / Cloudflare Worker enforcing an IP token-bucket rate limit (e.g. 5 submissions per IP per 10 minutes) and Cloudflare Turnstile anti-bot verification is recommended to shield the PostgREST ingress from distributed bot flooding.
2. **Environment Safety:**
   - Production `.env.local` remained 100% isolated. Staging credentials remain strictly contained in `.env.staging.local` and ignored by Git.

---

## 8. Final Staging QA Decision

### **FINAL DECISION: GO FOR PRODUCTION RELEASE GATE**

- **Live Staging PostgREST Tests:** 12 / 12 Live Verified (100% Pass)
- **RLS Policy Enforcement:** Confirmed live across all 4 personas
- **Submitter Contact Privacy:** Enforced at engine column level
- **Database Idempotency & Dedup:** Verified live with `pg_advisory_xact_lock`
- **Territorial Isolation:** Verified (Vellore franchise authorized; Chittoor franchise blocked)
- **Production Safety:** Maintained with zero writes to `gpqbppjqqndzuvksrtjb`
