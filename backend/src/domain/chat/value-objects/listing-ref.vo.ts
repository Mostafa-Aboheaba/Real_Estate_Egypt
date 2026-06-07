const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ListingRefProps {
  propertyId: string;
  title: string;
  priceEgp: number;
}

export class ListingRef {
  readonly propertyId: string;
  readonly title: string;
  readonly priceEgp: number;

  private constructor(props: ListingRefProps) {
    this.propertyId = props.propertyId;
    this.title = props.title;
    this.priceEgp = props.priceEgp;
  }

  static create(raw: unknown): ListingRef | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const o = raw as Record<string, unknown>;
    const propertyId = o.propertyId;
    const title = o.title;
    const priceEgp = o.priceEgp;
    if (typeof propertyId !== 'string' || !UUID_RE.test(propertyId)) {
      return null;
    }
    if (typeof title !== 'string' || title.length === 0 || title.length > 500) {
      return null;
    }
    const price = Number(priceEgp);
    if (!Number.isFinite(price) || price < 0) {
      return null;
    }
    return new ListingRef({
      propertyId,
      title,
      priceEgp: price,
    });
  }

  toJSON(): ListingRefProps {
    return {
      propertyId: this.propertyId,
      title: this.title,
      priceEgp: this.priceEgp,
    };
  }
}
