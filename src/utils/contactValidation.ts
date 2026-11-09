/**
 * KAARYAN LABS — CONTACT VALIDATION UTILITY
 *
 * Provides robust validation and normalization for Indian mobile, landline,
 * helpline/toll-free, and international phone numbers.
 *
 * Guarantees:
 * 1. Indian mobiles strictly require 10 digits starting with 6, 7, 8, or 9
 *    (optionally prefixed by +91, 91, or 0).
 * 2. Landlines require a valid STD code and subscriber number; landlines
 *    are NEVER treated as valid WhatsApp destinations.
 * 3. Short civic helplines (108, 100, 101, 1912) and toll-free (1800...) are
 *    supported for telephone dialing, but excluded from WhatsApp.
 * 4. Five-digit strings are NEVER treated as valid Indian mobile numbers.
 * 5. whatsappNumber strictly outputs international digits for wa.me/<number>.
 */

export type ContactType = 'mobile' | 'landline' | 'helpline' | 'international' | 'invalid';

export interface MobileValidationResult {
  isValid: boolean;
  mobile10?: string;
  whatsappDigits?: string;
  dialable?: string;
}

export interface ContactResolution {
  hasValidPhone: boolean;
  dialablePhone: string;
  phoneType: ContactType;
  hasValidWhatsApp: boolean;
  whatsappNumber: string;
}

/**
 * Validates an Indian mobile number.
 * Must be 10 digits starting with 6, 7, 8, or 9.
 * Accepts:
 * - 10 digits: 9842344550
 * - 11 digits starting with 0: 09842344550
 * - 12 digits starting with 91: 919842344550
 * - With +91: +91 98423 44550
 */
export function validateIndianMobile(raw: string | null | undefined): MobileValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false };
  }

  const trimmed = raw.trim();

  // Explicit STD-landline format check (e.g. 08572-231980 or 0416-2281000)
  // In India, landline subscriber numbers (after STD code) start with 2, 3, 4, or 5.
  if (/^0\d{2,4}[-\s][2-5]\d{5,7}$/.test(trimmed)) {
    return { isValid: false };
  }

  const digits = raw.replace(/\D/g, '');

  // Reject dummy repeating sequences (e.g. 0000000000, 1111111111, 9999999999)
  if (new Set(digits).size <= 2) {
    return { isValid: false };
  }

  let mobile10 = '';
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    mobile10 = digits;
  } else if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    // If 11 digits starting with 0, ensure it is not an STD landline where subscriber starts with 2-5
    const subscriberPart = digits.slice(-6);
    if (!/^[2-5]/.test(subscriberPart) || !trimmed.includes('-')) {
      mobile10 = digits.slice(1);
    }
  } else if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    mobile10 = digits.slice(2);
  }

  if (mobile10) {
    return {
      isValid: true,
      mobile10,
      whatsappDigits: `91${mobile10}`,
      dialable: `+91${mobile10}`,
    };
  }

  return { isValid: false };
}

/**
 * Validates an Indian landline number.
 * Typically 10 to 11 digits with STD code (e.g. 0416-2281000, 08572-231980).
 * In Indian telecom, landline subscriber numbers start with 2, 3, 4, 5, or 6.
 */
export function validateIndianLandline(raw: string | null | undefined): { isValid: boolean; dialable?: string } {
  if (!raw || typeof raw !== 'string') return { isValid: false };

  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');

  // Reject dummy repeating sequences
  if (new Set(digits).size <= 2) {
    return { isValid: false };
  }

  // Pure 10-digit mobile check
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return { isValid: false };
  }

  // Explicit STD-formatted landline with hyphen or space (e.g. 0416-2281000, 08572-231980)
  if (/^0\d{2,4}[-\s][2-6]\d{5,7}$/.test(trimmed)) {
    const dialable = digits.startsWith('0') ? digits : `0${digits}`;
    return { isValid: true, dialable };
  }

  // Common landline STD formats:
  // e.g. 04162281000 (11 digits starting with 0), 08572231980 (11 digits)
  if (digits.length >= 10 && digits.length <= 12) {
    if (digits.startsWith('0') || digits.startsWith('91') || trimmed.includes('-') || trimmed.includes(' ')) {
      const subscriberPart = digits.slice(-6);
      if (/^[2-6]/.test(subscriberPart) && (digits.startsWith('0') || trimmed.includes('-'))) {
        const dialable = trimmed.startsWith('+') ? `+${digits}` : digits.startsWith('0') ? digits : `0${digits}`;
        return { isValid: true, dialable };
      }
    }
  }

  return { isValid: false };
}

/**
 * Validates civic helplines and toll-free numbers.
 * - 3 to 4 digits: 100, 101, 102, 108, 112, 1912
 * - Toll-free: 1800xxxxxxx (10-11 digits)
 */
