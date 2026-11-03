import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  CityConfig,
  CityId,
  Listing,
} from '../../types';
import { CITIES } from '../../config/cities';
import {
  franchiseService,
  FranchiseStats,
  FranchiseAuditLog,
  FranchiseStaffMember,
} from '../../services/franchiseService';
import { CustomerEnquiry, GeneralServiceRequest } from '../../services/enquiryService';
import { FranchiseSidebar, FranchiseTab } from './FranchiseSidebar';
import { FranchiseHeader } from './FranchiseHeader';
import { FranchiseSecurityGate } from './FranchiseSecurityGate';
import { FranchiseOverviewPage } from './pages/FranchiseOverviewPage';
import { FranchiseApprovalsPage } from './pages/FranchiseApprovalsPage';
import { FranchiseBusinessesPage } from './pages/FranchiseBusinessesPage';
import { FranchiseEnquiriesPage } from './pages/FranchiseEnquiriesPage';
import { FranchiseContentPage } from './pages/FranchiseContentPage';
import { FranchiseStaffPage } from './pages/FranchiseStaffPage';
import { FranchiseAnalyticsPage } from './pages/FranchiseAnalyticsPage';
import { FranchiseSettingsPage } from './pages/FranchiseSettingsPage';

export interface FranchiseDashboardLayoutProps {
  currentUser: UserAccount | null;
  currentCity: CityConfig;
  onBackToHome: () => void;
  onOpenLogin?: () => void;
  onSignOut?: () => void;
  onPreviewListing: (listing: Listing) => void;
  onSelectCity?: (cityId: CityId) => void;
  onGoToOwnerDashboard?: () => void;
}

