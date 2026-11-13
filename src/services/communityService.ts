import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId } from '../types';
import {
  CommunityNotice,
  LocalEvent,
  NoticeSubmissionPayload,
  EventSubmissionPayload,
  NoticeFilterOptions,
  EventFilterOptions,
} from '../types/community';
import { INITIAL_VELLORE_NOTICES, INITIAL_VELLORE_EVENTS } from '../data/mockCommunityData';

const STORAGE_KEY_NOTICES = 'velloreads_community_notices';
const STORAGE_KEY_EVENTS = 'velloreads_local_events';

let memoryNotices: CommunityNotice[] = [...INITIAL_VELLORE_NOTICES];
let memoryEvents: LocalEvent[] = [...INITIAL_VELLORE_EVENTS];

function getStoredNotices(): CommunityNotice[] {
  if (typeof localStorage === 'undefined') return memoryNotices;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(INITIAL_VELLORE_NOTICES));
      return INITIAL_VELLORE_NOTICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VELLORE_NOTICES;
  } catch {
    return memoryNotices;
  }
}

function saveStoredNotices(notices: CommunityNotice[]): void {
  memoryNotices = notices;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
  } catch (err) {
    console.warn('Could not persist notices to localStorage:', err);
  }
}

function getStoredEvents(): LocalEvent[] {
  if (typeof localStorage === 'undefined') return memoryEvents;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_VELLORE_EVENTS));
      return INITIAL_VELLORE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VELLORE_EVENTS;
  } catch {
    return memoryEvents;
  }
}

function saveStoredEvents(events: LocalEvent[]): void {
  memoryEvents = events;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.warn('Could not persist events to localStorage:', err);
  }
}

// URL Protocol Validator (HTTP / HTTPS only)
export function isValidWebUrl(urlStr: string): boolean {
  if (!urlStr) return true; // Optional field
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateNoticePayload(payload: NoticeSubmissionPayload): { valid: boolean; error?: string } {
  if (!payload.title || payload.title.trim().length < 5 || payload.title.trim().length > 120) {
    return { valid: false, error: 'Title must be between 5 and 120 characters.' };
  }
  if (!payload.content || payload.content.trim().length < 10 || payload.content.trim().length > 2000) {
    return { valid: false, error: 'Content must be between 10 and 2000 characters.' };
  }
  if (!payload.organizerName || payload.organizerName.trim().length < 2 || payload.organizerName.trim().length > 100) {
    return { valid: false, error: 'Organizer / Desk name must be between 2 and 100 characters.' };
  }
  if (!payload.locality || payload.locality.trim().length === 0) {
    return { valid: false, error: 'Please select a locality.' };
  }
  if (payload.contactPhone) {
    const phoneClean = payload.contactPhone.replace(/[\s-]/g, '');
    if (!/^\+?[0-9]{10,14}$/.test(phoneClean)) {
      return { valid: false, error: 'Please enter a valid phone number (10-14 digits).' };
    }
  }
  if (payload.contactEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail.trim())) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
  }
  return { valid: true };
}

export function validateEventPayload(payload: EventSubmissionPayload): { valid: boolean; error?: string } {
  if (!payload.title || payload.title.trim().length < 5 || payload.title.trim().length > 120) {
    return { valid: false, error: 'Title must be between 5 and 120 characters.' };
  }
  if (!payload.description || payload.description.trim().length < 10 || payload.description.trim().length > 3000) {
    return { valid: false, error: 'Description must be between 10 and 3000 characters.' };
  }
  if (!payload.venueName || payload.venueName.trim().length < 3 || payload.venueName.trim().length > 150) {
    return { valid: false, error: 'Venue name must be between 3 and 150 characters.' };
  }
  if (!payload.venueAddress || payload.venueAddress.trim().length < 5 || payload.venueAddress.trim().length > 250) {
    return { valid: false, error: 'Venue address must be between 5 and 250 characters.' };
  }
  if (!payload.startDate || isNaN(Date.parse(payload.startDate))) {
    return { valid: false, error: 'Please provide a valid start date & time.' };
  }
  if (payload.endDate && isNaN(Date.parse(payload.endDate))) {
    return { valid: false, error: 'Please provide a valid end date & time.' };
  }
  if (payload.endDate && Date.parse(payload.endDate) < Date.parse(payload.startDate)) {
    return { valid: false, error: 'End date cannot be earlier than start date.' };
  }
  if (!payload.timeDisplay || payload.timeDisplay.trim().length < 3) {
    return { valid: false, error: 'Please provide event timings (e.g. 10:00 AM – 01:00 PM IST).' };
  }
  if (!payload.organizerName || payload.organizerName.trim().length < 2 || payload.organizerName.trim().length > 100) {
    return { valid: false, error: 'Organizer name must be between 2 and 100 characters.' };
  }
  if (payload.registrationUrl && !isValidWebUrl(payload.registrationUrl)) {
    return { valid: false, error: 'Registration URL must be a valid web address starting with http:// or https://' };
  }
  return { valid: true };
}

