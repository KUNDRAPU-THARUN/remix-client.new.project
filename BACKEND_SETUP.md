# KAARYAN LABS — SUPABASE & POSTGRESQL BACKEND SETUP GUIDE
## Multi-City Local Business Platform

This guide explains how to set up, configure, and connect the PostgreSQL database and Supabase managed backend for ChittoorAds, VelloreAds, and BengaluruAds.

---

## 1. Prerequisites
- A [Supabase](https://supabase.com) account (free or professional tier).
- Node.js 18+ and npm installed locally.
- Supabase CLI (optional, but recommended for automated migrations).

---

## 2. Step-by-Step Setup Instructions

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and name it `kaaryan-local-ads` (or your client brand).
3. Select your database region (e.g. `ap-south-1` Mumbai for Indian audience performance).
4. Securely note your Database Password.

---

### Step 2: Apply Database Migrations
You can apply the migrations using either the Supabase Dashboard SQL Editor or the Supabase CLI.

#### Option A: Via Supabase Dashboard SQL Editor
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab.
2. Open and run the contents of [`supabase/migrations/20261101000001_initial_schema.sql`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000001_initial_schema.sql).
3. Next, open and run [`supabase/migrations/20261101000002_row_level_security.sql`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/migrations/20261101000002_row_level_security.sql).

#### Option B: Via Supabase CLI
```bash
# Link your local project to your remote Supabase project
npx supabase link --project-ref your-project-ref

# Push database migrations
npx supabase db push
```

---

### Step 3: Populate Initial Seed Data
1. In the SQL Editor, execute the contents of [`supabase/seed.sql`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/seed.sql).
2. This will idempotently seed:
   - Cities: `chittoor`, `vellore`, `bengaluru`.
   - All 10 business categories with multi-lingual metadata (Telugu, Tamil, Kannada).
   - 10 verified Chittoor listings (`c-001` through `c-010`).
   - 3 verified Vellore listings (`v-001` through `v-003`).
   - 3 verified Bengaluru listings (`b-001` through `b-003`).

---

### Step 4: Configure Supabase Storage Bucket
1. In the Supabase Dashboard, navigate to **Storage**.
2. Click **New Bucket**.
3. Bucket Name: `business-images`
4. Set to **Public Bucket** (required for CDN delivery of approved storefront photographs).
5. File size limit: `5MB`
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
7. Storage RLS policies are automatically configured to allow authenticated owners to upload to their business folder and public visitors to read active images.

---

### Step 5: Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project keys from **Project Settings > API**:
```env
# Supabase Managed Backend Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-publishable-key
```

> [!CAUTION]
> **Security Rule:** Never put the `service_role` secret key or database master password into the frontend `.env` file! Only use the public publishable anon key.

---

### Step 6: Provisioning Privileged Roles
By default, public registration creates `customer` or `business_owner` accounts.
To provision a **City Franchise Manager** or **Super Admin**, execute the following in the SQL Editor:

```sql
-- Replace 'USER_UUID_FROM_AUTH_USERS' with the actual user id from auth.users table
INSERT INTO public.user_roles (user_id, role, city_id)
VALUES ('USER_UUID_FROM_AUTH_USERS', 'city_franchise', 'chittoor')
ON CONFLICT (user_id, role, city_id) DO NOTHING;

-- Or to grant global Super Admin access:
INSERT INTO public.user_roles (user_id, role, city_id)
VALUES ('USER_UUID_FROM_AUTH_USERS', 'super_admin', NULL)
ON CONFLICT (user_id, role, city_id) DO NOTHING;
```

---

### Step 7: Running Security Verification Tests
Execute [`supabase/tests/rls_policies_test.sql`](file:///c:/Users/kthar/Downloads/remix-client.new.project/supabase/tests/rls_policies_test.sql) in the SQL Editor.
The test script runs inside an automatic transaction (`BEGIN ... ROLLBACK;`) that leaves zero test records behind while asserting that:
- Anonymous visitors cannot read pending businesses or private enquiries.
- Competitor business owners cannot read each other's private customer leads.
- Vellore franchise operators cannot read Chittoor city enquiries.
- Business owners cannot bypass approval triggers or self-promote to admin roles.

---

## 3. Development vs Production Behavior

The application is engineered with an intelligent fallback architecture:
- **When `.env` has valid Supabase credentials:** The application communicates directly with your PostgreSQL database, enforcing Supabase Auth sessions, database-backed listings, real storage uploads, and private customer leads.
- **When `.env` is unconfigured (offline / demo mode):** The application automatically falls back to local `localStorage` and demo provider mode, allowing testing of all UI features without throwing errors or breaking the frontend.

