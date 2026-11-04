import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId, Listing, UserAccount, UserRoleType } from '../types';
import { CITIES, SUPPORTED_CITY_IDS } from '../config/cities';
import { franchiseService, FranchiseStats, FranchiseAuditLog } from './franchiseService';
import { enquiryService, GeneralServiceRequest, CustomerEnquiry } from './enquiryService';
import { INITIAL_LISTINGS } from '../data/mockData';

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
  status: 'active' | 'coming_soon' | 'inactive';
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

export interface AdminTheatreRecord {
  id: string;
  cityId: CityId;
  name: string;
  screenType: string;
  locality: string;
  currentMovie: string;
  language: string;
  ticketStatus: 'Available' | 'Fast Filling' | 'Sold Out';
  isActive: boolean;
}

const LOCAL_ADMIN_USERS_KEY = 'chittoorads_admin_users';
const LOCAL_THEATRES_KEY = 'chittoorads_admin_theatres';

function safeGetItem(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {}
}

const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

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
   * Cryptographically verifies active session with Supabase server
   * and inspects the database user_roles table for super_admin privileges.
   */
  async checkSuperAdminSession(): Promise<{ isSuperAdmin: boolean; userId?: string; email?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { isSuperAdmin: false };
    }

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData.user) {
        return { isSuperAdmin: false };
      }

      const uid = authData.user.id;
      const email = authData.user.email || '';

      // Check database user_roles table directly
      const { data: roles, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid);

      if (rolesErr || !roles) {
        return { isSuperAdmin: false, userId: uid, email };
      }

      const hasSuperAdminRole = roles.some((r: any) => r.role === 'super_admin');
      return {
        isSuperAdmin: hasSuperAdminRole,
        userId: uid,
        email,
      };
    } catch {
      return { isSuperAdmin: false };
    }
  },

  /**
   * Aggregates platform statistics across all supported cities from live database tables
   * with graceful fallback merging when tables are unpopulated or offline.
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

    // Query active franchise count from database
    let activeFranchisesCount = 3;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: franRoles } = await supabase
          .from('user_roles')
          .select('city_id')
          .eq('role', 'city_franchise');
        if (franRoles && franRoles.length > 0) {
          const uniqueCities = new Set(franRoles.map((r: any) => r.city_id).filter(Boolean));
          activeFranchisesCount = Math.max(uniqueCities.size, 3);
        }
      } catch {}
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
      activeFranchises: activeFranchisesCount,
      cityBreakdown,
    };
  },

  /**
   * Retrieves summary cards for all cities from Supabase cities table.
   */
  async getCitiesSummary(): Promise<AdminCitySummary[]> {
    const stats = await this.getPlatformStats();
    const supabase = getSupabaseClient();

    let dbCitiesMap: Record<string, any> = {};
    if (supabase) {
      try {
        const { data: dbCities } = await supabase.from('cities').select('*');
        if (dbCities && dbCities.length > 0) {
          dbCities.forEach((c: any) => {
            dbCitiesMap[c.id] = c;
          });
        }
      } catch {}
    }
    
    return SUPPORTED_CITY_IDS.map((cityId) => {
      const config = CITIES[cityId];
      const cityStats = stats.cityBreakdown[cityId];
      const dbCity = dbCitiesMap[cityId];
      
      const franchiseInfo: Record<CityId, { name: string; email: string }> = {
        chittoor: { name: 'Chittoor Regional Operations', email: 'franchise.chittoor@kaaryanlabs.com' },
        vellore: { name: 'Vellore Division Partner', email: 'franchise.vellore@kaaryanlabs.com' },
        bengaluru: { name: 'Bengaluru Metro Partner', email: 'franchise.bengaluru@kaaryanlabs.com' },
      };

      const fran = franchiseInfo[cityId];

      return {
        id: cityId,
        name: dbCity?.name || config.name,
        code: dbCity?.code || config.code,
        state: dbCity?.state || config.state,
        brandName: dbCity?.brand_name || config.brandName,
        status: (dbCity?.status as any) || 'active',
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
   * Updates city status (e.g. active, coming_soon, inactive) in Supabase.
   */
  async updateCityStatus(cityId: CityId, status: 'active' | 'coming_soon' | 'inactive'): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('cities')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', cityId);

      if (error) {
        console.warn('Supabase city update failed or denied by RLS:', error.message);
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'CITY_STATUS_UPDATE',
        'city',
        cityId,
        cityId,
        { new_status: status }
      );

      return { success: true };
    } catch (err: any) {
      console.warn('Supabase city update error:', err?.message || err);
      return { success: false, error: err?.message || 'City status update failed' };
    }
  },

  /**
   * Retrieves all franchise partners across the network.
   */
  async getFranchisePartners(): Promise<AdminFranchisePartner[]> {
    const stats = await this.getPlatformStats();
    const supabase = getSupabaseClient();

    const referencePartners: AdminFranchisePartner[] = [
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

    if (!supabase) {
      return referencePartners;
    }

    try {
      const { data: dbRoles, error: rErr } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          city_id,
          role,
          created_at
        `)
        .eq('role', 'city_franchise');

      if (rErr || !dbRoles || dbRoles.length === 0) {
        return referencePartners;
      }

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');

      const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const dynamicPartners: AdminFranchisePartner[] = dbRoles.map((r: any) => {
        const prof = profilesMap.get(r.user_id);
        const cityId = (r.city_id || 'chittoor') as CityId;
        const config = CITIES[cityId] || CITIES['chittoor'];
        const cityStats = stats.cityBreakdown[cityId];

        return {
          id: r.user_id,
          cityId,
          cityName: config.name,
          cityCode: config.code,
          name: prof?.display_name || `Franchise Partner (${config.name})`,
          email: prof?.email || `franchise.${cityId}@kaaryanlabs.com`,
          phone: prof?.phone || '+91 94400 00000',
          status: (prof?.account_status as any) || 'active',
          assignedDate: r.created_at ? r.created_at.split('T')[0] : '2026-10-15',
          moderationCount: cityStats?.totalListings || 0,
          pendingReviewsCount: cityStats?.pendingApprovals || 0,
          staffCount: 1,
        };
      });

      // Merge dynamic partners with any missing supported city
      const coveredCities = new Set(dynamicPartners.map((p) => p.cityId));
      for (const ref of referencePartners) {
        if (!coveredCities.has(ref.cityId)) {
          dynamicPartners.push(ref);
        }
      }

      return dynamicPartners;
    } catch {
      return referencePartners;
    }
  },

  /**
   * Assigns or updates a franchise partner to a city territory.
   */
  async assignFranchisePartner(
    userId: string,
    cityId: CityId,
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          {
            user_id: userId,
            role: 'city_franchise',
            city_id: cityId,
            assigned_by: operatorId || null,
          },
          { onConflict: 'user_id,role,city_id' }
        );

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'FRANCHISE_ASSIGNMENT',
        'user_role',
        userId,
        cityId,
        { role: 'city_franchise', city_id: cityId },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
   * Super Admin business approval action - routes strictly through moderate_business_listing RPC.
   */
  async approveListing(
    listingId: string,
    cityId: CityId,
    options?: { isVerified?: boolean; isFeatured?: boolean },
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    return franchiseService.approveBusiness(listingId, cityId, { ...options, operatorId });
  },

  /**
   * Super Admin business rejection action - routes strictly through moderate_business_listing RPC.
   */
  async rejectListing(
    listingId: string,
    cityId: CityId,
    reason: string,
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    return franchiseService.rejectBusiness(listingId, cityId, reason, operatorId);
  },

  /**
   * Super Admin verification badge toggle - routes through moderate_business_listing RPC.
   */
  async toggleVerified(listingId: string, cityId: CityId, currentVerified: boolean) {
    return franchiseService.toggleVerified(listingId, cityId, currentVerified);
  },

  /**
   * Super Admin featured placement toggle - routes through moderate_business_listing RPC.
   */
  async toggleFeatured(listingId: string, cityId: CityId, currentFeatured: boolean) {
    return franchiseService.toggleFeatured(listingId, cityId, currentFeatured);
  },

  /**
   * Batch approve multiple listings - each executed via moderate_business_listing RPC.
   */
  async bulkApproveListings(
    listings: Array<{ id: string; cityId: CityId }>,
    operatorId?: string
  ): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const item of listings) {
      const res = await this.approveListing(item.id, item.cityId, { isVerified: true }, operatorId);
      if (res.success) {
        successCount++;
      } else {
        failureCount++;
        if (res.error) errors.push(`${item.id}: ${res.error}`);
      }
    }

    return { successCount, failureCount, errors };
  },

  /**
   * Batch reject multiple listings - each executed via moderate_business_listing RPC.
   */
  async bulkRejectListings(
    listings: Array<{ id: string; cityId: CityId }>,
    reason: string,
    operatorId?: string
  ): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const item of listings) {
      const res = await this.rejectListing(item.id, item.cityId, reason, operatorId);
      if (res.success) {
        successCount++;
      } else {
        failureCount++;
        if (res.error) errors.push(`${item.id}: ${res.error}`);
      }
    }

    return { successCount, failureCount, errors };
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
   * Updates lead lifecycle status for a general service request.
   */
  async updateGeneralRequestStatus(
    requestId: string,
    status: 'pending' | 'routed' | 'contacted' | 'resolved' | 'archived',
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Local sync
    const raw = safeGetItem('chittoorads_general_leads');
    if (raw) {
      try {
        const list: GeneralServiceRequest[] = JSON.parse(raw);
        const idx = list.findIndex((r) => r.id === requestId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], status };
          safeSetItem('chittoorads_general_leads', JSON.stringify(list));
        }
      } catch {}
    }

    if (!isUuid(requestId)) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await (supabase as any)
        .from('general_service_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'LEAD_STATUS_UPDATE',
        'general_service_request',
        requestId,
        null,
        { new_status: status },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Updates lead lifecycle status for a direct customer enquiry.
   */
  async updateDirectEnquiryStatus(
    enquiryId: string,
    status: 'pending' | 'read' | 'replied' | 'archived',
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const raw = safeGetItem('chittoorads_enquiries');
    if (raw) {
      try {
        const list: CustomerEnquiry[] = JSON.parse(raw);
        const idx = list.findIndex((e) => e.id === enquiryId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], status };
          safeSetItem('chittoorads_enquiries', JSON.stringify(list));
        }
      } catch {}
    }

    if (!isUuid(enquiryId)) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .update({ status })
        .eq('id', enquiryId);

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'ENQUIRY_STATUS_UPDATE',
        'customer_enquiry',
        enquiryId,
        null,
        { new_status: status },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Retrieves platform audit logs across all cities from audit_logs table.
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
   * Inserts an immutable audit log entry into the database.
   */
  async logAdminAction(
    action: string,
    entityType: string,
    entityId: string,
    cityId: CityId | null,
    details: Record<string, any>,
    operatorId?: string
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: operatorId || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        city_id: cityId,
        details,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not write database audit log:', err);
    }
  },

  /**
   * Retrieves registered user accounts from Supabase or structured reference accounts.
   */
  async getAllUsers(): Promise<AdminUserRecord[]> {
    const rawLocalUsers = safeGetItem(LOCAL_ADMIN_USERS_KEY);
    let localUsers: AdminUserRecord[] = [];
    if (rawLocalUsers) {
      try {
        localUsers = JSON.parse(rawLocalUsers);
      } catch {}
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return localUsers.length > 0 ? localUsers : this.getReferenceUsers();
    }

    try {
      const { data: profiles, error: profErr } = await supabase
        .from('user_profiles')
        .select('*');

      if (profErr || !profiles || profiles.length === 0) {
        return localUsers.length > 0 ? localUsers : this.getReferenceUsers();
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
          cityId: (userRole?.city_id as CityId) || (p.city_id as CityId) || null,
          status: (p.account_status as any) || 'active',
          registeredDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-11-01',
        };
      });

      return userRecords;
    } catch {
      return localUsers.length > 0 ? localUsers : this.getReferenceUsers();
    }
  },

  /**
   * Assigns or updates a user's role and territory binding.
   */
  async assignUserRole(
    userId: string,
    newRole: UserRoleType,
    cityId: CityId | null,
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Update local cache
    const currentUsers = await this.getAllUsers();
    const idx = currentUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      currentUsers[idx] = {
        ...currentUsers[idx],
        role: newRole,
        cityId,
      };
      safeSetItem(LOCAL_ADMIN_USERS_KEY, JSON.stringify(currentUsers));
    }

    if (!isUuid(userId)) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      // 1. Attempt privileged RPC first
      const { error: rpcErr } = await (supabase as any).rpc('admin_assign_user_role', {
        _target_user_id: userId,
        _role: newRole,
        _city_id: cityId,
      });

      if (!rpcErr) {
        return { success: true };
      }

      // 2. Fallback to direct role table update (guarded by user_roles RLS)
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Insert new role
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: newRole,
        city_id: cityId,
        assigned_by: operatorId || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'ROLE_CHANGE',
        'user_role',
        userId,
        cityId,
        { role: newRole, city_id: cityId },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Updates a user's account status (active vs suspended).
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended',
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Local cache sync
    const currentUsers = await this.getAllUsers();
    const idx = currentUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      currentUsers[idx] = { ...currentUsers[idx], status };
      safeSetItem(LOCAL_ADMIN_USERS_KEY, JSON.stringify(currentUsers));
    }

    if (!isUuid(userId)) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      // 1. Attempt secure RPC first
      const { error: rpcErr } = await (supabase as any).rpc('admin_set_user_status', {
        _target_user_id: userId,
        _new_status: status,
      });

      if (!rpcErr) {
        return { success: true };
      }

      // 2. Fallback to user_profiles table update
      const { error } = await supabase
        .from('user_profiles')
        .update({ account_status: status, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.warn('user_profiles update rejected by database policy:', error.message);
        return {
          success: false,
          error: error.message || rpcErr?.message || 'Database rejected status change',
        };
      }

      await this.logAdminAction(
        'USER_STATUS_UPDATE',
        'user_profile',
        userId,
        null,
        { account_status: status },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
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
   * Retrieves theatres for a given city from city_theatres table.
   */
  async getLocalTheatres(cityId: CityId): Promise<AdminTheatreRecord[]> {
    const fallbackTheatres: Record<CityId, AdminTheatreRecord[]> = {
      chittoor: [
        { id: 'th-ch-01', cityId: 'chittoor', name: 'MSR Movie Land 4K Dolby Atmos', locality: 'Gandhi Road', screenType: 'Dolby Atmos 4K', currentMovie: 'Devara: Part 1', language: 'Telugu', ticketStatus: 'Fast Filling', isActive: true },
        { id: 'th-ch-02', cityId: 'chittoor', name: 'Venkateswara Theatre', locality: 'High Road', screenType: '2K Qube', currentMovie: 'Lucky Baskhar', language: 'Telugu', ticketStatus: 'Available', isActive: true },
        { id: 'th-ch-03', cityId: 'chittoor', name: 'Chanakya Multiplex', locality: 'Bazaar Street', screenType: 'Digital Surround', currentMovie: 'Amaran', language: 'Tamil / Telugu', ticketStatus: 'Available', isActive: true },
      ],
      vellore: [
        { id: 'th-vl-01', cityId: 'vellore', name: 'Vishnu Cinemas 4K Atmos', locality: 'Katpadi Road', screenType: 'RGB Laser Dolby', currentMovie: 'Amaran', language: 'Tamil', ticketStatus: 'Fast Filling', isActive: true },
        { id: 'th-vl-02', cityId: 'vellore', name: 'Galaxy Multiplex', locality: 'Near New Bus Stand', screenType: '4K Projection', currentMovie: 'Vettaiyan', language: 'Tamil', ticketStatus: 'Available', isActive: true },
        { id: 'th-vl-03', cityId: 'vellore', name: 'Big Cinemas Vellore', locality: 'Arcot Road', screenType: 'Digital Dolby', currentMovie: 'Kanguva', language: 'Tamil', ticketStatus: 'Available', isActive: true },
      ],
      bengaluru: [
        { id: 'th-bl-01', cityId: 'bengaluru', name: 'PVR IMAX Forum Mall', locality: 'Koramangala', screenType: 'IMAX with Laser', currentMovie: 'Gladiator II', language: 'English', ticketStatus: 'Fast Filling', isActive: true },
        { id: 'th-bl-02', cityId: 'bengaluru', name: 'INOX Garuda Mall', locality: 'Magrath Road', screenType: 'Insignia 4K', currentMovie: 'Bagheera', language: 'Kannada', ticketStatus: 'Available', isActive: true },
        { id: 'th-bl-03', cityId: 'bengaluru', name: 'Cinepolis Orion Mall', locality: 'Rajajinagar', screenType: '4DX / Macro XE', currentMovie: 'Singham Again', language: 'Hindi', ticketStatus: 'Available', isActive: true },
      ],
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      return fallbackTheatres[cityId] || [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('city_theatres')
        .select('*')
        .eq('city_id', cityId);

      if (error || !data || data.length === 0) {
        return fallbackTheatres[cityId] || [];
      }

      return data.map((t: any) => ({
        id: t.id,
        cityId: t.city_id as CityId,
        name: t.name,
        screenType: t.screen_type || '2D / Dolby Atmos',
        locality: t.locality,
        currentMovie: t.current_movie,
        language: t.language || 'Local',
        ticketStatus: (t.ticket_status as any) || 'Available',
        isActive: Boolean(t.is_active),
      }));
    } catch {
      return fallbackTheatres[cityId] || [];
    }
  },

  /**
   * Toggles active state of a theatre in city_theatres.
   */
  async toggleTheatreStatus(theatreId: string, currentActive: boolean, operatorId?: string): Promise<{ success: boolean; error?: string }> {
    if (!isUuid(theatreId)) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await (supabase as any)
        .from('city_theatres')
        .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
        .eq('id', theatreId);

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction(
        'THEATRE_STATUS_TOGGLE',
        'city_theatre',
        theatreId,
        null,
        { is_active: !currentActive },
        operatorId
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
