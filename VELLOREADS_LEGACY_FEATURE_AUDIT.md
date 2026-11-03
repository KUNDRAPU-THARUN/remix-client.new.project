# KAARYAN LABS — VELLORE ADS LEGACY WEBSITE FEATURE-PARITY AUDIT

## Comprehensive Architectural, UI/UX, Content & SEO Audit Report

**Client Website:** <https://velloreads.com/>
**Deployed New Vellore Platform:** <https://remix-client-new-project.vercel.app/city/vellore>
**Repository:** `remix-client.new.project`
**Target Territory:** Vellore (`TN-23`), Tamil Nadu, India
**Auditor:** Senior Full-Stack Architect, Web QA Engineer, UI/UX Auditor & Supabase Engineer — KAARYAN LABS
**Date:** November 2, 2026

---

## 1. EXECUTIVE SUMMARY

KAARYAN LABS has engineered a multi-city discovery, classifieds, and business management platform unifying **Chittoor Ads (`AP-03`)**, **Vellore Ads (`TN-23`)**, and **Bengaluru Ads (`KA-01`)** on a single React 19, TypeScript, Tailwind CSS v4, and Supabase architecture.

This audit provides a comprehensive, feature-by-feature comparison between the legacy `velloreads.com` website and the new application.

### Key Audit Findings

1. **Design Principle Retained:** The new KAARYAN LABS design language (clean SaaS aesthetic, primary brand colors red/blue/green/yellow, card layouts, mobile responsiveness, and modern typography) is vastly superior to the dated PHP/Materialize legacy template of `velloreads.com`. We strictly retain this design and **do not copy the legacy UI/UX theme**.
2. **Branding & SEO Finding (Verified):** The reported issue of `/city/vellore` exposing a "ChittoorAds" title was verified. In the deployed Vite SPA, the server-delivered `index.html` serves static `<title>` and `<meta property="og:...">` tags hardcoded to ChittoorAds. While client-side JavaScript hydration updates `document.title` to *"Vellore Ads - Local Business Directory & Services (TN-23)"*, web crawlers, search bots, and social media scrapers receive Chittoor metadata.
3. **Category Directory Bloat:** The legacy site contains **1,015 distinct category routes** riddled with severe duplication (`Hospital` vs `Hospital-&-Clinics`, `Hotel` vs `Hotel-&-Resorts`, `School` vs `Schools`, `IT-Solutions` vs `Solutions`). Conversely, the new application currently hardcodes 18 Chittoor-centric categories (`CHITTOOR_CATEGORIES`), causing regional mismatches (e.g., "Kanipakam Tours" and "Mango Mandis" showing for Vellore).
4. **Missing Legacy Content Modules:** Several highly localized features from `velloreads.com` are currently absent in the new application:
   - **Local Theatres Directory:** Prominent cinemas (Vishnu Cinemas, Balaji Cinemas, Lakshmi Multiplex, etc.).
   - **Top City Attractions:** Vellore Fort, Sripuram Golden Temple, Jalakandeswarar Temple.
   - **Homepage Quick Service Request:** Global multi-category quote request form.
   - **Pricing & Subscription Packages Page:** Public presentation of Free, Gold, Platinum, and Premium merchant tiers.
   - **Franchise Partner Portal:** Public inquiry and onboarding page for city franchise expansion.

---

## 2. LEGACY WEBSITE AUDIT (<https://velloreads.com/>)

A comprehensive crawl and automated analysis of `velloreads.com` and its internal endpoints was executed. Every accessible section was audited across 36 core areas:

