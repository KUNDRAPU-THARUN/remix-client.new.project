import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId } from '../types';

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

const STORAGE_KEY = 'chittoorads_enquiries';

function getStoredEnquiries(): CustomerEnquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredEnquiries(enquiries: CustomerEnquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
  } catch (err) {
    console.warn('Could not persist enquiries to localStorage:', err);
  }
}

export const enquiryService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async submitEnquiry(params: SubmitEnquiryParams): Promise<{ enquiry: CustomerEnquiry | null; error?: string }> {
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

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const localEnquiry: CustomerEnquiry = {
        id: `enq-${Date.now()}`,
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

      const existing = getStoredEnquiries();
      saveStoredEnquiries([localEnquiry, ...existing]);
      return { enquiry: localEnquiry };
    }

    try {
      // Find UUID for business
      const { data: bData } = await supabase
        .from('businesses')
        .select('id, name')
        .or(`id.eq.${params.businessId},legacy_id.eq.${params.businessId}`)
        .maybeSingle();

      const targetBusinessId = bData?.id || params.businessId;

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
        return { enquiry: null, error: error.message };
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

      return { enquiry };
    } catch (err) {
      return { enquiry: null, error: err instanceof Error ? err.message : 'Could not submit enquiry.' };
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

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching owner enquiries:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        businessId: row.business_id,
        businessName: row.businesses?.name || 'Your Business',
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

