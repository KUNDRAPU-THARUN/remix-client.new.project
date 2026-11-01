import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  INITIAL_LISTINGS, 
  INITIAL_CLASSIFIEDS, 
  CHITTOOR_AREAS, 
  CHITTOOR_CATEGORIES 
} from './data/mockData';
import { 
  Listing, 
  ClassifiedItem, 
  Review, 
  UserAccount 
} from './types';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { FeaturedShowcaseCarousel } from './components/FeaturedShowcaseCarousel';
import { CategoryPills } from './components/CategoryPills';
import { HomeSections } from './components/HomeSections';
import { CategoryResultsPage, ResultsFilters } from './components/CategoryResultsPage';
import { UserDashboard } from './components/UserDashboard';
import { LoginModal } from './components/LoginModal';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ClassifiedsSection } from './components/ClassifiedsSection';
import { KanipakamSpecial } from './components/KanipakamSpecial';
import { EmergencySection } from './components/EmergencySection';
import { FloatingChatbot } from './components/FloatingChatbot';
import { Footer } from './components/Footer';
import { LanguageProvider } from './i18n/LanguageContext';

type Tab = 'home' | 'category' | 'classifieds' | 'kanipakam' | 'dashboard';
interface RouteState {
  tab: Tab;
  categoryId: string;
  savedOnly: boolean;
  listingId: string | null;
  filters: ResultsFilters;
}
const defaultFilters: ResultsFilters = {
  searchQuery: '', selectedArea: 'all', verifiedOnly: false, minRating: 0, sortBy: 'rating',
};

// Keep the existing History API routing, with one source of truth for each URL.
function readRoute(): RouteState {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const category = path.match(/^\/category\/([^/]+)$/)?.[1];
  const categoryId = category && CHITTOOR_CATEGORIES.some((item) => item.id === category) ? category : 'all';
  const tab: Tab = category || path === '/category' ? 'category'
    : path === '/dashboard' || path === '/dashboard/my-ads' ? 'dashboard'
    : path === '/classifieds' ? 'classifieds' : path === '/kanipakam' ? 'kanipakam' : 'home';
  const area = params.get('area');
  const sort = params.get('sort');
  return {
    tab, categoryId, savedOnly: tab === 'category' && params.get('saved') === '1',
    listingId: params.get('listing'),
    filters: {
      searchQuery: params.get('q') || '',
      selectedArea: area && CHITTOOR_AREAS.some((item) => item.id === area) ? area : 'all',
      verifiedOnly: params.get('verified') === '1',
      minRating: params.get('rating') === '4' ? 4 : 0,
      sortBy: sort === 'popular' || sort === 'latest' ? sort : 'rating',
    },
  };
}

