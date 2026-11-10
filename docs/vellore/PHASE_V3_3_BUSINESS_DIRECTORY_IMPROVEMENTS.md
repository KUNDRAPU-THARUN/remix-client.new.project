# KAARYAN LABS — PHASE V3.3 ENGINEERING REPORT
## VELLORE ADS (TN-23): BUSINESS DIRECTORY IMPROVEMENTS

**Date:** November 10, 2026  
**Target Territory:** Vellore Ads (`/city/vellore`, TN-23)  
**Protected Territories:** Chittoor Ads (`/city/chittoor`, AP-03), Bengaluru Ads (`/city/bengaluru`, KA-01)  
**Branch:** `feat/platform-integration-phase-8`  
**Base Commit:** `06fb224`  
**Status:** COMPLETE & VERIFIED  

---

### 1. Executive Summary & Mission Scope

Phase V3.3 delivers comprehensive improvements to the Vellore local business directory and business profile experience across homepage featured businesses, category directory results, detail modals, and standalone profile routes (`/city/vellore/biz/:id`). All enhancements strictly respect multi-city architecture, data reliability standards, and zero-fabrication rules established in prior release gates.

#### Key Engineering Deliverables Completed:
1. **Real-time Operating Hours Calculator (`src/utils/operatingHours.ts`):** Evaluates business status in Indian Standard Time (`Asia/Kolkata`, UTC+5:30) with support for 12h AM/PM strings, multiple shifts, overnight intervals spanning midnight, explicit closed days, and resilient fallback to `"Hours Unavailable"` for untrusted/placeholder inputs (e.g. `"Sample Timings"`).
2. **Accessible Mobile Photo Gallery (`src/components/VelloreImageGallery.tsx`):** Touch swipe gestures with horizontal dominance tracking, overlay navigation arrows, dynamic counter pill (`X / Y`), keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), and responsive lightbox mode.
3. **Accurate Trust & Moderation Labels:** Guaranteed separation between `Verified Business` (`isVerified === true`), `Preview Listing` (active demo/unverified listings), and `Pending Approval` (under moderation). Zero unverified listings display false verification badges.
4. **Structured Price Range Indicators:** Displayed strictly when authentic structured data exists in `listing.priceRange`; cleanly omitted when absent.
5. **Full Multi-Viewport CDP Verification:** 15 automated browser assertions and 6 responsive screenshot captures across Desktop (1440px), Tablet (768px), Mobile (390px), and Small Mobile (320px) verifying zero horizontal overflow and zero console errors.
6. **Cross-City Isolation & Zero Regressions:** Protected Chittoor Ads (AP-03) and Bengaluru Ads (KA-01) retained exact existing behavior. All 68 Phase V3.3 automated assertions and 350+ regression tests passed with 100% success.

---

### 2. Component & Architecture Inventory

| File Path | Role & Changes |
| :--- | :--- |
| `src/utils/operatingHours.ts` | **NEW:** Real-time operating hours parser, interval calculator, and timezone evaluator (`Asia/Kolkata`). Supports 12-hour AM/PM formats, split intervals, overnight hours, and untrusted placeholder rejection. |
| `src/components/VelloreImageGallery.tsx` | **NEW:** Reusable, touch-swipe enabled image gallery component with overlay buttons, photo counter pill, thumbnail carousel, keyboard listeners, and modal lightbox. |
| `src/components/ListingCard.tsx` | **MODIFIED:** Added real-time operating hours status pill (`Open Now` / `Closed` / `Hours Unavailable`), accurate trust badges (`Verified` vs `Preview Listing` vs `Pending Approval`), and guarded structured price range display for Vellore listings without altering Chittoor or Bengaluru cards. |
| `src/components/ListingDetailModal.tsx` | **MODIFIED:** Integrated `VelloreImageGallery` in Gallery tab; updated About banner with accurate trust indicators and real-time operating hours pill; refined working hours in Quick Details grid. |
| `src/components/StandaloneBusinessPage.tsx` | **MODIFIED:** Integrated `VelloreImageGallery` in Photos tab; updated profile header with structured price range pill, accurate trust badges, and operating hours status; eliminated fabricated fallback hours string (`'Mon – Sat: 9:00 AM – 8:00 PM'`). |
| `src/components/HomeSections.tsx` | **MODIFIED:** Integrated real-time operating status pill and preview badge on Vellore featured business cards on the homepage. |
| `scripts/verify-vellore-v3-3-directory.ts` | **NEW:** Automated test suite verifying 68 assertions across timezone math, interval parsing, trust badge distribution, price range rules, gallery contract, and cross-city isolation. |
| `scripts/verify-vellore-v3-3-browser.ts` | **NEW:** Headless Chrome CDP browser verification suite testing responsive layouts, touch gallery rendering, horizontal overflow, and console errors across 4 viewports. |

