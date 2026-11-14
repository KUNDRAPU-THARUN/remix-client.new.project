import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Listing, CityId, Review } from '../types';
import { isCityId } from '../config/cities';
import { INITIAL_LISTINGS } from '../data/mockData';
import { Database } from '../types/database.types';

type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

export type BusinessDataState = 'loading' | 'success_with_results' | 'success_empty' | 'error';

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Helper to convert database row to frontend Listing type
function mapDbBusinessToListing(row: any, images: string[] = []): Listing {
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
    badge: row.badge || (row.status === 'pending' ? 'Pending Approval' : undefined),
    status: row.status === 'active' ? 'Active' : row.status === 'pending' ? 'Pending Approval' : 'Expired',
    postedByUser: row.owner_id || undefined,
    postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    images: images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    ],
    reviews: [],
  };
}

function safeGetStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export const businessService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async getPublishedListingsResult(cityId: CityId): Promise<{
    listings: Listing[];
    state: BusinessDataState;
    error?: string;
  }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback from localStorage or INITIAL_LISTINGS
      // Vellore in production NEVER returns mock listings automatically
      if (cityId === 'vellore') {
        const raw = safeGetStorage('chittoorads_listings');
        let userListings: Listing[] = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              userListings = parsed.filter(
                (l) => l.cityId === 'vellore' && l.postedByUser && l.postedByUser !== 'u-demo'
              );
            }
          } catch {}
        }
        return {
          listings: userListings,
          state: userListings.length > 0 ? 'success_with_results' : 'success_empty',
        };
      }

      const raw = safeGetStorage('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const filtered = listings.filter(
        (l) => (l.cityId || 'chittoor') === cityId && (l.status || 'Active') === 'Active'
      );
      return {
        listings: filtered,
        state: filtered.length > 0 ? 'success_with_results' : 'success_empty',
      };
    }

    try {
      let data: any[] | null = null;
      const joinedRes = await supabase
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
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (joinedRes.error) {
        const fallbackRes = await supabase
          .from('businesses')
          .select('*')
          .eq('city_id', cityId)
          .eq('status', 'active')
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false });

        if (fallbackRes.error) {
          console.warn('Error fetching published businesses from Supabase:', fallbackRes.error.message);
          return {
            listings: [],
            state: 'error',
            error: "We couldn't load businesses right now. Please try again.",
          };
        }
        data = fallbackRes.data;
      } else {
        data = joinedRes.data;
      }

      const mapped = (data || []).map((row) => {
        const images = Array.isArray(row.business_images) && row.business_images.length > 0
          ? row.business_images
              .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0))
              .map((img: any) => img.image_url)
              .filter(Boolean)
          : [];
        return mapDbBusinessToListing(row, images);
      });

      return {
        listings: mapped,
        state: mapped.length > 0 ? 'success_with_results' : 'success_empty',
      };
    } catch (err) {
      console.warn('Unexpected error in getPublishedListingsResult:', err);
      return {
        listings: [],
        state: 'error',
        error: "We couldn't load businesses right now. Please try again.",
      };
    }
  },

  async getPublishedListings(cityId: CityId): Promise<Listing[]> {
    const res = await this.getPublishedListingsResult(cityId);
    return res.listings;
  },

  async getListingById(
    listingId: string,
    cityId?: CityId
  ): Promise<{ listing: Listing | null; state: 'success' | 'not_found' | 'error'; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      if (cityId === 'vellore') {
        const raw = safeGetStorage('chittoorads_listings');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const found = parsed.find(
                (l) => l.id === listingId && l.cityId === 'vellore' && l.postedByUser && l.postedByUser !== 'u-demo'
              );
              if (found) return { listing: found, state: 'success' };
            }
          } catch {}
        }
        return { listing: null, state: 'not_found' };
      }

      const raw = safeGetStorage('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const found = listings.find((l) => l.id === listingId);
      if (!found) return { listing: null, state: 'not_found' };
      if (cityId && (found.cityId || 'chittoor') !== cityId) return { listing: null, state: 'not_found' };
      return { listing: found, state: 'success' };
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
        `);

      if (isUuid(listingId)) {
        query = query.or(`id.eq.${listingId},legacy_id.eq.${listingId}`);
      } else {
        query = query.eq('legacy_id', listingId);
      }

      query = query.eq('status', 'active');
      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        let fallbackQuery = supabase
          .from('businesses')
          .select('*');

        if (isUuid(listingId)) {
          fallbackQuery = fallbackQuery.or(`id.eq.${listingId},legacy_id.eq.${listingId}`);
        } else {
          fallbackQuery = fallbackQuery.eq('legacy_id', listingId);
        }

        fallbackQuery = fallbackQuery.eq('status', 'active');
        if (cityId) {
          fallbackQuery = fallbackQuery.eq('city_id', cityId);
        }

        const { data: fbData, error: fbError } = await fallbackQuery.maybeSingle();
        if (fbError) {
          console.warn('Error in getListingById fallback:', fbError.message);
          return { listing: null, state: 'error', error: "We couldn't load business details right now. Please try again." };
        }
        if (!fbData) {
          return { listing: null, state: 'not_found' };
        }
        return { listing: mapDbBusinessToListing(fbData, []), state: 'success' };
      }

      if (!data) {
        return { listing: null, state: 'not_found' };
      }

      const images = Array.isArray(data.business_images) && data.business_images.length > 0
        ? data.business_images
            .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => img.image_url)
            .filter(Boolean)
        : [];

      return { listing: mapDbBusinessToListing(data, images), state: 'success' };
    } catch (err) {
      console.warn('Unexpected error in getListingById:', err);
      return { listing: null, state: 'error', error: "We couldn't load business details right now. Please try again." };
    }
  },

  async getOwnerListings(userId: string, cityId?: CityId): Promise<Listing[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const raw = safeGetStorage('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {
          // ignore
        }
      }
      return listings.filter(
        (l) => l.postedByUser === userId && (!cityId || (l.cityId || 'chittoor') === cityId)
      );
    }

    try {
      let data: any[] | null = null;
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
        .eq('owner_id', userId);

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const joinedRes = await query.order('created_at', { ascending: false });

      if (joinedRes.error) {
        let fallbackQuery = supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', userId);

        if (cityId) {
          fallbackQuery = fallbackQuery.eq('city_id', cityId);
        }

        const fallbackRes = await fallbackQuery.order('created_at', { ascending: false });
        if (fallbackRes.error) {
          console.warn('Error fetching owner businesses:', fallbackRes.error.message);
          return [];
        }
        data = fallbackRes.data;
      } else {
        data = joinedRes.data;
      }

      return (data || []).map((row) => {
        const images = Array.isArray(row.business_images) && row.business_images.length > 0
          ? row.business_images
              .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0))
              .map((img: any) => img.image_url)
              .filter(Boolean)
          : [];
        return mapDbBusinessToListing(row, images);
      });
    } catch (err) {
      console.warn('Unexpected error in getOwnerListings:', err);
      return [];
    }
  },

  async createListing(newListing: Listing, userId: string): Promise<{ listing: Listing | null; error?: string }> {
    // Verified Operating Territory Enforcement
    if (!newListing.cityId || !isCityId(newListing.cityId)) {
      return {
        listing: null,
        error: 'Operating Territory Error: Business listing creation requires a verified operational city_id. Operation blocked.',
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const safeListing: Listing = {
        ...newListing,
        id: `${newListing.cityId}-local-${Date.now()}`,
        status: 'Pending Approval',
        postedByUser: userId,
        rating: 0,
        reviewsCount: 0,
        isVerified: false,
        isFeatured: false,
      };
      return { listing: safeListing };
    }

    try {
      const insertPayload = {
        city_id: newListing.cityId,
        owner_id: userId,
        category_id: newListing.category,
        name: newListing.title.trim(),
        description: newListing.description.trim(),
        phone: newListing.phone.trim(),
        whatsapp: newListing.whatsapp?.trim() || null,
        email: newListing.email?.trim() || null,
        address: newListing.address.trim(),
        locality: newListing.area,
        price_range: newListing.priceRange || 'Best Market Rate',
        timings: newListing.timings || 'Daily: 9:00 AM - 8:00 PM',
        services: newListing.services || [],
        badge: 'Pending Approval',
        status: 'pending' as const,
        is_verified: false,
        is_featured: false,
        rating: 0,
        reviews_count: 0,
        views_count: 0,
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return { listing: null, error: error.message };
      }

      // If user provided image URLs, insert them into business_images table
      if (newListing.images && newListing.images.length > 0) {
        const imageRows = newListing.images.map((url, idx) => ({
          business_id: data.id,
          storage_path: `public/${data.id}/${idx}`,
          image_url: url,
          is_cover: idx === 0,
          sort_order: idx,
        }));
        await supabase.from('business_images').insert(imageRows);
      }

      return { listing: mapDbBusinessToListing(data, newListing.images) };
    } catch (err) {
      return { listing: null, error: err instanceof Error ? err.message : 'Failed to create business listing.' };
    }
  },

  async updateListing(
    listingId: string,
    updates: Partial<Listing>,
    userId: string
  ): Promise<{ listing: Listing | null; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const raw = safeGetStorage('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {
          // ignore
        }
      }
      const idx = listings.findIndex((l) => l.id === listingId);
      if (idx !== -1) {
        if (listings[idx].postedByUser && listings[idx].postedByUser !== userId) {
          return { listing: null, error: 'Unauthorized: You can only edit your own listings.' };
        }
        // City territory is immutable; strip cityId from updates payload
        const { cityId: _ignoredCityId, ...safeUpdates } = updates;
        listings[idx] = { ...listings[idx], ...safeUpdates, status: 'Pending Approval' };
        safeSetStorage('chittoorads_listings', JSON.stringify(listings));
        return { listing: listings[idx] };
      }
      return { listing: null, error: 'Listing not found.' };
    }

    try {
      const { data: found } = await supabase
        .from('businesses')
        .select('id, owner_id')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!found) {
        return { listing: null, error: 'Listing not found.' };
      }

      if (found.owner_id !== userId) {
        return { listing: null, error: 'Unauthorized: You can only edit your own listings.' };
      }

      const updatePayload: BusinessUpdate = {};
      if (updates.title) updatePayload.name = updates.title.trim();
      if (updates.description) updatePayload.description = updates.description.trim();
      if (updates.phone) updatePayload.phone = updates.phone.trim();
      if (updates.whatsapp !== undefined) updatePayload.whatsapp = updates.whatsapp?.trim() || null;
      if (updates.email !== undefined) updatePayload.email = updates.email?.trim() || null;
      if (updates.address) updatePayload.address = updates.address.trim();
      if (updates.area) updatePayload.locality = updates.area;
      if (updates.priceRange) updatePayload.price_range = updates.priceRange;
      if (updates.timings) updatePayload.timings = updates.timings;
      if (updates.services) updatePayload.services = updates.services;

      const { data, error } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', found.id)
        .select()
        .single();

      if (error) return { listing: null, error: error.message };

      // Sync business_images if updated images provided
      if (updates.images && updates.images.length > 0) {
        try {
          await supabase.from('business_images').delete().eq('business_id', found.id);
          const imageRows = updates.images.map((url, idx) => ({
            business_id: found.id,
            storage_path: `public/${found.id}/${idx}`,
            image_url: url,
            is_cover: idx === 0,
            sort_order: idx,
          }));
          await supabase.from('business_images').insert(imageRows);
        } catch {
          // ignore non-critical image sync error
        }
      }

      return { listing: mapDbBusinessToListing(data, updates.images) };
    } catch (err) {
      return { listing: null, error: err instanceof Error ? err.message : 'Failed to update listing.' };
    }
  },

  async deleteListing(listingId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const raw = safeGetStorage('chittoorads_listings');
      let listings: Listing[] = INITIAL_LISTINGS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) listings = parsed;
        } catch {}
      }
      const target = listings.find((l) => l.id === listingId);
      if (!target) return { success: false, error: 'Listing not found.' };
      if (target.postedByUser && target.postedByUser !== userId) {
        return { success: false, error: 'Unauthorized: You can only delete your own listings.' };
      }
      listings = listings.filter((l) => l.id !== listingId);
      safeSetStorage('chittoorads_listings', JSON.stringify(listings));
      return { success: true };
    }

    try {
      // Find UUID or legacy_id
      const { data: found } = await supabase
        .from('businesses')
        .select('id, owner_id')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!found) {
        return { success: false, error: 'Listing not found.' };
      }

      if (found.owner_id !== userId) {
        return { success: false, error: 'Unauthorized: You can only delete your own listings.' };
      }

      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', found.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete listing.' };
    }
  },

  async addReview(
    listingId: string,
    review: Omit<Review, 'id' | 'date'>,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      // Resolve UUID if legacy_id passed
      const { data: found } = await supabase
        .from('businesses')
        .select('id')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!found) {
        return { success: false, error: 'Target business not found.' };
      }

      const { error } = await supabase.from('reviews').insert({
        business_id: found.id,
        user_id: userId || null,
        author_name: review.author.trim(),
        rating: Math.round(review.rating),
        comment: review.comment.trim(),
        service_quality: review.subRatings?.serviceQuality ? Math.round(review.subRatings.serviceQuality) : null,
        value_for_money: review.subRatings?.valueForMoney ? Math.round(review.subRatings.valueForMoney) : null,
        cleanliness: review.subRatings?.cleanliness ? Math.round(review.subRatings.cleanliness) : null,
        status: 'approved',
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Review submission failed.' };
    }
  },

  async getListingReviews(listingId: string): Promise<Review[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    try {
      const { data: found } = await supabase
        .from('businesses')
        .select('id')
        .or(`id.eq.${listingId},legacy_id.eq.${listingId}`)
        .maybeSingle();

      if (!found) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', found.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        author: r.author_name,
        rating: Number(r.rating) || 5,
        comment: r.comment || '',
        date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        verifiedPurchase: Boolean(r.verified_purchase),
        helpfulCount: r.helpful_count || 0,
        unhelpfulCount: r.unhelpful_count || 0,
        subRatings: {
          serviceQuality: r.service_quality || undefined,
          valueForMoney: r.value_for_money || undefined,
          cleanliness: r.cleanliness || undefined,
        },
      }));
    } catch {
      return [];
    }
  },
};