export const FranchiseDashboardLayout: React.FC<FranchiseDashboardLayoutProps> = ({
  currentUser,
  currentCity,
  onBackToHome,
  onOpenLogin,
  onSignOut,
  onPreviewListing,
  onSelectCity,
  onGoToOwnerDashboard,
}) => {
  // ---------------------------------------------------------------------------
  // 1. TAB ROUTING STATE (URL Hash Synchronization)
  // ---------------------------------------------------------------------------
  const getInitialTab = (): FranchiseTab => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs: FranchiseTab[] = [
        'overview', 'approvals', 'businesses', 'enquiries', 'content', 'staff', 'analytics', 'settings'
      ];
      if (validTabs.includes(hash as FranchiseTab)) {
        return hash as FranchiseTab;
      }
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<FranchiseTab>(getInitialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: FranchiseTab[] = [
        'overview', 'approvals', 'businesses', 'enquiries', 'content', 'staff', 'analytics', 'settings'
      ];
      if (validTabs.includes(hash as FranchiseTab)) {
        setActiveTab((prev) => (prev !== hash ? (hash as FranchiseTab) : prev));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    const interval = setInterval(handleHashChange, 150);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      clearInterval(interval);
    };
  }, []);

  const handleSelectTab = (tab: FranchiseTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
  };

  // ---------------------------------------------------------------------------
  // 2. DATA FETCHING & STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [stats, setStats] = useState<FranchiseStats>({
    totalListings: 0,
    activeListings: 0,
    pendingApprovals: 0,
    rejectedListings: 0,
    totalEnquiries: 0,
    generalLeads: 0,
    directEnquiries: 0,
    verifiedBusinesses: 0,
    activeCategories: 0,
  });

  const [businesses, setBusinesses] = useState<Listing[]>([]);
  const [generalLeads, setGeneralLeads] = useState<GeneralServiceRequest[]>([]);
  const [businessEnquiries, setBusinessEnquiries] = useState<CustomerEnquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<FranchiseAuditLog[]>([]);
  const [staffMembers, setStaffMembers] = useState<FranchiseStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthorized = useMemo(() => {
    return franchiseService.isAuthorized(currentUser, currentCity.id);
  }, [currentUser, currentCity.id]);

  const userFranchiseCity = useMemo(() => {
    return currentUser?.franchiseCityId || (currentUser?.roles?.find((r) => r.role === 'city_franchise')?.cityId) || null;
  }, [currentUser]);

  const loadTerritoryData = useCallback(async () => {
    if (!currentUser || !isAuthorized) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [
        loadedStats,
        loadedBusinesses,
        loadedGeneralLeads,
        loadedBusinessEnquiries,
        loadedAuditLogs,
        loadedStaff,
      ] = await Promise.all([
        franchiseService.getFranchiseStats(currentCity.id),
        franchiseService.getCityBusinesses(currentCity.id),
        franchiseService.getGeneralLeads(currentCity.id),
        franchiseService.getBusinessEnquiries(currentCity.id),
        franchiseService.getAuditLogs(currentCity.id),
        franchiseService.getStaffMembers(currentCity.id),
      ]);

      setStats(loadedStats);
      setBusinesses(loadedBusinesses);
      setGeneralLeads(loadedGeneralLeads);
      setBusinessEnquiries(loadedBusinessEnquiries);
      setAuditLogs(loadedAuditLogs);
      setStaffMembers(loadedStaff);
    } catch (err) {
      console.warn('Error loading territory franchise data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCity.id, currentUser, isAuthorized]);

  useEffect(() => {
    loadTerritoryData();
  }, [loadTerritoryData]);

  // Pending listings queue
  const pendingListings = useMemo(() => {
    return businesses.filter((b) => b.status === 'Pending Approval');
  }, [businesses]);

  // ---------------------------------------------------------------------------
  // 3. ACTION HANDLERS
  // ---------------------------------------------------------------------------
  const handleApproveListing = async (
    listingId: string,
    options?: { isVerified?: boolean; isFeatured?: boolean }
  ) => {
    if (!currentUser) return;
    await franchiseService.approveBusiness(listingId, currentCity.id, {
      ...options,
      operatorId: currentUser.id,
    });
    await loadTerritoryData();
  };

  const handleRejectListing = async (listingId: string, reason: string) => {
    if (!currentUser) return;
    await franchiseService.rejectBusiness(listingId, currentCity.id, reason, currentUser.id);
    await loadTerritoryData();
  };

  const handleToggleVerified = async (listingId: string, current: boolean) => {
    await franchiseService.toggleVerified(listingId, currentCity.id, !current);
    await loadTerritoryData();
  };

  const handleToggleFeatured = async (listingId: string, current: boolean) => {
    await franchiseService.toggleFeatured(listingId, currentCity.id, !current);
    await loadTerritoryData();
  };

  const handleUpdateGeneralLeadStatus = async (
    leadId: string,
    status: 'pending' | 'routed' | 'contacted' | 'resolved' | 'archived'
  ) => {
    await franchiseService.updateLeadStatus(leadId, currentCity.id, status);
    await loadTerritoryData();
  };

  const handleInviteStaff = async (member: Omit<FranchiseStaffMember, 'id' | 'joinedDate'>) => {
    const newMember: FranchiseStaffMember = {
      ...member,
      id: `staff-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newMember, ...staffMembers];
    setStaffMembers(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`chittoorads_franchise_staff_${currentCity.id}`, JSON.stringify(updated));
      } catch {}
    }
  };

  // ---------------------------------------------------------------------------
  // 4. SECURITY GATES ENFORCEMENT
  // ---------------------------------------------------------------------------

  // Gate A: Unauthenticated Visitor
  if (!currentUser) {
    return (
      <FranchiseSecurityGate
        gateType="unauthenticated"
        currentUser={null}
        currentCity={currentCity}
        onOpenLogin={onOpenLogin}
        onBackToHome={onBackToHome}
      />
    );
  }

  // Gate B: Customer Account
  if (currentUser.role === 'customer' && !currentUser.isSuperAdmin && !currentUser.isFranchise) {
    return (
      <FranchiseSecurityGate
        gateType="customer_denied"
        currentUser={currentUser}
        currentCity={currentCity}
        onOpenLogin={onOpenLogin}
        onBackToHome={onBackToHome}
      />
    );
  }

  // Gate C & Gate D: Standard Business Owner vs Territory Mismatch
  if (!isAuthorized) {
    // Check if user is a franchise partner for a DIFFERENT city (Territory Mismatch)
    if (userFranchiseCity && userFranchiseCity !== currentCity.id && !currentUser.isSuperAdmin) {
      return (
        <FranchiseSecurityGate
          gateType="territory_mismatch"
          currentUser={currentUser}
          currentCity={currentCity}
          userAssignedCityId={userFranchiseCity}
          onSwitchToAssignedCity={onSelectCity}
          onBackToHome={onBackToHome}
        />
      );
    }

    // Otherwise, user is an ordinary Business Owner attempting to access franchise tools
    return (
      <FranchiseSecurityGate
        gateType="owner_denied"
        currentUser={currentUser}
        currentCity={currentCity}
        onGoToOwnerDashboard={onGoToOwnerDashboard}
        onBackToHome={onBackToHome}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // 5. RENDER ACTIVE PAGE
  // ---------------------------------------------------------------------------
  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <FranchiseOverviewPage
            stats={stats}
            pendingListings={pendingListings}
            auditLogs={auditLogs}
            currentCity={currentCity}
            onNavigateTab={handleSelectTab}
            onApproveListing={handleApproveListing}
            onRejectListing={(id) => handleRejectListing(id, 'Information unverifiable')}
            onPreviewListing={onPreviewListing}
          />
        );

      case 'approvals':
        return (
          <FranchiseApprovalsPage
            pendingListings={pendingListings}
            currentCity={currentCity}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onPreviewListing={onPreviewListing}
            isLoading={isLoading}
          />
        );

      case 'businesses':
        return (
          <FranchiseBusinessesPage
            businesses={businesses}
            currentCity={currentCity}
            onPreviewListing={onPreviewListing}
            onToggleVerified={handleToggleVerified}
            onToggleFeatured={handleToggleFeatured}
            onRejectListing={(id, r) => handleRejectListing(id, r)}
            isLoading={isLoading}
          />
        );

      case 'enquiries':
        return (
          <FranchiseEnquiriesPage
            generalLeads={generalLeads}
            businessEnquiries={businessEnquiries}
            currentCity={currentCity}
            onUpdateGeneralLeadStatus={handleUpdateGeneralLeadStatus}
            isLoading={isLoading}
          />
        );

      case 'content':
        return <FranchiseContentPage currentCity={currentCity} />;

      case 'staff':
        return (
          <FranchiseStaffPage
            staffMembers={staffMembers}
            currentCity={currentCity}
            onInviteStaff={handleInviteStaff}
            isLoading={isLoading}
          />
        );

      case 'analytics':
        return (
          <FranchiseAnalyticsPage
            stats={stats}
            businesses={businesses}
            auditLogs={auditLogs}
            currentCity={currentCity}
          />
        );

      case 'settings':
        return (
          <FranchiseSettingsPage
            currentUser={currentUser}
            currentCity={currentCity}
            onSignOut={onSignOut}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans w-full max-w-full overflow-x-hidden">
      {/* Sidebar */}
      <FranchiseSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        currentCity={currentCity}
        onBackToHome={onBackToHome}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        counts={{
          pendingApprovals: pendingListings.length,
          totalListings: businesses.length,
          totalEnquiries: generalLeads.length + businessEnquiries.length,
          generalLeads: generalLeads.length,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <FranchiseHeader
          activeTab={activeTab}
          currentUser={currentUser}
          currentCity={currentCity}
          onOpenMobileNav={() => setIsMobileDrawerOpen(true)}
          onSelectCity={onSelectCity}
          pendingApprovalsCount={pendingListings.length}
          unreadLeadsCount={generalLeads.length}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};
