export interface AgentProfileProps {
  bio?: { en?: string; ar?: string };
  serviceAreas?: string[];
  photoUrl?: string;
  licenseNumber?: string | null;
}

const MAX_BIO = 500;
const MAX_AREAS = 10;

export class AgentProfile {
  private constructor(public readonly props: AgentProfileProps) {}

  static create(raw: unknown): AgentProfile | null {
    if (raw == null || typeof raw !== 'object') {
      return null;
    }
    const o = raw as Record<string, unknown>;
    const bio = parseBio(o.bio);
    if (bio === null) {
      return null;
    }
    const serviceAreas = parseServiceAreas(o.serviceAreas);
    if (serviceAreas === null) {
      return null;
    }
    const photoUrl =
      o.photoUrl == null
        ? undefined
        : typeof o.photoUrl === 'string' &&
            (o.photoUrl.startsWith('https://') || o.photoUrl === '')
          ? o.photoUrl || undefined
          : null;
    if (photoUrl === null) {
      return null;
    }
    const licenseNumber =
      o.licenseNumber == null
        ? undefined
        : typeof o.licenseNumber === 'string'
          ? o.licenseNumber
          : null;
    if (licenseNumber === null) {
      return null;
    }
    return new AgentProfile({
      bio,
      serviceAreas,
      photoUrl,
      licenseNumber,
    });
  }

  toJSON(): AgentProfileProps {
    return { ...this.props };
  }
}

function parseBio(v: unknown): AgentProfileProps['bio'] | null {
  if (v == null) {
    return undefined;
  }
  if (typeof v !== 'object') {
    return null;
  }
  const o = v as Record<string, unknown>;
  const en = typeof o.en === 'string' ? o.en : undefined;
  const ar = typeof o.ar === 'string' ? o.ar : undefined;
  if (en != null && en.length > MAX_BIO) {
    return null;
  }
  if (ar != null && ar.length > MAX_BIO) {
    return null;
  }
  return { en, ar };
}

function parseServiceAreas(v: unknown): string[] | undefined | null {
  if (v == null) {
    return undefined;
  }
  if (!Array.isArray(v) || v.length < 1 || v.length > MAX_AREAS) {
    return null;
  }
  if (v.some((a) => typeof a !== 'string' || !a.trim())) {
    return null;
  }
  return v as string[];
}
