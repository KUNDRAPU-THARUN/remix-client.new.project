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
  UserAccount,
  CityId,
  CityConfig
} from './types';
import { CITIES, DEFAULT_CITY_ID, SUPPORTED_CITY_IDS, isCityId } from './config/cities';
import { parseCityRoute, buildCityRouteUrl, ParsedCityRoute } from './utils/cityResolver';
import { CityProvider } from './contexts/CityContext';
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { businessService } from './services/businessService';
import { migrationService } from './services/migrationService';

type Tab = 'home' | 'category' | 'classifieds' | 'kanipakam' | 'dashboard';

interface AppRouteState {
  cityId: CityId;
  tab: Tab;
  categoryId: string;
  savedOnly: boolean;
  listingId: string | null;
  filters: ResultsFilters;
}

const defaultFilters: ResultsFilters = {
  searchQuery: '', selectedArea: 'all', verifiedOnly: false, minRating: 0, sortBy: 'rating',
};

function readAppRoute(): AppRouteState {
  const parsed = parseCityRoute();
  return {
    cityId: parsed.cityId,
    tab: parsed.tab,
    categoryId: parsed.categoryId,
    savedOnly: parsed.savedOnly,
    listingId: parsed.listingId,
    filters: {
      searchQuery: parsed.searchQuery,
      selectedArea: parsed.selectedArea,
      verifiedOnly: parsed.verifiedOnly,
      minRating: parsed.minRating,
      sortBy: parsed.sortBy,
    },
  };
}

function appRouteUrl(route: AppRouteState): string {
  return buildCityRouteUrl(
    route.cityId,
    route.tab,
    route.categoryId,
    {
      searchQuery: route.filters.searchQuery,
      selectedArea: route.filters.selectedArea,
      verifiedOnly: route.filters.verifiedOnly,
      minRating: route.filters.minRating,
      sortBy: route.filters.sortBy,
      savedOnly: route.savedOnly,
      listingId: route.listingId,
    }
  );
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
    && optionalStrings(value, ['whatsapp', 'priceRange', 'badge', 'email', 'postedByUser', 'cityId'])
    && finite(value.rating) && finite(value.reviewsCount) && value.reviewsCount >= 0
    && typeof value.isVerified === 'boolean' && strings(value.services) && strings(value.images)
    && Array.isArray(value.reviews) && value.reviews.every(isReview)
    && (value.viewsCount == null || finite(value.viewsCount))
    && (value.status == null || ['Active', 'Pending Approval', 'Expired'].includes(String(value.status)))
    && (value.cityId == null || isCityId(value.cityId));
}

function isClassified(value: unknown): value is ClassifiedItem {
  return isRecord(value) && stringFields(value, ['id', 'title', 'category', 'price', 'condition', 'location', 'phone', 'date', 'image', 'description', 'postedBy'])
    && optionalStrings(value, ['whatsapp', 'cityId'])
    && (value.cityId == null || isCityId(value.cityId));
}

