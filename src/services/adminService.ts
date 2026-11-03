import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId, Listing, UserAccount, UserRoleType } from '../types';
import { CITIES, SUPPORTED_CITY_IDS } from '../config/cities';
import { franchiseService, FranchiseStats, FranchiseAuditLog } from './franchiseService';
import { enquiryService, GeneralServiceRequest, CustomerEnquiry } from './enquiryService';
import { businessService } from './businessService';

export interface AdminPlatformStats {
  totalCities: number;
  totalListings: number;
  activeListings: number;
  pendingApprovals: number;
  rejectedListings: number;
  verifiedBusinesses: number;
  totalEnquiries: number;
  generalLeads: number;
  directEnquiries: number;
  activeFranchises: number;
  cityBreakdown: Record<CityId, FranchiseStats>;
}

export interface AdminCitySummary {
  id: CityId;
  name: string;
  code: string;
  state: string;
  brandName: string;
  status: 'active' | 'pending' | 'maintenance';
  localitiesCount: number;
  activeListings: number;
  pendingApprovals: number;
  totalEnquiries: number;
  franchisePartnerName: string;
  franchiseEmail: string;
  hasFranchiseAssigned: boolean;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRoleType;
  cityId: CityId | null;
  status: 'active' | 'pending' | 'suspended';
  registeredDate: string;
  lastLogin?: string;
  listingsCount?: number;
}

export interface AdminFranchisePartner {
  id: string;
  cityId: CityId;
  cityName: string;
  cityCode: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  assignedDate: string;
  moderationCount: number;
  pendingReviewsCount: number;
  staffCount: number;
}

