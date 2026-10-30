# KAARYAN LABS — Phase 1 Project Audit

Audit date: 31 October 2026 (Asia/Calcutta)

## Executive assessment

The existing React, TypeScript, Vite and Tailwind application is a useful, working discovery prototype. Preserve and extend it incrementally. Its homepage, category browsing, contact actions, multilingual shell and listing presentation provide a reusable foundation for Chittoor Ads, Vellore Ads and Bengaluru Ads.

It is not yet a production multi-city platform. There is no implemented application backend, database, trusted authentication, ownership enforcement, city tenancy, franchise administration or staff administration. Most writes affect only the current browser. Visible verification, ratings and analytics include fabricated/demo values.

This audit changes documentation only. No source components were removed, no UI or functional changes were made, and no packages were installed. Keep the client's red, blue, green and yellow palette throughout subsequent work, including the existing emerald and amber treatments.

## Scope, evidence and verification limits

Reviewed all 26 files under `src`, plus `package.json`, Vite/TypeScript configuration, `index.html`, metadata, README, environment example and ignore rules. Findings reference repository files and named handlers so they remain traceable without fixed line numbers.

Checks performed:

| Check | Result |
| --- | --- |
| `http://localhost:3000/` HTTP request | HTTP 200; confirms the dev server responds, not that all interactions work |
| `npm.cmd run lint` | Passed; this script runs `tsc --noEmit`, not ESLint or React Hooks rules |
| `npm.cmd run build` | Passed using installed Vite 8.3.5 |
| Build output | JS 843.90 kB / 199.02 kB gzip; CSS 74.31 kB / 11.67 kB gzip; large chunk warning |
| Browser/device rendering | Not exercised: no browser automation tool or installed Playwright/Puppeteer was available |
| External integrations | No AI request, OTP delivery, phone call, WhatsApp message or external contact verification performed |

PowerShell initially blocked `npm.ps1`; invoking `npm.cmd` completed checks without changing execution policy. The build regenerated ignored `dist` artifacts. No dependency vulnerability scan or deployed infrastructure review was performed; no claim of vulnerability-free dependencies or verified external contact information is made.

Responsive and interaction findings below are source-confirmed behavior or explicitly identified risks requiring browser testing. Existing Telugu/emoji content reads correctly as UTF-8; garbled default shell output alone is not evidence of broken website encoding.

## Current architecture and complete source inventory

```text
index.html -> src/main.tsx -> App -> LanguageProvider -> MainAppContent
                                                    |-- navigation/tab state
                                                    |-- listings/saved/user localStorage
                                                    |-- homepage and category results
                                                    |-- dashboard/classifieds/temple views
                                                    `-- details/login/post/AI/emergency modals