function isUser(value: unknown): value is UserAccount | null {
  return value === null || (isRecord(value) && stringFields(value, ['id', 'username', 'email', 'name'])
    && optionalStrings(value, ['mobile', 'cityId']) && (value.role === 'provider' || value.role === 'customer'));
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
  // Navigation & Multi-City Routing State
  const [route, setRoute] = useState<AppRouteState>(readAppRoute);
  const activeTab = route.tab;
  const activeCategoryId = route.categoryId;
  const isSavedViewActive = route.savedOnly;

  // Active City Configuration
  const currentCity = useMemo(() => {
    return CITIES[route.cityId] || CITIES[DEFAULT_CITY_ID];
  }, [route.cityId]);

  const allCities = useMemo(() => {
    return SUPPORTED_CITY_IDS.map((id) => CITIES[id]);
  }, []);

  // Primary State with localStorage persistence and backward-compatible city migration
  const [listings, setListings] = useState<Listing[]>(() => {
    const stored = readStored('chittoorads_listings', INITIAL_LISTINGS,
      (value): value is Listing[] => Array.isArray(value) && value.every(isListing));
    // Migration safeguard: assign 'chittoor' to legacy listings without a cityId
    return stored.map((l) => ({ ...l, cityId: l.cityId || 'chittoor' }));
  });

  const [classifieds] = useState<ClassifiedItem[]>(() => {
    const stored = readStored('chittoorads_classifieds', INITIAL_CLASSIFIEDS,
      (value): value is ClassifiedItem[] => Array.isArray(value) && value.every(isClassified));
    return stored.map((c) => ({ ...c, cityId: c.cityId || 'chittoor' }));
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() =>
    [...new Set(readStored('chittoorads_saved', [], strings))]);

  // Authenticated user state from AuthContext
  const { currentUser, setCurrentUser, signOut: handleSignOut } = useAuth();

  // Fetch live listings from database when configured
  useEffect(() => {
    if (businessService.isConfigured()) {
      businessService.getPublishedListings(route.cityId).then((remoteListings) => {
        if (remoteListings.length > 0) {
          setListings((prev) => {
            const userPending = prev.filter(
              (l) => l.status === 'Pending Approval' && (l.cityId || 'chittoor') === route.cityId
            );
            return [...userPending, ...remoteListings];
          });
        }
      });
    }
  }, [route.cityId]);

  // Reconcile user-created local listings when user logs in
  useEffect(() => {
    if (businessService.isConfigured() && currentUser && currentUser.id !== 'u-demo') {
      migrationService.reconcileLocalListingsToBackend(currentUser.id, route.cityId);
    }
  }, [currentUser, route.cityId]);

  // Search & Filters for Hero Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Multi-City Scoped Listings: Listings partitioned by active cityId
  const cityListings = useMemo(() => {
    return listings.filter((l) => (l.cityId || 'chittoor') === route.cityId);
  }, [listings, route.cityId]);

  // Public published listings for active city (active only)
  const publishedListings = useMemo(() => {
    return cityListings.filter((l) => (l.status || 'Active') === 'Active');
  }, [cityListings]);

  // Owner dashboard listings for active city and current logged-in demo account
  const userOwnedListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((l) => l.postedByUser === currentUser.id && (l.cityId || 'chittoor') === route.cityId);
  }, [listings, currentUser, route.cityId]);

  // Classifieds for active city
  const cityClassifieds = useMemo(() => {
    return classifieds.filter((c) => (c.cityId || 'chittoor') === route.cityId);
  }, [classifieds, route.cityId]);

  // Modals state: only allow public preview of active listings, or pending listings if viewed by the owner
  const selectedListing = useMemo(() => {
    if (!route.listingId) return null;
    const found = listings.find((listing) => listing.id === route.listingId);
    if (!found) return null;
    // Ensure listing matches current city
    if ((found.cityId || 'chittoor') !== route.cityId) return null;
    if (found.status === 'Pending Approval') {
      if (currentUser && found.postedByUser === currentUser.id) return found;
      return null;
    }
    return found;
  }, [listings, route.listingId, route.cityId, currentUser]);

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
    persist('chittoorads_user', currentUser);
  }, [currentUser, persist]);

  // Update document title and SEO metadata on city change
  useEffect(() => {
    document.title = currentCity.seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentCity.seo.description);
    }
  }, [currentCity]);

  // Handle URL Path parsing on initial mount and popstate (Browser Back/Forward)
  useEffect(() => {
    const handleLocationChange = () => {
      const next = readAppRoute();
      window.history.replaceState(window.history.state, '', appRouteUrl(next));
      setRoute(next);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (next: AppRouteState, replace = false, scroll = true) => {
    const url = appRouteUrl(next);
    if (url !== window.location.pathname + window.location.search) {
      window.history[replace ? 'replaceState' : 'pushState'](
        next.listingId && !replace ? { listingModal: true } : null, '', url);
    }
    setRoute(next);
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // City switching handler
  const handleCityChange = (newCityId: CityId) => {
    if (newCityId === route.cityId) return;

    // Incompatible filters reset
    setSearchQuery('');
    setSelectedArea('all');
    setSelectedCategory('all');

    const nextRoute: AppRouteState = {
      ...route,
      cityId: newCityId,
      listingId: null, // close any active modal from previous city
      filters: { ...defaultFilters, selectedArea: 'all' },
    };
    navigate(nextRoute);
  };

  const handleNavigateTab = (tab: string) => {
    if (!['home', 'category', 'classifieds', 'kanipakam', 'dashboard'].includes(tab)) return;
    navigate({
      ...route,
      tab: tab as Tab,
      categoryId: 'all',
      savedOnly: false,
      listingId: null,
      filters: defaultFilters
    });
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
    navigate({
      ...route,
      tab: 'category',
      categoryId: CHITTOOR_CATEGORIES.some((cat) => cat.id === catId) ? catId : 'all',
      savedOnly: false,
      listingId: null,
      filters: { ...defaultFilters, selectedArea: areaId || 'all' }
    });
  };

  const handleBackToHome = () => {
    handleNavigateTab('home');
  };

  const handleHeroSearchSubmit = (query = searchQuery) => {
    navigate({
      ...route,
      tab: 'category',
      categoryId: selectedCategory,
      savedOnly: false,
      listingId: null,
      filters: { ...defaultFilters, searchQuery: query.trim(), selectedArea }
    });
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

  const handleAddListing = async (newListing: Listing) => {
    const listingWithOwner: Listing = {
      ...newListing,
      cityId: route.cityId,
      postedByUser: newListing.postedByUser || currentUser?.id || 'u-demo',
      status: 'Pending Approval',
    };

    if (businessService.isConfigured() && currentUser) {
      const res = await businessService.createListing(listingWithOwner, currentUser.id);
      if (res.listing) {
        setListings((prev) => [res.listing!, ...prev]);
        return;
      }
    }

    setListings((prev) => [listingWithOwner, ...prev]);
  };

  const handleDeleteListing = async (id: string) => {
    const target = listings.find((l) => l.id === id);
    if (!target) return;
    if (!currentUser || target.postedByUser !== currentUser.id) {
      alert('Unauthorized: You cannot delete this listing. Only the verified business owner who posted this ad can remove it.');
      return;
    }

    if (businessService.isConfigured()) {
      const res = await businessService.deleteListing(id, currentUser.id);
      if (!res.success) {
        alert(`Deletion failed: ${res.error}`);
        return;
      }
    }

    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddReview = async (listingId: string, newReview: Omit<Review, 'date' | 'id'>) => {
    if (businessService.isConfigured()) {
      await businessService.addReview(listingId, newReview, currentUser?.id);
    }

    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;
        const safeReview: Review = {
          ...newReview,
          id: `rev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          verifiedPurchase: false,
          userMobile: undefined,
          userEmail: undefined,
        };
        const updatedReviews = [safeReview, ...l.reviews];
        const newRating =
          updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        return {
          ...l,
          rating: Number(newRating.toFixed(1)),
          reviewsCount: updatedReviews.length,
          reviews: updatedReviews,
        };
      })
    );
  };

  return (
    <CityProvider currentCityId={route.cityId} onCityChange={handleCityChange}>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Navigation Bar with Premium City Switcher */}
        <Navbar
          onOpenPostAd={() => setIsPostAdOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          currentUser={currentUser}
          onLogout={async () => {
            await handleSignOut();
            setCurrentUser(null);
          }}
          savedCount={savedIds.length}
          onToggleSavedView={() => {
            navigate({
              ...route,
              tab: 'category',
              categoryId: 'all',
              savedOnly: !isSavedViewActive,
              listingId: null,
              filters: defaultFilters
            });
          }}
          isSavedViewActive={isSavedViewActive}
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
          onSelectCategory={(catId) => handleNavigateToCategory(catId)}
          currentCity={currentCity}
          allCities={allCities}
          onCityChange={handleCityChange}
        />

        {/* Main Content Views */}
        <main className="flex-1">

          {/* VIEW 1: HOMEPAGE */}
          {activeTab === 'home' && !isSavedViewActive && (
            <div>
              {/* 1. Hero Section with city-specific banners, localities, & search */}
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
                currentCity={currentCity}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* 2. Featured Showcase Carousel */}
                <FeaturedShowcaseCarousel
                  onSelectCategory={handleNavigateToCategory}
                />

                {/* 3. Explore Categories Grid */}
                <CategoryPills
                  onSelectCategory={handleNavigateToCategory}
                />

                {/* 4. Home Sections (Featured Listings, City Localities Grid, Grow Your Business) */}
                <HomeSections
                  featuredListings={publishedListings}
                  onSelectListing={selectListing}
                  onSelectArea={(areaId) => handleNavigateToCategory('all', areaId)}
                  onOpenPostAd={() => setIsPostAdOpen(true)}
                  onViewAllBusinesses={() => handleNavigateToCategory('all')}
                  currentCity={currentCity}
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
              currentCity={currentCity}
            />
          )}

          {/* VIEW 3: USER DASHBOARD ("My Ads / Listings") */}
          {activeTab === 'dashboard' && (
            <UserDashboard
              currentUser={currentUser}
              userListings={userOwnedListings}
              onOpenPostAd={() => setIsPostAdOpen(true)}
              onPreviewListing={selectListing}
              onDeleteListing={handleDeleteListing}
              onBackToHome={handleBackToHome}
              onOpenLogin={() => setIsLoginOpen(true)}
              currentCity={currentCity}
            />
          )}

          {/* VIEW 4: CLASSIFIEDS SECTION */}
          {activeTab === 'classifieds' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <ClassifiedsSection
                classifieds={cityClassifieds}
                onOpenPostAd={() => setIsPostAdOpen(true)}
                currentCity={currentCity}
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

        {/* Footer with Multi-City Directory Links */}
        <Footer
          onSelectCategory={(catId) => handleNavigateToCategory(catId)}
          onSelectArea={(areaId) => handleNavigateToCategory('all', areaId)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenPostAd={() => setIsPostAdOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          currentCity={currentCity}
          allCities={allCities}
        />

        {/* MODALS */}
        {/* 1. Business Details Modal */}
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
          currentCity={currentCity}
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
            setIsLoginOpen(false);
          }}
        />

        {/* 4. AI Assistant Modal */}
        <AIAssistantModal
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
        />

        {/* 5. 24x7 Emergency Services Modal */}
        <EmergencySection
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />

        {/* 6. Floating AI Assistant Chatbot Widget */}
        <FloatingChatbot />
      </div>
    </CityProvider>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