function routeUrl(route: RouteState): string {
  const path = route.tab === 'home' ? '/' : route.tab === 'category' ? `/category/${route.categoryId}`
    : route.tab === 'dashboard' ? '/dashboard/my-ads' : `/${route.tab}`;
  const params = new URLSearchParams();
  if (route.tab === 'category') {
    const filters = route.filters;
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.selectedArea !== 'all') params.set('area', filters.selectedArea);
    if (filters.verifiedOnly) params.set('verified', '1');
    if (filters.minRating) params.set('rating', String(filters.minRating));
    if (filters.sortBy !== 'rating') params.set('sort', filters.sortBy);
    if (route.savedOnly) params.set('saved', '1');
  }
  if (route.listingId) params.set('listing', route.listingId);
  return path + (params.size ? `?${params}` : '');
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const stringFields = (value: Record<string, unknown>, fields: string[]) => fields.every((field) => typeof value[field] === 'string');
const optionalStrings = (value: Record<string, unknown>, fields: string[]) => fields.every((field) => value[field] == null || typeof value[field] === 'string');
function isReview(value: unknown): value is Review {
  const subRatings = isRecord(value) ? value.subRatings : undefined;
  return isRecord(value) && stringFields(value, ['id', 'author', 'comment', 'date']) && finite(value.rating)
    && optionalStrings(value, ['title', 'userEmail', 'userMobile'])
    && (value.photos == null || strings(value.photos))
    && (subRatings == null || (isRecord(subRatings) && ['serviceQuality', 'valueForMoney', 'cleanliness'].every((key) => finite(subRatings[key]))))
    && (value.ownerResponse == null || (isRecord(value.ownerResponse) && stringFields(value.ownerResponse, ['text', 'date', 'responder'])))
    && ['helpfulCount', 'unhelpfulCount'].every((key) => value[key] == null || finite(value[key]));
}
function isListing(value: unknown): value is Listing {
  return isRecord(value) && stringFields(value, ['id', 'title', 'category', 'area', 'address', 'phone', 'description', 'timings', 'postedDate'])
    && optionalStrings(value, ['whatsapp', 'priceRange', 'badge', 'email', 'postedByUser'])
    && finite(value.rating) && finite(value.reviewsCount) && value.reviewsCount >= 0
    && typeof value.isVerified === 'boolean' && strings(value.services) && strings(value.images)
    && Array.isArray(value.reviews) && value.reviews.every(isReview)
    && (value.viewsCount == null || finite(value.viewsCount))
    && (value.status == null || ['Active', 'Pending Approval', 'Expired'].includes(String(value.status)));
}
function isClassified(value: unknown): value is ClassifiedItem {
  return isRecord(value) && stringFields(value, ['id', 'title', 'category', 'price', 'condition', 'location', 'phone', 'date', 'image', 'description', 'postedBy'])
    && optionalStrings(value, ['whatsapp']);
}
function isUser(value: unknown): value is UserAccount | null {
  return value === null || (isRecord(value) && stringFields(value, ['id', 'username', 'email', 'name'])
    && optionalStrings(value, ['mobile']) && (value.role === 'provider' || value.role === 'customer'));
}
function readStored<T>(key: string, fallback: T, valid: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    if (valid(value)) return value;
    console.warn(`Ignoring invalid browser data: ${key}`);
  } catch (error) {
    console.warn(`Could not read browser data: ${key}`, error);
  }
  return fallback;
}

