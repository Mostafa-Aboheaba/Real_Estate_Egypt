import { UserRole } from '../../auth/enums/user-role.enum';
import { SearchPreferencesProps } from '../value-objects/search-preferences.vo';
import { AgentProfileProps } from '../value-objects/agent-profile.vo';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface FullUserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  phone: string | null;
  locale: string;
  avatarUrl: string | null;
  preferredAgentId: string | null;
  searchPreferences: SearchPreferencesProps | null;
  agentProfile: AgentProfileProps | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface UpdateProfilePatch {
  name?: string | null;
  phone?: string | null;
  locale?: string;
  avatarUrl?: string | null;
  preferredAgentId?: string | null;
  searchPreferences?: SearchPreferencesProps | null;
  agentProfile?: AgentProfileProps | null;
}

export interface FavoritePropertySummary {
  id: string;
  title: string;
  priceEgp: number;
  listingType: string;
  location: { city: string; governorate: string };
  thumbnailUrl: string | null;
  isActive: boolean;
}

export interface FavoriteRecord {
  id: string;
  propertyId: string;
  createdAt: Date;
  property: FavoritePropertySummary;
}

export interface PaginatedFavorites {
  items: FavoriteRecord[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface AgentPublicProfile {
  id: string;
  name: string;
  photoUrl: string | null;
  phone: string | null;
  bio: string;
  serviceAreas: string[];
  languages: string[];
}

export interface ProfileRepositoryPort {
  findFullProfile(userId: string): Promise<FullUserProfile | null>;
  updateProfile(
    userId: string,
    patch: UpdateProfilePatch,
  ): Promise<FullUserProfile>;
  softDeleteUser(userId: string): Promise<void>;
  addFavorite(
    userId: string,
    propertyId: string,
  ): Promise<{ record: FavoriteRecord; created: boolean }>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
  listFavorites(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedFavorites>;
  findAgentPublicProfile(
    agentUserId: string,
    locale: string,
  ): Promise<AgentPublicProfile | null>;
}
