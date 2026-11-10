/**
 * KAARYAN LABS — VELLORE ADS (TN-23) WHATSAPP TEMPLATE ENGINE
 *
 * Provides category-aware prefilled WhatsApp enquiry messages for Vellore Ads listings,
 * with strict phone validation via `resolveListingContact` and safe URL encoding.
 *
 * Protected: Preserves default standard messaging for Chittoor (AP-03) and Bengaluru (KA-01).
 */

import { resolveListingContact } from './contactValidation';

export interface WhatsAppTemplateParams {
  phone?: string | null;
  whatsapp?: string | null;
  businessTitle: string;
  categoryId?: string;
  localityName?: string;
  cityId?: string;
  brandName?: string;
  cityCode?: string;
  customRequirement?: string;
}

export interface WhatsAppUrlResult {
  url: string;
  prefilledMessage: string;
  isValid: boolean;
  destinationNumber: string;
}

/**
 * Returns a category-specific prefilled enquiry message tailored for Vellore Ads (TN-23).
 */
export function getVelloreWhatsAppCategoryMessage(
  categoryId?: string,
  businessTitle: string = 'your listing',
  localityName?: string
): string {
  const title = businessTitle.trim() || 'your listing';
  const cleanCategory = (categoryId || '').toLowerCase().trim();
  const areaSuffix = localityName ? ` in ${localityName}` : '';

  switch (cleanCategory) {
    case 'healthcare':
    case 'hospitals':
    case 'clinics':
    case 'doctors':
    case 'pharmacies':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about doctor consultation, appointment availability, and diagnostic services.`;

    case 'restaurants':
    case 'food':
    case 'cafes':
    case 'bakeries':
      return `Hello! I found your restaurant "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about table reservation, menu specialties, and takeaway/catering orders.`;

    case 'pg-hostels':
    case 'hostels':
    case 'student-accommodation':
    case 'rooms':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about room availability (AC/Non-AC), monthly rent, and amenities for students/professionals near VIT/CMC.`;

    case 'wedding-banquets':
    case 'banquets':
    case 'marriage-halls':
    case 'mandapam':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about hall availability, seating capacity, and tariff packages for an upcoming function.`;

    case 'leather-industry':
    case 'shopping':
    case 'leather':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about retail/wholesale leather products, pricing, and bulk orders.`;

    case 'education':
    case 'schools':
    case 'colleges':
    case 'coaching':
    case 'training':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about admission details, course curriculum, and batch timings.`;

    case 'automobiles':
    case 'cab-services':
    case 'cabs':
    case 'travel':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about vehicle rental tariffs, driver dispatch, and booking.`;

    case 'real-estate':
    case 'rentals':
    case 'properties':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about property details, rental/sale price, and site visit schedule.`;

    case 'home-services':
    case 'electricians':
    case 'plumbers':
    case 'ac-repair':
      return `Hello! I found "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about doorstep service availability, inspection charges, and technician visit timings.`;

    default:
      return `Hello! I found your listing "${title}"${areaSuffix} on Vellore Ads (TN-23). I would like to enquire about your services and pricing.`;
  }
}

/**
 * Builds a verified WhatsApp URL with appropriate category-tailored message.
 * Strictly checks contact validity:
 * - If phone/whatsapp is invalid, returns isValid: false and empty url.
 * - Landlines are never used for WhatsApp.
 */
export function buildListingWhatsAppUrl(params: WhatsAppTemplateParams): WhatsAppUrlResult {
  const contact = resolveListingContact(params.phone, params.whatsapp);

  if (!contact.hasValidWhatsApp || !contact.whatsappNumber) {
    return {
      url: '',
      prefilledMessage: '',
      isValid: false,
      destinationNumber: '',
    };
  }

  const isVellore = params.cityId === 'vellore';
  let baseMessage: string;

  if (isVellore) {
    baseMessage = getVelloreWhatsAppCategoryMessage(
      params.categoryId,
      params.businessTitle,
      params.localityName
    );
  } else {
    const brand = params.brandName || 'Local Ads';
    const code = params.cityCode ? ` (${params.cityCode})` : '';
    baseMessage = `Hello! I found your listing "${params.businessTitle}" on ${brand}${code}. I would like to inquire about your services.`;
  }

  const fullMessage = params.customRequirement?.trim()
    ? `${baseMessage}\n\nRequirement: ${params.customRequirement.trim()}`
    : baseMessage;

  const url = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;

  return {
    url,
    prefilledMessage: fullMessage,
    isValid: true,
    destinationNumber: contact.whatsappNumber,
  };
}
