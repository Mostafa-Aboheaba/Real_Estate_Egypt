import { ListingProvider } from '../enums/listing-provider.enum';
import { ListingType } from '../enums/listing-type.enum';
import { PropertyType } from '../enums/property-type.enum';
import { Location, LocationProps } from '../value-objects/location.vo';

export interface PropertyProps {
  id?: string;
  externalId: string;
  provider: ListingProvider;
  title: string;
  description?: string | null;
  priceEgp: number;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  location: LocationProps;
  amenities?: string[];
  images?: string[];
  sourceUrl?: string | null;
  isActive?: boolean;
  syncedAt?: Date;
  projectId?: string | null;
  agentId?: string | null;
}

export class Property {
  readonly id?: string;
  readonly externalId: string;
  readonly provider: ListingProvider;
  readonly title: string;
  readonly description?: string | null;
  readonly priceEgp: number;
  readonly propertyType: PropertyType;
  readonly listingType: ListingType;
  readonly bedrooms?: number | null;
  readonly bathrooms?: number | null;
  readonly areaSqm?: number | null;
  readonly location: Location;
  readonly amenities: string[];
  readonly images: string[];
  readonly sourceUrl?: string | null;
  readonly isActive: boolean;
  readonly syncedAt: Date;
  readonly projectId?: string | null;
  readonly agentId?: string | null;

  private constructor(props: PropertyProps & { location: Location }) {
    if (props.priceEgp <= 0) {
      throw new Error('priceEgp must be greater than 0');
    }
    if (!props.title?.trim()) {
      throw new Error('title is required');
    }

    this.id = props.id;
    this.externalId = props.externalId;
    this.provider = props.provider;
    this.title = props.title.trim();
    this.description = props.description ?? null;
    this.priceEgp = props.priceEgp;
    this.propertyType = props.propertyType;
    this.listingType = props.listingType;
    this.bedrooms = props.bedrooms ?? null;
    this.bathrooms = props.bathrooms ?? null;
    this.areaSqm = props.areaSqm ?? null;
    this.location = props.location;
    this.amenities = props.amenities ?? [];
    this.images = props.images ?? [];
    this.sourceUrl = props.sourceUrl ?? null;
    this.isActive = props.isActive ?? true;
    this.syncedAt = props.syncedAt ?? new Date();
    this.projectId = props.projectId ?? null;
    this.agentId = props.agentId ?? null;
  }

  static create(props: PropertyProps): Property {
    const location = Location.create(props.location);
    return new Property({ ...props, location });
  }
}
