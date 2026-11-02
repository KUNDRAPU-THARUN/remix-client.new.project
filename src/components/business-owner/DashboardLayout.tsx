import React, { useState, useEffect } from 'react';
import {
  Listing,
  UserAccount,
  CityConfig,
} from '../../types';
import { enquiryService, CustomerEnquiry } from '../../services/enquiryService';
import { businessService } from '../../services/businessService';
import { DashboardSidebar, DashboardTab } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { OverviewPage } from './pages/OverviewPage';
import { ListingsPage } from './pages/ListingsPage';
import { EnquiriesPage } from './pages/EnquiriesPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ListingFormModal } from './ListingFormModal';

export interface DashboardLayoutProps {
  currentUser: UserAccount;
  userListings: Listing[];
  currentCity?: CityConfig;
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onBackToHome: () => void;
  onSignOut?: () => void;
  onListingCreatedOrUpdated?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  userListings,
  currentCity,
  onOpenPostAd,
  onPreviewListing,
  onDeleteListing,
  onBackToHome,
  onSignOut,
  onListingCreatedOrUpdated,
}) => {
  const getInitialTab = (): DashboardTab => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'listings', 'enquiries', 'insights', 'profile', 'settings'].includes(hash)) {
        return hash as DashboardTab;
      }
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab') || params.get('view');
      if (sub && ['overview', 'listings', 'enquiries', 'insights', 'profile', 'settings'].includes(sub)) {
        return sub as DashboardTab;
      }
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(getInitialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'listings', 'enquiries', 'insights', 'profile', 'settings'].includes(hash)) {
        setActiveTab(hash as DashboardTab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
  };

  // Form Modal State (Add or Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Enquiries State
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);

  // Load enquiries
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEnquiries(true);
    enquiryService
      .getOwnerEnquiries(currentUser.id, currentCity?.id)
      .then((data) => {
        if (isMounted) {
          setEnquiries(data);
          setIsLoadingEnquiries(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load owner customer enquiries:', err);
        if (isMounted) setIsLoadingEnquiries(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentCity?.id]);

  const handleUpdateEnquiryStatus = async (
    enquiryId: string,
    status: 'pending' | 'read' | 'replied' | 'archived'
  ) => {
    await enquiryService.updateEnquiryStatus(enquiryId, status);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === enquiryId ? { ...e, status } : e))
    );
  };

  const handleOpenAdd = () => {
    setEditingListing(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (listingData: Partial<Listing>) => {
    if (editingListing) {
      // Update existing listing
      const res = await businessService.updateListing(
        editingListing.id,
        listingData,
        currentUser.id
      );
      if (res.error) {
        return { success: false, error: res.error };
      }
      if (onListingCreatedOrUpdated) onListingCreatedOrUpdated();
      return { success: true };
    } else {
      // Create new listing
      const newListing: Listing = {
        id: `temp-${Date.now()}`,
        cityId: currentCity?.id || 'chittoor',
        title: listingData.title || '',
        category: listingData.category || 'restaurants',
        area: listingData.area || 'gandhi-road',
        address: listingData.address || '',
        phone: listingData.phone || '',
        whatsapp: listingData.whatsapp,
        email: listingData.email,
        description: listingData.description || '',
        priceRange: listingData.priceRange,
        timings: listingData.timings || 'Daily: 9:00 AM - 8:00 PM',
        services: listingData.services || [],
        images: listingData.images || [],
        rating: 0,
        reviewsCount: 0,
        isVerified: false,
        postedDate: new Date().toISOString().split('T')[0],
        status: 'Pending Approval',
        badge: 'Pending Approval',
        reviews: [],
      };

      const res = await businessService.createListing(newListing, currentUser.id);
      if (res.error) {
        return { success: false, error: res.error };
      }
      if (onListingCreatedOrUpdated) onListingCreatedOrUpdated();
      return { success: true };
    }
  };

  const counts = {
    totalListings: userListings.length,
    pendingListings: userListings.filter((l) => l.status === 'Pending Approval').length,
    totalEnquiries: enquiries.length,
    unreadEnquiries: enquiries.filter((e) => e.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex text-slate-800">
      {/* 1. Sidebar (Desktop sticky & Mobile drawer) */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        currentUser={currentUser}
        currentCity={currentCity}
        onOpenPostAd={handleOpenAdd}
        onBackToHome={onBackToHome}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        counts={counts}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <DashboardHeader
          activeTab={activeTab}
          currentUser={currentUser}
          currentCity={currentCity}
          onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)}
          onOpenPostAd={handleOpenAdd}
          onSelectTab={handleTabChange}
          onBackToHome={onBackToHome}
          onSignOut={onSignOut}
          unreadCount={counts.unreadEnquiries}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              currentUser={currentUser}
              userListings={userListings}
              enquiries={enquiries}
              currentCity={currentCity}
              onSelectTab={handleTabChange}
              onOpenPostAd={handleOpenAdd}
              onPreviewListing={onPreviewListing}
              onEditListing={handleOpenEdit}
            />
          )}

          {activeTab === 'listings' && (
            <ListingsPage
              currentUser={currentUser}
              userListings={userListings}
              currentCity={currentCity}
              onOpenPostAd={handleOpenAdd}
              onPreviewListing={onPreviewListing}
              onEditListing={handleOpenEdit}
              onDeleteListing={onDeleteListing}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesPage
              currentUser={currentUser}
              enquiries={enquiries}
              userListings={userListings}
              currentCity={currentCity}
              onUpdateStatus={handleUpdateEnquiryStatus}
              onOpenPostAd={handleOpenAdd}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsPage
              currentUser={currentUser}
              userListings={userListings}
              enquiries={enquiries}
              currentCity={currentCity}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              userListings={userListings}
              currentCity={currentCity}
              onPreviewListing={onPreviewListing}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              currentCity={currentCity}
              onSignOut={onSignOut}
              onBackToHome={onBackToHome}
            />
          )}
        </main>
      </div>

      {/* 3. Add / Edit Listing Modal */}
      {isFormModalOpen && (
        <ListingFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialListing={editingListing}
          currentUser={currentUser}
          currentCity={currentCity}
        />
      )}
    </div>
  );
};

