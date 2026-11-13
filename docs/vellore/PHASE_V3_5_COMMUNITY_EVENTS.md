# KAARYAN LABS — PHASE V3.5: VELLORE ADS (TN-23)
## COMMUNITY NOTICEBOARD & LOCAL EVENTS IMPLEMENTATION REPORT

**Author:** Senior React/TypeScript Full-Stack Engineer, Software Architect & QA Lead  
**Scope:** Strictly `/city/vellore` (TN-23)  
**Protected Territories:** Chittoor Ads (`AP-03`), Bengaluru Ads (`KA-01`)  
**Status:** Verification Passed (100%) — Ready for Staging Review  
**Date:** November 12, 2026  

---

## 1. Executive Summary

In Phase V3.5, KAARYAN LABS delivered a production-grade, hyper-local **Community Noticeboard** and **Local Events Calendar** experience exclusively for **Vellore Ads (TN-23)**. This release fulfills a core requirement from the Vellore legacy feature parity audit, providing civic institutions, resident welfare associations, students, healthcare forums, and local event organizers with a verified, accessible platform for non-commercial notices and community gatherings.

### Key Milestones Delivered:
1. **Community Noticeboard (`/city/vellore/community` and `/city/vellore/community/:id`):**
   - Categorized announcements: Community, Education & Student Notices, Public & Civic Notices, Local Jobs, Lost & Found, and Other.
   - Pinned, Urgent, and Standard notice prioritization with Asia/Kolkata date displays.
   - Accessible detail dialogs with shareable URLs and privacy-guarded contact cards.
2. **Local Events Calendar (`/city/vellore/events` and `/city/vellore/events/:id`):**
   - Chronological calendar with upcoming vs. past archives toggle.
   - Date badge displays formatted in `en-IN` (Asia/Kolkata timezone).
   - Category filtering (Cultural, Education, Business & Expo, Sports, Entertainment).
   - Sanitized external RSVP / registration links restricted strictly to HTTP/HTTPS protocols.
3. **Public Submission Modals with Defensive Validation:**
   - Strict input length boundaries (titles 5–120 chars, descriptions 10–3000 chars, venues 3–150 chars).
   - Anti-spam idempotency interceptor preventing duplicate submissions within 5 minutes.
   - Explicit consent opt-in for public contact disclosure (`showContact`).
   - Default initial state is strictly `pending` moderation.
4. **Franchise Content Moderation Center (`FranchiseContentPage.tsx`):**
   - Added Community Notices and Local Events moderation tabs for Vellore franchise operators.
   - One-click approve/publish, reject, and review workflows.
   - Clearly labeled staging/local demo mode banner preventing confusion before database migration.
5. **Architectural Safety & Migration Governance:**
   - Authored proposed migration `supabase/migrations/20261112000001_community_notices_and_events.sql` with Row Level Security (RLS) policies.
   - Strictly preserved the rule: **No migrations executed on live production database**.
   - Preserved `supabase/migrations/20261103000003_super_admin_governance.sql` untouched.
   - Complete zero modifications to Chittoor (`AP-03`) or Bengaluru (`KA-01`).

---

## 2. Architecture & Data Model

### 2.1 Database Schema (Proposed Migration)
The proposed migration is archived at `supabase/migrations/20261112000001_community_notices_and_events.sql` with explicit warning headers:

