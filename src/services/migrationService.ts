import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Listing, CityId } from '../types';
import { INITIAL_LISTINGS } from '../data/mockData';

export interface MigrationSummary {
  totalScanned: number;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

export const migrationService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Safe reconciliation and migration of user-created listings from localStorage
   * to PostgreSQL when a user signs in to their real account.
   */
  async reconcileLocalListingsToBackend(
    userId: string,
    cityId: CityId
  ): Promise<MigrationSummary> {
    const summary: MigrationSummary = {
      totalScanned: 0,
      migratedCount: 0,
      skippedCount: 0,
      errors: [],
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      summary.errors.push('Database not configured. Migration skipped.');
      return summary;
    }

    try {
      const raw = localStorage.getItem('chittoorads_listings');
      if (!raw) return summary;

      const stored: Listing[] = JSON.parse(raw);
      if (!Array.isArray(stored)) return summary;

      // Identify listings that were created locally (e.g. have 'user-' or 'local-' in ID and are NOT seed listings)
      const userCreated = stored.filter(
        (l) =>
          !l.id.startsWith('c-') &&
          !l.id.startsWith('v-') &&
          !l.id.startsWith('b-') &&
          (l.postedByUser === 'u-demo' || l.postedByUser === userId) &&
          (l.cityId || 'chittoor') === cityId
      );

      summary.totalScanned = userCreated.length;

      for (const item of userCreated) {
        try {
          // Check if already exists by title and phone in PostgreSQL
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('city_id', cityId)
            .eq('name', item.title.trim())
            .eq('phone', item.phone.trim())
            .maybeSingle();

          if (existing) {
            summary.skippedCount++;
            continue;
          }

          // Insert into database with status = 'pending' and unrated
          const { error: insertError } = await supabase.from('businesses').insert({
            city_id: cityId,
            owner_id: userId,
            category_id: item.category,
            name: item.title.trim(),
            description: item.description.trim(),
            phone: item.phone.trim(),
            whatsapp: item.whatsapp?.trim() || null,
            email: item.email?.trim() || null,
            address: item.address.trim(),
            locality: item.area,
            price_range: item.priceRange || 'Best Market Rate',
            timings: item.timings || 'Daily: 9:00 AM - 8:00 PM',
            services: item.services || [],
            status: 'pending',
            is_verified: false,
            is_featured: false,
            rating: 0,
            reviews_count: 0,
            views_count: 0,
            badge: 'Pending Approval',
          });

          if (insertError) {
            summary.errors.push(`Failed to migrate "${item.title}": ${insertError.message}`);
          } else {
            summary.migratedCount++;
          }
        } catch (itemErr) {
          summary.errors.push(
            `Error migrating "${item.title}": ${itemErr instanceof Error ? itemErr.message : 'Unknown error'}`
          );
        }
      }

      return summary;
    } catch (err) {
      summary.errors.push(err instanceof Error ? err.message : 'Failed to scan local listings.');
      return summary;
    }
  },
};

