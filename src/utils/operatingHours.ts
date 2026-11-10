/**
 * Operating Hours Parser and Real-time Status Helper
 * Timezone: Asia/Kolkata (IST, UTC+5:30)
 * 
 * Supports:
 * - 12-hour AM/PM formats (e.g., '10:00 AM - 8:30 PM', '8 AM - 9 PM')
 * - Multiple intervals per day (e.g., '9:00 AM - 1:00 PM, 4:00 PM - 9:00 PM')
 * - Overnight shifts spanning midnight (e.g., '8:00 PM - 2:00 AM')
 * - Day ranges ('Mon-Sat', 'Mon-Fri', 'Daily', 'Mon-Sun', 'Sunday: Closed')
 * - 24x7 / Open 24 Hours
 * - Prefix handling ('Office: ...', 'Booking Office: ...', 'Daily: ...')
 * - Untrustworthy or placeholder timings ('Sample Timings', empty string) -> 'Hours Unavailable'
 */

export type OperatingStatusType = 'open' | 'closed' | 'unavailable';

export interface OperatingHoursStatus {
  status: OperatingStatusType;
  label: 'Open Now' | 'Closed' | 'Hours Unavailable';
  isOpen: boolean;
  rawText: string;
  scheduleSummary: string;
  badgeClass: string;
  dotClass: string;
  currentIstTime?: string;
}

export interface ParsedTimeInterval {
  startMinutes: number; // 0..1439
  endMinutes: number;   // 0..1439
  isOvernight: boolean; // startMinutes > endMinutes
}

export interface DaySchedule {
  days: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  intervals: ParsedTimeInterval[];
  isClosed: boolean;
}

const DAY_MAP: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Convert 12h time string (e.g., "10:00 AM", "8 PM", "11:30 am") to minutes since midnight (0..1439).
 * Returns null if parsing fails.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3].toLowerCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes >= 60) {
    return null;
  }

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Extract time intervals from a time-range string like "10:00 AM - 8:30 PM, 9:00 PM - 11:00 PM".
 */
export function parseTimeIntervals(text: string): ParsedTimeInterval[] {
  const intervals: ParsedTimeInterval[] = [];
  // Match pairs like "10:00 AM - 8:30 PM" or "8 AM to 9 PM"
  const rangeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi;
  let match: RegExpExecArray | null;

  while ((match = rangeRegex.exec(text)) !== null) {
    const startMin = parseTimeToMinutes(match[1]);
    const endMin = parseTimeToMinutes(match[2]);

    if (startMin !== null && endMin !== null) {
      intervals.push({
        startMinutes: startMin,
        endMinutes: endMin,
        isOvernight: startMin > endMin,
      });
    }
  }

  return intervals;
}

/**
 * Parse day tokens (e.g., "Mon-Sat", "Mon - Fri", "Daily", "All Days").
 */
function parseDays(dayPart: string): number[] {
  const clean = dayPart.toLowerCase().trim();

  if (clean.includes('daily') || clean.includes('all days') || clean.includes('everyday') || clean.includes('every day')) {
    return [...ALL_DAYS];
  }

  // Range like "mon-sat" or "mon - fri"
  const rangeMatch = clean.match(/([a-z]+)\s*(?:-|–|—|to)\s*([a-z]+)/);
  if (rangeMatch) {
    const startDay = DAY_MAP[rangeMatch[1]];
    const endDay = DAY_MAP[rangeMatch[2]];
    if (startDay !== undefined && endDay !== undefined) {
      const days: number[] = [];
      let current = startDay;
      while (true) {
        days.push(current);
        if (current === endDay) break;
        current = (current + 1) % 7;
      }
      return days;
    }
  }

  // Single day or comma list of days
  const matchedDays: number[] = [];
  const tokens = clean.split(/[,\s&]+/);
  for (const token of tokens) {
    const d = DAY_MAP[token];
    if (d !== undefined && !matchedDays.includes(d)) {
      matchedDays.push(d);
    }
  }

  return matchedDays.length > 0 ? matchedDays : [...ALL_DAYS];
}

/**
 * Get current time in Asia/Kolkata timezone (IST, UTC+5:30).
 */
export function getKolkataDateTime(refDate: Date = new Date()): {
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  hours: number;     // 0..23
  minutes: number;   // 0..59
  totalMinutes: number; // 0..1439
  formattedTime: string;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(refDate);
  let weekdayStr = 'Sun';
  let hours = 0;
  let minutes = 0;

  for (const p of parts) {
    if (p.type === 'weekday') weekdayStr = p.value;
    if (p.type === 'hour') hours = parseInt(p.value, 10);
    if (p.type === 'minute') minutes = parseInt(p.value, 10);
  }

  const dayOfWeek = DAY_MAP[weekdayStr.toLowerCase()] ?? 0;
  const totalMinutes = hours * 60 + minutes;

  const displayHours = hours % 12 || 12;
  const displayAmPm = hours >= 12 ? 'PM' : 'AM';
  const displayMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedTime = `${displayHours}:${displayMin} ${displayAmPm} IST`;

  return { dayOfWeek, hours, minutes, totalMinutes, formattedTime };
}

