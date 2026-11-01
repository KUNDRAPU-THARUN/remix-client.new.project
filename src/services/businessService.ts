import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Listing, CityId, Review } from '../types';
import { INITIAL_LISTINGS } from '../data/mockData';

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

export const businessService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async getPublishedListings(cityId: CityId): Promise<Listing[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback from localStorage or INITIAL_LISTINGS
      const raw = localStorage.getItem('chittoorads_listings');
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
        (l) => (l.cityId || 'chittoor') === cityId && (l.status || 'Active') === 'Active'
      );
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('city_id', cityId)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) {
        console.warn('Error fetching published businesses from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => mapDbBusinessToListing(row));
    } catch (err) {
      console.warn('Unexpected error in getPublishedListings:', err);
      return [];
    }
  },

  async getOwnerListings(userId: string, cityId: CityId): Promise<Listing[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const raw = localStorage.getItem('chittoorads_listings');
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
        (l) => l.postedByUser === userId && (l.cityId || 'chittoor') === cityId
      );
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .eq('city_id', cityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching owner businesses:', error.message);
        return [];
      }

      return (data || []).map((row) => mapDbBusinessToListing(row));
    } catch (err) {
      console.warn('Unexpected error in getOwnerListings:', err);
      return [];
    }
  },

  async createListing(newListing: Listing, userId: string): Promise<{ listing: Listing | null; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback
      const safeListing: Listing = {
        ...newListing,
        id: `${newListing.cityId || 'ch'}-local-${Date.now()}`,
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
        city_id: newListing.cityId || 'chittoor',
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

  async deleteListing(listingId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
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
};

