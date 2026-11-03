# KAARYAN LABS — VELLORE ADS FEATURE PARITY MATRIX

## Detailed Comparative Matrix: Legacy Website vs. New Multi-City Application

**Legacy Website:** <https://velloreads.com/>
**New Application (Vellore Context):** <https://remix-client-new-project.vercel.app/city/vellore>
**Branch:** `feat/business-owner-final-qa`
**Date:** November 2, 2026

---

## 1. CORE FEATURE PARITY MATRIX (36 FUNCTIONAL DOMAINS)

| # | Feature Name | Existing Website URL | Existing Website Evidence | New Website URL / Component | Implementation Status | Functionality Verified | Missing Behavior | Priority | Recommended Change | Backend Dependency |
|:--|:---|:---|:---|:---|:---:|:---:|:---|:---:|:---|:---|
| 1 | **Hero Keyword & Service Search** | `https://velloreads.com/` | Input `select-search` + city selector + submit button. Autocomplete on keyup. | `src/components/HeroSearch.tsx` | **COMPLETE** | Yes | None. Modern fuzzy search with instant category and locality suggestions. | P0 | Retain current new design; expand search keywords for Vellore healthcare & education. | None (Client-side search over listings) |
| 2 | **Locality / Area Filter** | `https://velloreads.com/` | Input `select-city` defaulting to "Vellore". | `src/config/cities.ts` (`VELLORE_AREAS_CONFIG`) | **COMPLETE** | Yes | None. 11 Vellore localities (Katpadi, Sathuvachari, Bagayam, etc.) fully filterable. | P0 | Retain current implementation; ensure all 11 localities appear in CategoryResultsPage chips. | `businesses.locality` column |
| 3 | **Business Category Directory** | `https://velloreads.com/` | 1,015 category links under `/Vellore/<Category>`. Icons with listing counts. | `CategoryPills.tsx`, `CategoryResultsPage.tsx` | **PARTIAL** | Partial | Displays 18 Chittoor categories (`CHITTOOR_CATEGORIES`). Leaks "Kanipakam" & "Mango Mandis" into Vellore. | P0 | Introduce city-aware category helper `getCityCategories('vellore')` with normalized 20 categories. | `categories` table in Supabase |
| 4 | **Subcategories Navigation** | `https://velloreads.com/Vellore/Hospital` | Sub-sections (e.g. Neurological, Cardiac, Critical Care, Diagnostic). | `CategoryResultsPage.tsx` | **MISSING** | No | New app only supports 1 level of categories. No subcategory tags or breadcrumb filters. | P1 | Add optional `tags` or `subcategories` array to category configuration for secondary filtering. | Optional `parent_id` in `categories` table |
| 5 | **Search Results Page** | `https://velloreads.com/Vellore/Hospital` | List of hospitals with address, phone, ratings, "Get Quotes" button. | `/city/vellore/category/:id` (`CategoryResultsPage.tsx`) | **COMPLETE** | Yes | None. Full sidebar filters, locality pills, star ratings, sort options, and responsive grid cards. | P0 | Retain current new design. | `businesses` table filtered by `city_id='vellore'` |
| 6 | **Business Detail View** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Full page with About, Departments, Contact, Address, Gallery, Reviews. | `ListingDetailModal.tsx` (`?listing=:id`) | **PARTIAL** | Yes | Implemented as modal overlay. Dedicated clean URL slug (e.g. `/city/vellore/business/:slug`) missing for direct SEO. | P1 | Add route handler in `cityResolver.ts` for `/city/vellore/business/:id` to open directly or render page. | `businesses` & `business_images` tables |
| 7 | **Business Image Gallery** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Hero banner and image slider on detail page. | `ListingDetailModal.tsx`, Supabase Storage | **COMPLETE** | Yes | None. Cover image + thumbnails + private signed URLs verified in Phase 5B. | P0 | Retain current implementation. | `business_images` table & `business-images` bucket |
| 8 | **Contact, Phone & Map** | `https://velloreads.com/Vellore/Naruvi-Hospital/7008` | Click-to-call, WhatsApp link, Google Maps embed, copy share link. | `ListingDetailModal.tsx`, `ListingCard.tsx` | **COMPLETE** | Yes | None. Direct `tel:`, `https://wa.me/`, and Google Maps navigation buttons active. | P0 | Retain current implementation. | `businesses.phone`, `whatsapp`, `address` |
| 9 | **Ratings & Reviews System** | `https://velloreads.com/customer-reviews` | Star ratings, customer review listing, submit review form. | `WriteReviewModal.tsx`, `reviews` table | **COMPLETE** | Yes | None. 3-criteria rating (quality, value, cleanliness) backed by RLS-guarded PostgreSQL `reviews` table. | P0 | Retain current implementation. | `reviews` table in Supabase |
| 10 | **User Sign In** | `https://velloreads.com/users/login` | Email/Username and password login form. | `LoginModal.tsx` (`authService.signIn`) | **COMPLETE** | Yes | None. Real Supabase GoTrue Auth with server-verified JWT and role-based permissions. | P0 | Retain current implementation. | Supabase GoTrue Auth (`auth.users`) |
| 11 | **User Registration** | `https://velloreads.com/users/register` | New user signup form. | `LoginModal.tsx` (`authService.signUp`) | **COMPLETE** | Yes | None. Creates `auth.users`, syncs `user_profiles`, and records `customer` or `business_owner` role. | P0 | Retain current implementation. | `user_profiles` & `user_roles` tables |
| 12 | **Add Business (Merchant Self-Service)** | `https://velloreads.com/add-listing` | Multi-field listing submission form. | `ListingFormModal.tsx` inside Dashboard | **COMPLETE** | Yes | Legacy has public add-listing form; new app requires merchant authentication (anti-spam security). | P0 | Retain new secure design; public "Add Listing" button triggers login gate then opens dashboard form. | `businesses` table (`status='pending'`) |
| 13 | **Post Free Ads (Classifieds)** | `https://velloreads.com/post-free-ads` | Classified submission page. | `PostAdModal.tsx` (`/city/vellore/classifieds`) | **PARTIAL** | Yes | Category dropdown reuses business categories instead of classified listing types (Rent, Sale, Jobs). | P1 | Update `PostAdModal.tsx` category options to use classified-specific categories. | `classified_ads` table |
| 14 | **Classified Categories & Feed** | `https://velloreads.com/post-free-ads` | Flats, Houses, PG, Jobs, Cars, Used Bikes, Mobiles, Computers. | `/city/vellore/classifieds` (`ClassifiedsPage.tsx`) | **COMPLETE** | Yes | None. Filter by area, category, and price. Direct WhatsApp & Call buttons on cards. | P0 | Retain current implementation. | `classified_ads` table |
| 15 | **Popular Services Quick Access** | `https://velloreads.com/` | Quick icon grid: Hotel Bookings, Jobs, Real Estate, Health, Cabs. | `QuickSearchPills.tsx`, `HeroSearch.tsx` | **COMPLETE** | Yes | None. Modern pill chips under hero search bar. | P0 | Retain current implementation. | Static config in `HeroSearch.tsx` |
| 16 | **Local Theatres & Cinema Schedules** | `https://velloreads.com/` | Section: "Theatre's in Vellore" + OTT streaming links. | *None* | **MISSING** | No | Completely missing in new app. Vellore residents frequently seek local theatre information. | P1 | Create reusable `VelloreTheatresSection.tsx` showing Vishnu, Balaji, Lakshmi Cinemas with maps. | New mock/database data for `theatres` |
| 17 | **Local News & Trending Highlights** | `https://velloreads.com/trendings` | Section: "Explore your Trending" (CMC hospital milestones, local updates). | *None* | **MISSING** | No | No news feed or trending local updates in new app. | P2 | Create modular `VelloreTrendingHighlights.tsx` highlighting verified local achievements. | Optional `news_articles` table |
| 18 | **Product Shopping & Commercial Showcase** | `https://velloreads.com/` | Section: "Buy your Products" (local sponsor products, books, wellness). | *None* | **MISSING** | No | No commercial product showcase section. | P2 | Low priority. Client approval needed if affiliate or retail product promotion is desired. | Optional `products` table |
| 19 | **Top Trending Businesses Spotlight** | `https://velloreads.com/` | "Top Trendings for your City" (CMC Hospital, VIT, Golden Temple). | `FeaturedListings.tsx`, `HomeSections.tsx` | **COMPLETE** | Yes | None. Verified badge, reviews count, and contact buttons present. | P0 | Retain current implementation. | `businesses.is_featured` column |
| 20 | **Top City Attractions & Tourism** | `https://velloreads.com/` | "Top Attractions in Vellore" (Vellore Fort, Golden Temple, Jalakandeswarar). | *None* (Chittoor has `KanipakamSection.tsx`) | **MISSING** | No | Chittoor has a dedicated temple section; Vellore currently lacks its Fort & Sripuram guide! | P1 | Build `VelloreAttractionsSection.tsx` displaying Vellore Fort, Golden Temple Sripuram, etc. | Data config in `src/config/cities.ts` |
| 21 | **Nearby City Directories** | `https://velloreads.com/` | Links to Chennai Ads, Arani Ads. | `CitySwitcherModal.tsx`, `Header.tsx` | **COMPLETE** | Yes | None. Supports 1-click switching between Chittoor, Vellore, and Bengaluru with native scripts. | P0 | Retain current multi-city switcher. | `cities` table |
| 22 | **Homepage Quick Enquiry / Get Quotes** | `https://velloreads.com/` | "Quick service request" form + "Footer Get Quotes" (`footerGetQuotes()`). | *None on homepage* (Listing modal has it) | **PARTIAL** | Partial | Listing-level enquiry exists, but no global homepage quote request form exists. | P1 | Implement `HomepageQuickEnquiry.tsx` on homepage to route leads to appropriate local businesses. | `customer_enquiries` table |
| 23 | **Advertising Banners & Promotions** | `https://velloreads.com/` | Video promotion embed + sponsor banners. | `HeroBannerCarousel.tsx`, `PostAdBanner.tsx` | **COMPLETE** | Yes | None. Rotates 4 Vellore banners with responsive CTA buttons. | P0 | Retain current implementation. | `VELLORE_HERO_BANNERS_CONFIG` |
| 24 | **About Us Page** | `https://velloreads.com/about-us` | Static info page about the platform. | *None* (Footer has basic summary) | **MISSING** | No | Dedicated `/about-us` URL does not exist. | P2 | Create a simple, clean `AboutUsModal.tsx` or `/city/vellore/about` route. | Static content |
| 25 | **Contact Us Page** | `https://velloreads.com/contact-us` | Office address, phone (`+91 81899 85559`), email (`info@velloreads.com`). | `Footer.tsx` (has contact info) | **BROKEN** | Partial | Phone and email in `cities.ts` currently point to Chittoor (`vellore@chittoorads.com`). | P0 | Correct contact phone to `+91 81899 85559` and email to `info@velloreads.com` in `cities.ts`. | Configuration update |
| 26 | **Customer Reviews Aggregation** | `https://velloreads.com/customer-reviews` | Aggregated testimonials page. | `ReviewList.tsx` (Inside Listing Modal) | **PARTIAL** | Partial | Reviews only visible per listing, not aggregated on a dedicated public page. | P2 | Retain listing-specific reviews as primary; aggregated review page is optional. | `reviews` table |
| 27 | **Pricing & Commercial Plans** | `https://velloreads.com/pricing` | Tiered plans: Free, Gold, Platinum, Premium. | *None on public site* | **MISSING** | No | No public `/pricing` page explaining verified listing tiers and benefits. | P1 | Create a clean `PricingPage.tsx` or modal detailing Free, Featured, and Verified options. | Future Phase 6 payment gateway |
| 28 | **Nearby Listings / Area Hubs** | `https://velloreads.com/nearby-listings` | Area-based listing discovery. | `CityGrid.tsx`, Locality chips | **COMPLETE** | Yes | None. 6 Vellore hubs (Katpadi, Sathuvachari, Bagayam, Fort, Ranipet, Gudiyatham) with counts. | P0 | Retain current implementation. | `VELLORE_CITIES_GRID_CONFIG` |
| 29 | **How It Works Guide** | `https://velloreads.com/how-it-work` | 3-step visual guide for users and merchants. | Merchant Auth Gate | **PARTIAL** | Partial | Mentioned inside Merchant Gate; missing public user-facing guide on the homepage. | P2 | Add a 3-step "How It Works" card section on homepage (`HomeSections.tsx`). | Static UI |
| 30 | **Franchise Partner Recruitment** | `https://velloreads.com/franchise-partner` | "Are you looking for Franchise", inquiry form. | Database role `city_franchise` | **MISSING** | No | Backend role exists, but there is no public landing page to capture franchise partner leads. | P1 | Create `FranchiseLandingModal.tsx` or `/city/vellore/franchise` to capture franchise applications. | `customer_enquiries` (type='franchise') |
| 31 | **Local Events & Community Blog** | `https://velloreads.com/events`, `/blog` | Events calendar and blog articles. | *None* | **MISSING** | No | No events or blog engine in new application. | P2 | Low priority. Client approval needed if editorial blog is required for Phase 6. | Optional `blog_posts` table |
| 32 | **Footer Service Directory** | `https://velloreads.com/` | Massive footer with 1,255 categorized links. | `Footer.tsx` | **COMPLETE** | Yes | None. Clean 4-column footer with quick links, city directory, emergency links, and copyright. | P0 | Retain current clean design; avoid 1,200 spam links. | None |
| 33 | **Advertise / Media Kit** | `https://velloreads.com/advertise` | Business promotion info and banner slots. | `PostAdBanner.tsx` | **MISSING** | Partial | Banner exists encouraging merchants to list; no dedicated rate card. | P2 | Low priority. | None |
| 34 | **Mobile App SMS Dispatch** | `https://velloreads.com/` | "Get App Link" input accepting mobile number. | Responsive Web / PWA | **NOT VERIFIED** | N/A | New app is a high-speed progressive web app (PWA) that installs directly on iOS/Android. | P2 | Add PWA install prompt button rather than outdated SMS dispatch. | None |
| 35 | **Social Media Integration** | `https://velloreads.com/` | Link to Facebook (`velloreadsclassifieds`). | `Footer.tsx` | **PARTIAL** | Partial | Footer has Facebook placeholder; needs actual Vellore Ads Facebook URL. | P1 | Set Vellore Facebook link in `src/config/cities.ts`. | Configuration update |
| 36 | **SEO Titles, Metadata & Open Graph** | `https://velloreads.com/` | Dynamic keyword-rich title, description, OG tags. | `src/App.tsx` (lines 296-303) | **BROKEN** | Partial | Deployed `index.html` serves ChittoorAds title and metadata. Client JS updates title but misses OG/canonical. | P0 | Implement `SEOHead` component to dynamically manage title, description, OG, Twitter, and canonical tags. | Client-side DOM & Edge headers |

