import { CityId } from '../types';

export type NoticeCategory =
  | 'community'
  | 'education'
  | 'public_notice'
  | 'public_notices'
  | 'jobs'
  | 'jobs_opportunities'
  | 'lost_found'
  | 'other';

export type NoticeStatus = 'pending' | 'published' | 'rejected' | 'archived' | 'expired';
export type NoticePriority = 'standard' | 'featured' | 'urgent' | 'pinned';

export interface CommunityNotice {
  id: string;
  cityId: CityId;
  title: string;
  category: NoticeCategory;
  content: string;
  description?: string;
  locality: string;
  organizerName: string;
  authorName?: string;
  authorId?: string;
  contactPhone?: string;
  contactEmail?: string;
  showContact: boolean;
  status: NoticeStatus;
  priority: NoticePriority;
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  publishDate: string;
  publishedAt?: string;
  expiryDate?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  isSamplePreview?: boolean;
}

export type EventCategory =
  | 'cultural'
  | 'education'
  | 'business'
  | 'sports'
  | 'charity'
  | 'entertainment'
  | 'other';

export type EventStatus = 'pending' | 'published' | 'rejected' | 'archived' | 'cancelled';
export type EventPriceType = 'free' | 'paid' | 'donation' | 'invite_only';

export interface LocalEvent {
  id: string;
  cityId: CityId;
  title: string;
  category: EventCategory;
  description: string;
  organizerName: string;
  organizer?: string;
  venueName: string;
  venue?: string;
  venueAddress: string;
  locality: string;
  startDate: string; // ISO 8601 string
  endDate?: string; // ISO 8601 string
  timeDisplay: string;
  isFree: boolean;
  entryFee?: string;
  priceType?: EventPriceType;
  priceAmount?: string;
  registrationUrl?: string;
  bannerImage?: string;
  posterUrl?: string;
  authorId?: string;
  organizerContact?: string;
  contactPhone?: string;
  contactEmail?: string;
  showContact?: boolean;
  status: EventStatus;
  isFeatured?: boolean;
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
  isSamplePreview?: boolean;
}

export interface NoticeSubmissionPayload {
  cityId: CityId;
  title: string;
  category: NoticeCategory;
  content: string;
  description?: string;
  locality: string;
  organizerName: string;
  authorName?: string;
  contactPhone?: string;
  contactEmail?: string;
  showContact: boolean;
  expiryDate?: string;
  expiresAt?: string;
}

export interface EventSubmissionPayload {
  cityId: CityId;
  title: string;
  category: EventCategory;
  description: string;
  organizerName: string;
  organizer?: string;
  venueName: string;
  venue?: string;
  venueAddress: string;
  locality: string;
  startDate: string;
  endDate?: string;
  timeDisplay: string;
  isFree: boolean;
  entryFee?: string;
  priceType?: EventPriceType;
  priceAmount?: string;
  registrationUrl?: string;
  bannerImage?: string;
  posterUrl?: string;
  organizerContact?: string;
  contactPhone?: string;
  contactEmail?: string;
  showContact?: boolean;
}

export interface NoticeFilterOptions {
  category?: NoticeCategory | 'all';
  searchQuery?: string;
  locality?: string | 'all';
  sortBy?: 'latest' | 'priority';
}

export interface EventFilterOptions {
  category?: EventCategory | 'all';
  timeline?: 'upcoming' | 'past' | 'all';
  timeFilter?: 'upcoming' | 'past' | 'all';
  searchQuery?: string;
  locality?: string | 'all';
  sortBy?: 'date_asc' | 'date_desc' | 'popular';
}
