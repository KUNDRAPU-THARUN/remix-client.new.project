# KAARYAN LABS — VELLORE ADS IMPLEMENTATION ROADMAP

## Controlled 4-Stage Parity Implementation & Legacy Migration Plan

**Target Franchise:** Vellore Ads (`TN-23`), Tamil Nadu
**Technology Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Supabase (Auth, PostgreSQL 15, Storage)
**Branch:** `feat/business-owner-final-qa`
**Auditor:** Senior Full-Stack Architect, UI/UX Auditor & Supabase Engineer — KAARYAN LABS
**Date:** November 2, 2026

---

## 1. IMPLEMENTATION PHILOSOPHY & NON-NEGOTIABLE PRINCIPLES

1. **Preserve KAARYAN LABS Design Language:** We strictly preserve the modern, responsive SaaS design, clean card typography, multi-city header, and brand colors (red, blue, green, yellow). We **do not revert to the outdated legacy visual theme**.
2. **Zero Synthetic / Fabricated Data:** We do not invent fake news articles, false review counts, or artificial star ratings to fill sections.
3. **Controlled Stage Rollout:** Each stage must be reviewed, tested, and approved before commencing subsequent stages.
4. **Backend Stability:** No disruptive database migrations or unapproved schema mutations. We reuse existing Supabase tables (`cities`, `businesses`, `customer_enquiries`, `classified_ads`, `reviews`).

---

## 2. FOUR CONTROLLED IMPLEMENTATION STAGES

```text
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE A: CRITICAL BRANDING, METADATA & DATA NORMALIZATION (IMMEDIATE) │
├────────────────────────────────────────────────────────────────────────┤
│ • Dynamic SEOHead Component (Title, Meta Description, OG, Canonical)   │
│ • Fix Vellore Contact Phone (+91 81899 85559) & Email (info@velloreads)│
│ • City-Aware Category Normalization (Eliminate Chittoor Leak in TN-23) │
│ • Update Facebook Social Link to @velloreadsclassifieds               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE B: SEARCH, CLASSIFIEDS & LEAD CAPTURE ENHANCEMENTS               │
├────────────────────────────────────────────────────────────────────────┤
│ • Homepage Quick Quote Service Request Widget (HomepageQuickEnquiry)  │
│ • Dedicated Classifieds Categories in PostAdModal                      │
│ • Direct Route Support for Business Details (/city/vellore/business/:id)│
│ • Subcategory / Department Tags Filtering on Category Results Page     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE C: VELLORE CITY CONTENT & PROMOTIONAL MODULES                    │
├────────────────────────────────────────────────────────────────────────┤
│ • Vellore Attractions & Heritage Guide (Fort & Sripuram Golden Temple) │
│ • Vellore Local Theatres & Cinemas Directory (Vishnu, Balaji, Lakshmi) │
│ • Public Commercial Pricing & Packages Modal (/pricing)                │
│ • Franchise Partner Recruitment Landing Page (/franchise-partner)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE D: BROWSER QA, LEGACY REDIRECTS & DEPLOYMENT VERIFICATION        │
├────────────────────────────────────────────────────────────────────────┤
│ • Comprehensive Multi-Device Headless Chrome Testing (360px - 1920px)  │
│ • Legacy URL Redirect Mapping in vercel.json                           │
│ • Production Build, Lighthouse Audit & Client Sign-Off                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. STAGE DETAILS & SPECIFICATIONS

### STAGE A — Critical Branding, Metadata & Category Normalization

**Focus:** Immediate fixes for verified defects, branding accuracy, and category decoupling.
**Execution Pre-requisite:** No client commercial approval needed (safe engineering corrections).

| Task Code | Action / Deliverable | Complexity | Backend Dependency | Client Approval Needed | Acceptance Criteria |
|:---|:---|:---:|:---:|:---:|:---|
| **A-1** | **Dynamic SEO & Open Graph Sync (`SEOHead.tsx`)** | Low | None (Client-side DOM) | No | When navigating to `/city/vellore`, `document.title` displays *"Vellore Ads - Local Business Directory & Services (TN-23)"*, `meta[name="description"]` updates, `meta[property="og:title"]` and `meta[property="og:description"]` reflect Vellore, and `<link rel="canonical">` points to the canonical city URL. |
| **A-2** | **Vellore Contact Details Correction** | Low | `src/config/cities.ts` | No | In `CITIES.vellore.contact`, update phone to `+91 81899 85559` and email to `info@velloreads.com`. Footer and emergency contact strips show correct Vellore details. |
| **A-3** | **City-Aware Category Decoupling** | Medium | `src/data/mockData.ts` & `src/config/cities.ts` | No | Replace direct `CHITTOOR_CATEGORIES` imports with a city-scoped resolver `getCityCategories(cityId)`. For Vellore, exclude Chittoor-only items ("Kanipakam Tours & Cabs", "Mango & Agro Mandis") and include "Hospitals & Multi-Speciality Clinics", "Colleges & Universities", "Leather & Export Industries", "Theatres & Entertainment". |
| **A-4** | **Vellore Social Link Alignment** | Low | `src/config/cities.ts` | No | Update Facebook link in `CITIES.vellore` to `https://www.facebook.com/velloreadsclassifieds`. |