---

## 2. STATUS CLASSIFICATION SUMMARY

- **COMPLETE (15 Features):**
  - Hero Keyword & Service Search
  - Locality / Area Filter
  - Search Results Page
  - Business Image Gallery
  - Contact, Phone & Map
  - Ratings & Reviews System
  - User Sign In
  - User Registration
  - Add Business (Merchant Self-Service)
  - Classified Categories & Feed
  - Popular Services Quick Access
  - Top Trending Businesses Spotlight
  - Nearby City Directories
  - Advertising Banners & Promotions
  - Footer Service Directory

- **PARTIAL (7 Features):**
  - Business Category Directory (Loaded with Chittoor-only specialties)
  - Business Detail View (Modal-only; lacks direct clean URL route)
  - Post Free Ads (Reuses business categories instead of classified listing types)
  - Homepage Quick Enquiry / Get Quotes (Listing-level active; global homepage quote form absent)
  - Customer Reviews Aggregation (Per-listing reviews active; public aggregate page absent)
  - How It Works Guide (Inside merchant gate; missing public homepage section)
  - Social Media Integration (Generic placeholder link)

- **MISSING (11 Features):**
  - Subcategories Navigation
  - Local Theatres & Cinema Schedules
  - Local News & Trending Highlights
  - Product Shopping & Commercial Showcase
  - Top City Attractions & Tourism (Vellore Fort & Sripuram Golden Temple)
  - About Us Page
  - Pricing & Commercial Plans
  - Franchise Partner Recruitment Page
  - Local Events & Community Blog
  - Advertise / Media Kit
  - Nearby Listings Hub Dedicated Page

