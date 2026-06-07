import { RawListing } from '../../../domain/property/ports/listing-provider.port';

/** Shape of items in `GET /properties` `data` array (Shaety Laravel API). */
export interface ShaetyPropertyRecord {
  id: number | string;
  code?: string;
  title?: string;
  content?: string;
  post_date?: string;
  image?: string;
  images?: string[];
  post_status?: string;
  city?: string;
  property_features?: string[];
  property_area?: string;
  property_type?: string;
  property_status?: string;
  property_price?: string | number;
  property_size?: string | number;
  property_bedrooms?: string | number;
  property_bathrooms?: string | number;
  property_location?: Record<string, number>;
}

export function mapShaetyPropertyToRawListing(
  record: ShaetyPropertyRecord,
  baseUrl: string,
): RawListing | null {
  const externalId = String(record.id ?? record.code ?? '').trim();
  const title = record.title?.trim();
  if (!externalId || !title) {
    return null;
  }

  const priceEgp = parsePriceEgp(record.property_price);
  if (priceEgp <= 0) {
    return null;
  }

  const images = collectImages(record);
  const location = parseLocation(record);

  return {
    externalId,
    title,
    description: stripHtml(record.content),
    priceEgp,
    propertyType: mapPropertyType(record.property_type),
    listingType: mapListingType(record.property_status),
    bedrooms: parseOptionalInt(record.property_bedrooms),
    bathrooms: parseOptionalInt(record.property_bathrooms),
    areaSqm: parseOptionalNumber(record.property_size),
    location,
    amenities: record.property_features ?? [],
    images,
    sourceUrl: `${baseUrl.replace(/\/$/, '')}/properties/${externalId}`,
  };
}

export function parsePriceEgp(raw: string | number | undefined): number {
  if (raw == null) {
    return 0;
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw);
  }

  const text = String(raw).replace(/,/g, '').trim();
  const digits = text.match(/[\d.]+/);
  if (!digits) {
    return 0;
  }

  let total = 0;

  const millionMatch = text.match(/([\d.]+)\s*(?:مليون|million)/i);
  if (millionMatch) {
    const m = Number.parseFloat(millionMatch[1]);
    if (Number.isFinite(m) && m > 0) {
      total += m * 1_000_000;
    }
  }

  const thousandMatch = text.match(/([\d.]+)\s*(?:ألف|الف|thousand)/i);
  if (thousandMatch) {
    const k = Number.parseFloat(thousandMatch[1]);
    if (Number.isFinite(k) && k > 0) {
      total += k * 1_000;
    }
  }

  if (total > 0) {
    return Math.round(total);
  }

  const value = Number.parseFloat(digits[0]);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (/مليون|million/i.test(text)) {
    return Math.round(value * 1_000_000);
  }
  if (/ألف|الف|thousand/i.test(text)) {
    return Math.round(value * 1_000);
  }

  return Math.round(value);
}

function mapPropertyType(raw?: string): string {
  const t = (raw ?? '').trim();
  if (/فيلا|villa/i.test(t)) {
    return 'villa';
  }
  if (/شقة|apartment/i.test(t)) {
    return 'apartment';
  }
  if (/دوبلكس|duplex/i.test(t)) {
    return 'duplex';
  }
  if (/تاون|townhouse/i.test(t)) {
    return 'townhouse';
  }
  if (/تجار|commercial/i.test(t)) {
    return 'commercial';
  }
  if (/أرض|ارض|land/i.test(t)) {
    return 'land';
  }
  return 'other';
}

function mapListingType(raw?: string): string {
  const t = (raw ?? '').trim();
  if (/إيجار|ايجار|rent|للإيجار|للايجار/i.test(t)) {
    return 'rent';
  }
  return 'sale';
}

function parseLocation(record: ShaetyPropertyRecord): RawListing['location'] {
  const loc = record.property_location;
  const lat = loc?.['0'] ?? loc?.lat;
  const lng = loc?.['1'] ?? loc?.lng;

  return {
    governorate: record.city?.trim() || 'Egypt',
    city: record.city?.trim() || 'Unknown',
    district: record.property_area?.trim() || '',
    ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
  };
}

function collectImages(record: ShaetyPropertyRecord): string[] {
  const urls = new Set<string>();
  if (record.image) {
    urls.add(record.image);
  }
  for (const img of record.images ?? []) {
    if (img) {
      urls.add(img);
    }
  }
  return [...urls];
}

function parseOptionalInt(raw: string | number | undefined): number | null {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalNumber(raw: string | number | undefined): number | null {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseFloat(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function stripHtml(html?: string): string | null {
  if (!html?.trim()) {
    return null;
  }
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);
}
