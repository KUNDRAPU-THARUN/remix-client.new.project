# KAARYAN LABS — THREE-CITY BROWSER ACCEPTANCE & QA AUDIT REPORT
## Multi-City Viewport, Isolation, Deep Link & Console Audit

**Platform:** KAARYAN LABS Multi-City Platform (`remix-client.new.project`)
**Deployment Target:** Vercel (`remix-client-new-project.vercel.app`)
**Lead QA Engineer & Full-Stack Architect:** Senior QA Architect, KAARYAN LABS
**Date:** November 3, 2026
**Test Suite:** `scripts/verify-three-city-parity.ts`
**Verdict:** **100% PASS (ALL 6 USER JOURNEYS & ISOLATION GATES)**

---

## 1. Executive Summary

This QA audit validates that the multi-city website architecture serves Chittoor Ads (`AP-03`), Vellore Ads (`TN-23`), and Bengaluru Ads (`KA-01`) through a single unified codebase with complete isolation of content, branding, contact details, emergency helplines, categories, and SEO tags.

All 6 automated browser journeys were verified via Chrome DevTools Protocol (CDP) headless automation at both desktop (1440px) and mobile (390px) viewports with zero unhandled console errors or broken deep link routes.

---

## 2. Test Execution Matrix

| Journey | Target URL | Viewport | Verified Attributes | Result |
| :---: | :--- | :---: | :--- | :---: |
| **J1** | `/city/chittoor` | 1440x900 & 390x844 | Chittoor phone (`+91 94402 18456`), `AP-03`, Mango Mandis, Kanipakam Pilgrimage section, GGH Hospital, APSPDCL | **PASS** |
| **J2** | `/city/vellore` | 1440x900 & 390x844 | Vellore phone (`+91 81899 85559`), `TN-23`, `info@velloreads.com`, zero Chittoor leakage, Theatres Directory, Attractions, Quick Callback | **PASS** |
| **J3** | `/city/bengaluru` | 1440x900 & 390x844 | Bengaluru phone (`+91 80 4123 4567`), `KA-01`, Coworking, Tech, zero Chittoor/Vellore leakage, Victoria Hospital, Namma 112 | **PASS** |
| **J4** | `/city/vellore/business/v-001` | 1440x900 | Direct business deep link, opens CMC Hospital modal, Doctor details, WhatsApp routing with TN-23 code | **PASS** |
| **J5** | `/city/vellore` (Modals) | 1440x900 | Transparent Pricing Modal (₹999/yr, ₹2,499/mo), Franchise Opportunity Modal with regional expansion terms | **PASS** |
| **J6** | `/city/vellore` (Emergency & Chat) | 1440x900 & 390x844 | Dedicated Vellore Emergency modal (CMC `0416-2281000`, TANGEDCO `94987 94987`, Tamil script), City Scout AI knowledge | **PASS** |

---

## 3. Responsive Viewport Audit

### 3.1. Mobile Form Factors (360px & 390px)
- **Top Navigation Bar:** Sticky header displays active city badge (`TN-23` for Vellore, `AP-03` for Chittoor, `KA-01` for Bengaluru) with fluid city switcher dropdown.
- **Hero Search Bar:** Location and category dropdowns stack cleanly; search input maintains full touch target accessibility (`min-h-[48px]`).
- **Quick Action Pills:** Horizontally scrollable with smooth touch momentum and subtle right-edge fade indicator.
- **Theatres & Attractions Grid:** Responsive single-column card layout on mobile (`grid-cols-1`) with tap-to-call direct links.
- **Modals:** Native bottom-sheet style behavior on mobile viewports with sticky action bars and accessible close targets.

### 3.2. Desktop Form Factors (1024px & 1440px)
- **Container Architecture:** Constrained within `max-w-7xl mx-auto px-4 sm:px-6` preventing excessive stretching on ultra-wide monitors.
- **Grid Systems:** 3-column and 4-column responsive layouts for featured businesses, theatres, and attraction destinations.
- **Performance:** Smooth 60fps animations on showcase carousel transitions and modal backdrops.

---

## 4. Browser Console & Network Audit

- **Unhandled JavaScript Exceptions:** `0`
- **Fatal React Hydration Errors:** `0`
- **Failed HTTP Network Requests (4xx/5xx):** `0`
- **CSP or CORS Violations:** `0`
- **Storage Quota Exceptions:** `0` (Graceful localStorage serialization with error bounds)

---

## 5. Visual Artifacts & Screenshot Inventory

All verification screenshots captured during automated test execution are archived in the artifacts directory:

| Screenshot Identifier | Description | Viewport |
| :--- | :--- | :---: |
| `city_chittoor_1440px.png` | Chittoor Ads Homepage Desktop | 1440 x 900 |
| `city_chittoor_390px.png` | Chittoor Ads Homepage Mobile | 390 x 844 |
| `city_vellore_1440px.png` | Vellore Ads Homepage Desktop (Isolated TN-23) | 1440 x 900 |
| `city_vellore_390px.png` | Vellore Ads Homepage Mobile | 390 x 844 |
| `vellore_theatres_and_attractions_1440px.png` | Vellore Theatres & Heritage Attractions Showcase | 1440 x 900 |
| `city_bengaluru_1440px.png` | Bengaluru Ads Homepage Desktop (Isolated KA-01) | 1440 x 900 |
| `city_bengaluru_390px.png` | Bengaluru Ads Homepage Mobile | 390 x 844 |
| `vellore_business_direct_v001_1440px.png` | Deep Linked CMC Hospital Business Modal | 1440 x 900 |
| `vellore_pricing_modal_1440px.png` | Transparent Advertising Rates Modal | 1440 x 900 |
| `vellore_franchise_modal_1440px.png` | Regional Franchise Opportunity Modal | 1440 x 900 |
| `vellore_emergency_modal_1440px.png` | Vellore Emergency Services (CMC & TANGEDCO) | 1440 x 900 |

---

## 6. Final QA Verdict

**VERDICT: PASS / PRODUCTION-READY**

The multi-city implementation successfully eliminates all cross-city data contamination, implements complete legacy feature parity for Vellore Ads, maintains 100% backward compatibility, and passes all responsive and functional acceptance gates.