| # | Feature / Area | Legacy URL | Status | Evidence & Functional Capability |
|:--|:---|:---|:---:|:---|
| 1 | **Homepage & Hero Search** | `https://velloreads.com/` | Verified | Dual search form: service keyword (`categoryNm`) + city input (`cityNm`, default "Vellore") + submit button. Sticky top search bar on scroll. |
| 2 | **City & Locality Search** | `https://velloreads.com/` | Verified | Client-side city auto-suggest via `autoCityIndex()`. |
| 3 | **Category Directory** | `https://velloreads.com/` | Verified | Grid of category icons with direct links to `/Vellore/<Category>`. Total of 1,015 category links. |
| 4 | **Subcategories** | `https://velloreads.com/Vellore/Hospital` | Verified | Displays departments/specialties (e.g. Neurological, Cardiac, Critical Care). |
| 5 | **Search Results Page** | `https://velloreads.com/Vellore/Hospital` | Verified | H1: "Hospital in Vellore". Lists top establishments with ratings, contact, and quote buttons. |
| 6 | **Individual Business Listing** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Verified | Dedicated listing page with About, Department breakdown, Address, Operating Hours, Gallery. |
| 7 | **Business Images** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Verified | Image slider / photo gallery on business detail view. |
| 8 | **Contact, Phone & Map** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Verified | Click-to-call, WhatsApp icon, Google Maps iframe embed, copy share link. |
| 9 | **Ratings & Reviews** | `https://velloreads.com/customer-reviews` | Verified | Star rating display and interactive review submission box. |
| 10 | **Sign In** | `https://velloreads.com/users/login` | Verified | User login form accepting username/email and password. |
| 11 | **Registration** | `https://velloreads.com/users/register` | Verified | New user account registration form. |
| 12 | **Add Business** | `https://velloreads.com/add-listing` | Verified | Multi-input merchant listing form: Name, Phone, Email, Title, Category, Locality. |
| 13 | **Post Free Ads** | `https://velloreads.com/post-free-ads` | Verified | Dedicated classified listing submission page. |
| 14 | **Classified Categories** | `https://velloreads.com/post-free-ads` | Verified | Sell/Buy categories: Flats, Houses, PG, IT Jobs, Cars, Used Bikes, Mobiles, Computers. |
| 15 | **Popular Services** | `https://velloreads.com/` | Verified | Homepage quick links: Hotel Bookings, Jobs, Real Estate, Health Check-up, Cab Booking. |
| 16 | **Local Theatres** | `https://velloreads.com/` | Verified | Section: "Theatre's in Vellore" with movie show timings and OTT banners (Prime Video, Netflix, Hotstar). |
| 17 | **Local News & Trending** | `https://velloreads.com/trendings` | Verified | Section: "Explore your Trending" (e.g., CMC Paediatric Robotic Surgery milestone) & `/trendings`. |
| 18 | **Product Shopping** | `https://velloreads.com/` | Verified | Section: "Buy your Products" showcasing sponsored local and affiliate products. |
| 19 | **Top Trending Businesses** | `https://velloreads.com/` | Verified | "Top Trendings for your City" spotlighting CMC Hospital, VIT, Golden Temple, Naruvi Hospital. |
| 20 | **Top Attractions** | `https://velloreads.com/` | Verified | "Top Attractions in Vellore" highlighting Vellore Fort, Golden Temple Sripuram, Jalakandeswarar. |
| 21 | **Nearby City Directories** | `https://velloreads.com/` | Verified | "Explore your City Listings" linking to Chennai Ads, Arani Ads, etc. |
| 22 | **Service Request / Quick Enquiry** | `https://velloreads.com/` | Verified | Homepage "Quick service request" form and "Footer Get Quotes" (`footerGetQuotes()`). |
| 23 | **Advertising & Video Banners** | `https://velloreads.com/` | Verified | "Reach the Right Customers" video promotional embed. |
| 24 | **About Us** | `https://velloreads.com/about-us` | Verified | Company background, mission, and directory overview. |
| 25 | **Contact Us** | `https://velloreads.com/contact-us` | Verified | Office address, phone (`+91 81899 85559`), email (`info@velloreads.com`), inquiry form. |
| 26 | **Customer Reviews Page** | `https://velloreads.com/customer-reviews` | Verified | Aggregated public review listings and feedback. |
| 27 | **Pricing Information** | `https://velloreads.com/pricing` | Verified | Tiered commercial plans: Free, Gold, Platinum, Premium. |
| 28 | **Nearby Listings** | `https://velloreads.com/nearby-listings` | Verified | Area-based listing discovery page. |
| 29 | **How It Works** | `https://velloreads.com/how-it-work` | Verified | 3-step guide: Search Service, Compare Quotes, Hire Expert. |
| 30 | **Franchise Information** | `https://velloreads.com/franchise-partner` | Verified | Franchise partner recruitment page ("Are you looking for Franchise"). |
| 31 | **Events & Blog** | `https://velloreads.com/events`, `/blog` | Verified | Local event calendar and community blog posts. |
| 32 | **Footer Service Directory** | `https://velloreads.com/` | Verified | Mega-footer containing over 1,200 categorized directory links. |
| 33 | **Payment / Advertising Info** | `https://velloreads.com/advertise` | Verified | Advertising opportunities and placement guide. |
| 34 | **Mobile App Promotion** | `https://velloreads.com/` | Verified | "Get the App!" SMS dispatch widget. |
| 35 | **Social Media Links** | `https://velloreads.com/` | Verified | Active link to Facebook (`velloreadsclassifieds`). |
| 36 | **SEO Titles & Metadata** | `https://velloreads.com/` | Verified | Keyword-dense meta title and description with Open Graph properties. |