export const adminService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Evaluates if a user is authorized for Super Admin operations.
   * Server-verified roles take strict precedence over client flags.
   */
  isSuperAdmin(user: UserAccount | null): boolean {
    if (!user) return false;
    if (user.roles && user.roles.length > 0) {
      return user.roles.some((r) => r.role === 'super_admin');
    }
    return Boolean(user.isSuperAdmin);
  },

  /**
   * Aggregates platform statistics across all supported cities.
   */
  async getPlatformStats(): Promise<AdminPlatformStats> {
    const cityBreakdown: Record<CityId, FranchiseStats> = {
      chittoor: {
        totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0,
        totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0,
      },
      vellore: {
        totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0,
        totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0,
      },
      bengaluru: {
        totalListings: 0, activeListings: 0, pendingApprovals: 0, rejectedListings: 0,
        totalEnquiries: 0, generalLeads: 0, directEnquiries: 0, verifiedBusinesses: 0, activeCategories: 0,
      },
    };

    let totalListings = 0;
    let activeListings = 0;
    let pendingApprovals = 0;
    let rejectedListings = 0;
    let verifiedBusinesses = 0;
    let totalEnquiries = 0;
    let generalLeads = 0;
    let directEnquiries = 0;

    for (const cityId of SUPPORTED_CITY_IDS) {
      try {
        const stats = await franchiseService.getFranchiseStats(cityId);
        cityBreakdown[cityId] = stats;
        totalListings += stats.totalListings;
        activeListings += stats.activeListings;
        pendingApprovals += stats.pendingApprovals;
        rejectedListings += stats.rejectedListings;
        verifiedBusinesses += stats.verifiedBusinesses;
        totalEnquiries += stats.totalEnquiries;
        generalLeads += stats.generalLeads;
        directEnquiries += stats.directEnquiries;
      } catch (err) {
        console.warn(`Could not load stats for city ${cityId}:`, err);
      }
    }

    return {
      totalCities: SUPPORTED_CITY_IDS.length,
      totalListings,
      activeListings,
      pendingApprovals,
      rejectedListings,
      verifiedBusinesses,
      totalEnquiries,
      generalLeads,
      directEnquiries,
      activeFranchises: 3, // Chittoor, Vellore, Bengaluru designated regional partners
      cityBreakdown,
    };
  },

  /**
   * Retrieves summary cards for all cities.
   */
  async getCitiesSummary(): Promise<AdminCitySummary[]> {
    const stats = await this.getPlatformStats();
    
    return SUPPORTED_CITY_IDS.map((cityId) => {
      const config = CITIES[cityId];
      const cityStats = stats.cityBreakdown[cityId];
      
      const franchiseInfo: Record<CityId, { name: string; email: string }> = {
        chittoor: { name: 'Chittoor Regional Operations', email: 'franchise.chittoor@kaaryanlabs.com' },
        vellore: { name: 'Vellore Division Partner', email: 'franchise.vellore@kaaryanlabs.com' },
        bengaluru: { name: 'Bengaluru Metro Partner', email: 'franchise.bengaluru@kaaryanlabs.com' },
      };

      const fran = franchiseInfo[cityId];

      return {
        id: cityId,
        name: config.name,
        code: config.code,
        state: config.state,
        brandName: config.brandName,
        status: 'active',
        localitiesCount: config.localities.length - 1, // minus 'all'
        activeListings: cityStats?.activeListings || 0,
        pendingApprovals: cityStats?.pendingApprovals || 0,
        totalEnquiries: cityStats?.totalEnquiries || 0,
        franchisePartnerName: fran.name,
        franchiseEmail: fran.email,
        hasFranchiseAssigned: true,
      };
    });
  },

  /**
   * Retrieves all franchise partners across the network.
   */
  async getFranchisePartners(): Promise<AdminFranchisePartner[]> {
    const stats = await this.getPlatformStats();

    const partners: AdminFranchisePartner[] = [
      {
        id: 'fran-cht-01',
        cityId: 'chittoor',
        cityName: 'Chittoor',
        cityCode: 'AP-03',
        name: 'Chittoor Regional Operations Partner',
        email: 'franchise.chittoor@kaaryanlabs.com',
        phone: '+91 94401 23456',
        status: 'active',
        assignedDate: '2026-10-15',
        moderationCount: stats.cityBreakdown.chittoor.totalListings,
        pendingReviewsCount: stats.cityBreakdown.chittoor.pendingApprovals,
        staffCount: 1,
      },
      {
        id: 'fran-vel-01',
        cityId: 'vellore',
        cityName: 'Vellore',
        cityCode: 'TN-23',
        name: 'Vellore Ads Regional Partner',
        email: 'franchise.vellore@kaaryanlabs.com',
        phone: '+91 94432 88990',
        status: 'active',
        assignedDate: '2026-10-20',
        moderationCount: stats.cityBreakdown.vellore.totalListings,
        pendingReviewsCount: stats.cityBreakdown.vellore.pendingApprovals,
        staffCount: 1,
      },
      {
        id: 'fran-blr-01',
        cityId: 'bengaluru',
        cityName: 'Bengaluru',
        cityCode: 'KA-01',
        name: 'Bengaluru Metro Enterprise Partner',
        email: 'franchise.bengaluru@kaaryanlabs.com',
        phone: '+91 98450 12345',
        status: 'active',
        assignedDate: '2026-10-25',
        moderationCount: stats.cityBreakdown.bengaluru.totalListings,
        pendingReviewsCount: stats.cityBreakdown.bengaluru.pendingApprovals,
        staffCount: 1,
      },
    ];

    return partners;
  },

  /**
   * Retrieves listings across all cities or a selected city.
   */
  async getAllListings(cityFilter: CityId | 'all' = 'all'): Promise<Listing[]> {
    let allListings: Listing[] = [];

    const targetCities: CityId[] = cityFilter === 'all' ? [...SUPPORTED_CITY_IDS] : [cityFilter];

    for (const cityId of targetCities) {
      try {
        const cityListings = await franchiseService.getCityBusinesses(cityId, { status: 'all' });
        allListings = [...allListings, ...cityListings];
      } catch (err) {
        console.warn(`Error fetching listings for ${cityId}:`, err);
      }
    }

    return allListings;
  },

  /**
   * Retrieves enquiries across all cities or a selected city.
   */
  async getAllEnquiries(cityFilter: CityId | 'all' = 'all'): Promise<{
    generalRequests: GeneralServiceRequest[];
    directEnquiries: CustomerEnquiry[];
  }> {
    let generalRequests: GeneralServiceRequest[] = [];
    let directEnquiries: CustomerEnquiry[] = [];

    const targetCities: CityId[] = cityFilter === 'all' ? [...SUPPORTED_CITY_IDS] : [cityFilter];

    for (const cityId of targetCities) {
      try {
        const genLeads = await enquiryService.getGeneralServiceRequests(cityId);
        const dirEnq = await franchiseService.getBusinessEnquiries(cityId);
        generalRequests = [...generalRequests, ...genLeads];
        directEnquiries = [...directEnquiries, ...dirEnq];
      } catch (err) {
        console.warn(`Error fetching enquiries for ${cityId}:`, err);
      }
    }

    return { generalRequests, directEnquiries };
  },

  /**
   * Retrieves platform audit logs across all cities.
   */
  async getGlobalAuditLogs(cityFilter: CityId | 'all' = 'all', limit: number = 100): Promise<FranchiseAuditLog[]> {
    let allLogs: FranchiseAuditLog[] = [];

    const targetCities: CityId[] = cityFilter === 'all' ? [...SUPPORTED_CITY_IDS] : [cityFilter];

    for (const cityId of targetCities) {
      try {
        const cityLogs = await franchiseService.getAuditLogs(cityId);
        allLogs = [...allLogs, ...cityLogs];
      } catch (err) {
        console.warn(`Error fetching audit logs for ${cityId}:`, err);
      }
    }

    // Sort descending by timestamp
    allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allLogs.slice(0, limit);
  },

  /**
   * Retrieves registered user accounts from Supabase or structured reference accounts.
   */
  async getAllUsers(): Promise<AdminUserRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.getReferenceUsers();
    }

    try {
      // Query user_profiles and user_roles
      const { data: profiles, error: profErr } = await supabase
        .from('user_profiles')
        .select('*');

      if (profErr || !profiles || profiles.length === 0) {
        return this.getReferenceUsers();
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      const userRecords: AdminUserRecord[] = profiles.map((p) => {
        const userRole = (roles || []).find((r) => r.user_id === p.id);
        return {
          id: p.id,
          name: p.display_name || p.email.split('@')[0],
          email: p.email,
          mobile: p.phone || undefined,
          role: (userRole?.role as UserRoleType) || 'customer',
          cityId: (p.city_id as CityId) || null,
          status: (p.account_status as any) || 'active',
          registeredDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-11-01',
        };
      });

      return userRecords;
    } catch {
      return this.getReferenceUsers();
    }
  },

  /**
   * Fallback reference users when database has 0 user_profiles or in offline dev mode.
   */
  getReferenceUsers(): AdminUserRecord[] {
    return [
      {
        id: 'usr-admin-01',
        name: 'Super Administrator',
        email: 'admin@kaaryanlabs.com',
        mobile: '+91 99000 00001',
        role: 'super_admin',
        cityId: null,
        status: 'active',
        registeredDate: '2026-10-01',
      },
      {
        id: 'usr-fran-cht',
        name: 'Chittoor Operations Partner',
        email: 'franchise.chittoor@kaaryanlabs.com',
        mobile: '+91 94401 23456',
        role: 'city_franchise',
        cityId: 'chittoor',
        status: 'active',
        registeredDate: '2026-10-15',
      },
      {
        id: 'usr-fran-vel',
        name: 'Vellore Operations Partner',
        email: 'franchise.vellore@kaaryanlabs.com',
        mobile: '+91 94432 88990',
        role: 'city_franchise',
        cityId: 'vellore',
        status: 'active',
        registeredDate: '2026-10-20',
      },
      {
        id: 'usr-fran-blr',
        name: 'Bengaluru Operations Partner',
        email: 'franchise.bengaluru@kaaryanlabs.com',
        mobile: '+91 98450 12345',
        role: 'city_franchise',
        cityId: 'bengaluru',
        status: 'active',
        registeredDate: '2026-10-25',
      },
      {
        id: 'usr-owner-01',
        name: 'Sri Krishna Sweets',
        email: 'merchant@krishnasweets.com',
        mobile: '+91 98480 11223',
        role: 'business_owner',
        cityId: 'chittoor',
        status: 'active',
        registeredDate: '2026-11-01',
      },
      {
        id: 'usr-cust-01',
        name: 'Anand Kumar',
        email: 'anand.customer@gmail.com',
        mobile: '+91 94432 88990',
        role: 'customer',
        cityId: 'vellore',
        status: 'active',
        registeredDate: '2026-11-02',
      },
    ];
  },

  /**
   * Super Admin business approval action - routes through moderate_business_listing RPC.
   */
  async approveListing(listingId: string, cityId: CityId, options?: { isVerified?: boolean; isFeatured?: boolean }, operatorId?: string) {
    return franchiseService.approveBusiness(listingId, cityId, options);
  },

  /**
   * Super Admin business rejection action - routes through moderate_business_listing RPC.
   */
  async rejectListing(listingId: string, cityId: CityId, reason: string, operatorId?: string) {
    return franchiseService.rejectBusiness(listingId, cityId, reason, operatorId);
  },

  /**
   * Super Admin verification badge toggle.
   */
  async toggleVerified(listingId: string, cityId: CityId, currentVerified: boolean) {
    return franchiseService.toggleVerified(listingId, cityId, currentVerified);
  },

  /**
   * Super Admin featured placement toggle.
   */
  async toggleFeatured(listingId: string, cityId: CityId, currentFeatured: boolean) {
    return franchiseService.toggleFeatured(listingId, cityId, currentFeatured);
  },
};