---

### 3. Detailed Technical Solutions

#### 3.1 Real-Time Operating Hours (`src/utils/operatingHours.ts`)
- **Timezone Invariance:** Employs `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` and `hourCycle: 'h23'` to compute current day of week and minute offset in IST regardless of the client machine's local timezone.
- **12-Hour AM/PM Time Parsing (`parseTimeToMinutes`):** Converts inputs such as `"10:00 AM"` (600m), `"12:00 PM"` (720m), `"8:30 PM"` (1230m), and `"12:00 AM"` (0m) into minute offsets from midnight (0..1439).
- **Multiple Interval Support (`parseTimeIntervals`):** Regex extracts multi-shift schedules (e.g., `"9:00 AM - 1:00 PM, 4:00 PM - 9:00 PM"`).
- **Overnight Interval Calculation:** Identifies intervals where `startMinutes > endMinutes` (e.g. `"8:00 PM - 2:00 AM"`). Evaluates open status for:
  - Portion 1: Active day evening after `startMinutes`.
  - Portion 2: Following day early morning before `endMinutes` when the preceding day was active.
- **Closed Day Handling:** Parses prefixes such as `"Mon-Sat:"` (Sunday closed) and explicit clauses like `"Sunday: Closed"`.
- **Zero-Fabrication Fallbacks:** Strings matching developer mocks or placeholders (`"Sample Timings"`, `"TBD"`, empty string, `null`) return `{ status: 'unavailable', label: 'Hours Unavailable', ... }`. The system never invents hours.

#### 3.2 Accessible Mobile Photo Gallery (`VelloreImageGallery.tsx`)
- **Touch Gesture Swipe:** Listens to `onTouchStart` and `onTouchEnd`. Computes delta offsets:
  $$\Delta X = \text{touchEndX} - \text{touchStartX}$$
  $$\Delta Y = \text{touchEndY} - \text{touchStartY}$$
  Enforces horizontal dominance check (`Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40`) to prevent interfering with vertical page scrolling.
- **Overlay Navigation:** Previous/Next overlay chevron buttons with distinct `aria-label="Previous photo"` and `aria-label="Next photo"`.
- **Dynamic Counter Pill:** High-contrast `X / Y` indicator pill (`bg-black/65 backdrop-blur-md`) positioned at bottom-right.
- **Keyboard Navigation:** Event listeners for `ArrowLeft`, `ArrowRight`, and `Escape` (to dismiss lightbox).

#### 3.3 Accurate Trust & Moderation Labels
In accordance with platform trust requirements:
- **Verified Business:** Only rendered when `listing.isVerified === true`.
- **Pending Approval:** Displayed as `"Pending Approval"` (or `"Pending Moderation"`) when `listing.status === 'Pending Approval'`.
- **Preview Listing:** Rendered as `"Preview Listing"` (or `"Preview"`) for active unverified listings.
- In `ListingDetailModal.tsx`, the legacy hardcoded `<span className="... bg-emerald-600">Verified {cityConfig.code} Listing</span>` banner was updated to dynamically evaluate `listing.isVerified` and display `"Preview Listing"` or `"Pending Moderation"` for unverified records.

#### 3.4 Structured Price Range Rules
- In `ListingCard.tsx`, `ListingDetailModal.tsx`, and `StandaloneBusinessPage.tsx`, price badges are strictly rendered when `listing.priceRange` contains non-empty text (e.g., `"Consultation by Appointment"`, `"Dining & Takeaway"`, `"Monthly Accommodation"`).
- Omitted entirely when `priceRange` is absent or whitespace. Zero fallback pricing is invented.

---

### 4. Verification & Automated Test Results