```sql
-- PROPOSED MIGRATION (NOT EXECUTED)
-- STRICT NOTICE: Under Phase V3.5 governance rules, this migration is for architecture documentation
-- and future staging deployment only. DO NOT EXECUTE ON PRODUCTION WITHOUT EXPLICIT WRITTEN APPROVAL.

-- Table: public.community_notices
CREATE TABLE IF NOT EXISTS public.community_notices (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore',
    title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('community', 'education', 'public_notice', 'jobs', 'lost_found', 'other')),
    content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 2000),
    locality TEXT NOT NULL,
    organizer_name TEXT NOT NULL CHECK (char_length(organizer_name) >= 2 AND char_length(organizer_name) <= 100),
    contact_phone TEXT,
    contact_email TEXT,
    show_contact BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived')),
    priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'urgent', 'pinned')),
    publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    expiry_date TIMESTAMPTZ,
    rejection_reason TEXT,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.local_events
CREATE TABLE IF NOT EXISTS public.local_events (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL DEFAULT 'vellore',
    title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
    category TEXT NOT NULL CHECK (category IN ('cultural', 'education', 'business', 'sports', 'entertainment', 'other')),
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 Row Level Security (RLS) Policies
1. **Public Read Access:**
   - Anonymous and authenticated visitors can only `SELECT` records where `status = 'published'` and `publish_date <= now()`.
   - Expired notices (`expiry_date <= now()`) are excluded automatically.
2. **Public Submission Access:**
   - Anonymous and authenticated users can only `INSERT` records with `status = 'pending'`.
   - Direct publication via client-side write manipulation is blocked by the `WITH CHECK (status = 'pending')` constraint.
3. **Franchise Moderation Access:**
   - Full `ALL` access restricted to users holding `super_admin` role or `auth.jwt() ->> 'city_id' = city_id`.

---

## 3. Territorial Feature Isolation

To ensure that the Community Noticeboard and Local Events features remain strictly confined to Vellore without polluting Chittoor (`AP-03`) or Bengaluru (`KA-01`), explicit boolean flags are established in `CityConfig['features']`:

| Territory | City Code | hasCommunityNoticeboard | hasLocalEvents | Impact |
| :--- | :---: | :---: | :---: | :--- |
| **Vellore** | `TN-23` | **`true`** | **`true`** | Community & Events nav tabs, routes, and views enabled |
| **Chittoor** | `AP-03` | **`false`** | **`false`** | Retains Kanipakam pilgrimage special; community tabs hidden |
| **Bengaluru** | `KA-01` | **`false`** | **`false`** | Retains IT/commercial directory; community tabs hidden |

If a user manually navigates to `/city/chittoor/community` or `/city/bengaluru/events`, `App.tsx` renders a graceful city-isolation fallback notice informing the user that the feature is exclusive to Vellore (`TN-23`) and provides a one-click return to the active city's home directory.

---

## 4. Routing, Static Prerendering & Vercel Configuration

### 4.1 Route Resolver (`src/utils/cityResolver.ts`)
The city routing utilities were extended to recognize subpaths cleanly:
- `/community` and `/community/:id` -> `tab: 'community'`, `noticeId`
- `/events` and `/events/:id` -> `tab: 'events'`, `eventId`
- `buildCityRouteUrl` supports generating canonical links with `noticeId` and `eventId`.

### 4.2 SEO Static Prerendering (`scripts/prerender-seo.ts`)
During Vite build execution, the static prerenderer outputs SEO-optimized HTML entrypoints:
- `dist/city/vellore/community/index.html` (Title: *Vellore Community Noticeboard - Public Announcements & Civic Updates (TN-23)*)
- `dist/city/vellore/events/index.html` (Title: *Vellore Local Events Calendar - Conferences, Concerts & Workshops (TN-23)*)

### 4.3 Vercel Rewrites (`vercel.json`)
Specific static rewrites were prepended before catch-all routes:
```json
    {
      "source": "/city/vellore/community",
      "destination": "/city/vellore/community/index.html"
    },
    {
      "source": "/city/vellore/events",
      "destination": "/city/vellore/events/index.html"
    }
```

---

## 5. Security & Input Sanitization

### 5.1 Protocol Sanitization
External event registration URLs are evaluated using `isValidWebUrl()`:
- `https://...` -> **ALLOWED**
- `http://...` -> **ALLOWED**
- `javascript:...` -> **BLOCKED**
- `data:...` -> **BLOCKED**
- `ftp:...` -> **BLOCKED**

All outbound links render with `rel="noopener noreferrer"` and `target="_blank"`.

### 5.2 Anti-Spam Duplicate Interception
In `communityService.ts`, submissions are checked against existing in-memory/browser records. If an identical title + organizer combination is submitted within 5 minutes (300,000 ms), the service flags `isDuplicate: true`, prevents spam duplication, and informs the submitter that their notice/event is already queued for review.

### 5.3 Privacy & Contact Guard
When submitting a notice, users are presented with an explicit checkbox:
> *"Display my contact information publicly on the noticeboard. If unchecked, contact info is only visible to the moderation team."*

In public view cards and detail modals, contact phone and email links are only rendered if `showContact === true`.

---

## 6. Verification & Test Evidence

### 6.1 Test Suites Execution Results