---

### STAGE B — Customer Search, Listings, Classifieds & Enquiries

**Focus:** Enhancing user discovery and lead generation capabilities.

| Task Code | Action / Deliverable | Complexity | Backend Dependency | Client Approval Needed | Acceptance Criteria |
|:---|:---|:---:|:---:|:---:|:---|
| **B-1** | **Homepage Quick Enquiry Widget (`HomepageQuickEnquiry.tsx`)** | Medium | `public.customer_enquiries` | Yes (Lead routing) | A clean, modern card section on the Vellore homepage allowing visitors to request quotes for any service (Health, PGs, Home Services). Form validates 10-digit Indian phone number and records lead to Supabase with `city_id='vellore'`. |
| **B-2** | **Dedicated Classifieds Taxonomy in `PostAdModal.tsx`** | Medium | `public.classified_ads` | No | In `PostAdModal.tsx`, replace the 18 business categories with classified-specific types: *Used Cars & Bikes, Houses & Rooms for Rent, Mobile Phones & Laptops, Furniture & Home Appliances, Local Jobs & Vacancies*. |
| **B-3** | **Direct URL Routing for Business Listings** | Medium | `src/utils/cityResolver.ts` | No | Support clean URLs like `/city/vellore/business/:id` or `/city/vellore/business/:slug` in addition to modal overlays. When shared on WhatsApp or refreshed directly, the listing opens automatically. |
| **B-4** | **Subcategory & Department Filtering** | Medium | `CategoryResultsPage.tsx` | No | Allow secondary chips inside medical or education categories (e.g., in Healthcare: *Neurology, Cardiology, Emergency, Diagnostics, Pharmacy*). |

---

### STAGE C — Vellore City Content & Promotional Modules

**Focus:** Deep local content parity celebrating Vellore's heritage, institutions, and commercial landscape.

