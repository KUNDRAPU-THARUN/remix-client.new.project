import React, { useState, useEffect, useCallback } from 'react';
import { UserAccount, CityId, Listing } from '../../types';
import {
  adminService,
  AdminPlatformStats,
  AdminCitySummary,
  AdminFranchisePartner,
  AdminUserRecord,
} from '../../services/adminService';
import { FranchiseAuditLog } from '../../services/franchiseService';
import { GeneralServiceRequest, CustomerEnquiry } from '../../services/enquiryService';
import { AdminSecurityGate } from './AdminSecurityGate';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';

// Pages
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminCitiesPage } from './pages/AdminCitiesPage';
import { AdminFranchisesPage } from './pages/AdminFranchisesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminBusinessesPage } from './pages/AdminBusinessesPage';
import { AdminEnquiriesPage } from './pages/AdminEnquiriesPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export interface AdminDashboardLayoutProps {
  currentUser: UserAccount | null;
  onBackToHome: () => void;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
  onGoToOwnerDashboard?: () => void;
  onGoToFranchisePortal?: () => void;
  initialTab?: AdminTab;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  currentUser,
  onBackToHome,
  onSignOut,
  onSwitchAccount,
  onGoToOwnerDashboard,
  onGoToFranchisePortal,
  initialTab,
}) => {
  // 1. Authorization check
  const isAuthorized = adminService.isSuperAdmin(currentUser);

  // 2. Tab Navigation state with Hash sync
  const getInitialTabFromHash = (): AdminTab => {
    if (initialTab) return initialTab;
    const hash = window.location.hash.replace('#', '') as AdminTab;
    const validTabs: AdminTab[] = [
      'overview',
      'cities',
      'franchises',
      'users',
      'businesses',
      'enquiries',
      'content',
      'analytics',
      'audit',
      'settings',
    ];
    return validTabs.includes(hash) ? hash : 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTabFromHash);
  const [activeCityFilter, setActiveCityFilter] = useState<CityId | 'all'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 3. Platform Data State
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminPlatformStats>({
    totalCities: 3,
    totalListings: 0,
    activeListings: 0,
    pendingApprovals: 0,
    rejectedListings: 0,
    verifiedBusinesses: 0,
    totalEnquiries: 0,
    generalLeads: 0,
    directEnquiries: 0,
    activeFranchises: 3,
    cityBreakdown: {
      chittoor: { totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0, totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0 },
      vellore: { totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0, totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0 },
      bengaluru: { totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0, totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0 },
    },
  });

  const [citiesSummary, setCitiesSummary] = useState<AdminCitySummary[]>([]);
  const [franchisePartners, setFranchisePartners] = useState<AdminFranchisePartner[]>([]);
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [generalRequests, setGeneralRequests] = useState<GeneralServiceRequest[]>([]);
  const [directEnquiries, setDirectEnquiries] = useState<CustomerEnquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<FranchiseAuditLog[]>([]);

  // Hash listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AdminTab;
      const validTabs: AdminTab[] = [
        'overview',
        'cities',
        'franchises',
        'users',
        'businesses',
        'enquiries',
        'content',
        'analytics',
        'audit',
        'settings',
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // 4. Data Loading Routine
  const loadPlatformData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        loadedStats,
        loadedCities,
        loadedPartners,
        loadedUsers,
        loadedListings,
        loadedEnquiries,
        loadedLogs,
      ] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getCitiesSummary(),
        adminService.getFranchisePartners(),
        adminService.getAllUsers(),
        adminService.getAllListings('all'),
        adminService.getAllEnquiries('all'),
        adminService.getGlobalAuditLogs('all', 100),
      ]);

      setStats(loadedStats);
      setCitiesSummary(loadedCities);
      setFranchisePartners(loadedPartners);
      setUsersList(loadedUsers);
      setAllListings(loadedListings);
      setGeneralRequests(loadedEnquiries.generalRequests);
      setDirectEnquiries(loadedEnquiries.directEnquiries);
      setAuditLogs(loadedLogs);
    } catch (err) {
      console.error('Error loading Super Admin platform data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadPlatformData();
    }
  }, [isAuthorized, loadPlatformData]);

  // Moderation Handlers
  const handleApproveListing = async (listingId: string, cityId: CityId) => {
    await adminService.approveListing(listingId, cityId, undefined, currentUser?.id);
    await loadPlatformData();
  };

  const handleRejectListing = async (listingId: string, cityId: CityId, reason: string) => {
    await adminService.rejectListing(listingId, cityId, reason, currentUser?.id);
    await loadPlatformData();
  };

  const handleToggleVerified = async (listingId: string, cityId: CityId, currentVerified: boolean) => {
    await adminService.toggleVerified(listingId, cityId, currentVerified);
    await loadPlatformData();
  };

  const handleToggleFeatured = async (listingId: string, cityId: CityId, currentFeatured: boolean) => {
    await adminService.toggleFeatured(listingId, cityId, currentFeatured);
    await loadPlatformData();
  };

  const getGateType = (): 'unauthenticated' | 'customer_denied' | 'owner_denied' | 'franchise_denied' => {
    if (!currentUser) return 'unauthenticated';
    if (currentUser.isFranchise || (currentUser.roles && currentUser.roles.some((r) => r.role === 'city_franchise'))) {
      return 'franchise_denied';
    }
    if (currentUser.roles && currentUser.roles.some((r) => r.role === 'business_owner')) {
      return 'owner_denied';
    }
    return 'customer_denied';
  };

  // If user is not authorized, render the Security Gate
  if (!isAuthorized || !currentUser) {
    return (
      <AdminSecurityGate
        gateType={getGateType()}
        currentUser={currentUser}
        onBackToHome={onBackToHome}
        onOpenLogin={onSwitchAccount}
        onGoToOwnerDashboard={onGoToOwnerDashboard || onBackToHome}
        onGoToFranchisePortal={onGoToFranchisePortal || onBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Super Admin Top Header */}
      <AdminHeader
        currentUser={currentUser}
        activeCityFilter={activeCityFilter}
        onCityFilterChange={setActiveCityFilter}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onSignOut={onSignOut}
        onBackToHome={onBackToHome}
      />

      {/* Main Administrative Container */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop & Mobile Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          counts={{
            pendingApprovals: stats.pendingApprovals,
            totalListings: stats.totalListings,
            totalEnquiries: stats.totalEnquiries,
          }}
        />

        {/* Content Body Area */}
        <main
          className={`flex-1 transition-all duration-300 min-w-0 p-4 sm:p-6 lg:p-8 ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <AdminOverviewPage
                stats={stats}
                cities={citiesSummary}
                auditLogs={auditLogs}
                activeCityFilter={activeCityFilter}
                onNavigateTab={handleSelectTab}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'cities' && (
              <AdminCitiesPage
                cities={citiesSummary}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                onNavigateTab={handleSelectTab}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'franchises' && (
              <AdminFranchisesPage
                franchises={franchisePartners}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                onNavigateTab={handleSelectTab}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsersPage
                users={usersList}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'businesses' && (
              <AdminBusinessesPage
                businesses={allListings}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                onApproveListing={handleApproveListing}
                onRejectListing={handleRejectListing}
                onToggleVerified={handleToggleVerified}
                onToggleFeatured={handleToggleFeatured}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'enquiries' && (
              <AdminEnquiriesPage
                generalRequests={generalRequests}
                directEnquiries={directEnquiries}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'content' && (
              <AdminContentPage
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'analytics' && (
              <AdminAnalyticsPage
                stats={stats}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'audit' && (
              <AdminAuditPage
                auditLogs={auditLogs}
                activeCityFilter={activeCityFilter}
                onSelectCityFilter={setActiveCityFilter}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsPage
                currentUser={currentUser}
                isLoading={isLoading}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