| Test Suite File | Assertions Passed | Failed | Status |
| :--- | :---: | :---: | :---: |
| `scripts/verify-vellore-v3-5-community.ts` | **37 / 37** | 0 | **100% PASS** |
| `scripts/verify-vellore-v3-4-enquiry.ts` | **43 / 43** | 0 | **100% PASS** |
| `scripts/verify-vellore-v3-4-1-live.ts` | **35 / 35** | 0 | **100% PASS** |
| `scripts/verify-vellore-v3-3-directory.ts` | **68 / 68** | 0 | **100% PASS** |
| `scripts/verify-vellore-v3-2-features.ts` | **50 / 50** | 0 | **100% PASS** |
| `scripts/verify-three-city-region-lock.ts` | **81 / 81** | 0 | **100% PASS** |
| `scripts/verify-unified-login-security.ts` | **69 / 69** | 0 | **100% PASS** |
| **Combined Platform Assertions** | **383 / 383** | **0** | **100% PASS** |

### 6.2 Browser CDP Responsiveness & Overflow Audit
Headless Chrome was executed across 4 standardized viewports with CDP assertions (`document.documentElement.scrollWidth <= window.innerWidth`):

1. **Desktop (1440px × 900px):**
   - Community Noticeboard: `true` (No horizontal scroll)
   - Local Events Calendar: `true` (No horizontal scroll)
   - Screenshot: `phase_v3_5_community_desktop_1440px.png`
   - Screenshot: `phase_v3_5_events_desktop_1440px.png`
2. **Tablet (768px × 1024px):**
   - Community Noticeboard: `true` (No horizontal scroll)
   - Local Events Calendar: `true` (No horizontal scroll)
   - Screenshot: `phase_v3_5_community_tablet_768px.png`
   - Screenshot: `phase_v3_5_events_tablet_768px.png`
3. **Mobile (390px × 844px):**
   - Community Noticeboard: `true` (No horizontal scroll)
   - Local Events Calendar: `true` (No horizontal scroll)
   - Notice Submission Modal: verified accessible, fits within mobile screen
   - Event Submission Modal: verified accessible, fits within mobile screen
   - Screenshot: `phase_v3_5_community_mobile_390px.png`
   - Screenshot: `phase_v3_5_notice_modal_mobile_390px.png`
   - Screenshot: `phase_v3_5_events_mobile_390px.png`
   - Screenshot: `phase_v3_5_event_modal_mobile_390px.png`
4. **Small Mobile (320px × 568px):**
   - Community Noticeboard: `true` (No horizontal scroll)
   - Local Events Calendar: `true` (No horizontal scroll)
   - Screenshot: `phase_v3_5_community_small_mobile_320px.png`
   - Screenshot: `phase_v3_5_events_small_mobile_320px.png`

---

## 7. Captured Visual Evidence

### Community Noticeboard Views
- **Desktop (1440px):**  
  ![Vellore Community Desktop](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_community_desktop_1440px.png)
- **Tablet (768px):**  
  ![Vellore Community Tablet](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_community_tablet_768px.png)
- **Mobile (390px):**  
  ![Vellore Community Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_community_mobile_390px.png)
- **Notice Submission Modal (390px):**  
  ![Notice Submission Modal Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_notice_modal_mobile_390px.png)
- **Small Mobile (320px):**  
  ![Vellore Community Small Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_community_small_mobile_320px.png)

### Local Events Views
- **Desktop (1440px):**  
  ![Vellore Events Desktop](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_events_desktop_1440px.png)
- **Tablet (768px):**  
  ![Vellore Events Tablet](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_events_tablet_768px.png)
- **Mobile (390px):**  
  ![Vellore Events Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_events_mobile_390px.png)
- **Event Submission Modal (390px):**  
  ![Event Submission Modal Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_event_modal_mobile_390px.png)
- **Small Mobile (320px):**  
  ![Vellore Events Small Mobile](file:///C:/Users/kthar/.gemini/antigravity/brain/9076861a-2010-4a7c-a3c7-3851ba7daeeb/phase_v3_5_events_small_mobile_320px.png)

---

## 8. Staging & Production Rollout Checklist

Before promoting Phase V3.5 changes to production, execute the following steps in order:

1. **Staging Environment Migration:**
   - Execute `supabase/migrations/20261112000001_community_notices_and_events.sql` strictly on the authorized staging project (`tbwtxnszyddvpgqvxwow`).
   - Verify table creation, indexes, and RLS policies using Supabase dashboard table editor.
2. **Franchise Staging Moderation Verification:**
   - Sign in as Vellore Franchise operator on staging.
   - Test approval of pending community notices and events.
   - Verify that published notices immediately reflect in public queries.
3. **Production Deployment Sign-Off:**
   - Confirm written sign-off from KAARYAN LABS governance team.
   - Commit code to release branch, push, and deploy to Vercel production.
   - Apply migration to production Supabase database.