| Task Code | Action / Deliverable | Complexity | Backend Dependency | Client Approval Needed | Acceptance Criteria |
|:---|:---|:---:|:---:|:---:|:---|
| **C-1** | **Vellore Attractions & Heritage Guide (`VelloreAttractionsSection.tsx`)** | Medium | Static Config in `cities.ts` | Yes (Content copy) | A visually striking card section on the Vellore homepage showcasing: Historic Vellore Fort, Jalakandeswarar Temple, Sripuram Golden Temple, and Amirthi Zoological Park with distance markers, opening hours, and location tags. |
| **C-2** | **Vellore Local Theatres Directory (`VelloreTheatresSection.tsx`)** | Medium | Optional seed / mock data | Yes (Theatre roster) | Directory section listing prominent cinemas (Vishnu Cinemas, Balaji Cinemas, Lakshmi Multiplex, Apsara, Big Cinemas). Cards display screen formats, locality, phone, and direct Google Maps navigation button (strictly zero fake ticketing). |
| **C-3** | **Public Commercial Pricing Page (`PricingModal.tsx` or `/pricing`)** | Medium | None (Informational) | Yes (Pricing tiers) | A modern SaaS-style pricing matrix presenting Free Basic Listing, Verified Listing, and Featured Placement benefits. Clicking "Choose Plan" routes to Business Owner onboarding. |
| **C-4** | **Franchise Partner Recruitment Page (`FranchisePage.tsx`)** | Medium | `customer_enquiries` | Yes (Franchise terms) | Dedicated page at `/city/vellore/franchise-partner` explaining territory rights for Vellore district, revenue models, and an application form submitting partner inquiries directly to KAARYAN LABS leadership. |
| **C-5** | **Vellore Institutional Spotlights** | Low | Hero Banners Config | No | Refresh hero banners to feature CMC Hospital campus, VIT University junction, and Sripuram transit lodging. |

---

### STAGE D — Browser QA, Legacy Redirects & Deployment

**Focus:** Final end-to-end testing, legacy URL backward compatibility, and client sign-off.

| Task Code | Action / Deliverable | Complexity | Backend Dependency | Client Approval Needed | Acceptance Criteria |
|:---|:---|:---:|:---:|:---:|:---|
| **D-1** | **Legacy URL 301 Redirect Mapping** | Medium | `vercel.json` | Yes (URL mapping) | Map old high-ranking legacy URLs (`/Vellore/Hospital` → `/city/vellore/category/healthcare`, `/add-listing` → `/city/vellore/dashboard`, `/post-free-ads` → `/city/vellore/classifieds`, `/about-us` → `/city/vellore/about`) via `vercel.json` redirects to preserve legacy Google SEO equity. |
| **D-2** | **Multi-Device Responsive Audit** | Low | Headless Chrome CDP | No | Execute automated headless Chrome test capturing full-page screenshots across 360px, 390px, 768px, 1024px, 1440px, and 1920px. 0 console errors, 0 layout shifts. |
| **D-3** | **Lighthouse & Core Web Vitals Audit** | Low | Lighthouse CLI | No | Achieve Performance ≥ 90, Accessibility ≥ 95, Best Practices = 100, SEO ≥ 95 on mobile and desktop. |
| **D-4** | **Client Stakeholder Demonstration** | Low | Staging Deployment | Yes (Final sign-off) | Conduct structured 15-minute live demonstration for KAARYAN LABS executives and Vellore franchise partners. |

---

## 4. ESTIMATED COMPLEXITY & RESOURCE MATRIX

| Implementation Stage | Tasks | Overall Complexity | Est. Engineering Scope | Backend Impact |
|:---|:---:|:---:|:---|:---:|
| **Stage A: Immediate Branding & Metadata** | A-1 to A-4 | **Low** | Codebase configuration & dynamic SEO component | Zero database changes |
| **Stage B: Search, Classifieds & Leads** | B-1 to B-4 | **Medium** | Form widgets, classifieds modal, URL resolver | Uses existing `customer_enquiries` & `classified_ads` |
| **Stage C: Local Content & Sections** | C-1 to C-5 | **Medium** | 4 new React components, city data configuration | Optional theatre reference data |
| **Stage D: QA, Redirects & Migration** | D-1 to D-4 | **Low** | Vercel redirects, headless Chrome visual audit | Zero database changes |

---

## 5. CLIENT APPROVALS REQUIRED BEFORE EXECUTION

Before implementing Stages B and C, client confirmation is required on:

1. **Commercial Pricing Tiers:** Confirmation of listing packages (Free listing approval model vs. Paid Featured listings).
2. **Franchise Terms:** Desired contact recipient and terms for the `/franchise-partner` application form.
3. **Theatres Roster:** Verified list of active Vellore cinema halls to include in `VelloreTheatresSection`.
4. **Legacy URL Redirection:** Approval to route legacy `/Vellore/*` traffic into the corresponding new `/city/vellore/*` routes.