```

`MainAppContent` in `src/App.tsx` coordinates data, persistence, history, selected listings, reviews and modal visibility through props. There is no route library or shared server-data layer. Most components are eagerly imported. Express and dotenv are dependencies, but no Express server, API handlers, database implementation or server startup script exists in the reviewed project.

| File under `src/` | Responsibility and reuse assessment |
| --- | --- |
| `main.tsx` | React root, StrictMode and CSS bootstrap; retain |
| `App.tsx` | Application orchestration and browser persistence; incrementally extract routing and data access |
| `index.css` | Tailwind import, typography and scrollbars; preserve styling |
| `types.ts` | Listing, review, category, area, user, classified and emergency interfaces; evolve with API contracts |
| `data/mockData.ts` | All directory seed data, geography, categories and civic contacts; retain as isolated demo fixtures |
| `services/aiService.ts` | Optional browser Gemini client and static fallback responses/ad templates; move paid AI access behind a server |
| `i18n/translations.ts` | English, Telugu, Tamil, Kannada, Urdu and Hindi dictionaries |
| `i18n/LanguageContext.tsx` | Language persistence, English fallback, HTML language and Urdu RTL direction; retain |
| `components/Navbar.tsx` | Sticky shell, account/category dropdowns, bookmarks and mobile menu; reusable with city configuration |
| `components/HeroSearch.tsx` | Search form, promotional carousel and quick tags; retain presentation |
| `components/FeaturedShowcaseCarousel.tsx` | Rotating category promotions; reusable with managed content |
| `components/CategoryPills.tsx` | Category thumbnail grid; reusable with real counts |
| `components/HomeSections.tsx` | Featured businesses, geographic grid and advertiser promotion; reusable with correct data selection |
| `components/CategoryResultsPage.tsx` | In-memory filtering, sorting, sidebar and result grid; reusable with URL/API state |
| `components/ListingCard.tsx` | Listing summary, save, telephone and WhatsApp actions; strong reusable component |
| `components/ListingDetailModal.tsx` | About, services, gallery, simulated 360 view and review UI; retain and split internally later |
| `components/LoginModal.tsx` | Demo sign-in form and customer/provider selector; reuse form shell after real auth |
| `components/PostAdModal.tsx` | Business submission and AI description generation; reuse fields with trusted submission workflow |
| `components/UserDashboard.tsx` | Listing table, status filters, preview/delete and metrics; reusable owner dashboard shell |
| `components/ClassifiedsSection.tsx` | Classified cards, category filtering and seller contacts; retain |
| `components/KanipakamSpecial.tsx` | Static destination/travel content and contact links; reusable city-specific content block |
| `components/EmergencySection.tsx` | Civic contact modal and dial actions; reuse with curated city data |
| `components/AIAssistantModal.tsx` | English/Telugu question interface and chat history; retain shell |
| `components/FloatingChatbot.tsx` | Local FAQ search/matching and session chat; reusable support widget, not a live support service |
| `components/LanguageSelector.tsx` | Regional language dropdown and outside-click closing; retain |
| `components/Footer.tsx` | Directory links, contact content, app/social placeholders; reusable shell |

## Homepage, navigation, search and listings

### Homepage

The page composes a five-banner hero, category showcase carousel, first 16 category tiles, five business cards, six geography tiles, advertiser CTA, footer and floating FAQ widget. Red primary actions, blue chat/brand accents, green verification/contact accents and yellow promotional/rating accents already exist.

`HomeSections` displays `featuredListings.slice(0, 5)` even though App supplies every listing. It does not select `isFeatured` or approved status, so a newly submitted listing can displace a featured business. Category/city counts and promotions are hardcoded rather than derived from searchable published records.

The geographic grid represents Chittoor localities/towns, not selectable platform tenants. Exact area matching means choosing `chittoor-town` does not aggregate Gandhi Road or Church Street listings; the seed listings use those more specific area IDs.

### Navigation and URLs

Routes are manually coordinated through `activeTab`, `pushState` and a `popstate` handler. Recognized paths include `/category/:id`, `/dashboard/my-ads`, `/classifieds` and `/kanipakam`.

Confirmed problems in `App.tsx`:

- `handleLocationChange` has no `/` or unknown-path fallback. Browser Back from a category to `/` can leave category content visible. Saved state is not cleared by this handler either.
- The saved button changes view state without updating the URL. `CategoryResultsPage` receives saved IDs for bookmark decoration but never filters results to saved IDs, so the saved view shows ordinary results.
- Search text, area, sort and saved mode are absent from URLs; reload/shared links cannot restore them. Listing details have no dedicated URL; sharing copies the current page URL rather than a specific business.
- Unknown categories fall back to an All Categories heading while filtering by the unknown ID, producing misleading empty results. No explicit 404 page exists.
- In the navbar logo handler, home navigation clears saved mode and then the captured saved flag can call the toggle again, returning the user to results instead of home.

Production hosting will need SPA history fallback; current Vite dev-server success does not establish production deep-link support. Static metadata in `index.html` covers only Chittoor, with no city/category/business-specific SEO, canonical URLs, sitemap or structured listing data.

### Search/category results

Working local functionality includes title/description/address/service substring search, exact category and area filters, verified-only and minimum 4-star filters, rating/review-count/date sorting and an empty-results state. There is no server search, pagination, autocomplete, distance search, geolocation or multilingual search indexing.

`handleHeroSearchSubmit` only updates `activeCategoryId` when the selection is not `all`. After a prior category search, submitting All Categories can retain the old category while pushing `/category/all`. `CategoryResultsPage` initializes local query/area state from props once; changed props while mounted will not synchronize. Category navigation can retain previous area/query restrictions without making them explicit. Search checks `trim()` for emptiness but matches the untrimmed query, so surrounding spaces can suppress matches. Reset leaves the sort selection unchanged.

Category counts use `actualCount || cat.count`, substituting fabricated totals for zero-result categories. Public results do not exclude pending/expired listings; status is not an enforced publication boundary.

### Listing details and contact actions

Cards and details support real `tel:` and WhatsApp links; these open external communication apps and do not record leads, confirm delivery or create bookings. Galleries and review sorting operate locally. Business owner responses can be displayed from seed data, but no owner response editor exists.

The 360 tab pans the first ordinary image using background positioning and shows fixed hotspots. It has no panorama asset model, pointer/touch drag handlers or true virtual-tour implementation. Review helpful votes are component state with default sample totals; initial clicks can replace the displayed sample baseline with counts based on zero. Seed aggregate review totals exceed the embedded review arrays, so summary percentages and displayed totals describe different datasets.

## Login, customers and business owners

`LoginModal` accepts any nonempty username and browser-required password, waits 600 ms, and creates a local account. Passwords are not validated or sent to an identity service. Users choose their own role. Forgot Password only displays an alert; Remember Me has no effect on persistence. There is no registration flow despite the Login/Register label.

`App.tsx` initializes a demo provider whenever no stored user exists. Logging out removes the key, so a reload restores the demo provider. The dashboard renders even without a user when visited directly, and its menu is not restricted to providers.

App passes all listings to `UserDashboard`; no owner filter is applied. Delete removes any selected listing from the browser dataset. `postedByUser` is optional in the type and is not assigned by the posting form. No edit, business claim, ownership verification, leads inbox, owner reply, genuine analytics or subscription management exists.

`PostAdModal` creates a browser-only business listing with Active status, `isVerified: true`, five stars and a fabricated verification-desk review. Authentication and moderation are not required. Its success copy mentions review while publication is immediate. The default phone text `+91 ` passes the simple nonempty check. Photo input accepts a URL rather than uploading a business image.

The classifieds posting CTA opens this same business form. It never creates a `ClassifiedItem`; `setClassifieds` is unused and there is no classifieds write/persistence effect.

### Missing capabilities by role

| Role | Existing foundation | Missing functionality |
| --- | --- | --- |
| Customer | Discovery, local bookmarks, local review form, contact links | Real registration/auth/recovery, profile and consent controls, account-scoped cross-device saves, own review history/editing, lead/request history, notifications, reporting and support tickets |
| Business Owner / Provider | Post form, dashboard table, preview and local delete | Ownership/claim workflow, create/edit drafts, secure media, moderation lifecycle, branches, owner responses, lead management and genuine performance reporting |
| City Franchise | None | Assigned-city dashboard, local onboarding/verification, authorized approval queue, staff assignment, local banner/content management, city reports and scoped lead supervision |
| Staff | None | Invite/activation, city and task assignment, limited operational permissions, verification tasks, moderation notes, escalation and action history |
| Super Admin | None | City/franchise setup, privileged user/role management, global taxonomy/configuration, moderation escalation, platform reports, audit access and account suspension |

Franchise sales, plans, commission, settlements and payment features require business rules before implementation. Existing messaging promises free listings; preserve a free tier and obtain explicit product direction before introducing paid plans. Multi-role membership should be supported rather than forcing each person into one exclusive global role.

## Security, privacy and trust findings

These are code-level trust gaps in a local prototype, not evidence of an exploited production server.

| Priority | Evidence | Impact and required direction |
| --- | --- | --- |
| P0: before real users | `LoginModal`, user initialization and localStorage identity | Any identity/role can be fabricated; no session or account verification. Implement server-verified authentication and expiry/revocation; never authorize from browser role values |
| P0: before shared writes | `App` dashboard wiring/delete, `PostAdModal` | No ownership, role or city boundary. Enforce every mutation on the server using authenticated memberships and resource ownership |
| P0: before trusted reviews | Detail modal OTP checks and `verifiedPurchase: isMobileVerified || true` | Any four-character OTP passes and every submitted review is marked verified. Replace simulation with expiring, rate-limited server challenges; phone verification must not imply a verified transaction |
| P0: before paid AI | `aiService.ts` browser `GoogleGenAI` and `VITE_GEMINI_API_KEY` | A configured Vite-prefixed key is public in the client. Proxy AI through an authenticated, validated and rate-limited server; keep secrets server-side. No actual secret exposure was established by this audit |
| P1 | Review email/mobile/photos and user data persisted in browser storage | Shared-browser exposure, no account partitioning, retention controls or authoritative privacy boundary. Minimize PII, separate private fields from public review DTOs and add deletion/retention policies |
| P1 | Data URL photo attachments; arbitrary business photo URLs | No enforced file byte/type/count limit despite 10 MB UI text; storage can exhaust quota. Add controlled object storage, file inspection, size limits and safe URL rules before server ingestion |
| P1 | JSON parsing without runtime shape checks | Valid JSON with the wrong shape can crash consumers; writes can fail while UI implies success. Version and validate demo storage and expose persistence errors |
| P1 | AI prompts include queries/business contact details; fallback makes verification claims | No grounded directory retrieval, provenance or data-sharing explanation. Curate content and ground responses in approved city records; define AI privacy and usage limits |
| P1 | No server/API boundary yet | Rate limits, request validation, protected cookies, CSRF controls where cookie-authenticated writes apply, authorization tests and audit logging must accompany the backend |

React text interpolation is used; no `dangerouslySetInnerHTML` was found. This does not establish complete XSS protection. Avoid treating external images, user URLs or future rich text as trusted. Security headers, TLS and hosting policy cannot be assessed from this frontend alone. The development server binds to `0.0.0.0`; it is not a production deployment strategy.

The README's `GEMINI_API_KEY` setup is not wired into browser code by Vite configuration. The service's browser-safe alternate is `VITE_GEMINI_API_KEY`, which would expose the key. Metadata claims a server-side Gemini capability, but no server implementation supports it.

## Mock and simulated functionality register

- `mockData.ts`: 10 businesses, 4 classifieds, 18 categories, 16 area entries including All, 6 geographic tiles and 6 civic contacts. All need provenance review before production use; do not assume business contacts or credentials are genuine.
- Promotional hero/showcase arrays, category/geography totals, FAQ claims and local fallback AI answers are static content, not live inventory.
- Login, password recovery, OTP verification, listing approval, verification reviews and rating creation are simulated.
- Dashboard metrics use seed view counts and `viewsCount || 120`; zero views becomes 120. There is no view/inquiry event tracking.
- Review vote defaults and 360 presentation are simulations; uploaded review photos are browser Data URLs, not remote uploads. The form advertises drag/drop and video but implements only image file selection.
- Google Play/App Store badges and social icons in the footer have no destination/action. Showcase “Book Now” navigates to a category rather than making a booking.
- AI assistance may make a real external request only with a usable key; otherwise it silently returns keyword/template content. It does not search the current listing dataset. Its local fallback remains English even when Telugu is selected.
- Civic availability, hospital claims, certifications and temple timings are unverified content in this audit; establish a documented verification owner and review date rather than carrying demo assertions into launch.

## Responsive behavior and accessibility

Source shows intentional responsive work: a viewport meta tag, constrained containers, responsive padding/type, a mobile menu below `lg`, stacked hero fields below `md`, category grids from 2 to 8 columns, business grids from 1 to 5 columns, stacked results/sidebar below `lg`, scrollable dashboard tables, horizontal category/tab strips and height-limited scrolling modals. Keep these foundations.

Risks to validate in a browser:

- The fixed-height navbar retains a nonshrinking logo, bookmark, account/login, full post CTA and hamburger in one row. Their combined width is likely to overflow at 320–390 px, especially with longer translations.
- The full category list and filter sidebar precede results on mobile, creating substantial scrolling. Two-column cards plus the fixed desktop sidebar may become cramped near breakpoints.
- Several section headers, badges, review controls and 360 overlays do not wrap. Check narrow devices, Urdu RTL and 200% zoom.
- Modals use `vh` sizing; validate mobile keyboard, landscape, safe areas and nested scrolling. The floating chatbot uses the same z-index as many overlays and can compete with modal focus/visibility.
- Hero rotates every 1.8 seconds without pause; showcase pauses only on mouse hover. No reduced-motion handling or keyboard/touch pause is implemented.
- Modal dialog semantics, focus trapping/restoration, Escape dismissal and background scroll locking are absent. Many clickable cards/logo/geography tiles are `div`s without keyboard behavior. Many input labels are not associated using `htmlFor`/IDs; icon controls and dropdowns lack consistent accessible names/expanded state. Multiple `main` elements can render on the results view.
- Language provider changes HTML language/direction, but many page/form labels remain hardcoded English. Physical left/right positioning is widespread, so RTL completeness is not established.

Recommended later acceptance matrix: widths 320, 375, 390, 768, 1024 and 1440 px; portrait/landscape; customer and owner states; all modals; all six languages; keyboard-only navigation; 200% zoom; slow network and failed images. Record screenshots and overflow/focus results before changing layouts. No visual pass is claimed here.

## Recommended incremental architecture

Keep the current React/Vite/Tailwind frontend and component designs. Introduce boundaries behind existing props first; extract large components only as needed, retaining their exports and behavior during migration.

Suggested evolution:

```text
src/
  components/             existing reusable presentation
  features/               auth, discovery, listings, reviews, classifieds,
                          owner, franchise, staff, admin
  routes/                 route definitions and access-aware layouts
  services/               typed API client and feature repositories
  i18n/                   existing context/dictionaries, completed gradually
  data/                   explicitly isolated demo fixtures