#### 4.1 Unit & Contract Verification Suite (`scripts/verify-vellore-v3-3-directory.ts`)
```
================================================================
KAARYAN LABS — PHASE V3.3 BUSINESS DIRECTORY VERIFICATION SUITE
================================================================

--- 1. Timezone & 12-Hour AM/PM Time Parsing ---
  [PASS] 12:00 AM parses to 0 minutes
  [PASS] 12:30 AM parses to 30 minutes
  [PASS] 9:00 AM parses to 540 minutes
  [PASS] 12:00 PM parses to 720 minutes
  [PASS] 1:15 PM parses to 795 minutes
  [PASS] 8:30 PM parses to 1230 minutes
  [PASS] 11:59 PM parses to 1439 minutes
  [PASS] Invalid string returns null
  [PASS] Empty string returns null
  [PASS] Multiple intervals parsed count = 2
  [PASS] Interval 1: 9:00 AM (540m) to 1:00 PM (780m)
  [PASS] Interval 2: 4:00 PM (960m) to 9:00 PM (1260m)

--- 2. Real-Time Operating Hours Evaluation in Asia/Kolkata ---
  [PASS] Mon-Sat is Open at Wednesday 2:00 PM IST
  [PASS] Label is "Open Now" when open
  [PASS] Mon-Sat is Closed at Wednesday 10:00 PM IST
  [PASS] Label is "Closed" when closed
  [PASS] Mon-Sat is Closed on Sunday (inactive day)
  [PASS] Daily schedule is Open on Sunday 2:00 PM IST
  [PASS] Split schedule: Open in morning shift (11 AM)
  [PASS] Split schedule: Closed during break (2 PM)
  [PASS] Split schedule: Open in evening shift (6 PM)
  [PASS] Split schedule: Closed after hours (10 PM)
  [PASS] Overnight: Open at 9:00 PM IST
  [PASS] Overnight: Open at 1:30 AM IST next day
  [PASS] Overnight: Closed at 4:00 AM IST
  [PASS] 24 Hours schedule is Open Now
  [PASS] Open 24x7 schedule is Open Now
  [PASS] "Sample Timings" returns status "unavailable"
  [PASS] "Sample Timings" label is "Hours Unavailable"
  [PASS] Empty string returns "unavailable"
  [PASS] null returns "unavailable"
  [PASS] undefined returns "unavailable"

--- 3. Vellore Mock Data Trust & Verification Audit ---
  [PASS] Vellore listings found in mock data: 5
  [PASS] Zero unverified Vellore listings are marked isVerified = true
  [PASS] Listing v-001 found
  [PASS] v-001 with "Sample Timings" correctly resolves to "Hours Unavailable" without fabricated hours
  [PASS] Listing v-003 found
  [PASS] v-003 has timings "Daily: 11:30 AM - 10:30 PM"
  [PASS] v-003 evaluates to Open on Sunday 2:00 PM IST

--- 4. Structured Price Range Indicator Rules ---
  [PASS] Listing v-001 has valid structured priceRange: "Consultation by Appointment"
  [PASS] Listing v-002 has valid structured priceRange: "Monthly Accommodation"
  [PASS] Listing v-003 has valid structured priceRange: "Dining & Takeaway"
  [PASS] Listing v-pending-01 has valid structured priceRange: "Wholesale & Retail"
  [PASS] Listing v-pending-02 has valid structured priceRange: "Tariff by Event"

--- 5. Mobile Photo Gallery Contract Verification ---
  [PASS] VelloreImageGallery.tsx exists
  [PASS] Gallery implements touch gesture listeners
  [PASS] Gallery implements minSwipeDistance swipe threshold
  [PASS] Gallery ensures horizontal swipe dominance over vertical scroll
  [PASS] Gallery includes accessible Previous button label
  [PASS] Gallery includes accessible Next button label
  [PASS] Gallery includes photo count indicator pill
  [PASS] Gallery includes keyboard navigation handlers
  [PASS] Gallery includes Escape key handler for fullscreen modal

--- 6. Component Integrations & Trust Label Contracts ---
  [PASS] ListingCard imports and uses getOperatingHoursStatus
  [PASS] ListingCard determines isVellore
  [PASS] ListingCard renders Preview Listing label for unverified Vellore items
  [PASS] ListingCard renders real-time hours status badge
  [PASS] ListingDetailModal uses VelloreImageGallery for photos
  [PASS] ListingDetailModal imports and uses getOperatingHoursStatus
  [PASS] ListingDetailModal has accurate trust labels
  [PASS] StandaloneBusinessPage uses VelloreImageGallery
  [PASS] StandaloneBusinessPage imports and uses getOperatingHoursStatus
  [PASS] StandaloneBusinessPage no longer fabricates fallback timings
  [PASS] HomeSections uses getOperatingHoursStatus
  [PASS] HomeSections renders real-time hours badge for Vellore

--- 7. Cross-City Isolation Verification ---
  [PASS] Chittoor (AP-03) config intact
  [PASS] Bengaluru (KA-01) config intact
  [PASS] Vellore (TN-23) config intact

================================================================
TEST RESULTS: 68 PASSED, 0 FAILED (100% SUCCESS)
================================================================
```