/**
 * Evaluates whether an operating hours string indicates the business is Open Now, Closed, or Unavailable.
 */
export function getOperatingHoursStatus(
  timings?: string | null,
  referenceDate?: Date
): OperatingHoursStatus {
  const rawText = timings ? timings.trim() : '';

  // 1. Check for empty or known placeholder/untrustworthy strings
  if (!rawText) {
    return {
      status: 'unavailable',
      label: 'Hours Unavailable',
      isOpen: false,
      rawText: '',
      scheduleSummary: 'Hours not provided',
      badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300',
    };
  }

  const lower = rawText.toLowerCase();

  // Known invalid / developer mock placeholders
  const placeholderPatterns = [
    'sample timings',
    'sample timing',
    'sample',
    'tbd',
    'flexible',
    'to be announced',
    'n/a',
    'not available',
  ];
  if (placeholderPatterns.some((pattern) => lower === pattern || lower.startsWith(pattern))) {
    return {
      status: 'unavailable',
      label: 'Hours Unavailable',
      isOpen: false,
      rawText,
      scheduleSummary: 'Hours not confirmed',
      badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300',
    };
  }

  // 2. Check for 24x7 / Open 24 Hours
  if (/24\s*x\s*7|24\s*hours|open\s*24\s*hours/i.test(lower)) {
    const { formattedTime } = getKolkataDateTime(referenceDate);
    return {
      status: 'open',
      label: 'Open Now',
      isOpen: true,
      rawText,
      scheduleSummary: 'Open 24 Hours (Daily)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      currentIstTime: formattedTime,
    };
  }

  // 3. Extract time intervals
  const intervals = parseTimeIntervals(rawText);
  if (intervals.length === 0) {
    // If no standard time intervals could be parsed
    return {
      status: 'unavailable',
      label: 'Hours Unavailable',
      isOpen: false,
      rawText,
      scheduleSummary: rawText,
      badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300',
    };
  }

  // 4. Determine active days of week
  let activeDays = [...ALL_DAYS];

  // Check prefix or segment before colon (e.g., 'Mon-Sat:', 'Office:', 'Daily:')
  const colonIndex = rawText.indexOf(':');
  if (colonIndex > 0) {
    const prefix = rawText.substring(0, colonIndex).trim();
    // If the prefix mentions days or day ranges
    const dayMatches = parseDays(prefix);
    // If it matched a specific subset of days
    if (dayMatches.length > 0 && dayMatches.length < 7) {
      activeDays = dayMatches;
    }
  }

  // Check explicit "Sunday: Closed" or "Sundays closed"
  if (/(?:sun|sunday)s?\s*(?::|\s|-)\s*closed/i.test(lower)) {
    activeDays = activeDays.filter((d) => d !== 0);
  }

  // 5. Evaluate current IST time
  const { dayOfWeek, totalMinutes, formattedTime } = getKolkataDateTime(referenceDate);
  const previousDayOfWeek = (dayOfWeek + 6) % 7;

  let isOpen = false;

  // Check if today is an active day
  const isTodayActive = activeDays.includes(dayOfWeek);
  const isPrevDayActive = activeDays.includes(previousDayOfWeek);

  for (const interval of intervals) {
    if (interval.isOvernight) {
      // Overnight interval, e.g., 20:00 (1200m) to 02:00 (120m)
      // Portion 1: Started on previous active day and extends into today's early morning (before endMinutes)
      if (isPrevDayActive && totalMinutes < interval.endMinutes) {
        isOpen = true;
        break;
      }
      // Portion 2: Starts on today's active day (after startMinutes) and extends past midnight
      if (isTodayActive && totalMinutes >= interval.startMinutes) {
        isOpen = true;
        break;
      }
    } else {
      // Normal interval within same calendar day
      if (isTodayActive && totalMinutes >= interval.startMinutes && totalMinutes < interval.endMinutes) {
        isOpen = true;
        break;
      }
    }
  }

  if (isOpen) {
    return {
      status: 'open',
      label: 'Open Now',
      isOpen: true,
      rawText,
      scheduleSummary: rawText,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      currentIstTime: formattedTime,
    };
  }

  return {
    status: 'closed',
    label: 'Closed',
    isOpen: false,
    rawText,
    scheduleSummary: rawText,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    currentIstTime: formattedTime,
  };
}
