import { CityId } from '../types';
import {
  TourismAttraction,
  TourismCategory,
  TourismCategoryDefinition,
  TourismCategoryWithCount,
  TourismFilterState,
  TourismSearchOptions,
} from '../types/tourism';
import {
  PUBLISHED_VELLORE_ATTRACTIONS,
  VELLORE_TOURISM_CATEGORIES,
} from '../data/velloreTourismData';

/**
 * Normalizes user search input strings for safe case-insensitive matching
 */
function normalizeQuery(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Service Layer for Vellore Heritage & Tourism
 * Adheres to strict city confinement (Vellore TN-23 only) and ensures
 * zero exposure of draft or cross-city records.
 */
export const tourismService = {
  /**
   * Retrieves all published attractions for a city.
   * Strictly confines results to Vellore ('vellore'). Returns [] for any other city.
   */
  async getTourismAttractions(cityId: CityId = 'vellore'): Promise<TourismAttraction[]> {
    if (cityId !== 'vellore') {
      return [];
    }

    return PUBLISHED_VELLORE_ATTRACTIONS.filter(
      (att) => att.cityId === 'vellore' && att.publicationStatus === 'published'
    );
  },

  /**
   * Retrieves featured published attractions for Vellore.
   */
  async getFeaturedTourismAttractions(cityId: CityId = 'vellore'): Promise<TourismAttraction[]> {
    if (cityId !== 'vellore') {
      return [];
    }

    return PUBLISHED_VELLORE_ATTRACTIONS.filter(
      (att) =>
        att.cityId === 'vellore' &&
        att.publicationStatus === 'published' &&
        att.isFeatured === true
    );
  },

  /**
   * Looks up a published attraction by its URL-safe slug.
   * Returns null if not found, unpublished, or requested for a non-Vellore city.
   */
  async getTourismAttractionBySlug(
    slug: string,
    cityId: CityId = 'vellore'
  ): Promise<TourismAttraction | null> {
    if (cityId !== 'vellore' || !slug) {
      return null;
    }

    const cleanSlug = slug.toLowerCase().trim();
    const match = PUBLISHED_VELLORE_ATTRACTIONS.find(
      (att) =>
        att.cityId === 'vellore' &&
        att.publicationStatus === 'published' &&
        att.slug.toLowerCase() === cleanSlug
    );

    return match || null;
  },

  /**
   * Looks up a published attraction by its ID.
   */
  async getTourismAttractionById(
    id: string,
    cityId: CityId = 'vellore'
  ): Promise<TourismAttraction | null> {
    if (cityId !== 'vellore' || !id) {
      return null;
    }

    const match = PUBLISHED_VELLORE_ATTRACTIONS.find(
      (att) =>
        att.cityId === 'vellore' &&
        att.publicationStatus === 'published' &&
        att.id === id
    );

    return match || null;
  },

  /**
   * Retrieves tourism categories with dynamically computed record counts.
   * Never hardcodes fake counts.
   */
  async getTourismCategories(cityId: CityId = 'vellore'): Promise<TourismCategoryWithCount[]> {
    if (cityId !== 'vellore') {
      return [];
    }

    const published = PUBLISHED_VELLORE_ATTRACTIONS.filter(
      (att) => att.cityId === 'vellore' && att.publicationStatus === 'published'
    );

    return VELLORE_TOURISM_CATEGORIES.map((catDef) => {
      const count = published.filter((att) => att.category === catDef.id).length;
      return {
        category: catDef,
        count,
      };
    });
  },

  /**
   * Searches published attractions across titles, native names, categories, localities,
   * descriptions, and historical highlights.
   */
  async searchTourismAttractions(
    query: string,
    options?: TourismSearchOptions,
    cityId: CityId = 'vellore'
  ): Promise<TourismAttraction[]> {
    if (cityId !== 'vellore') {
      return [];
    }

    const normalized = normalizeQuery(query || '');
    let results = PUBLISHED_VELLORE_ATTRACTIONS.filter(
      (att) => att.cityId === 'vellore' && att.publicationStatus === 'published'
    );

    // Apply category filter if specified
    if (options?.category && options.category !== 'all') {
      results = results.filter((att) => att.category === options.category);
    }

    // Apply locality filter if specified
    if (options?.locality && options.locality !== 'all') {
      const normLoc = normalizeQuery(options.locality);
      results = results.filter((att) =>
        normalizeQuery(att.location.locality).includes(normLoc)
      );
    }

    // Apply featured filter if specified
    if (options?.featuredOnly) {
      results = results.filter((att) => att.isFeatured);
    }

    // Apply verification filter if specified
    if (options?.verifiedOnly) {
      results = results.filter((att) => att.contentVerificationStatus === 'verified');
    }

    // Apply keyword search matching if query is non-empty
    if (normalized.length > 0) {
      const tokens = normalized.split(' ').filter(Boolean);
      results = results.filter((att) => {
        const searchableCorpus = [
          att.title,
          att.nameNative,
          att.shortDescription,
          att.fullDescription,
          att.location.locality,
          att.location.distanceFromCenter,
          ...(att.historicalHighlights || []),
          att.category,
        ]
          .join(' ')
          .toLowerCase();

        // Match all search tokens against the corpus
        return tokens.every((token) => searchableCorpus.includes(token));
      });
    }

    // Pagination
    if (options?.offset) {
      results = results.slice(options.offset);
    }
    if (options?.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }

    return results;
  },

  /**
   * Comprehensive filter function for tourism explorer views
   */
  async filterTourismAttractions(
    filter: TourismFilterState,
    cityId: CityId = 'vellore'
  ): Promise<TourismAttraction[]> {
    return this.searchTourismAttractions(
      filter.searchQuery || '',
      {
        category: filter.category,
        locality: filter.locality,
        featuredOnly: filter.featuredOnly,
        verifiedOnly: filter.verifiedOnly,
      },
      cityId
    );
  },

  /**
   * Retrieves related attractions in the same category or nearby locality,
   * excluding the current attraction itself.
   */
  async getRelatedTourismAttractions(
    attractionId: string,
    limit: number = 3,
    cityId: CityId = 'vellore'
  ): Promise<TourismAttraction[]> {
    if (cityId !== 'vellore' || !attractionId) {
      return [];
    }

    const current = await this.getTourismAttractionById(attractionId, cityId);
    if (!current) {
      return [];
    }

    const allPublished = await this.getTourismAttractions(cityId);

    // Score other attractions based on same category (weight 2) or same locality (weight 1)
    const scored = allPublished
      .filter((att) => att.id !== current.id)
      .map((att) => {
        let score = 0;
        if (att.category === current.category) score += 2;
        if (att.location.locality === current.location.locality) score += 1;
        return { att, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.att);
  },
};