---

## 3. NEW APPLICATION AUDIT (`remix-client.new.project`)

Audit performed on the live deployed URL (`https://remix-client-new-project.vercel.app/city/vellore`) and local repository codebase:

### Implementation Classification

- **Implemented & Deployed:**
  - Modern hero search with locality and category filters (`src/components/HeroSearch.tsx`).
  - Multi-city dynamic routing (`/city/vellore`, `/city/vellore/category/:id`, `/city/vellore/classifieds`).
  - Vellore-specific locality configuration (11 localities: Katpadi, Sathuvachari, Bagayam, Fort City, etc. in `src/config/cities.ts`).
  - Vellore hero banners carousel (`CMC Healthcare`, `Katpadi Hostels`, `Ambur Biryani`, `Golden Temple Lodges`).
  - Vellore city grid hotspots (`Katpadi`, `Sathuvachari`, `Bagayam`, `Fort City`, `Ranipet Corridor`, `Gudiyatham Hub`).
  - Category search results with sidebar navigation, locality chips, and ratings filtering (`CategoryResultsPage.tsx`).
  - Business detail modal with directions, call, WhatsApp, reviews, and opening hours (`ListingDetailModal.tsx`).
  - Customer enquiry lead generation backed by PostgreSQL `customer_enquiries` table.
  - Full Business Owner Dashboard (`Overview`, `Listings`, `Enquiries`, `Insights`, `Profile`, `Settings`).
  - Authenticated user management via Supabase GoTrue Auth.
  - Multi-city city switcher modal (`CitySwitcherModal.tsx`).

- **Partially Implemented:**
  - **Category Coverage:** Currently renders 18 categories from `CHITTOOR_CATEGORIES`. Shows Chittoor specialties ("Kanipakam Tours", "Mango Mandis") while missing core Vellore sectors.
  - **Classifieds Categories:** `PostAdModal.tsx` reuses the 18 business categories rather than classified-specific listing types (Vehicles, Rentals, Electronics).
  - **SEO Metadata:** Dynamic client title works via React `useEffect`, but initial server-delivered HTML contains ChittoorAds title and lacks Open Graph and canonical updates.

- **Missing in New Application:**
  - Local Theatres & Cinemas directory.
  - Vellore Top Attractions guide (Fort, Sripuram Golden Temple).
  - Homepage Quick Quote service request form.
  - Public Pricing & Membership packages page (`/pricing`).
  - Franchise Partner recruitment page (`/franchise-partner`).
  - Standalone About Us and Contact Us pages.
  - Dedicated SEO business landing URLs (currently modal-based `?listing=<id>`).

---

## 4. BRANDING & SEO DEEP-DIVE: THE CHITTOOR TITLE ISSUE

### Root Cause Analysis

