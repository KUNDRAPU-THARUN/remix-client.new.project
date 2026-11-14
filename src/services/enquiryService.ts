import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId } from '../types';

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export interface CustomerEnquiry {
  id: string;
  businessId: string;
  businessName?: string;
  cityId: CityId;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface SubmitEnquiryParams {
  businessId: string;
  businessName?: string;
  cityId: CityId;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
}

export interface GeneralServiceRequest {
  id: string;
  cityId: CityId;
  categoryId: string;
  areaId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  status: 'pending' | 'routed' | 'contacted' | 'resolved' | 'archived';
  createdAt: string;
}

export interface SubmitGeneralLeadParams {
  cityId: CityId;
  categoryId: string;
  areaId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
}

export interface SubmitEnquiryResult {
  enquiry: CustomerEnquiry | null;
  error?: string;
  persisted?: boolean;
  duplicatePrevented?: boolean;
  isOffline?: boolean;
}

export interface SubmitGeneralLeadResult {
  success: boolean;
  leadId?: string;
  note?: string;
  error?: string;
  persisted?: boolean;
  duplicatePrevented?: boolean;
  isOffline?: boolean;
}

const STORAGE_KEY = 'chittoorads_enquiries';
const GENERAL_LEADS_STORAGE_KEY = 'chittoorads_general_leads';

let memoryEnquiries: CustomerEnquiry[] = [];
let memoryGeneralLeads: GeneralServiceRequest[] = [];

function getStoredEnquiries(): CustomerEnquiry[] {
  if (typeof localStorage === 'undefined') return memoryEnquiries;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryEnquiries;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : memoryEnquiries;
  } catch {
    return memoryEnquiries;
  }
}

function saveStoredEnquiries(enquiries: CustomerEnquiry[]): void {
  memoryEnquiries = enquiries;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
  } catch (err) {
    console.warn('Could not persist enquiries to localStorage:', err);
  }
}

function getStoredGeneralLeads(): GeneralServiceRequest[] {
  if (typeof localStorage === 'undefined') return memoryGeneralLeads;
  try {
    const raw = localStorage.getItem(GENERAL_LEADS_STORAGE_KEY);
    if (!raw) return memoryGeneralLeads;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : memoryGeneralLeads;
  } catch {
    return memoryGeneralLeads;
  }
}

function saveStoredGeneralLeads(leads: GeneralServiceRequest[]): void {
  memoryGeneralLeads = leads;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(GENERAL_LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.warn('Could not save general lead to localStorage:', err);
  }
}

