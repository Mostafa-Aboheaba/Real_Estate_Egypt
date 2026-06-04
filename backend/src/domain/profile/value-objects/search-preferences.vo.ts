import { ListingType } from '../../property/enums/listing-type.enum';
import { PropertyType } from '../../property/enums/property-type.enum';

export interface SearchPreferencesProps {
  listingType?: ListingType;
  minPriceEgp?: number;
  maxPriceEgp?: number;
  propertyTypes?: PropertyType[];
  cities?: string[];
}

export class SearchPreferences {
  private constructor(public readonly props: SearchPreferencesProps) {}

  static create(raw: unknown): SearchPreferences | null {
    if (raw == null || typeof raw !== 'object') {
      return new SearchPreferences({});
    }
    const o = raw as Record<string, unknown>;
    const listingType = o.listingType;
    if (
      listingType != null &&
      listingType !== ListingType.Sale &&
      listingType !== ListingType.Rent
    ) {
      return null;
    }
    const minPriceEgp = parseOptionalNumber(o.minPriceEgp);
    const maxPriceEgp = parseOptionalNumber(o.maxPriceEgp);
    if (minPriceEgp === null || maxPriceEgp === null) {
      return null;
    }
    if (minPriceEgp != null && minPriceEgp < 0) {
      return null;
    }
    if (maxPriceEgp != null && maxPriceEgp < 0) {
      return null;
    }
    if (
      minPriceEgp != null &&
      maxPriceEgp != null &&
      minPriceEgp > maxPriceEgp
    ) {
      return null;
    }
    const propertyTypes = parsePropertyTypes(o.propertyTypes);
    if (propertyTypes === null) {
      return null;
    }
    const cities = parseCities(o.cities);
    if (cities === null) {
      return null;
    }
    return new SearchPreferences({
      listingType: listingType as ListingType | undefined,
      minPriceEgp,
      maxPriceEgp,
      propertyTypes,
      cities,
    });
  }

  toJSON(): SearchPreferencesProps {
    return { ...this.props };
  }
}

function parseOptionalNumber(v: unknown): number | undefined | null {
  if (v == null) {
    return undefined;
  }
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    return null;
  }
  return v;
}

function parsePropertyTypes(v: unknown): PropertyType[] | undefined | null {
  if (v == null) {
    return undefined;
  }
  if (!Array.isArray(v)) {
    return null;
  }
  const allowed = new Set(Object.values(PropertyType));
  for (const item of v) {
    if (typeof item !== 'string' || !allowed.has(item as PropertyType)) {
      return null;
    }
  }
  return v as PropertyType[];
}

function parseCities(v: unknown): string[] | undefined | null {
  if (v == null) {
    return undefined;
  }
  if (!Array.isArray(v) || v.some((c) => typeof c !== 'string')) {
    return null;
  }
  return v as string[];
}