1. **Server-Delivered HTML (Static SPA):**
   Vercel serves `dist/index.html` on initial request for `https://remix-client-new-project.vercel.app/city/vellore`. Lines 6-9 of `index.html` are:

   ```html
   <title>ChittoorAds - Discover Chittoor in One Click | Chittoor Business Directory & Classifieds</title>
   <meta name="description" content="Discover Chittoor in One Click. Chittoor's premier local business directory..." />
   <meta property="og:title" content="ChittoorAds - Discover Chittoor in One Click" />
   ```

   Web crawlers (Googlebot, Bingbot), WhatsApp/Facebook preview bots, and web readers that do not execute client-side JavaScript immediately index the site as **ChittoorAds**.

2. **Client-Side Hydration Incompleteness:**
   In `src/App.tsx` (lines 296-303):

   ```ts
   useEffect(() => {
     document.title = currentCity.seo.title;
     const metaDesc = document.querySelector('meta[name="description"]');
     if (metaDesc) metaDesc.setAttribute('content', currentCity.seo.description);
   }, [currentCity]);
   ```

   This only updates `document.title` and `meta[name="description"]`. It **fails to update**:

   - `<meta property="og:title">`
   - `<meta property="og:description">`
   - `<meta property="og:url">`
   - `<meta name="twitter:title">`
   - `<meta name="twitter:description">`
   - `<link rel="canonical">` (missing entirely)

3. **Contact Details Discrepancy in `src/config/cities.ts`:**
   Lines 370-374 set:

   ```ts
   contact: {
     address: 'Katpadi Main Road, Near VIT Junction, Vellore - 632014, Tamil Nadu',
     phone: '+91 94402 18456',           // <-- Chittoor phone number!
     email: 'vellore@chittoorads.com',     // <-- Chittoor domain email!
   }
   ```

   Legacy Vellore Ads has verified contact phone `+91 81899 85559` and email `info@velloreads.com`.

### Required Corrections

1. Add a dynamic `SEOHead` component or utility to sync all Open Graph, Twitter, and canonical metadata with the active city.
2. In `src/config/cities.ts`, update Vellore contact phone to `+91 81899 85559` and email to `info@velloreads.com`.
3. In `vercel.json` or edge middleware, consider HTML edge rewriting for crawler User-Agents, or configure pre-rendering for city roots.

---

## 5. CATEGORY DIRECTORY ANALYSIS & NORMALIZATION

### Legacy Directory Problems

The old site contains **1,015 category entries**, but analysis reveals severe structural bloat:

1. **Direct Duplicates:**
   - `Hospital` (447 KB page) AND `Hospital-&-Clinics`
   - `Hotel` AND `Hotel-&-Resorts`
   - `School` AND `Schools`
   - `College` AND `Colleges`
   - `Computer` AND `Computer-Repair`
   - `Mobile` AND `Mobile-Shops`
   - `Departmental` AND `Departmental-Store`
   - `General` AND `General-Shop`
   - `Rental` AND `Rental-House`
   - `Estates` AND `Property` AND `Real-Estate-Agency`
   - `Travels` AND `Tour-&-Travels`
2. **Subcategory Confusion:** Specialty terms like "Ready made Dress", "Medicine", and "Driving School" are mixed as top-level parent categories alongside major industries.
3. **Ghost Categories:** Hundreds of generated slugs lead to zero listings or duplicate results.

### Comparison: Legacy vs Current vs Database Schema

