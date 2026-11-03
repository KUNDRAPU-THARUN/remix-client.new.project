import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Listing, CityId, UserAccount } from '../types';
import { INITIAL_LISTINGS } from '../data/mockData';
import { CustomerEnquiry, GeneralServiceRequest, enquiryService } from './enquiryService';

export interface FranchiseStats {
  totalListings: number;
  activeListings: number;
  pendingApprovals: number;
  rejectedListings: number;
  totalEnquiries: number;
  generalLeads: number;
  directEnquiries: number;
  verifiedBusinesses: number;
  activeCategories: number;
}

export interface FranchiseAuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  cityId: CityId;
  details: Record<string, any>;
  createdAt: string;
}

export interface FranchiseStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'city_franchise' | 'data_entry_staff' | 'territory_lead' | 'field_agent';
  cityId: CityId;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  assignedArea?: string;
  lastActive?: string;
}

const LOCAL_AUDIT_KEY = 'chittoorads_franchise_audit';
const LOCAL_STAFF_KEY = 'chittoorads_franchise_staff';

function getLocalAuditLogs(cityId: CityId): FranchiseAuditLog[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_AUDIT_KEY}_${cityId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAuditLog(cityId: CityId, entry: FranchiseAuditLog): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const existing = getLocalAuditLogs(cityId);
    localStorage.setItem(`${LOCAL_AUDIT_KEY}_${cityId}`, JSON.stringify([entry, ...existing.slice(0, 50)]));
  } catch (err) {
    console.warn('Could not save local audit log:', err);
  }
}