export const MainAppContent: React.FC = () => {
  // Primary State with localStorage persistence
  const [listings, setListings] = useState<Listing[]>(() => readStored('chittoorads_listings', INITIAL_LISTINGS,
    (value): value is Listing[] => Array.isArray(value) && value.every(isListing)));

  const [classifieds] = useState<ClassifiedItem[]>(() => readStored('chittoorads_classifieds', INITIAL_CLASSIFIEDS,
    (value): value is ClassifiedItem[] => Array.isArray(value) && value.every(isClassified)));

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() =>
    [...new Set(readStored('chittoorads_saved', [], strings))]);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    readStored('chittoorads_user', {
        id: 'u-demo',
        username: 'RameshNaidu',
        name: 'Ramesh Naidu',
        email: 'ramesh.chittoor@gmail.com',
        role: 'provider',
        mobile: '9440218456',
      }, isUser));

  // Navigation & Routing State
  const [route, setRoute] = useState(readRoute);
  const activeTab = route.tab;
  const activeCategoryId = route.categoryId;
  const isSavedViewActive = route.savedOnly;

  // Search & Filters for Hero Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered views for public directory vs owner dashboard
  const publishedListings = useMemo(() => {
    return listings.filter((l) => (l.status || 'Active') === 'Active');
  }, [listings]);

  const userOwnedListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((l) => l.postedByUser === currentUser.id);
  }, [listings, currentUser]);

  // Modals state: only allow public preview of active listings, or pending listings if viewed by the owner
  const selectedListing = useMemo(() => {
    if (!route.listingId) return null;
    const found = listings.find((listing) => listing.id === route.listingId);
    if (!found) return null;
    if (found.status === 'Pending Approval') {
      if (currentUser && found.postedByUser === currentUser.id) return found;
      return null;
    }
    return found;
  }, [listings, route.listingId, currentUser]);
  const savedIds = useMemo(() => {
    const listingIds = new Set(listings.map((listing) => listing.id));
    return savedListingIds.filter((id) => listingIds.has(id));
  }, [savedListingIds, listings]);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const storageWarnings = useRef(new Set<string>());
  const persist = useCallback((key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      storageWarnings.current.delete(key);
    } catch (error) {
      console.warn(`Could not persist ${key}:`, error);
      if (!storageWarnings.current.has(key)) {
        storageWarnings.current.add(key);
        alert('Browser storage is unavailable or full. Changes remain available in this tab but may be lost after reloading.');
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    persist('chittoorads_listings', listings);
  }, [listings, persist]);

  useEffect(() => {
    persist('chittoorads_saved', savedIds);
  }, [savedIds, persist]);

  useEffect(() => {
    // Explicit null preserves a demo logout across reloads.
    persist('chittoorads_user', currentUser);
  }, [currentUser, persist]);

  // Handle URL Path parsing on initial mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const next = readRoute();
      window.history.replaceState(window.history.state, '', routeUrl(next));
      setRoute(next);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (next: RouteState, replace = false, scroll = true) => {
    const url = routeUrl(next);
    if (url !== window.location.pathname + window.location.search) {
      window.history[replace ? 'replaceState' : 'pushState'](
        next.listingId && !replace ? { listingModal: true } : null, '', url);
    }
    setRoute(next);
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTab = (tab: string) => {
    if (!['home', 'category', 'classifieds', 'kanipakam', 'dashboard'].includes(tab)) return;
    navigate({ tab: tab as Tab, categoryId: 'all', savedOnly: false, listingId: null, filters: defaultFilters });
  };

  const selectListing = (listing: Listing | null) => {
    if (listing === null && window.history.state?.listingModal) {
      window.history.back();
      return;
    }
    navigate({ ...route, listingId: listing?.id || null }, listing === null, false);
  };

  // Dedicated Category Click Redirection
  const handleNavigateToCategory = (catId: string, areaId?: string) => {
    navigate({ tab: 'category', categoryId: CHITTOOR_CATEGORIES.some((cat) => cat.id === catId) ? catId : 'all',
      savedOnly: false, listingId: null, filters: { ...defaultFilters, selectedArea: areaId || 'all' } });
  };

  const handleBackToHome = () => {
    handleNavigateTab('home');
  };

  const handleHeroSearchSubmit = (query = searchQuery) => {
    navigate({ tab: 'category', categoryId: selectedCategory, savedOnly: false, listingId: null,
      filters: { ...defaultFilters, searchQuery: query.trim(), selectedArea } });
  };

  const handleQuickTagClick = (tagLabel: string, catId?: string) => {
    if (catId) {
      handleNavigateToCategory(catId);
    } else {
      setSearchQuery(tagLabel);
      handleHeroSearchSubmit(tagLabel);
    }
  };

  const toggleSaveListing = (id: string) => {
    setSavedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddListing = (newListing: Listing) => {
    const listingWithOwner: Listing = {
      ...newListing,
      postedByUser: newListing.postedByUser || currentUser?.id || 'u-demo',
      status: 'Pending Approval',
    };
    setListings((prev) => [listingWithOwner, ...prev]);
  };

  const handleDeleteListing = (id: string) => {
    const target = listings.find((l) => l.id === id);
    if (!target) return;
    if (!currentUser || target.postedByUser !== currentUser.id) {
      alert('Unauthorized: You cannot delete this listing. Only the verified business owner who posted this ad can remove it.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${target.title}"?`)) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      setSavedListingIds((prev) => prev.filter((savedId) => savedId !== id));
      if (route.listingId === id) selectListing(null);
    }
  };

  const handleAddReview = (listingId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    const rev: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;

        const updatedReviews = [rev, ...l.reviews];
        const newCount = l.reviewsCount + 1;
        const newAvg = (l.rating * l.reviewsCount + newReview.rating) / newCount;

        const updatedListing = {
          ...l,
          rating: Number(newAvg.toFixed(1)),
          reviewsCount: newCount,
          reviews: updatedReviews,
        };

        return updatedListing;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Main Navbar */}
      <Navbar
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        savedCount={savedIds.length}
        onToggleSavedView={() => {
          navigate({ tab: 'category', categoryId: 'all', savedOnly: !isSavedViewActive,
            listingId: null, filters: defaultFilters });
        }}
        isSavedViewActive={isSavedViewActive}
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onSelectCategory={(catId) => handleNavigateToCategory(catId)}
      />

      {/* Main Container */}
      <main className="flex-1">
        
        {/* VIEW 1: HOMEPAGE */}
        {activeTab === 'home' && !isSavedViewActive && (
          <div>
            {/* 1. Hero Section with dynamic auto-scrolling ad banner carousel & unified search */}
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSearchSubmit={() => handleHeroSearchSubmit()}
              onQuickTagClick={handleQuickTagClick}
              onOpenAI={() => setIsAIOpen(true)}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* 2. Featured Showcase Cards (Restaurants, Beauty, Schools, Hospitals) */}
              <FeaturedShowcaseCarousel
                onSelectCategory={handleNavigateToCategory}
              />

              {/* 3. Explore Popular Categories Grid (2 Rows with rich image thumbnails) */}
              <CategoryPills
                onSelectCategory={handleNavigateToCategory}
              />

              {/* 4. Home Sections (Featured Businesses, Search by City Grid, Helping Entrepreneurs Banner) */}
              <HomeSections
                featuredListings={publishedListings}
                onSelectListing={selectListing}
                onSelectArea={(areaId) => handleNavigateToCategory('all', areaId)}
                onOpenPostAd={() => setIsPostAdOpen(true)}
                onViewAllBusinesses={() => handleNavigateToCategory('all')}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: DEDICATED CATEGORY RESULTS PAGE */}
        {(activeTab === 'category' || isSavedViewActive) && (
          <CategoryResultsPage
            activeCategoryId={activeCategoryId}
            onSelectCategory={(catId) => {
              navigate({ ...route, categoryId: catId, listingId: null });
            }}
            listings={publishedListings}
            savedListingIds={savedIds}
            savedOnly={isSavedViewActive}
            onToggleSave={toggleSaveListing}
            onSelectListing={selectListing}
            onBackToHome={handleBackToHome}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            filters={route.filters}
            onFiltersChange={(filters) => navigate({ ...route, filters }, true, false)}
          />
        )}

        {/* VIEW 3: USER DASHBOARD ("My Ads / Listings" - /dashboard/my-ads) */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            userListings={userOwnedListings}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            onPreviewListing={selectListing}
            onDeleteListing={handleDeleteListing}
            onBackToHome={handleBackToHome}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* VIEW 4: CLASSIFIEDS SECTION */}
        {activeTab === 'classifieds' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ClassifiedsSection
              classifieds={classifieds}
              onOpenPostAd={() => setIsPostAdOpen(true)}
            />
          </div>
        )}

        {/* VIEW 5: KANIPAKAM PILGRIMAGE */}
        {activeTab === 'kanipakam' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <KanipakamSpecial />
          </div>
        )}
      </main>

      {/* Footer with App Download banner and multi-column directory */}
      <Footer
        onSelectCategory={(catId) => handleNavigateToCategory(catId)}
        onSelectArea={(areaId) => handleNavigateToCategory('all', areaId)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Business Details Modal with Sub-Tabs */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => selectListing(null)}
        isSaved={selectedListing ? savedIds.includes(selectedListing.id) : false}
        onToggleSave={toggleSaveListing}
        onAddReview={handleAddReview}
      />

      {/* 2. Post Free Ad Modal */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onAddListing={handleAddListing}
        currentUser={currentUser}
        onNavigateToDashboard={() => {
          handleNavigateTab('dashboard');
        }}
      />

      {/* 3. Login / Register Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* 4. AI Assistant Modal ("Chittoor Smart Scout") */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* 5. Emergency 24x7 Section */}
      <EmergencySection
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* 6. Floating Chatbot Widget ("ChittoorAds Q&A Support") */}
      <FloatingChatbot />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
};

export default App;