server/                   proposed TypeScript API, auth, authorization,
                          city scoping, validation, moderation and AI proxy
database/                 proposed schema, migrations and controlled seeds
```

Use an API and relational database (PostgreSQL is a suitable proposed default), plus object storage for media. Existing Express can support the API if selected; installation alone does not provide a backend. Choose auth/database/storage providers against deployment requirements before adding packages. Start as a modular application rather than separate city codebases or microservices.

### City and permissions model

Represent Chittoor, Vellore and Bengaluru as City records with stable IDs/slugs, name, brand text, approved palette, locales, publishing state and configurable content/contact data. Do not infer city permissions from a user-selected city, a URL or branding. Resolve canonical city scope in the API and check authenticated membership on every private query/mutation.

Proposed entities and relationships:

- `User`, server session/identity reference, `Role`, `Membership(userId, role, cityId?)`; global Super Admin is explicit, staff/franchise memberships are city scoped.
- `City`, `Area(cityId, parentAreaId?)`, shared `Category`, optional city/category visibility; enforce area-city consistency.
- `Franchise`, `FranchiseCityAssignment`, staff assignments; decide whether franchise territories cover one or multiple cities without hardcoding the answer.
- `Business`, `Listing(cityId, businessId, ownerId, categoryId, areaId, status)`, business memberships/claim requests and listing revisions.
- `MediaAsset`, `Review(listingId, authorId, moderationStatus)`, unique review votes, owner responses and separately protected verification evidence.
- `SavedListing(userId, listingId)` with uniqueness; `Classified(cityId, ownerId, status, expiresAt)` as a separate content type.
- `Lead`, `LeadEvent`, `ModerationTask`, append-only `AuditEvent`, notifications, banners and emergency contacts with provenance/review dates.

Use server-generated IDs, consistent timestamps, foreign keys and indexes on city/category/area/status. Public endpoints expose only published content and public DTOs. Private media/evidence and contact details require explicit access rules. A city field without enforced authorization is insufficient; use database row policies where supported as defense in depth.

Publication lifecycle should distinguish draft, pending, approved/published, rejected, suspended, expired and archived. Verification is separate from publication and requires recorded evidence. Preserve approval history and soft deletion. Ratings and public counts derive from eligible approved reviews; never trust client-supplied aggregates or verified flags.

### Routing, data and operational boundaries

Plan canonical routes such as `/:citySlug`, `/:citySlug/category/:categorySlug`, `/:citySlug/business/:businessSlug`, customer account routes, owner routes, city franchise/staff workspaces and global administration. Preserve legacy paths through redirects/default-city mapping. Encode query, area, sort and pagination in query parameters. A business modal can remain the browsing UI while a canonical detail route supports reload/share/SEO.

Keep transient modal/form state local. Put session/city/permissions in focused contexts and authoritative data behind typed services. Introduce a router/server-state library only when the implementation warrants it. Public listing/search APIs need pagination, stable ordering and validation. Privileged workflows require server-side permission checks even when frontend guards hide controls.

Add genuine event tracking with privacy controls, backups/restore checks, operational logs and deployment health checks as the backend arrives. Move AI calls server-side, set quotas/timeouts and retrieve approved city content. Defer AI expansion until core discovery and trust are reliable. Later code-split dashboards/modals/AI and optimize imagery; do not replace the current visual design to address bundle size.

## Implementation order and acceptance gates

Each stage is a separately reviewable change after authorization. Phase 1 ends with this document.

| Order | Work | Acceptance gate |
| --- | --- | --- |
| 1. Establish baseline | Capture browser screenshots and key journeys; document current brand colors; isolate demo mode and agree roles, city ownership and launch rules | Working baseline preserved; explicit demo/production separation and agreed permission matrix |
| 2. Correct existing behavior | Fix conditional hooks, URL/back/home consistency, All Categories, saved filtering, filter synchronization and listing share identity | Browser regression coverage for these failures; no redesign or component deletion |
| 3. Define city/data contracts | Introduce city config and tenant-aware types behind existing components; design schema, migrations and service interfaces | All three cities modeled, legacy Chittoor paths mapped, area hierarchy defined, existing pages still work |
| 4. Build secure foundation | Implement API/database, real authentication/recovery/session handling, membership authorization, validation and audit events | Anonymous/owner/customer/staff/franchise/admin boundary tests, cross-city and cross-owner denial tests; no browser secrets |
| 5. Complete Super Admin minimum | Secure bootstrap/invites, city/franchise setup, taxonomy and role assignment; global moderation oversight | Only privileged users can assign roles or territories; changes audited |
| 6. Migrate public discovery | Serve published listings/categories/areas from API; city selection, URL filters, pagination, real counts and canonical business URLs | Refresh/Back/share work; pending/suspended content stays private; no demo data silently becomes production data |
| 7. Complete owner workflow | Ownership/claims, draft/edit/publish requests, validated media, owner-only dashboard and soft deletion | Owner A cannot modify Owner B; new listings start without fabricated stars/verification; edits follow moderation rules |
| 8. Deliver City Franchise | Assigned-city queue, verification evidence, local content controls and reports | Actions restricted to assigned cities; reviewer decisions recorded and escalatable |
| 9. Deliver Staff | Invitations, task permissions, city assignments, notes and escalation | Least-privilege staff cannot assign roles, cross cities or approve outside delegated authority |
| 10. Complete customer workflow | Account-scoped saves, verified identity where required, moderated reviews, voting, owner replies, reports and notifications | Saves isolated per user; duplicate/abusive reviews controlled; private contact fields excluded from public API |
| 11. Complete classifieds/leads | Separate classified create/edit/expiry/moderation flow, real lead capture and owner/franchise assignment | Classified submissions appear in classifieds; external contact clicks are distinguished from confirmed leads/bookings |
| 12. Launch readiness | Complete translations/RTL, responsive/accessibility fixes, city SEO, media/bundle optimization, curated civic content, monitoring/backups | Device/keyboard acceptance matrix passed, deployment deep links tested, restore tested, trust claims substantiated |
| 13. Optional expansion | Grounded server AI, managed campaigns, paid plans and franchise commissions only if approved | Product rules, privacy requirements and settlement/payment ownership agreed; core free listing path preserved |

Before stage 2, note a confirmed React correctness defect: `LoginModal`, `PostAdModal`, `AIAssistantModal` and `ListingDetailModal` return early before calling hooks. Their visibility props change while the components remain mounted, violating hook ordering. In the detail modal, later `useMemo` calls also follow that early return. A passing TypeScript/build check does not detect this; verify open/close/reopen, switching listings and stale form state during the first corrective phase.

For future testing, prioritize behavior and authorization: authentication/session expiry, role escalation denial, owner/city isolation, moderation transitions, search URL restoration, saved-account isolation, upload limits and review integrity. Add targeted unit/API/browser tests with the chosen tooling; there is currently no test script or test suite in the project. Do not install a broad testing stack or rewrite presentation components simply to begin the migration.

## Phase 1 outcome

Retain the existing application and brand. First stabilize its current journeys, then establish trusted city-aware identity/data boundaries, then extend role workflows in dependency order. Functional corrections, backend implementation and visual adjustments remain recommendations only and await the next instruction.
