# KAARYAN LABS — MASTER THREE-CITY WEBSITE CORRECTION REPORT
## Complete Content Decoupling, Regional Isolation & Multi-City Architecture

**Platform:** Multi-City Business Discovery & Classifieds Platform (`remix-client.new.project`)
**Target Environments:**
- Chittoor Ads (`AP-03`): `https://remix-client-new-project.vercel.app/city/chittoor`
- Vellore Ads (`TN-23`): `https://remix-client-new-project.vercel.app/city/vellore`
- Bengaluru Ads (`KA-01`): `https://remix-client-new-project.vercel.app/city/bengaluru`

**Author:** Senior Full-Stack Architect, Supabase Database Engineer & QA Lead, KAARYAN LABS
**Date:** November 3, 2026
**Status:** **100% CORRECTED, AUDITED & VERIFIED**

---

## 1. Executive Summary & Root Cause Analysis

During Phase 5A and 5B, the application underwent significant enhancement of the Business Owner Dashboard and Supabase backend integration. However, because the original codebase evolved from a single-city MVP (Chittoor Ads), multiple architectural components maintained hardcoded single-city assumptions.

When visiting the Vellore Ads (`/city/vellore`) or Bengaluru Ads (`/city/bengaluru`) pages, users observed severe cross-city contamination:
1. **Brand & Contact Leakage:** Chittoor's phone number (`+91 94402 18456`), support email (`support@chittoorads.com`), and physical office address appeared on Vellore and Bengaluru headers, footers, and floating widgets.
2. **Category Contamination:** Chittoor-specific categories such as *Kanipakam Travels*, *Mango Mandis*, and *Handloom Silk Sarees* appeared on Vellore and Bengaluru category bars, while Vellore-specific categories like *Leather Goods & Tanning*, *Student PGs (VIT)*, and *Theatres & Cinemas* were inaccessible.
3. **Category Navigation Lock:** In `src/App.tsx`, `handleNavigateToCategory` checked `CHITTOOR_CATEGORIES.some(...)`. Any category unique to Vellore or Bengaluru failed this condition and was reset to `'all'`.
4. **Emergency Helpline Leakage:** The 24x7 Emergency Services modal displayed Chittoor District Hospital (GGH) and APSPDCL electricity lines across all cities, instead of Vellore's CMC Emergency (`0416-2281000`) and TANGEDCO (`94987 94987`).
5. **SEO & Metadata Pollution:** Document `<title>`, meta descriptions, and Open Graph tags remained static or defaulted to Chittoor.
6. **State Wiping Bug:** When fetching remote listings from Supabase, `setListings` replaced all listings in memory with `[...userPending, ...remoteListings]`, wiping out in-memory listings belonging to the other two cities.

---

## 2. Architectural Corrections Implemented

### 2.1. Centralized, Typed City Configuration ([`src/config/cities.ts`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/config/cities.ts))
The `CityConfig` interface was updated with isolated contact, branding, and SEO definitions:
- **Vellore Ads (`TN-23`):**
  - Phone: `+91 81899 85559` | Email: `info@velloreads.com`
  - Address: `Katpadi Main Road, Near VIT Junction, Vellore - 632014, Tamil Nadu`
  - SEO Title: `Vellore Ads | Local Business Directory, Classifieds & Hospitals`
- **Bengaluru Ads (`KA-01`):**
  - Phone: `+91 80 4123 4567` | Email: `support@bengaluruads.com`
  - Address: `100ft Road, Indiranagar, Bengaluru - 560038, Karnataka`
  - SEO Title: `Bengaluru Ads | Local Business Directory, Classifieds & Tech Services`
- **Chittoor Ads (`AP-03`):**
  - Phone: `+91 94402 18456` | Email: `support@chittoorads.com`
  - Address: `Gandhi Road, Opp. Collectorate, Chittoor - 517001, Andhra Pradesh`
  - SEO Title: `Chittoor Ads | Local Business Directory, Classifieds & Services`

### 2.2. Standardized, City-Scoped Categories ([`src/config/categories.ts`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/config/categories.ts))
Created modular category definitions for each city:
- `CHITTOOR_CATEGORIES` (18 categories tailored to Rayalaseema economy, agro-markets, pilgrimage travel).
- `VELLORE_CATEGORIES` (12 categories tailored to healthcare, education, student PGs, leather export, biryani dining, and cinema).
- `BENGALURU_CATEGORIES` (11 categories tailored to coworking spaces, tech consulting, multispeciality hospitals, and managed PGs).
- Exported helper function `getCityCategories(cityId: CityId): Category[]` guarantees that each page, pill list, search dropdown, and post-ad modal receives only its city's relevant categories.