- **BROKEN (2 Features):**
  - Contact Us Details (Vellore contact phone/email point to Chittoor in `src/config/cities.ts`)
  - SEO Titles & Open Graph Metadata (Server HTML exposes ChittoorAds title on `/city/vellore`)

- **NOT VERIFIED (1 Feature):**
  - Mobile App SMS Dispatch (Legacy SMS input; replaced by modern responsive PWA)

---

## 3. PRIORITY SUMMARY

- **P0 (Critical Parity & Branding Fixes — 10 items):**
  - Item 3: Normalized Vellore Category Structure (remove Chittoor leak).
  - Item 5: Search Results & Directory Parity.
  - Item 10 & 11: GoTrue Auth Sign In / Registration.
  - Item 12: Business Owner Dashboard & Add Listing Flow.
  - Item 14: Classifieds Marketplace Feed.
  - Item 19: Featured Businesses Spotlight.
  - Item 21: Multi-City Switcher Architecture.
  - Item 25: Correct Vellore Contact Phone (`+91 81899 85559`) and Email (`info@velloreads.com`).
  - Item 32: Clean Footer Directory.
  - Item 36: SEO Metadata & Open Graph Dynamic Sync (Eliminate ChittoorAds Title on `/city/vellore`).

- **P1 (High-Value Vellore City Content & Parity — 6 items):**
  - Item 4: Category Secondary Filtering / Department Tags.
  - Item 6: Direct URL Routing for Business Detail Views (`/city/vellore/business/:id`).
  - Item 13: Classified-specific Categories in `PostAdModal.tsx`.
  - Item 16: Local Theatres & Cinema Directory (`VelloreTheatresSection.tsx`).
  - Item 20: Vellore Top Attractions & Heritage Guide (`VelloreAttractionsSection.tsx`).
  - Item 22: Homepage Quick Service Request / Get Quotes Widget.
  - Item 27: Public Commercial Pricing & Packages Presentation.
  - Item 30: Franchise Partner Recruitment Landing Page & Lead Form.

- **P2 (Secondary Content, Editorial & Enhancements — 8 items):**
  - Item 17: Local News & Trending Highlights.
  - Item 18: Product Shopping Showcase (requires client commercial agreement).
  - Item 24: Dedicated Standalone About Us Page.
  - Item 26: Aggregated Customer Testimonials Page.
  - Item 29: Homepage "How It Works" 3-step explainer card.
  - Item 31: Events Calendar & Community Blog.
  - Item 33: Advertising Media Kit.
  - Item 34: PWA Direct Add-to-Home-Screen prompt.