export const communityService = {
  /**
   * Fetch published, active notices for public display.
   */
  async getNotices(cityId: CityId, filters?: NoticeFilterOptions): Promise<CommunityNotice[]> {
    // If Supabase configured, attempt remote query
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Client unavailable');
        let query = (client as any)
          .from('community_notices')
          .select('*')
          .eq('city_id', cityId)
          .eq('status', 'published')
          .lte('publish_date', new Date().toISOString())
          .order('publish_date', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.locality && filters.locality !== 'all') {
          query = query.eq('locality', filters.locality);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          // Map DB snake_case to camelCase
          return data.map((item: any) => ({
            id: item.id,
            cityId: item.city_id,
            title: item.title,
            category: item.category,
            content: item.content,
            locality: item.locality,
            organizerName: item.organizer_name,
            contactPhone: item.contact_phone,
            contactEmail: item.contact_email,
            showContact: item.show_contact ?? true,
            status: item.status,
            priority: item.priority || 'standard',
            publishDate: item.publish_date,
            expiryDate: item.expiry_date,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        // Table may not yet be migrated in remote DB; fall through to local
        console.debug('Supabase community_notices query skipped or failed, using local store:', err);
      }
    }

    // Local / fallback store
    const all = getStoredNotices().filter((n) => n.cityId === cityId && n.status === 'published');
    const now = new Date().toISOString();

    let filtered = all.filter((n) => {
      if (n.expiryDate && n.expiryDate < now) return false;
      if (filters?.category && filters.category !== 'all' && n.category !== filters.category) return false;
      if (filters?.locality && filters.locality !== 'all' && n.locality !== filters.locality) return false;
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesOrg = n.organizerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesOrg) return false;
      }
      return true;
    });

    // Pinned notices first, then urgent, then standard by publish date desc
    filtered.sort((a, b) => {
      const priorityOrder: Record<string, number> = { pinned: 3, urgent: 2, standard: 1 };
      const diff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      if (diff !== 0) return diff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    return filtered;
  },

  /**
   * Fetch notice by ID
   */
  async getNoticeById(id: string): Promise<CommunityNotice | null> {
    const list = getStoredNotices();
    return list.find((n) => n.id === id) || null;
  },

  /**
   * Submit a new notice (starts as pending moderation)
   */
  async submitNotice(payload: NoticeSubmissionPayload): Promise<{
    success: boolean;
    notice?: CommunityNotice;
    error?: string;
    isDuplicate?: boolean;
    isDatabasePersisted?: boolean;
    isDemoMode?: boolean;
  }> {
    const validation = validateNoticePayload(payload);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const notices = getStoredNotices();

    // Duplicate detection within 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const existing = notices.find(
      (n) =>
        n.cityId === payload.cityId &&
        n.title.trim().toLowerCase() === payload.title.trim().toLowerCase() &&
        n.organizerName.trim().toLowerCase() === payload.organizerName.trim().toLowerCase() &&
        new Date(n.createdAt).getTime() > fiveMinutesAgo
    );

    if (existing) {
      return { success: true, notice: existing, isDuplicate: true };
    }

    const now = new Date().toISOString();
    const newNotice: CommunityNotice = {
      id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cityId: payload.cityId,
      title: payload.title.trim(),
      category: payload.category,
      content: payload.content.trim(),
      locality: payload.locality.trim(),
      organizerName: payload.organizerName.trim(),
      contactPhone: payload.contactPhone?.trim(),
      contactEmail: payload.contactEmail?.trim(),
      showContact: payload.showContact,
      status: 'pending',
      priority: 'standard',
      publishDate: now,
      createdAt: now,
      updatedAt: now,
    };

    let isPersistedInDatabase = false;
    let isDemoMode = false;

    // If Supabase configured, attempt remote insert (return=minimal, no SELECT on pending record)
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Client unavailable');
        const { error } = await (client as any).from('community_notices').insert({
          id: newNotice.id,
          city_id: newNotice.cityId,
          title: newNotice.title,
          category: newNotice.category,
          content: newNotice.content,
          locality: newNotice.locality,
          organizer_name: newNotice.organizerName,
          contact_phone: newNotice.contactPhone,
          contact_email: newNotice.contactEmail,
          submitter_phone: newNotice.contactPhone,
          submitter_email: newNotice.contactEmail,
          show_contact: newNotice.showContact,
          status: newNotice.status,
          priority: newNotice.priority,
          publish_date: newNotice.publishDate,
          created_at: newNotice.createdAt,
          updated_at: newNotice.updatedAt,
        });

        if (error) {
          console.error('Remote notice insert returned database error:', error);
          return {
            success: false,
            error: error.message || 'Database submission rejected.',
            isDatabasePersisted: false,
          };
        }
        isPersistedInDatabase = true;
      } catch (err: any) {
        console.error('Remote notice insert network/system exception:', err);
        return {
          success: false,
          error: err?.message || 'Database connection error.',
          isDatabasePersisted: false,
        };
      }
    } else {
      isDemoMode = true;
    }

    notices.unshift(newNotice);
    saveStoredNotices(notices);

    return {
      success: true,
      notice: newNotice,
      isDatabasePersisted: isPersistedInDatabase,
      isDemoMode: isDemoMode,
    };
  },

  /**
   * Fetch published local events.
   */
  async getEvents(cityId: CityId, filters?: EventFilterOptions): Promise<LocalEvent[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Client unavailable');
        let query = (client as any)
          .from('local_events')
          .select('*')
          .eq('city_id', cityId)
          .eq('status', 'published')
          .order('start_date', { ascending: true });

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.locality && filters.locality !== 'all') {
          query = query.eq('locality', filters.locality);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            cityId: item.city_id,
            title: item.title,
            category: item.category,
            description: item.description,
            venueName: item.venue_name,
            venueAddress: item.venue_address,
            locality: item.locality,
            startDate: item.start_date,
            endDate: item.end_date,
            timeDisplay: item.time_display,
            organizerName: item.organizer_name,
            organizerContact: item.organizer_contact,
            registrationUrl: item.registration_url,
            isFree: item.is_free ?? true,
            entryFee: item.entry_fee,
            bannerImage: item.banner_image,
            status: item.status,
            isFeatured: item.is_featured ?? false,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        console.debug('Supabase local_events query skipped or failed, using local store:', err);
      }
    }

    const all = getStoredEvents().filter((e) => e.cityId === cityId && e.status === 'published');
    const nowTime = Date.now();

    let filtered = all.filter((e) => {
      const eventTime = new Date(e.startDate).getTime();
      const isPast = eventTime < nowTime;

      if (filters?.timeline === 'upcoming' && isPast) return false;
      if (filters?.timeline === 'past' && !isPast) return false;

      if (filters?.category && filters.category !== 'all' && e.category !== filters.category) return false;
      if (filters?.locality && filters.locality !== 'all' && e.locality !== filters.locality) return false;

      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesDesc = e.description.toLowerCase().includes(q);
        const matchesVenue = e.venueName.toLowerCase().includes(q);
        const matchesOrg = e.organizerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesOrg) return false;
      }
      return true;
    });

    // Upcoming sorted by start date ASC; past sorted by start date DESC
    filtered.sort((a, b) => {
      const timeA = new Date(a.startDate).getTime();
      const timeB = new Date(b.startDate).getTime();
      if (filters?.timeline === 'past') {
        return timeB - timeA;
      }
      return timeA - timeB;
    });

    return filtered;
  },

  /**
   * Fetch event by ID
   */
  async getEventById(id: string): Promise<LocalEvent | null> {
    const list = getStoredEvents();
    return list.find((e) => e.id === id) || null;
  },

  /**
   * Submit a new event (starts as pending moderation)
   */
  async submitEvent(payload: EventSubmissionPayload): Promise<{
    success: boolean;
    event?: LocalEvent;
    error?: string;
    isDuplicate?: boolean;
    isDatabasePersisted?: boolean;
    isDemoMode?: boolean;
  }> {
    const validation = validateEventPayload(payload);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const events = getStoredEvents();

    // Duplicate detection within 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const existing = events.find(
      (e) =>
        e.cityId === payload.cityId &&
        e.title.trim().toLowerCase() === payload.title.trim().toLowerCase() &&
        e.startDate === payload.startDate &&
        new Date(e.createdAt).getTime() > fiveMinutesAgo
    );

    if (existing) {
      return { success: true, event: existing, isDuplicate: true };
    }

    const now = new Date().toISOString();
    const newEvent: LocalEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cityId: payload.cityId,
      title: payload.title.trim(),
      category: payload.category,
      description: payload.description.trim(),
      venueName: payload.venueName.trim(),
      venueAddress: payload.venueAddress.trim(),
      locality: payload.locality.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      timeDisplay: payload.timeDisplay.trim(),
      organizerName: payload.organizerName.trim(),
      organizerContact: payload.organizerContact?.trim(),
      registrationUrl: payload.registrationUrl?.trim(),
      isFree: payload.isFree,
      entryFee: payload.entryFee?.trim(),
      bannerImage: payload.bannerImage?.trim(),
      status: 'pending',
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
    };

    let isPersistedInDatabase = false;
    let isDemoMode = false;

    // If Supabase configured, attempt remote insert (return=minimal, no SELECT on pending record)
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Client unavailable');
        const { error } = await (client as any).from('local_events').insert({
          id: newEvent.id,
          city_id: newEvent.cityId,
          title: newEvent.title,
          category: newEvent.category,
          description: newEvent.description,
          venue_name: newEvent.venueName,
          venue_address: newEvent.venueAddress,
          locality: newEvent.locality,
          start_date: newEvent.startDate,
          end_date: newEvent.endDate,
          time_display: newEvent.timeDisplay,
          organizer_name: newEvent.organizerName,
          organizer_contact: newEvent.organizerContact,
          registration_url: newEvent.registrationUrl,
          is_free: newEvent.isFree,
          entry_fee: newEvent.entryFee,
          banner_image: newEvent.bannerImage,
          status: newEvent.status,
          is_featured: newEvent.isFeatured,
          created_at: newEvent.createdAt,
          updated_at: newEvent.updatedAt,
        });

        if (error) {
          console.error('Remote event insert returned database error:', error);
          return {
            success: false,
            error: error.message || 'Database submission rejected.',
            isDatabasePersisted: false,
          };
        }
        isPersistedInDatabase = true;
      } catch (err: any) {
        console.error('Remote event insert network/system exception:', err);
        return {
          success: false,
          error: err?.message || 'Database connection error.',
          isDatabasePersisted: false,
        };
      }
    } else {
      isDemoMode = true;
    }

    events.unshift(newEvent);
    saveStoredEvents(events);

    return {
      success: true,
      event: newEvent,
      isDatabasePersisted: isPersistedInDatabase,
      isDemoMode: isDemoMode,
    };
  },

  /**
   * Fetch all notices for franchise moderation (includes pending, rejected, published)
   */
  async getAllNoticesForFranchise(cityId: CityId): Promise<CommunityNotice[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          // Attempt secure franchise moderation view first (contains submitter_phone/email)
          let { data, error } = await (client as any)
            .from('franchise_community_notices')
            .select('*')
            .eq('city_id', cityId)
            .order('created_at', { ascending: false });

          if (error || !data || !Array.isArray(data) || data.length === 0) {
            // Fallback to table query
            const res = await client
              .from('community_notices')
              .select('*')
              .eq('city_id', cityId)
              .order('created_at', { ascending: false });
            data = res.data;
            error = res.error;
          }
          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map((item) => ({
              id: item.id,
              cityId: item.city_id as CityId,
              title: item.title,
              category: item.category as any,
              content: item.content,
              locality: item.locality,
              organizerName: item.organizer_name,
              contactPhone: item.contact_phone || (item as any).submitter_phone || undefined,
              contactEmail: item.contact_email || (item as any).submitter_email || undefined,
              showContact: item.show_contact,
              status: item.status,
              priority: item.priority as any,
              publishDate: item.publish_date,
              expiryDate: item.expiry_date || undefined,
              rejectionReason: item.rejection_reason || undefined,
              moderatedBy: item.moderated_by || undefined,
              moderatedAt: item.moderated_at || undefined,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }));
          }
        }
      } catch (err) {
        console.debug('Remote franchise notices query skipped or failed, using local store:', err);
      }
    }
    return getStoredNotices().filter((n) => n.cityId === cityId);
  },

  /**
   * Fetch all events for franchise moderation (includes pending, rejected, published)
   */
  async getAllEventsForFranchise(cityId: CityId): Promise<LocalEvent[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('local_events')
            .select('*')
            .eq('city_id', cityId)
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map((item) => ({
              id: item.id,
              cityId: item.city_id as CityId,
              title: item.title,
              category: item.category as any,
              description: item.description,
              venueName: item.venue_name,
              venueAddress: item.venue_address,
              locality: item.locality,
              startDate: item.start_date,
              endDate: item.end_date || undefined,
              timeDisplay: item.time_display,
              organizerName: item.organizer_name,
              organizerContact: item.organizer_contact || undefined,
              registrationUrl: item.registration_url || undefined,
              isFree: item.is_free,
              entryFee: item.entry_fee || undefined,
              bannerImage: item.banner_image || undefined,
              status: item.status,
              isFeatured: item.is_featured,
              moderatedBy: item.moderated_by || undefined,
              moderatedAt: item.moderated_at || undefined,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }));
          }
        }
      } catch (err) {
        console.debug('Remote franchise events query skipped or failed, using local store:', err);
      }
    }
    return getStoredEvents().filter((e) => e.cityId === cityId);
  },

  /**
   * Moderate a notice (Franchise/Admin action)
   */
  async moderateNotice(
    id: string,
    status: 'published' | 'rejected' | 'archived',
    reason?: string,
    moderatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const notices = getStoredNotices();
    const idx = notices.findIndex((n) => n.id === id);
    if (idx === -1) {
      return { success: false, error: 'Notice not found.' };
    }

    const now = new Date().toISOString();
    notices[idx] = {
      ...notices[idx],
      status,
      rejectionReason: reason,
      moderatedBy: moderatorId || 'franchise-mod',
      moderatedAt: now,
      updatedAt: now,
    };

    saveStoredNotices(notices);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client
            .from('community_notices')
            .update({
              status,
              rejection_reason: reason || null,
              moderated_by: moderatorId || 'franchise-mod',
              moderated_at: now,
              updated_at: now,
            })
            .eq('id', id);
        }
      } catch (err) {
        console.debug('Remote notice moderation update skipped or failed, saved locally:', err);
      }
    }

    return { success: true };
  },

  /**
   * Moderate an event (Franchise/Admin action)
   */
  async moderateEvent(
    id: string,
    status: 'published' | 'rejected' | 'archived',
    moderatorId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const events = getStoredEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) {
      return { success: false, error: 'Event not found.' };
    }

    const now = new Date().toISOString();
    events[idx] = {
      ...events[idx],
      status,
      moderatedBy: moderatorId || 'franchise-mod',
      moderatedAt: now,
      updatedAt: now,
    };

    saveStoredEvents(events);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client
            .from('local_events')
            .update({
              status,
              moderated_by: moderatorId || 'franchise-mod',
              moderated_at: now,
              updated_at: now,
            })
            .eq('id', id);
        }
      } catch (err) {
        console.debug('Remote event moderation update skipped or failed, saved locally:', err);
      }
    }

    return { success: true };
  },
};
