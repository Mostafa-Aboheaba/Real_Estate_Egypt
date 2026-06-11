import { ListingType } from '../../domain/property/enums/listing-type.enum';
import { PropertyType } from '../../domain/property/enums/property-type.enum';

export interface ParsedSearchIntent {
  textQuery: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPriceEgp?: number;
  maxPriceEgp?: number;
  city?: string;
}

const GREETING_PATTERNS = [
  /^good\s+(morning|afternoon|evening|night)\b/i,
  /^(hi|hello|hey|howdy)\b/i,
  /^(thanks|thank you|thx)\b/i,
  /^(السلام|سلام|مرحبا|مرحبًا|أهلا|اهلا|صباح|مساء)(?:\s|$|[!.?,])/,
  /^(how are you|what'?s up)\b/i,
];

export function isGreetingOrChitchat(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return true;
  }
  if (trimmed.length < 40 && GREETING_PATTERNS.some((p) => p.test(trimmed))) {
    return true;
  }
  return false;
}

export function isPropertySearchIntent(text: string): boolean {
  const lower = text.toLowerCase();
  const triggers = [
    'apartment',
    'villa',
    'rent',
    'buy',
    'sale',
    'property',
    'flat',
    'bedroom',
    'budget',
    'price',
    'egp',
    'looking for',
    'need a',
    'want a',
    'help me find',
    'show me',
    'find me',
    'جنيه',
    'شقة',
    'فيلا',
    'إيجار',
    'ايجار',
    'شراء',
    'للبيع',
    'للإيجار',
    'عقار',
    'غرف',
    'مليون',
    'ألف',
    'الف',
    'maadi',
    'zamalek',
    'alexandria',
    'الإسكندرية',
    'الاسكندرية',
    'cairo',
    'القاهرة',
    'compound',
    'كومباوند',
    'دور على',
    'محتاج',
    'عايز',
  ];
  return triggers.some((t) => lower.includes(t)) || extractPriceEgp(text) != null;
}

const FOLLOW_UP_PHRASES = [
  'cheaper',
  'more options',
  'another',
  'anything else',
  'similar',
  'what about',
  'show me more',
  'lower price',
  'higher price',
  'bigger',
  'smaller',
  'أرخص',
  'أغلى',
  'خيارات تانية',
  'خيارات أخرى',
  'المزيد',
  'غير كده',
];

export function isSearchFollowUp(
  text: string,
  recentContext: string,
): boolean {
  const lower = text.toLowerCase();
  if (!FOLLOW_UP_PHRASES.some((phrase) => lower.includes(phrase))) {
    return false;
  }
  return isPropertySearchIntent(recentContext);
}

export function parseSearchIntent(text: string): ParsedSearchIntent {
  const propertyType = detectPropertyType(text);
  const listingType = detectListingType(text);
  const price = extractPriceEgp(text);
  const city = detectCity(text);

  let minPriceEgp: number | undefined;
  let maxPriceEgp: number | undefined;

  if (price != null) {
    const rangeMatch = text.match(
      /(?:from|between)\s*([\d,.]+)\s*(?:to|and|-)\s*([\d,.]+)/i,
    );
    if (rangeMatch) {
      const low = parseNumericPrice(rangeMatch[1]);
      const high = parseNumericPrice(rangeMatch[2]);
      if (low != null && high != null) {
        minPriceEgp = Math.min(low, high);
        maxPriceEgp = Math.max(low, high);
      }
    } else if (/around|about|near|تقريب|حوالي|في حدود/i.test(text)) {
      minPriceEgp = Math.round(price * 0.85);
      maxPriceEgp = Math.round(price * 1.15);
    } else if (/under|below|max|less than|أقل من|تحت/i.test(text)) {
      maxPriceEgp = price;
    } else if (/above|over|min|more than|أكثر من|فوق/i.test(text)) {
      minPriceEgp = price;
    } else {
      maxPriceEgp = price;
    }
  }

  return {
    textQuery: text.trim(),
    propertyType,
    listingType,
    minPriceEgp,
    maxPriceEgp,
    city,
  };
}

function detectPropertyType(text: string): PropertyType | undefined {
  if (/villa|فيلا|townhouse|تاون/i.test(text)) {
    return PropertyType.Villa;
  }
  if (/duplex|دوبلكس/i.test(text)) {
    return PropertyType.Duplex;
  }
  if (/apartment|flat|شقة/i.test(text)) {
    return PropertyType.Apartment;
  }
  if (/commercial|تجار|محل/i.test(text)) {
    return PropertyType.Commercial;
  }
  if (/land|أرض|ارض/i.test(text)) {
    return PropertyType.Land;
  }
  return undefined;
}

function detectListingType(text: string): ListingType | undefined {
  if (/rent|إيجار|ايجار|للإيجار|للايجار/i.test(text)) {
    return ListingType.Rent;
  }
  if (/sale|buy|شراء|للبيع/i.test(text)) {
    return ListingType.Sale;
  }
  return undefined;
}

function detectCity(text: string): string | undefined {
  const cities: Array<{ pattern: RegExp; value: string }> = [
    { pattern: /alexandria|الإسكندرية|الاسكندرية/i, value: 'الإسكندرية' },
    { pattern: /cairo|القاهرة/i, value: 'القاهرة' },
    { pattern: /maadi|المعادي/i, value: 'المعادي' },
    { pattern: /zamalek|الزمالك/i, value: 'الزمالك' },
  ];
  for (const { pattern, value } of cities) {
    if (pattern.test(text)) {
      return value;
    }
  }
  return undefined;
}

function extractPriceEgp(text: string): number | null {
  const millionMatch = text.match(
    /([\d,.]+)\s*(?:million|مليون|m)\b/i,
  );
  if (millionMatch) {
    const m = parseNumericPrice(millionMatch[1]);
    return m != null ? Math.round(m * 1_000_000) : null;
  }

  const thousandMatch = text.match(
    /([\d,.]+)\s*(?:thousand|ألف|الف|k)\b/i,
  );
  if (thousandMatch) {
    const k = parseNumericPrice(thousandMatch[1]);
    return k != null ? Math.round(k * 1_000) : null;
  }

  const numericMatches = [...text.matchAll(/([\d]{1,3}(?:[,.][\d]{3})+|[\d,.]+)/g)];
  let best: number | null = null;
  for (const match of numericMatches) {
    const value = parseNumericPrice(match[1]);
    if (value == null || value < 10_000) {
      continue;
    }
    if (best == null || value > best) {
      best = value;
    }
  }
  return best;
}

function parseNumericPrice(raw: string): number | null {
  const normalized = raw.replace(/,/g, '').trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.round(value);
}