#### 4.2 Browser CDP & Responsive Verification (`scripts/verify-vellore-v3-3-browser.ts`)
```
======================================================================
KAARYAN LABS — PHASE V3.3 VELLORE DIRECTORY BROWSER VERIFICATION
======================================================================

[HTTP Server] Listening on http://127.0.0.1:8097

--- 1. Testing /city/vellore Homepage & Featured Business Cards ---
  ✅ PASS: Homepage title mentions Vellore Ads
  ✅ PASS: Found 3 Preview badges on homepage cards
  📸 Captured Homepage Desktop -> phase_v3_3_vellore_home_desktop_1440px.png
  ✅ PASS: Homepage desktop has zero horizontal overflow
  📸 Captured Homepage Mobile -> phase_v3_3_vellore_home_mobile_390px.png
  ✅ PASS: Homepage mobile (390px) has zero horizontal overflow

--- 2. Testing /city/vellore/biz/v-001 Standalone Profile (Preview Item) ---
  ✅ PASS: Page loaded v-001 profile heading
  ✅ PASS: v-001 displays "Preview Listing" trust badge
  ✅ PASS: v-001 displays "Hours Unavailable" without fabricating hours
  ✅ PASS: v-001 displays structured price range indicator
  📸 Captured Biz Profile Desktop -> phase_v3_3_vellore_biz_desktop_1440px.png
  📸 Captured Biz Profile Tablet -> phase_v3_3_vellore_biz_tablet_768px.png
  📸 Captured Biz Profile Mobile -> phase_v3_3_vellore_biz_mobile_390px.png
  📸 Captured Biz Profile Small Mobile -> phase_v3_3_vellore_biz_small_mobile_320px.png
  ✅ PASS: v-001 has zero horizontal overflow on Desktop (1440px)
  ✅ PASS: v-001 has zero horizontal overflow on Tablet (768px)
  ✅ PASS: v-001 has zero horizontal overflow on Mobile (390px)
  ✅ PASS: v-001 has zero horizontal overflow on Small Mobile (320px)

--- 3. Testing /city/vellore/biz/v-003 & Photos Gallery ---
  ✅ PASS: Page loaded v-003 profile heading
  ✅ PASS: Photo Gallery counter indicator (X / Y) is rendered

--- 4. Runtime Console Error Check ---
  ✅ PASS: Zero runtime console errors during browser navigation

======================================================================
BROWSER TEST RESULTS: 15 PASSED, 0 FAILED (100% SUCCESS)
======================================================================
```

#### 4.3 Platform Regression Summary

| Test Suite | Focus Area | Assertions | Result |
| :--- | :--- | :--- | :--- |
| `npm run lint` (`tsc --noEmit`) | TypeScript Strict Compilation | All source files | ✅ 0 errors |
| `npm run build` | Vite Bundle & SEO Static Prerender | 5 static HTML pages | ✅ Passed |
| `scripts/verify-vellore-v3-3-directory.ts` | Phase V3.3 Hours & Trust Contract | 68/68 checks | ✅ 100% Passed |
| `scripts/verify-vellore-v3-3-browser.ts` | Headless Chrome CDP Verification | 15/15 checks | ✅ 100% Passed |
| `scripts/verify-three-city-region-lock.ts` | Three-City Region Lock Security | 81/81 checks | ✅ 100% Passed |
| `scripts/verify-unified-login-security.ts` | Multi-City Data & Moderation Security | 69/69 checks | ✅ 100% Passed |
| `scripts/verify-vellore-v2-reliability.ts` | Contact Validation & Reviews Integrity | 150/150 checks | ✅ 100% Passed |
| `scripts/verify-vellore-v3-2-features.ts` | Routing & Subpage Contract | 50/50 checks | ✅ 100% Passed |
| **Total Assertions** | **Cross-Platform Test Suite** | **433+ checks** | **100% PASS** |

---

### 5. Release Gate Compliance Audit

1. **Website Branding & Design:** Preserved existing layout and theme colors. Zero redesign.
2. **Database Migrations:** No migrations executed; no database records altered.
3. **Protected Migration File:** `supabase/migrations/20261103000003_super_admin_governance.sql` preserved uncommitted.
4. **Credential Security:** Zero disclosure or modification of `.env.local`.
5. **Cross-City Isolation:** Chittoor (`AP-03`) and Bengaluru (`KA-01`) routing and design untouched.
6. **Git Release Guard:** Strictly zero auto-commits, pushes, or deployments.