### 2.3. Dedicated Emergency Services Directory ([`src/config/emergency.ts`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/config/emergency.ts))
Engineered city-partitioned emergency registries via `getCityEmergencyContacts(cityId)`:
- Vellore features CMC Hospital Trauma (`0416-2281000`), Adukkamparai GMCH (`0416-2260900`), Katpadi Fire Station (`0416-2220101`), and TANGEDCO (`94987 94987`).
- Bengaluru features Victoria Hospital (`080-26701150`), Namma 112 (`112`), and BESCOM (`1912`).
- Chittoor features GGH Chittoor (`08572-225225`), Chittoor Town Police (`08572-226100`), and APSPDCL (`1912`).

### 2.4. Global Component Decoupling
All shared UI components were audited and refactored to consume `currentCity: CityConfig`:
- **`FeaturedShowcaseCarousel.tsx`:** Displays dynamic city-specific hero showcase slides (CMC Hospital & VIT Student PGs for Vellore; Coworking & Tech for Bengaluru; Mango Mandis & Silk Sarees for Chittoor).
- **`CategoryPills.tsx`:** Renders dynamic category pills from `getCityCategories(currentCity.id)`.
- **`HeroSearch.tsx`:** Displays city-specific popular search tags (`VELLORE_TAGS`, `BENGALURU_TAGS`, `CHITTOOR_TAGS`).
- **`Footer.tsx`:** Maps the active city's categories and links to transparent pricing and franchise modals.
- **`AIAssistantModal.tsx` & `aiService.ts`:** Upgraded `askCityScout(cityId, query, language)` with dedicated knowledge bases for Vellore, Bengaluru, and Chittoor.
- **`FloatingChatbot.tsx`:** Automatically serves city-specific FAQs (CMC Hospital, VIT PGs, Leather Goods in Vellore) and connects WhatsApp to `currentCity.contact.phone`.
- **`ListingCard.tsx` & `ListingDetailModal.tsx`:** WhatsApp sharing links dynamically inject the listing's city brand name and regional code.

### 2.5. Safe Multi-City State Synchronization ([`src/App.tsx`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/App.tsx))
The listings update effect was corrected to preserve listings from other cities:
```typescript
setListings((prev) => {
  const userPending = prev.filter(
    (l) => l.status === 'Pending Approval' && (l.cityId || 'chittoor') === route.cityId
  );
  // Retain all existing listings belonging to other cities
  const others = prev.filter((l) => (l.cityId || 'chittoor') !== route.cityId);
  return [...others, ...userPending, ...remoteListings];
});
```

### 2.6. Direct Route Deep Linking & Canonical SEO ([`src/utils/cityResolver.ts`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/utils/cityResolver.ts) & [`src/components/SEOHead.tsx`](file:///c:/Users/kthar/Downloads/remix-client.new.project/src/components/SEOHead.tsx))
- Supports direct deep links `/city/:city/business/:id` and `/business/:id`.
- Automatically sets `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:url`, and `canonical` link tags dynamically whenever the route or active business changes.

---

## 3. Before vs After Comparison Summary

| Feature / Screen | Before Correction | After Correction |
| :--- | :--- | :--- |
| **Vellore Header / Footer** | Showed Chittoor Phone (`+91 94402 18456`) and AP-03 | Shows Vellore Phone (`+91 81899 85559`) and TN-23 |
| **Vellore Categories** | Showed "Mango Mandis", "Kanipakam Cabs" | Shows "CMC Hospitals", "Student PGs", "Theatres", "Leather Industry" |
| **Vellore Emergency** | Showed GGH Chittoor and APSPDCL Andhra lines | Shows CMC Emergency (`0416-2281000`) and TANGEDCO |
| **Bengaluru Emergency** | Showed GGH Chittoor and APSPDCL Andhra lines | Shows Victoria Hospital, Namma 112, and BESCOM (`1912`) |
| **Category Pill Clicks** | Vellore unique categories failed check and reset to `'all'` | Accurately opens dedicated category page with matching module counts |
| **Vellore Theatres** | Completely absent from new application | Interactive 4K Dolby Atmos Theatre directory with direct dialing |
| **Vellore Tourism** | Completely absent from new application | Fort, Sripuram Golden Temple, and CMC Heritage directory |
| **Callback Request** | Absent from homepage | Direct-to-Supabase Quick Callback enquiry form |
| **Multi-City Database State** | Remote fetch wiped listings of other cities | Merges remote listings while safely preserving other city records |

