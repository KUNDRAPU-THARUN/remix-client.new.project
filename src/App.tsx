import React, { useState, useEffect } from 'react';
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
import { CategoryResultsPage } from './components/CategoryResultsPage';
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

export const MainAppContent: React.FC = () => {
  // Primary State with localStorage persistence
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem('chittoorads_listings');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  const [classifieds, setClassifieds] = useState<ClassifiedItem[]>(() => {
    try {
      const saved = localStorage.getItem('chittoorads_classifieds');
      return saved ? JSON.parse(saved) : INITIAL_CLASSIFIEDS;
    } catch {
      return INITIAL_CLASSIFIEDS;
    }
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chittoorads_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('chittoorads_user');
      return saved ? JSON.parse(saved) : {
        id: 'u-demo',
        username: 'RameshNaidu',
        name: 'Ramesh Naidu',
        email: 'ramesh.chittoor@gmail.com',
        role: 'provider',
        mobile: '9440218456',
      };
    } catch {
      return null;
    }
  });

  // Navigation & Routing State
  const [activeTab, setActiveTab] = useState<'home' | 'category' | 'classifieds' | 'kanipakam' | 'dashboard'>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isSavedViewActive, setIsSavedViewActive] = useState(false);

  // Search & Filters for Hero Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chittoorads_listings', JSON.stringify(listings));
    } catch (e) {
      console.warn('Could not persist listings:', e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem('chittoorads_saved', JSON.stringify(savedListingIds));
    } catch (e) {
      console.warn('Could not persist saved IDs:', e);
    }
  }, [savedListingIds]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('chittoorads_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('chittoorads_user');
      }
    } catch (e) {
      console.warn('Could not persist user:', e);
    }
  }, [currentUser]);

  // Handle URL Path parsing on initial mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/category/')) {
        const cat = path.replace('/category/', '');
        setActiveCategoryId(cat || 'all');
        setActiveTab('category');
      } else if (path.startsWith('/dashboard')) {
        setActiveTab('dashboard');
      } else if (path.startsWith('/classifieds')) {
        setActiveTab('classifieds');
      } else if (path.startsWith('/kanipakam')) {
        setActiveTab('kanipakam');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Dedicated Category Click Redirection
  const handleNavigateToCategory = (catId: string, areaId?: string) => {
    setActiveCategoryId(catId);
    if (areaId) setSelectedArea(areaId);
    setActiveTab('category');
    setIsSavedViewActive(false);

    // Update URL history without page reload
    const targetUrl = catId === 'all' ? '/category/all' : `/category/${catId}`;
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveTab('home');
    setIsSavedViewActive(false);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearchSubmit = () => {
    if (selectedCategory !== 'all') {
      setActiveCategoryId(selectedCategory);
    }
    setActiveTab('category');
    const targetUrl = selectedCategory !== 'all' ? `/category/${selectedCategory}` : '/category/all';
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTagClick = (tagLabel: string, catId?: string) => {
    if (catId) {
      handleNavigateToCategory(catId);
    } else {
      setSearchQuery(tagLabel);
      handleHeroSearchSubmit();
    }
  };

  const toggleSaveListing = (id: string) => {
    setSavedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  const handleDeleteListing = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleAddReview = (listingId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;

        const rev: Review = {
          ...newReview,
          id: `rev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        };

        const updatedReviews = [rev, ...l.reviews];
        const newCount = l.reviewsCount + 1;
        const newAvg = (l.rating * l.reviewsCount + newReview.rating) / newCount;

        const updatedListing = {
          ...l,
          rating: Number(newAvg.toFixed(1)),
          reviewsCount: newCount,
          reviews: updatedReviews,
        };

        if (selectedListing?.id === listingId) {
          setSelectedListing(updatedListing);
        }

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
        savedCount={savedListingIds.length}
        onToggleSavedView={() => {
          setIsSavedViewActive(!isSavedViewActive);
          if (activeTab !== 'category') setActiveTab('category');
        }}
        isSavedViewActive={isSavedViewActive}
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === 'home') handleBackToHome();
          else if (t === 'dashboard') {
            setActiveTab('dashboard');
            window.history.pushState(null, '', '/dashboard/my-ads');
          } else {
            setActiveTab(t as any);
            window.history.pushState(null, '', `/${t}`);
          }
          setIsSavedViewActive(false);
        }}
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
              onSearchSubmit={handleHeroSearchSubmit}
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
                featuredListings={listings}
                onSelectListing={(biz) => setSelectedListing(biz)}
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
              setActiveCategoryId(catId);
              window.history.pushState(null, '', catId === 'all' ? '/category/all' : `/category/${catId}`);
            }}
            listings={listings}
            savedListingIds={savedListingIds}
            onToggleSave={toggleSaveListing}
            onSelectListing={(listing) => setSelectedListing(listing)}
            onBackToHome={handleBackToHome}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            initialSearchQuery={searchQuery}
            initialArea={selectedArea}
          />
        )}

        {/* VIEW 3: USER DASHBOARD ("My Ads / Listings" - /dashboard/my-ads) */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            userListings={listings}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            onPreviewListing={(listing) => setSelectedListing(listing)}
            onDeleteListing={handleDeleteListing}
            onBackToHome={handleBackToHome}
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
        onClose={() => setSelectedListing(null)}
        isSaved={selectedListing ? savedListingIds.includes(selectedListing.id) : false}
        onToggleSave={toggleSaveListing}
        onAddReview={handleAddReview}
      />

      {/* 2. Post Free Ad Modal */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onAddListing={handleAddListing}
        onNavigateToDashboard={() => {
          setActiveTab('dashboard');
          window.history.pushState(null, '', '/dashboard/my-ads');
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