export function validateHelpline(raw: string | null | undefined): { isValid: boolean; dialable?: string } {
  if (!raw || typeof raw !== 'string') return { isValid: false };

  const digits = raw.replace(/\D/g, '');
  if (/^(100|101|102|108|112|1912)$/.test(digits)) {
    return { isValid: true, dialable: digits };
  }
  if (digits.startsWith('1800') && digits.length >= 10 && digits.length <= 11) {
    return { isValid: true, dialable: digits };
  }
  return { isValid: false };
}

/**
 * Validates international numbers starting with + and 8-15 digits.
 */
export function validateInternational(raw: string | null | undefined): { isValid: boolean; dialable?: string; whatsappDigits?: string } {
  if (!raw || typeof raw !== 'string') return { isValid: false };

  const trimmed = raw.trim();
  if (!trimmed.startsWith('+')) return { isValid: false };

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 15) {
    return { isValid: true, dialable: `+${digits}`, whatsappDigits: digits };
  }
  return { isValid: false };
}

/**
 * Comprehensive phone parser that classifies and normalizes any contact number.
 */
export function parseContactPhone(raw: string | null | undefined): {
  type: ContactType;
  isValidForTel: boolean;
  dialable: string;
} {
  if (!raw || !raw.trim()) {
    return { type: 'invalid', isValidForTel: false, dialable: '' };
  }

  const trimmed = raw.trim();

  // 1. Check formatted STD landline first if explicit pattern matches
  if (/^0\d{2,4}[-\s][2-5]\d{5,7}$/.test(trimmed)) {
    const landline = validateIndianLandline(trimmed);
    if (landline.isValid && landline.dialable) {
      return { type: 'landline', isValidForTel: true, dialable: landline.dialable };
    }
  }

  // 2. Check Indian Mobile
  const mobile = validateIndianMobile(raw);
  if (mobile.isValid && mobile.dialable) {
    return { type: 'mobile', isValidForTel: true, dialable: mobile.dialable };
  }

  // 2. Check Emergency / Helpline
  const helpline = validateHelpline(raw);
  if (helpline.isValid && helpline.dialable) {
    return { type: 'helpline', isValidForTel: true, dialable: helpline.dialable };
  }

  // 3. Check Landline
  const landline = validateIndianLandline(raw);
  if (landline.isValid && landline.dialable) {
    return { type: 'landline', isValidForTel: true, dialable: landline.dialable };
  }

  // 4. Check International (+xxx)
  const intl = validateInternational(raw);
  if (intl.isValid && intl.dialable) {
    return { type: 'international', isValidForTel: true, dialable: intl.dialable };
  }

  return { type: 'invalid', isValidForTel: false, dialable: '' };
}

/**
 * Resolves verified phone and WhatsApp destinations for a listing.
 * Strict rules:
 * - Landlines and helplines are valid for calling, but NEVER for WhatsApp.
 * - Minimum of 5 digits is NEVER treated as a valid mobile number.
 * - whatsappNumber is strictly digits for wa.me/<number>.
 */
export function resolveListingContact(
  phoneInput: string | null | undefined,
  whatsappInput?: string | null | undefined
): ContactResolution {
  const phoneParsed = parseContactPhone(phoneInput);

  // Determine WhatsApp validity:
  let hasValidWhatsApp = false;
  let whatsappNumber = '';

  // 1. Prefer explicit WhatsApp field if provided
  if (whatsappInput && whatsappInput.trim()) {
    const waMobile = validateIndianMobile(whatsappInput);
    if (waMobile.isValid && waMobile.whatsappDigits) {
      hasValidWhatsApp = true;
      whatsappNumber = waMobile.whatsappDigits;
    } else {
      const waIntl = validateInternational(whatsappInput);
      if (waIntl.isValid && waIntl.whatsappDigits) {
        hasValidWhatsApp = true;
        whatsappNumber = waIntl.whatsappDigits;
      }
    }
  }

  // 2. Fall back to phone ONLY IF phone is a verified mobile (NOT landline/helpline/invalid)
  if (!hasValidWhatsApp && phoneParsed.type === 'mobile') {
    const mobile = validateIndianMobile(phoneInput);
    if (mobile.isValid && mobile.whatsappDigits) {
      hasValidWhatsApp = true;
      whatsappNumber = mobile.whatsappDigits;
    }
  } else if (!hasValidWhatsApp && phoneParsed.type === 'international') {
    const intl = validateInternational(phoneInput);
    if (intl.isValid && intl.whatsappDigits) {
      hasValidWhatsApp = true;
      whatsappNumber = intl.whatsappDigits;
    }
  }

  return {
    hasValidPhone: phoneParsed.isValidForTel,
    dialablePhone: phoneParsed.dialable,
    phoneType: phoneParsed.type,
    hasValidWhatsApp,
    whatsappNumber,
  };
}
