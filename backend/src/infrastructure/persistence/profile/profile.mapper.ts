import { Property as PrismaProperty, User } from '@prisma/client';
import { UserRole } from '../../../domain/auth/enums/user-role.enum';
import {
  AgentPublicProfile,
  FavoritePropertySummary,
  FavoriteRecord,
  FullUserProfile,
} from '../../../domain/profile/ports/profile.repository.port';
import { AgentProfileProps } from '../../../domain/profile/value-objects/agent-profile.vo';
import { SearchPreferencesProps } from '../../../domain/profile/value-objects/search-preferences.vo';

type UserRow = Pick<
  User,
  | 'id'
  | 'email'
  | 'role'
  | 'name'
  | 'phone'
  | 'locale'
  | 'avatarUrl'
  | 'preferredAgentId'
  | 'searchPreferences'
  | 'agentProfile'
  | 'emailVerified'
  | 'createdAt'
>;

export function toFullProfile(row: UserRow): FullUserProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    name: row.name,
    phone: row.phone,
    locale: row.locale,
    avatarUrl: row.avatarUrl,
    preferredAgentId: row.preferredAgentId,
    searchPreferences: row.searchPreferences as SearchPreferencesProps | null,
    agentProfile: row.agentProfile as AgentProfileProps | null,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
  };
}

export function toFavoritePropertySummary(
  row: PrismaProperty,
): FavoritePropertySummary {
  const location = row.location as {
    city?: string;
    governorate?: string;
  };
  const images = (row.images as string[]) ?? [];
  return {
    id: row.id,
    title: row.title,
    priceEgp: Number(row.priceEgp),
    listingType: row.listingType,
    location: {
      city: location.city ?? '',
      governorate: location.governorate ?? '',
    },
    thumbnailUrl: images[0] ?? null,
    isActive: row.isActive,
  };
}

export function toFavoriteRecord(
  favorite: { id: string; propertyId: string; createdAt: Date },
  property: PrismaProperty,
): FavoriteRecord {
  return {
    id: favorite.id,
    propertyId: favorite.propertyId,
    createdAt: favorite.createdAt,
    property: toFavoritePropertySummary(property),
  };
}

export function resolveAgentBio(
  agentProfile: AgentProfileProps | null,
  locale: string,
): string {
  const bio = agentProfile?.bio;
  if (!bio) {
    return '';
  }
  if (locale.startsWith('ar')) {
    return bio.ar ?? bio.en ?? '';
  }
  return bio.en ?? bio.ar ?? '';
}

export function toAgentPublicProfile(
  row: UserRow,
  locale: string,
): AgentPublicProfile | null {
  if (row.role !== UserRole.Agent) {
    return null;
  }
  const agentProfile = row.agentProfile as AgentProfileProps | null;
  const photoUrl =
    agentProfile?.photoUrl ?? row.avatarUrl ?? null;
  return {
    id: row.id,
    name: row.name ?? row.email,
    photoUrl,
    phone: row.phone,
    bio: resolveAgentBio(agentProfile, locale),
    serviceAreas: agentProfile?.serviceAreas ?? [],
    languages: [row.locale, 'en'].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
  };
}