export const enquiryService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async submitEnquiry(params: SubmitEnquiryParams): Promise<SubmitEnquiryResult> {
    // 1. Input Validation
    if (!params.customerName.trim() || params.customerName.trim().length < 2) {
      return { enquiry: null, error: 'Please enter a valid customer name (at least 2 characters).' };
    }

    const cleanPhone = params.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { enquiry: null, error: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!params.message.trim() || params.message.trim().length < 5) {
      return { enquiry: null, error: 'Please enter your requirement or question (at least 5 characters).' };
    }

    if (params.customerEmail && params.customerEmail.trim()) {
      const emailTrimmed = params.customerEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        return { enquiry: null, error: 'Please enter a valid email address (e.g. name@example.com).' };
      }
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback in offline development
      // Vellore strictly rejects mock/demo business IDs
      if (params.cityId === 'vellore' && (params.businessId.startsWith('v-') || params.businessId.includes('demo') || params.businessId.includes('00000000'))) {
        return {
          enquiry: null,
          error: "Unable to submit enquiry: The requested business listing could not be found or is no longer available.",
          persisted: false,
        };
      }

      const existing = getStoredEnquiries();
      const recentDup = existing.find(
        (e) =>
          e.businessId === params.businessId &&
          e.customerPhone === params.customerPhone.trim() &&
          Date.now() - new Date(e.createdAt).getTime() < 60000
      );

      if (recentDup) {
        return {
          enquiry: recentDup,
          persisted: false,
          duplicatePrevented: true,
          isOffline: true,
        };
      }

      const localEnquiry: CustomerEnquiry = {
        id: `local-demo-${Date.now()}`,
        businessId: params.businessId,
        businessName: params.businessName || 'Local Business',
        cityId: params.cityId,
        customerId: params.customerId,
        customerName: params.customerName.trim(),
        customerPhone: params.customerPhone.trim(),
        customerEmail: params.customerEmail?.trim() || undefined,
        message: params.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      saveStoredEnquiries([localEnquiry, ...existing]);
      return { enquiry: localEnquiry, persisted: false, isOffline: true };
    }

    try {
      // Find UUID for business and verify it exists, matches city, and is active
      let bQuery = supabase
        .from('businesses')
        .select('id, name, city_id, status');

      if (isUuid(params.businessId)) {
        bQuery = bQuery.or(`id.eq.${params.businessId},legacy_id.eq.${params.businessId}`);
      } else {
        bQuery = bQuery.eq('legacy_id', params.businessId);
      }

      const { data: bData, error: bError } = await bQuery.maybeSingle();

      if (bError) {
        console.warn('Error verifying business for enquiry:', bError.message);
        return {
          enquiry: null,
          error: "Unable to verify business details. Please check your connection and try again.",
          persisted: false,
        };
      }

      if (!bData) {
        return {
          enquiry: null,
          error: "Unable to submit enquiry: The requested business listing could not be found or is no longer available.",
          persisted: false,
        };
      }

      if (bData.status !== 'active') {
        return {
          enquiry: null,
          error: "Unable to submit enquiry: This business listing is currently inactive.",
          persisted: false,
        };
      }

      if (params.cityId && bData.city_id && bData.city_id !== params.cityId) {
        return {
          enquiry: null,
          error: "Unable to submit enquiry: City territory mismatch.",
          persisted: false,
        };
      }

      const targetBusinessId = bData.id;

      // 2. Duplicate submission protection on uncertain network retry (within 60s)
      const recentWindow = new Date(Date.now() - 60000).toISOString();
      const { data: existingDup } = await supabase
        .from('customer_enquiries')
        .select('id, created_at')
        .eq('business_id', targetBusinessId)
        .eq('customer_phone', params.customerPhone.trim())
        .gte('created_at', recentWindow)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDup?.id) {
        return {
          enquiry: {
            id: existingDup.id,
            businessId: params.businessId,
            businessName: bData.name || params.businessName,
            cityId: params.cityId,
            customerId: params.customerId,
            customerName: params.customerName.trim(),
            customerPhone: params.customerPhone.trim(),
            customerEmail: params.customerEmail?.trim() || undefined,
            message: params.message.trim(),
            status: 'pending',
            createdAt: existingDup.created_at,
          },
          persisted: true,
          duplicatePrevented: true,
        };
      }

      const { data, error } = await supabase
        .from('customer_enquiries')
        .insert({
          business_id: targetBusinessId,
          city_id: params.cityId,
          customer_id: params.customerId || null,
          customer_name: params.customerName.trim(),
          customer_phone: params.customerPhone.trim(),
          customer_email: params.customerEmail?.trim() || null,
          message: params.message.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return { enquiry: null, error: "Failed to submit enquiry. Please try again.", persisted: false };
      }

      const enquiry: CustomerEnquiry = {
        id: data.id,
        businessId: params.businessId,
        businessName: bData?.name || params.businessName,
        cityId: data.city_id as CityId,
        customerId: data.customer_id || undefined,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email || undefined,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
      };

      return { enquiry, persisted: true };
    } catch (err) {
      return { enquiry: null, error: err instanceof Error ? err.message : 'Could not submit enquiry.', persisted: false };
    }
  },

  async submitGeneralLead(params: SubmitGeneralLeadParams): Promise<SubmitGeneralLeadResult> {
    if (!params.customerName.trim() || params.customerName.trim().length < 2) {
      return { success: false, error: 'Please enter a valid customer name (at least 2 characters).' };
    }

    const cleanPhone = params.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!params.message.trim() || params.message.trim().length < 5) {
      return { success: false, error: 'Please enter your requirement or question (at least 5 characters).' };
    }

    if (params.customerEmail && params.customerEmail.trim()) {
      const emailTrimmed = params.customerEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Check for recent duplicate submission on retry (within 60s)
        const recentWindow = new Date(Date.now() - 60000).toISOString();
        let dupQuery = (supabase as any)
          .from('general_service_requests')
          .select('id')
          .eq('city_id', params.cityId)
          .eq('customer_phone', params.customerPhone.trim())
          .gte('created_at', recentWindow);

        if (params.categoryId) {
          dupQuery = dupQuery.eq('category_id', params.categoryId);
        }

        const { data: existingLead } = await dupQuery
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingLead?.id) {
          return {
            success: true,
            leadId: existingLead.id,
            persisted: true,
            duplicatePrevented: true,
          };
        }

        const { data, error } = await (supabase as any)
          .from('general_service_requests')
          .insert({
            city_id: params.cityId,
            category_id: params.categoryId,
            area_id: params.areaId,
            customer_name: params.customerName.trim(),
            customer_phone: params.customerPhone.trim(),
            customer_email: params.customerEmail?.trim() || null,
            message: params.message.trim(),
            status: 'pending',
          })
          .select('id')
          .maybeSingle();

        if (error) {
          console.warn('Backend rejected general service request:', error);
          if (error.code === '42P01') {
            return {
              success: false,
              persisted: false,
              error: 'General enquiry routing is pending database migration. Please reach out via our verified city contact desk.',
            };
          }
          return {
            success: false,
            persisted: false,
            error: error.message || 'The server could not record your service enquiry.',
          };
        }

        return { success: true, leadId: data?.id, persisted: !!data?.id };
      } catch (err) {
        console.error('Backend general_service_requests failure:', err);
        return {
          success: false,
          persisted: false,
          error: err instanceof Error ? err.message : 'Network error submitting service request.',
        };
      }
    }

    // Offline / unconfigured development environment fallback
    const leads = getStoredGeneralLeads();
    const recentDup = leads.find(
      (l) =>
        l.cityId === params.cityId &&
        l.categoryId === params.categoryId &&
        l.customerPhone === params.customerPhone.trim() &&
        Date.now() - new Date(l.createdAt).getTime() < 60000
    );

    if (recentDup) {
      return {
        success: true,
        leadId: undefined,
        persisted: false,
        duplicatePrevented: true,
        isOffline: true,
        note: 'Duplicate prevented: Recent identical request within 60s recorded locally.',
      };
    }

    const localLead: GeneralServiceRequest = {
      id: `local-demo-${Date.now()}`,
      cityId: params.cityId,
      categoryId: params.categoryId,
      areaId: params.areaId,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      customerEmail: params.customerEmail?.trim() || undefined,
      message: params.message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveStoredGeneralLeads([localLead, ...leads]);

    return {
      success: true,
      leadId: undefined, // Strictly no fake server ID
      persisted: false,
      isOffline: true,
      note: 'Demo mode: service request saved locally in browser.'
    };
  },

  async getGeneralServiceRequests(cityId?: CityId): Promise<GeneralServiceRequest[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const leads = getStoredGeneralLeads();
      return cityId ? leads.filter((l) => l.cityId === cityId) : leads;
    }

    try {
      let query = (supabase as any)
        .from('general_service_requests')
        .select('id, city_id, category_id, area_id, customer_name, customer_phone, customer_email, message, status, created_at')
        .order('created_at', { ascending: false });

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching general service requests:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        cityId: row.city_id as CityId,
        categoryId: row.category_id,
        areaId: row.area_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email || undefined,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Unexpected error in getGeneralServiceRequests:', err);
      return [];
    }
  },

  async getOwnerEnquiries(ownerId: string, cityId?: CityId): Promise<CustomerEnquiry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback: returns enquiries matching the active city
      const all = getStoredEnquiries();
      return cityId ? all.filter((e) => e.cityId === cityId) : all;
    }

    try {
      let query = supabase
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
            name,
            owner_id
          )
        `)
        .order('created_at', { ascending: false });

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      let data: any[] | null = null;
      const res = await query;
      if (res.error) {
        let fallbackQuery = supabase
          .from('customer_enquiries')
          .select('id, business_id, city_id, customer_id, customer_name, customer_phone, customer_email, message, status, created_at')
          .order('created_at', { ascending: false });
        if (cityId) fallbackQuery = fallbackQuery.eq('city_id', cityId);
        const fallbackRes = await fallbackQuery;
        if (fallbackRes.error) {
          console.warn('Error fetching owner enquiries:', fallbackRes.error.message);
          return [];
        }
        data = fallbackRes.data;
      } else {
        data = res.data;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        businessId: row.business_id,
        businessName: row.businesses?.name || 'Your Business Listing',
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
      console.warn('Unexpected error in getOwnerEnquiries:', err);
      return [];
    }
  },

  async updateEnquiryStatus(
    enquiryId: string,
    status: 'pending' | 'read' | 'replied' | 'archived'
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const all = getStoredEnquiries();
      const updated = all.map((e) => (e.id === enquiryId ? { ...e, status } : e));
      saveStoredEnquiries(updated);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .update({ status })
        .eq('id', enquiryId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update enquiry status.' };
    }
  },
};