| Sector | Legacy Vellore Categories | Current New App (`CHITTOOR_CATEGORIES`) | Database Schema (`public.categories`) | Recommended Normalized Vellore Category |
|:---|:---|:---|:---|:---|
| Healthcare | `Hospital`, `Hospital-&-Clinics`, `Medical`, `Medicine` | `healthcare` ("Hospitals & Healthcare") | `hospitals` ("Hospitals & Clinics") | `hospitals` (Hospitals & Multi-Speciality Clinics) |
| Dining | `Restaurants`, `Food-Court`, `Hotel` | `restaurants` ("Restaurants & Dining") | `restaurants` ("Restaurants & Tiffins") | `restaurants` (Restaurants, Biryani & Cafes) |
| Hospitality | `Hotel`, `Hotel-&-Resort`, `Hotel-&-Resorts` | `hotels-lodges` ("Hotels & Lodges") | `hotels-lodges` ("Hotels & Lodges") | `hotels-lodges` (Hotels, Lodges & Transit Stays) |
| Higher Education | `College`, `Colleges`, `Training`, `Education` | `education` ("Schools & Education") | `education` ("Schools & Coaching") | `colleges-universities` (Colleges & Universities - VIT/Voorhees) |
| Schools | `School`, `Schools` | Included in `education` | Included in `education` | `schools-education` (Schools & Coaching Centers) |
| Industry | Leather Exporters, Tanners | *None* | *None* | `leather-industry` (Leather Exports & Manufacturing) |
| Accommodations | `Rental`, `Rental-House` | `pg-hostels` ("PG & Hostels") | *None* | `pg-hostels` (Student Hostels & Executive PGs) |
| Real Estate | `Estates`, `Property`, `Real-Estate-Agency` | `real-estate` ("Real Estate & Properties") | `real-estate` ("Real Estate & Plots") | `real-estate` (Properties, Plots & Commercial Rentals) |
| Entertainment | `Theatre's in Vellore`, `Movie-Tickets-Booking` | *None* | *None* | `theatres-entertainment` (Theatres & Entertainment) |
| Heritage Tourism | Golden Temple, Fort, Temples | `kanipakam-travels` (*Chittoor leak!*) | *None* | `heritage-temples` (Vellore Fort & Sripuram Golden Temple) |
| Agriculture | *None* | `mango-agro` (*Chittoor leak!*) | *None* | Exclude for Vellore / Retain for Chittoor |
| Textiles | `Fashion`, `Readymades`, `Textiles`, `Silks` | `silks-textiles` ("Silk Sarees & Handlooms") | `shopping` ("Shopping & Textiles") | `textiles-fashion` (Silk Sarees & Ready-made Showrooms) |
| IT & Electronics | `Computer`, `Mobile`, `Solutions`, `Hardware` | *None* | `electronics` ("Electronics & Mobiles") | `electronics-mobiles` (Mobiles, Laptops & IT Services) |

---

## 6. LOCAL CONTENT COMPARISON & COMPONENT PROPOSALS

To achieve genuine feature and content parity with Vellore Ads without copying legacy UI, we propose five modular React components:

### 1. `VelloreAttractionsSection.tsx` (Priority: P1)

- **Purpose:** Highlights Vellore's historical and spiritual identity.
- **Content:**
  - Historic Vellore Fort & Jalakandeswarar Temple (16th Century Vijayanagara Architecture).
  - Sripuram Golden Temple (Sri Lakshmi Narayani Golden Temple, Malaikodi).
  - Amirthi Zoological Park & Waterfalls.
  - Government State Museum & Clock Tower.
- **UX Design:** Responsive card slider matching the KAARYAN LABS aesthetic with distance markers and locality tags (`Fort City`, `Bagayam`).

### 2. `VelloreTheatresSection.tsx` (Priority: P1)

- **Purpose:** Replaces the legacy "Theatre's in Vellore" section.
- **Content:** Verified directory of local cinema halls:
  - Vishnu Cinemas (Katpadi)
  - Balaji Cinemas (Fort City)
  - Lakshmi Multiplex (Thottapalayam)
  - Apsara & Big Cinemas
- **UX Design:** Clean status cards indicating screen count, sound system (Dolby Atmos), and direct Google Maps direction buttons (strictly zero fake ticketing).

### 3. `HomepageQuickEnquiry.tsx` (Priority: P1)

- **Purpose:** Parity with legacy "Quick service request" and "Footer Get Quotes".
- **Functionality:** 1-click inquiry capturing customer name, mobile number, selected category, and requirement. Submits to Supabase `customer_enquiries` table and notifies city franchise.

### 4. `VelloreHeritageBanners.tsx` (Priority: P2)

- **Purpose:** Visual storytelling banners for CMC Medical Corridor, VIT Education Cluster, and Ranipet Leather Belt.

### 5. `FranchiseLandingPage.tsx` (Priority: P1)

- **Purpose:** Public landing page at `/city/vellore/franchise-partner` explaining franchise benefits, territory exclusivity, and partner application.
