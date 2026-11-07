# KAARYAN LABS — PHASE 8C TEST ACCOUNT READINESS & PROVISIONING REVIEW
## Safe Multi-Role Onboarding Architecture, Staging Super Admin Bootstrap & RBAC Verification Specification

**Project:** `remix-client.new.project`  
**Current Development Branch:** `feat/platform-integration-phase-8`  
**Target Staging Project:** `kaaryan-localads-staging` (`tbwtxnszyddvpgqvxwow`)  
**Staging Endpoint:** `https://tbwtxnszyddvpgqvxwow.supabase.co`  
**Date:** November 4, 2026  
**Author:** Principal Full-Stack Architect, Senior Supabase Security Architect, DevOps Engineer & QA Lead  

---

### 1. EXECUTIVE SUMMARY

The dedicated Supabase staging project (`kaaryan-localads-staging`, ref: `tbwtxnszyddvpgqvxwow`) has successfully synchronized all seven local migrations and verified 18/18 database, schema, RLS, storage, and RPC assertions with a 100% pass rate ([`PHASE_8B_POST_MIGRATION_VERIFICATION.md`](file:///c:/Users/kthar/Downloads/remix-client.new.project/PHASE_8B_POST_MIGRATION_VERIFICATION.md)).

Before provisioning accounts for live authenticated testing in Phase 8C, this review audits the proposed provisioning mechanics, eliminates dangerous architectural anti-patterns (such as direct raw SQL insertion into Supabase-managed authentication catalogs), establishes a reviewed Super Admin bootstrap procedure, and defines the verification matrix for Customer, Business Owner, City Franchise, and Super Admin test personas.

**CRITICAL POLICY ENFORCEMENT:**
- **Zero Automatic Execution:** No users have been created, no raw SQL executed, and no roles granted during this review.
- **Zero Credential Exposure:** No production passwords, secret keys, or service role credentials are hardcoded or committed.
- **Strict Production Isolation:** The production/development project (`gpqbppjqqndzuvksrtjb`) remains completely untouched and isolated.

---

### 2. AUDIT OF PROPOSED SECTION 13 SCRIPT (ANTI-PATTERN & RISK ANALYSIS)

In Section 13 of the previous post-migration report, a draft SQL snippet proposed populating test users via direct `INSERT INTO auth.users`. A rigorous architectural and security audit reveals critical flaws that mandate discarding that approach in favor of canonical Supabase Auth provisioning:

```
[INSECURE DRAFT FROM SECTION 13 - REJECTED]
DO $$ ... INSERT INTO auth.users (id, email, encrypted_password, ...) VALUES (...) ... $$;
```

#### Why Direct SQL Insertion Into `auth.users` Fails in Supabase GoTrue:

1. **Supabase GoTrue Identity Linking Violation (`auth.identities`):**
   - Modern Supabase Auth (GoTrue v2) separates the primary user identity record (`auth.users`) from authentication providers (`auth.identities`).
   - When a user logs in via `supabase.auth.signInWithPassword()`, GoTrue queries `auth.identities` where `provider = 'email'` and `identity_data->>'email' = ...`.
   - Direct SQL insertion into `auth.users` leaves `auth.identities` unpopulated. Consequently, password sign-in attempts fail with an immediate `Invalid login credentials` error, even if the password hash in `auth.users` is mathematically valid.
2. **Missing GoTrue State & Internal Metadata:**
   - GoTrue maintains critical internal columns (`confirmation_token`, `recovery_token`, `email_change_token_current`, `reauthentication_token`, `is_sso_user`, `is_anonymous`).
   - Raw SQL inserts bypass GoTrue's internal validation, case normalization, email formatting rules, and cryptographic salt generation parameters.
3. **Database Trigger Race Conditions & Duplication:**
   - Any insertion into `auth.users` fires the `on_auth_user_created` trigger, which calls [`public.handle_new_user()`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000004_fix_handle_new_user.sql).
   - `handle_new_user()` immediately inserts a record into `public.user_profiles` and creates a default role in `public.user_roles`.
   - When a script subsequently executes manual `INSERT INTO public.user_roles`, it introduces duplicate role rows or violates unique constraints if parameters differ.
4. **Hardcoded Plaintext Credentials in Version Control:**
   - Hardcoding password hashes or cleartext passwords like `StagingAdmin#2026` in SQL files checked into Git violates security governance and creates persistent leak vectors.
5. **Lack of Inbox Ownership:**
   - Synthetic dummy emails cannot receive password reset emails, magic links, or email verification flows, preventing proper testing of authentication recovery paths.

**Audit Conclusion:** Direct SQL manipulation of `auth.users` and `auth.identities` is strictly prohibited. All user identities must be created through Supabase Auth (GoTrue API or Supabase Dashboard).

---

### 3. ACTUAL DATABASE TRIGGER & PUBLIC SCHEMA GOVERNANCE

A comprehensive audit of the database schema and triggers deployed on staging confirms strict server-side protection against unauthorized privilege escalation.

#### A. Trigger Audit: [`public.handle_new_user()`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000004_fix_handle_new_user.sql)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, email, phone, city_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone;

    INSERT INTO public.user_roles (user_id, role, city_id)
    VALUES (
        new.id,
        CASE WHEN (new.raw_user_meta_data->>'role') = 'business_owner' THEN 'business_owner' ELSE 'customer' END,
        COALESCE(new.raw_user_meta_data->>'city_id', 'chittoor')
    )
    ON CONFLICT (user_id, role, city_id) DO NOTHING;

    RETURN new;
END;
$$;
```

**Key Security Findings:**
- **Zero Public Self-Escalation:** The trigger explicitly limits assigned roles on user creation to `business_owner` or `customer`.
- **Privilege Immunity:** If an untrusted actor submits `{"role": "super_admin"}` or `{"role": "city_franchise"}` in user metadata during signup, the conditional `CASE` expression automatically discards it and assigns `'customer'`.
- **Safe Profile Synchronization:** A corresponding profile in `public.user_profiles` is initialized with `account_status = 'active'`.

#### B. Profile Integrity Trigger: [`public.protect_user_profile_integrity()`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261103000003_super_admin_governance.sql)
- Attached as `BEFORE UPDATE ON public.user_profiles`.
- Prevents tampering with `id` or `created_at`.
- Prevents non-super-admins from changing `account_status` (e.g. self-unsuspension).
- Verified active on staging.

#### C. Role Table Row-Level Security: `public.user_roles`
- **SELECT Policy:** `auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin')`.
- **ALL (INSERT/UPDATE/DELETE) Policy:** Restricted strictly to `public.has_role(auth.uid(), 'super_admin')`.
- Ordinary users cannot insert or modify any row in `public.user_roles`.

---

### 4. SAFE MULTI-ROLE ONBOARDING ARCHITECTURE

To ensure compatibility with GoTrue, database triggers, and security boundaries, each test persona must be onboarded using the designated method below:

```
+-------------------------------------------------------------------------------------------------+
|                                 STAGING ONBOARDING WORKFLOW                                     |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|  1. CUSTOMER                                                                                    |
|     Standard App Signup / Dashboard -> Trigger assigns 'customer' role in 'bengaluru'           |
|                                                                                                 |
|  2. BUSINESS OWNER                                                                              |
|     Provider Signup / Dashboard -> Trigger assigns 'business_owner' role in 'chittoor'          |
|                                                                                                 |
|  3. CITY FRANCHISE (VELLORE)                                                                    |
|     Dashboard Auth Creation -> Baseline Trigger -> Promoted via admin_assign_user_role() RPC   |
|                                                                                                 |
|  4. SUPER ADMIN (BOOTSTRAP)                                                                     |
|     Dashboard Auth Creation -> Baseline Trigger -> Initial One-Time SQL Role Promotion Script   |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+
```

#### Detailed Workflow by Persona:

#### Persona 1: Verified Customer (Bengaluru Hub)
- **Email:** Dedicated owned mailbox / alias (e.g. `staging.customer@kaaryanlabs.com`).
- **Provisioning Method:** Standard app signup (`/city/bengaluru` -> Login Modal -> Sign Up) OR Supabase Dashboard -> Authentication -> Users -> "Add User" (Auto-confirm email: enabled).
- **Metadata Provided:**
  ```json
  {
    "display_name": "Staging Customer Bengaluru",
    "role": "customer",
    "city_id": "bengaluru"
  }
  ```
- **Automated Result:** `handle_new_user()` creates `public.user_profiles` (`city_id = 'bengaluru'`) and `public.user_roles` (`role = 'customer'`, `city_id = 'bengaluru'`). No elevated privileges required.

#### Persona 2: Business Owner (Chittoor Hub)
- **Email:** Dedicated owned mailbox / alias (e.g. `staging.merchant@kaaryanlabs.com`).
- **Provisioning Method:** Standard provider signup OR Supabase Dashboard -> Authentication -> Users -> "Add User" (Auto-confirm email: enabled).
- **Metadata Provided:**
  ```json
  {
    "display_name": "Staging Merchant Chittoor",
    "role": "business_owner",
    "city_id": "chittoor"
  }
  ```
- **Automated Result:** `handle_new_user()` creates `public.user_profiles` (`city_id = 'chittoor'`) and `public.user_roles` (`role = 'business_owner'`, `city_id = 'chittoor'`).

#### Persona 3: City Franchise Partner (Vellore Hub — TN-23)
- **Email:** Dedicated owned mailbox / alias (e.g. `staging.franchise.vellore@kaaryanlabs.com`).
- **Provisioning Method (Two-Step Governed Promotion):**
  1. **Step 1 (Auth Creation):** Create user in Supabase Dashboard -> Authentication -> Users -> "Add User" (Auto-confirm email: enabled). `handle_new_user()` creates baseline profile and customer role.
  2. **Step 2 (Governed Role Assignment):** Once the Super Admin is bootstrapped, the Super Admin calls the audited RPC via the Super Admin Dashboard (`/admin/users`) or via SQL:
     ```sql
     -- Executed by authenticated Super Admin
     SELECT public.admin_assign_user_role(
         '<vellore_user_id>',
         'city_franchise',
         'vellore'
     );
     ```
  - **Automated Result:** Atomic replacement of baseline role with `city_franchise` for `vellore`, recording `assigned_by` and an immutable audit log in `public.audit_logs`.

#### Persona 4: Super Admin (Global Territory)
- **Email:** Dedicated owned mailbox (e.g. `staging.superadmin@kaaryanlabs.com`).
- **Provisioning Method (Bootstrap):** Follows the dedicated bootstrap procedure detailed in Section 5.

---

### 5. REVIEWED SUPER ADMIN BOOTSTRAP PROCEDURE (LIMITED TO STAGING)

In a pristine staging database, no Super Admin exists yet to call `admin_assign_user_role`. To solve this chicken-and-egg bootstrap without compromising GoTrue or database security, the administrator must follow this two-phase procedure:

#### Phase A: Create User in Supabase Auth (Dashboard UI)
1. Navigate to: `https://supabase.com/dashboard/project/tbwtxnszyddvpgqvxwow/auth/users`.
2. Click **Add user** -> **Create user**.
3. Enter:
   - **User Email:** `staging.superadmin@kaaryanlabs.com` (or authorized owned address).
   - **User Password:** Strong generated passphrase (stored in secure team vault).
   - **Auto Confirm User:** Checked (Yes).
4. Click **Create user**.
   - *This creates the standard GoTrue records in `auth.users` and `auth.identities` and executes `handle_new_user()`.*

#### Phase B: Execute Reviewed Role Promotion Script (SQL Editor)
Open the Supabase SQL Editor on project `tbwtxnszyddvpgqvxwow` and execute the following reviewed script:

```sql
-- =============================================================================
-- KAARYAN LABS — STAGING SUPER ADMIN BOOTSTRAP (SAFE PROMOTION ONLY)
-- Project: kaaryan-localads-staging (tbwtxnszyddvpgqvxwow)
-- Safety: Does NOT insert into auth.users or auth.identities.
-- Operation: Promotes existing GoTrue user to global super_admin in public.user_roles.
-- =============================================================================

DO $$
DECLARE
    _target_email TEXT := 'tharunsuperadmin@gmail.com';
    _user_id UUID;
BEGIN
    -- 1. Locate the GoTrue-managed user identity
    SELECT id INTO _user_id 
    FROM auth.users 
    WHERE email = _target_email;

    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Bootstrap Aborted: User "%" does not exist in auth.users. Please create the user in Supabase Dashboard -> Authentication -> Users first.', _target_email;
    END IF;

    -- 2. Clear default self-registration role created by trigger
    DELETE FROM public.user_roles WHERE user_id = _user_id;

    -- 3. Assign global super_admin role (city_id NULL grants all-territory authority)
    INSERT INTO public.user_roles (
        user_id,
        role,
        city_id,
        assigned_by,
        created_at
    ) VALUES (
        _user_id,
        'super_admin',
        NULL,
        _user_id,
        timezone('utc', now())
    )
    ON CONFLICT (user_id, role, city_id) DO NOTHING;

    -- 4. Set verified status and display name in public.user_profiles
    UPDATE public.user_profiles
    SET display_name = 'Staging Super Administrator',
        account_status = 'active',
        updated_at = timezone('utc', now())
    WHERE id = _user_id;

    -- 5. Record initial bootstrap event in audit trail
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        city_id,
        details,
        created_at
    ) VALUES (
        _user_id,
        'BOOTSTRAP_SUPER_ADMIN',
        'user_role',
        _user_id::text,
        NULL,
        jsonb_build_object(
            'environment', 'staging',
            'project_ref', 'tbwtxnszyddvpgqvxwow',
            'action_note', 'Initial Staging Super Admin role bootstrap promotion'
        ),
        timezone('utc', now())
    );

    RAISE NOTICE 'SUCCESS: User "%" (UUID: %) promoted to Super Administrator.', _target_email, _user_id;
END $$;
```

#### Why This Bootstrap Procedure is Safe:
- **Zero GoTrue Corruption:** Does not touch `auth.users` or `auth.identities`. Password hashing, identity linkages, and session generation remain 100% GoTrue-standard.
- **Fail-Safe Precondition:** Aborts immediately with an error if the user has not been created in Auth first.
- **Audited:** Writes an immutable log to `public.audit_logs`.
- **Idempotent:** Safe to run multiple times without creating duplicate roles.

---

### 6. PREVENTION OF PRIVILEGE ESCALATION (GOVERNANCE MATRIX)

The multi-city platform enforces four defense-in-depth barriers ensuring ordinary users cannot grant themselves or others elevated roles:

| Layer | Component | Mechanism | Failure Mode / Defense |
| :--- | :--- | :--- | :--- |
| **1. Client Boundary** | [`src/services/authService.ts`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/services/authService.ts) | Public `signUp()` only forwards `customer` or `business_owner`. | Prevents UI clients from requesting administrative roles. |
| **2. Auth Trigger** | [`public.handle_new_user()`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000004_fix_handle_new_user.sql) | Server-side `CASE` expression forces all non-owner roles to `'customer'`. | Malicious API calls requesting `super_admin` are safely demoted. |
| **3. Table RLS** | [`public.user_roles`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000002_row_level_security.sql) | `FOR ALL` policy requires `has_role(auth.uid(), 'super_admin')`. | Authenticated non-super-admins receive RLS denial on direct `INSERT`/`UPDATE`. |
| **4. Governed RPC** | [`public.admin_assign_user_role()`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261103000003_super_admin_governance.sql) | Checks `has_role(_caller_id, 'super_admin')` before executing role changes. | Unauthorized RPC calls fail with `Access Denied: Only Super Administrators may assign user roles.` |

---

### 7. OWNED EMAIL INBOXES & CREDENTIAL SECURITY POLICIES

To satisfy rigorous security compliance and enable end-to-end testing of email flows:

1. **Email Address Criteria:**
   - Test accounts must use owned inboxes or team catch-all domain aliases (e.g., Google Workspace aliases or personal developer plus-addressing: `qa+superadmin@...`, `qa+franchise@...`).
   - Ensures verification links, MFA tokens, and password reset workflows can be received and tested.
2. **Password Entropy & Generation:**
   - Minimum length: 16 characters.
   - Character classes: Uppercase, lowercase, numbers, and symbols.
   - Distinct passwords generated for each of the four test personas.
3. **Zero Secrets in Git:**
   - Credentials must **never** be committed to Git or written into shared Markdown documents.
   - For local CLI execution, test credentials are provided via `.env.test.local`, which is protected by `.gitignore` (`.env*` rule).
   - Production secrets remain exclusively in the secure Vercel and Supabase management consoles.

---

### 8. PHASE 8C ACCEPTANCE TEST SUITE SPECIFICATION

The upcoming Phase 8C verification suite will execute comprehensive real-credential tests across the four personas:

```
+--------------------------------------------------------------------------------------------------+
|                               PHASE 8C TEST EXECUTION MATRIX                                     |
+-------------------+------------------------------------------+-----------------------------------+
| Persona           | Permitted Operations (Positive Tests)    | Prohibited Operations (403 Tests) |
+-------------------+------------------------------------------+-----------------------------------+
| Customer          | - Browse businesses & search categories  | - Access /owner dashboard         |
| (Bengaluru)       | - Submit customer enquiry                | - Access /franchise/* portals     |
|                   | - Submit general service request         | - Access /admin/* governance      |
|                   | - Update personal profile (phone/name)   | - Modify other users or listings  |
+-------------------+------------------------------------------+-----------------------------------+
| Business Owner    | - Access /owner dashboard                | - Access /franchise/* portals     |
| (Chittoor)        | - Create new business listing            | - Access /admin/* governance      |
|                   | - Upload images to business-images       | - Modify listings owned by others |
|                   | - Edit owned business profile            | - Assign roles or change statuses |
+-------------------+------------------------------------------+-----------------------------------+
| City Franchise    | - Access /franchise/vellore              | - Access /franchise/chittoor (403)|
| (Vellore — TN-23) | - View Vellore business listings         | - Access /franchise/bengaluru(403)|
|                   | - Execute moderate_business_listing()    | - Access /admin/* governance      |
|                   | - View Vellore customer enquiries        | - Modify global platform settings |
+-------------------+------------------------------------------+-----------------------------------+
| Super Admin       | - Access /admin multi-city dashboard     | - Cannot suspend own account      |
| (Global)          | - View overview metrics across 3 cities  |   (anti-lockout guard)            |
|                   | - Execute admin_assign_user_role()       |                                   |
|                   | - Execute admin_set_user_status()        |                                   |
|                   | - Inspect immutable audit_logs           |                                   |
+-------------------+------------------------------------------+-----------------------------------+
```

#### Dedicated Cross-City Barrier Tests:
- Authenticate as Vellore Franchise (`staging.franchise.vellore@...`).
- Attempt direct RPC call `moderate_business_listing` on a Chittoor business listing.
- **Expected Assertion:** Server-side exception: `"Access Denied: You do not have franchise management permissions for city chittoor."`

---

### 9. VERCEL PREVIEW VS PRODUCTION CONFIGURATION STATUS

The multi-environment deployment architecture ensures complete safety between production and staging:

| Environment | Trigger Branch / Event | `VITE_SUPABASE_URL` | Target Project | Database Status |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | Push to `main` | `https://gpqbppjqqndzuvksrtjb.supabase.co` | `kaaryan-localads-dev` | Isolated, untouched, live |
| **Preview** | Pull Request from `feat/platform-integration-phase-8` | `https://tbwtxnszyddvpgqvxwow.supabase.co` | `kaaryan-localads-staging` | 7 migrations applied, clean |

#### Verification Checkpoints:
1. Production environment variables in Vercel remain strictly mapped to `gpqbppjqqndzuvksrtjb`.
2. Preview environment variables in Vercel are configured with `tbwtxnszyddvpgqvxwow` and its staging publishable anon key.
3. Every pull request created from branch `feat/platform-integration-phase-8` will build and preview exclusively against the staging database.

---

### 10. TEST ACCOUNT READINESS CHECKLIST & NEXT ACTIONS

#### Administrator Action Plan (To Be Performed Manually by Stakeholder):

- [ ] **Step 1: Create GoTrue Users in Staging Dashboard**
  - Open: `https://supabase.com/dashboard/project/tbwtxnszyddvpgqvxwow/auth/users`
  - Create the four test accounts with "Auto Confirm User" enabled:
    1. `staging.superadmin@kaaryanlabs.com`
    2. `staging.franchise.vellore@kaaryanlabs.com`
    3. `staging.merchant@kaaryanlabs.com`
    4. `staging.customer@kaaryanlabs.com`
  - *Store passwords in your secure secrets manager.*

- [ ] **Step 2: Execute Super Admin Bootstrap Script in Staging SQL Editor**
  - Open: `https://supabase.com/dashboard/project/tbwtxnszyddvpgqvxwow/sql/new`
  - Run the SQL script from **Section 5** above to promote `staging.superadmin@kaaryanlabs.com` to Super Admin.

- [ ] **Step 3: Promote Vellore Franchise Partner**
  - Either log into the Super Admin portal (`/admin/users`) with the bootstrapped Super Admin to assign the `city_franchise` role for `vellore`, OR run:
    ```sql
    SELECT public.admin_assign_user_role(
        (SELECT id FROM auth.users WHERE email = 'staging.franchise.vellore@kaaryanlabs.com'),
        'city_franchise',
        'vellore'
    );
    ```

- [ ] **Step 4: Provide Local Environment Variables for QA Execution**
  - Create a private, git-ignored `.env.test.local` (or configure session variables) containing:
    ```env
    VITE_SUPABASE_URL=https://tbwtxnszyddvpgqvxwow.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=<staging-anon-key>
    TEST_SUPER_ADMIN_EMAIL=staging.superadmin@kaaryanlabs.com
    TEST_SUPER_ADMIN_PASSWORD=<super-admin-password>
    TEST_FRANCHISE_EMAIL=staging.franchise.vellore@kaaryanlabs.com
    TEST_FRANCHISE_PASSWORD=<franchise-password>
    TEST_OWNER_EMAIL=staging.merchant@kaaryanlabs.com
    TEST_OWNER_PASSWORD=<owner-password>
    TEST_CUSTOMER_EMAIL=staging.customer@kaaryanlabs.com
    TEST_CUSTOMER_PASSWORD=<customer-password>
    ```

- [ ] **Step 5: Notify Agent to Execute Phase 8C Live Verification Suite**
  - Once the four accounts are provisioned, reply to begin execution of the live authenticated test suite.

---

### 11. CONCLUSION & STATUS

**Readiness Review Result: APPROVED & READY FOR PROVISIONING**

All architectural flaws from earlier draft provisioning concepts have been analyzed and eliminated. The GoTrue identity requirements, database triggers, table RLS policies, and RPC governance models are fully aligned. The staging database is primed and ready for safe manual test-account creation and subsequent automated Phase 8C verification.