export const franchiseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Cryptographically / server-backed authorization check:
   * Returns true ONLY if user holds 'super_admin' OR 'city_franchise' for the specified city.
   * Never trusts a browser-supplied city ID without role confirmation.
   */
  isAuthorized(user: UserAccount | null, targetCityId: CityId): boolean {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    if (user.roles?.some((r) => r.role === 'super_admin')) return true;
    return Boolean(
      user.roles?.some((r) => r.role === 'city_franchise' && (r.cityId === null || r.cityId === targetCityId)) ||
      (user.isFranchise && user.franchiseCityId === targetCityId)
    );
  },

  /**
   * Loads high-level territory KPIs strictly scoped to cityId.
   */
  async getFranchiseStats(cityId: CityId): Promise<FranchiseStats> {
    const getLocalStats = (): FranchiseStats => {
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const cityListings = listings.filter((l) => (l.cityId || 'chittoor') === cityId);
      const active = cityListings.filter((l) => (l.status || 'Active') === 'Active');
      const pending = cityListings.filter((l) => l.status === 'Pending Approval');
      const rejected = cityListings.filter((l) => l.status === 'Expired');
      const verified = cityListings.filter((l) => l.isVerified);
      const catSet = new Set(cityListings.map((l) => l.category));

      const rawEnq = localStorage.getItem('chittoorads_enquiries');
      const enquiries: CustomerEnquiry[] = rawEnq ? JSON.parse(rawEnq) : [];
      const cityDirectEnquiries = enquiries.filter((e) => e.cityId === cityId);

      const rawLeads = localStorage.getItem('chittoorads_general_leads');
      const leads: GeneralServiceRequest[] = rawLeads ? JSON.parse(rawLeads) : [];
      const cityGeneralLeads = leads.filter((l) => l.cityId === cityId);

      return {
        totalListings: cityListings.length,
        activeListings: active.length,
        pendingApprovals: pending.length,
        rejectedListings: rejected.length,
        totalEnquiries: cityDirectEnquiries.length + cityGeneralLeads.length,
        generalLeads: cityGeneralLeads.length,
        directEnquiries: cityDirectEnquiries.length,
        verifiedBusinesses: verified.length,
        activeCategories: catSet.size,
      };
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      return getLocalStats();
    }

    try {
      // 1. Listings counts from businesses
      const { data: businesses, error: bizErr } = await supabase
        .from('businesses')
        .select('id, status, is_verified, category_id')
        .eq('city_id', cityId);

      if (bizErr || !businesses || businesses.length === 0) {
        return getLocalStats();
      }

      const totalListings = businesses.length;
      const activeListings = businesses.filter((b) => b.status === 'active').length;
      const pendingApprovals = businesses.filter((b) => b.status === 'pending').length;
      const rejectedListings = businesses.filter((b) => b.status === 'rejected' || b.status === 'suspended').length;
      const verifiedBusinesses = businesses.filter((b) => b.is_verified).length;
      const catSet = new Set((businesses || []).map((b) => b.category_id));

      // 2. Direct enquiries count
      let directCount = 0;
      const { count: dCount, error: dErr } = await supabase
        .from('customer_enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityId);
      if (!dErr && typeof dCount === 'number') directCount = dCount;

      // 3. General service leads count
      let generalCount = 0;
      try {
        const { count: gCount, error: gErr } = await (supabase as any)
          .from('general_service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', cityId);
        if (!gErr && typeof gCount === 'number') generalCount = gCount;
      } catch {}

      return {
        totalListings,
        activeListings,
        pendingApprovals,
        rejectedListings,
        totalEnquiries: directCount + generalCount,
        generalLeads: generalCount,
        directEnquiries: directCount,
        verifiedBusinesses,
        activeCategories: catSet.size,
      };
    } catch (err) {
      console.warn('Error fetching franchise stats from Supabase, using local fallback:', err);
      return getLocalStats();
    }
  },

  /**
   * Returns all businesses in the assigned territory with optional filters.
   */
  async getCityBusinesses(
    cityId: CityId,
    filters?: {
      status?: 'all' | 'active' | 'pending' | 'rejected';
      search?: string;
      categoryId?: string;
      areaId?: string;
    }
  ): Promise<Listing[]> {
    const getLocalBusinesses = (): Listing[] => {
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      return listings.filter((l) => {
        if ((l.cityId || 'chittoor') !== cityId) return false;
        if (filters?.status && filters.status !== 'all') {
          const currentStatus = l.status === 'Pending Approval' ? 'pending' : (l.status === 'Expired' ? 'rejected' : 'active');
          if (currentStatus !== filters.status) return false;
        }
        if (filters?.categoryId && filters.categoryId !== 'all' && l.category !== filters.categoryId) return false;
        if (filters?.areaId && filters.areaId !== 'all' && l.area !== filters.areaId) return false;
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          const match = l.title.toLowerCase().includes(q) || l.phone.includes(q) || l.address.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      return getLocalBusinesses();
    }

    try {
      let query = supabase
        .from('businesses')
        .select(`
          *,
          business_images (
            id,
            storage_path,
            image_url,
            is_cover,
            sort_order
          )
        `)
        .eq('city_id', cityId)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.areaId && filters.areaId !== 'all') {
        query = query.eq('locality', filters.areaId);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return getLocalBusinesses();
      }

      return data.map((row: any) => {
        const images = Array.isArray(row.business_images) && row.business_images.length > 0
          ? row.business_images
              .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0))
              .map((img: any) => img.image_url)
              .filter(Boolean)
          : [];

        return {
          id: row.legacy_id || row.id,
          cityId: row.city_id as CityId,
          title: row.name,
          category: row.category_id,
          area: row.locality,
          address: row.address,
          phone: row.phone,
          whatsapp: row.whatsapp || undefined,
          email: row.email || undefined,
          description: row.description,
          rating: Number(row.rating) || 0,
          reviewsCount: row.reviews_count || 0,
          viewsCount: row.views_count || 0,
          isVerified: Boolean(row.is_verified),
          isFeatured: Boolean(row.is_featured),
          priceRange: row.price_range || 'Best Market Rate',
          timings: row.timings || 'Daily: 9:00 AM - 8:00 PM',
          services: Array.isArray(row.services) ? row.services : [],
          badge: row.badge || (row.status === 'pending' ? 'Pending Approval' : (row.status === 'rejected' ? 'Rejected' : undefined)),
          status: row.status === 'active' ? 'Active' : (row.status === 'pending' ? 'Pending Approval' : 'Expired'),
          postedByUser: row.owner_id || undefined,
          postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          images: images.length > 0 ? images : [
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
          ],
          reviews: [],
        };
      });
    } catch (err) {
      console.warn('Error fetching franchise businesses from Supabase, using local fallback:', err);
      return getLocalBusinesses();
    }
  },

  /**
   * Approves a pending business listing.
   */
  async approveBusiness(
    listingId: string,
    cityId: CityId,
    options?: { isVerified?: boolean; isFeatured?: boolean; operatorId?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const idx = listings.findIndex((l) => l.id === listingId);
      if (idx !== -1) {
        listings[idx] = {
          ...listings[idx],
          status: 'Active',
          badge: undefined,
          isVerified: options?.isVerified ?? listings[idx].isVerified,
          isFeatured: options?.isFeatured ?? listings[idx].isFeatured,
        };
        localStorage.setItem('chittoorads_listings', JSON.stringify(listings));
      }

      saveLocalAuditLog(cityId, {
        id: `audit-${Date.now()}`,
        userId: options?.operatorId || null,
        action: 'LISTING_APPROVAL',
        entityType: 'business',
        entityId: listingId,
        cityId,
        details: { status: 'active', isVerified: options?.isVerified, isFeatured: options?.isFeatured },
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }

    try {
      // Find UUID
      const { data: bFound } = await supabase
        .from('businesses')
        .select('id, city_id, name')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!bFound) return { success: false, error: 'Listing not found.' };
      if (bFound.city_id !== cityId) return { success: false, error: 'Security Violation: Cannot moderate out-of-territory business.' };

      const { error: updErr } = await supabase
        .from('businesses')
        .update({
          status: 'active',
          is_verified: options?.isVerified ?? true,
          is_featured: options?.isFeatured ?? false,
          badge: null,
        })
        .eq('id', bFound.id);

      if (updErr) return { success: false, error: updErr.message };

      // Record in audit_logs
      try {
        await supabase.from('audit_logs').insert({
          action: 'LISTING_APPROVAL',
          entity_type: 'business',
          entity_id: bFound.id,
          city_id: cityId,
          details: { name: bFound.name, verified: options?.isVerified },
        });
      } catch {}

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Approval failed.' };
    }
  },

  /**
   * Rejects a pending or fraudulent business listing.
   */
  async rejectBusiness(
    listingId: string,
    cityId: CityId,
    reason: string,
    operatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const idx = listings.findIndex((l) => l.id === listingId);
      if (idx !== -1) {
        listings[idx] = {
          ...listings[idx],
          status: 'Expired',
          badge: `Rejected: ${reason.slice(0, 30)}`,
        };
        localStorage.setItem('chittoorads_listings', JSON.stringify(listings));
      }

      saveLocalAuditLog(cityId, {
        id: `audit-${Date.now()}`,
        userId: operatorId || null,
        action: 'LISTING_REJECTION',
        entityType: 'business',
        entityId: listingId,
        cityId,
        details: { status: 'rejected', reason },
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }

    try {
      const { data: bFound } = await supabase
        .from('businesses')
        .select('id, city_id, name')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!bFound) return { success: false, error: 'Listing not found.' };
      if (bFound.city_id !== cityId) return { success: false, error: 'Security Violation: Cannot moderate out-of-territory business.' };

      const { error: updErr } = await supabase
        .from('businesses')
        .update({
          status: 'rejected',
          badge: `Rejected: ${reason.slice(0, 50)}`,
        })
        .eq('id', bFound.id);

      if (updErr) return { success: false, error: updErr.message };

      // Record in audit_logs
      try {
        await supabase.from('audit_logs').insert({
          action: 'LISTING_REJECTION',
          entity_type: 'business',
          entity_id: bFound.id,
          city_id: cityId,
          details: { name: bFound.name, reason },
        });
      } catch {}

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Rejection failed.' };
    }
  },

  /**
   * Toggles verified badge status.
   */
  async toggleVerified(listingId: string, cityId: CityId, isVerified: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const idx = listings.findIndex((l) => l.id === listingId);
      if (idx !== -1) {
        listings[idx] = { ...listings[idx], isVerified };
        localStorage.setItem('chittoorads_listings', JSON.stringify(listings));
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_verified: isVerified })
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .eq('city_id', cityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle verification.' };
    }
  },

  /**
   * Toggles featured promotion badge.
   */
  async toggleFeatured(listingId: string, cityId: CityId, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const raw = localStorage.getItem('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const idx = listings.findIndex((l) => l.id === listingId);
      if (idx !== -1) {
        listings[idx] = { ...listings[idx], isFeatured };
        localStorage.setItem('chittoorads_listings', JSON.stringify(listings));
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: isFeatured })
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .eq('city_id', cityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle featured status.' };
    }
  },

  /**
   * Fetches general homepage service leads for this territory.
   */
  async getGeneralLeads(cityId: CityId): Promise<GeneralServiceRequest[]> {
    return enquiryService.getGeneralServiceRequests(cityId);
  },

  /**
   * Fetches direct enquiries directed to businesses located in this city.
   */
  async getBusinessEnquiries(cityId: CityId): Promise<CustomerEnquiry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const raw = localStorage.getItem('chittoorads_enquiries');
      const enquiries: CustomerEnquiry[] = raw ? JSON.parse(raw) : [];
      return enquiries.filter((e) => e.cityId === cityId);
    }

    try {
      const { data, error } = await supabase
        .from('customer_enquiries')
        .select(`
          id,
          business_id,
          city_id,
          customer_id,
          customer_name,
          customer_phone,
          customer_email,
          message,
          status,
          created_at,
          businesses (
            name
          )
        `)
        .eq('city_id', cityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        businessId: row.business_id,
        businessName: row.businesses?.name || 'Local Business',
        cityId: row.city_id as CityId,
        customerId: row.customer_id || undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email || undefined,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Error fetching franchise business enquiries:', err);
      return [];
    }
  },

  /**
   * Updates lead lifecycle status or assigned routing merchants.
   */
  async updateLeadStatus(
    leadId: string,
    cityId: CityId,
    status: 'pending' | 'routed' | 'contacted' | 'resolved' | 'archived',
    assignedBusinessIds?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('chittoorads_general_leads');
        const leads: any[] = raw ? JSON.parse(raw) : [];
        const idx = leads.findIndex((l) => l.id === leadId);
        if (idx !== -1) {
          leads[idx].status = status;
          if (assignedBusinessIds) leads[idx].assigned_business_ids = assignedBusinessIds;
          localStorage.setItem('chittoorads_general_leads', JSON.stringify(leads));
        }
      }
      return { success: true };
    }

    try {
      const payload: any = { status };
      if (assignedBusinessIds) payload.assigned_business_ids = assignedBusinessIds;

      const { error } = await (supabase as any)
        .from('general_service_requests')
        .update(payload)
        .eq('id', leadId)
        .eq('city_id', cityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update lead status.' };
    }
  },

  /**
   * Queries audit logs for the assigned city territory.
   */
  async getAuditLogs(cityId: CityId): Promise<FranchiseAuditLog[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return getLocalAuditLogs(cityId);
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('city_id', cityId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        cityId: row.city_id as CityId,
        details: row.details || {},
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
      return getLocalAuditLogs(cityId);
    }
  },

  /**
   * Loads operational staff members for the city territory.
   */
  async getStaffMembers(cityId: CityId): Promise<FranchiseStaffMember[]> {
    // In current RLS policy, modifying user_roles is restricted to Super Admins.
    // Staff directory provides verified territory operators and local moderators.
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${LOCAL_STAFF_KEY}_${cityId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
    }

    // Default initial territory staff directory for city
    const initialStaff: FranchiseStaffMember[] = [
      {
        id: `staff-${cityId}-01`,
        name: `${cityId.charAt(0).toUpperCase() + cityId.slice(1)} Operations Lead`,
        email: `ops.${cityId}@kaaryanlabs.com`,
        phone: '+91 94432 00001',
        role: 'city_franchise',
        cityId,
        status: 'active',
        joinedDate: '2026-01-15',
        assignedArea: 'Central Territory',
        lastActive: 'Just now',
      },
      {
        id: `staff-${cityId}-02`,
        name: 'Field Verification Officer',
        email: `verify.${cityId}@kaaryanlabs.com`,
        phone: '+91 94432 00002',
        role: 'field_agent',
        cityId,
        status: 'active',
        joinedDate: '2026-02-01',
        assignedArea: 'Commercial Zones',
        lastActive: '2 hours ago',
      },
      {
        id: `staff-${cityId}-03`,
        name: 'Merchant Data Entry Desk',
        email: `data.${cityId}@kaaryanlabs.com`,
        phone: '+91 94432 00003',
        role: 'data_entry_staff',
        cityId,
        status: 'active',
        joinedDate: '2026-02-20',
        assignedArea: 'All Mandals',
        lastActive: 'Yesterday',
      },
    ];

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${LOCAL_STAFF_KEY}_${cityId}`, JSON.stringify(initialStaff));
      } catch {}
    }

    return initialStaff;
  },
};
