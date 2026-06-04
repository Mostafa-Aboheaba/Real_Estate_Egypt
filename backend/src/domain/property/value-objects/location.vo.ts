export interface LocationProps {
  governorate: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
}

export class Location {
  readonly governorate: string;
  readonly city: string;
  readonly district: string;
  readonly latitude?: number;
  readonly longitude?: number;

  private constructor(props: LocationProps) {
    this.governorate = props.governorate.trim();
    this.city = props.city.trim();
    this.district = props.district.trim();
    this.latitude = props.latitude;
    this.longitude = props.longitude;
  }

  static create(props: LocationProps): Location {
    if (!props.governorate?.trim() || !props.city?.trim() || !props.district?.trim()) {
      throw new Error('Location requires governorate, city, and district');
    }
    return new Location(props);
  }

  toJSON(): LocationProps {
    return {
      governorate: this.governorate,
      city: this.city,
      district: this.district,
      ...(this.latitude != null ? { latitude: this.latitude } : {}),
      ...(this.longitude != null ? { longitude: this.longitude } : {}),
    };
  }
}
