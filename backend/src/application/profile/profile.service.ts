import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
} from '../../domain/auth/ports/auth.repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../domain/auth/ports/password-hasher.port';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import {
  ProfileDomainException,
  ProfileErrorCode,
} from '../../domain/profile/failures/profile.failures';
import {
  AGENT_CATALOG,
  AgentCatalogPort,
} from '../../domain/profile/ports/agent-catalog.port';
import {
  PROFILE_REPOSITORY,
  FullUserProfile,
  PaginatedFavorites,
  ProfileRepositoryPort,
  UpdateProfilePatch,
  AgentPublicProfile,
  FavoriteRecord,
} from '../../domain/profile/ports/profile.repository.port';
import { AgentProfile } from '../../domain/profile/value-objects/agent-profile.vo';
import { LocalePreference } from '../../domain/profile/value-objects/locale.vo';
import { Phone } from '../../domain/profile/value-objects/phone.vo';
import { SearchPreferences } from '../../domain/profile/value-objects/search-preferences.vo';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: ProfileRepositoryPort,
    @Inject(AGENT_CATALOG) private readonly agentCatalog: AgentCatalogPort,
    @Inject(AUTH_REPOSITORY) private readonly auth: AuthRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwords: PasswordHasherPort,
  ) {}

  async getMe(userId: string): Promise<FullUserProfile> {
    return this.requireProfile(userId);
  }

  async updateMe(
    userId: string,
    role: UserRole,
    raw: Record<string, unknown>,
  ): Promise<FullUserProfile> {
    await this.requireProfile(userId);
    const patch = await this.buildPatch(raw, role);
    return this.profiles.updateProfile(userId, patch);
  }

  async updateSearchPreferences(
    userId: string,
    raw: Record<string, unknown>,
  ): Promise<{ searchPreferences: FullUserProfile['searchPreferences'] }> {
    const prefs = SearchPreferences.create(raw);
    if (!prefs) {
      throw new ProfileDomainException(
        ProfileErrorCode.VALIDATION_ERROR,
        'Invalid search preferences',
      );
    }
    const profile = await this.profiles.updateProfile(userId, {
      searchPreferences: prefs.toJSON(),
    });
    return { searchPreferences: profile.searchPreferences };
  }

  async listFavorites(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedFavorites> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    return this.profiles.listFavorites(userId, safePage, safeLimit);
  }

  async addFavorite(
    userId: string,
    propertyId: string,
  ): Promise<{ record: FavoriteRecord; created: boolean }> {
    try {
      return await this.profiles.addFavorite(userId, propertyId);
    } catch {
      throw new ProfileDomainException(
        ProfileErrorCode.PROPERTY_NOT_FOUND,
        'Property not found or inactive',
      );
    }
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    const removed = await this.profiles.removeFavorite(userId, propertyId);
    if (!removed) {
      throw new ProfileDomainException(
        ProfileErrorCode.FAVORITE_NOT_FOUND,
        'Favorite not found',
      );
    }
  }

  async deleteAccount(
    userId: string,
    input: { password?: string; confirm?: boolean },
  ): Promise<void> {
    if (!input.confirm) {
      throw new ProfileDomainException(
        ProfileErrorCode.VALIDATION_ERROR,
        'confirm must be true',
      );
    }
    const user = await this.auth.findById(userId);
    if (!user) {
      throw new ProfileDomainException(ProfileErrorCode.NOT_FOUND);
    }
    if (user.passwordHash) {
      if (!input.password) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'password required',
        );
      }
      const ok = await this.passwords.compare(
        input.password,
        user.passwordHash,
      );
      if (!ok) {
        throw new ProfileDomainException(
          ProfileErrorCode.INVALID_CREDENTIALS,
          'Invalid password',
        );
      }
    }
    await this.auth.revokeAllRefreshTokens(userId);
    await this.profiles.softDeleteUser(userId);
  }

  requestDataExport(): {
    requestId: string;
    status: string;
    estimatedDeliveryHours: number;
  } {
    return {
      requestId: randomUUID(),
      status: 'queued',
      estimatedDeliveryHours: 72,
    };
  }

  async getAgentPublicProfile(
    agentId: string,
    acceptLanguage?: string,
  ): Promise<AgentPublicProfile> {
    const locale = acceptLanguage?.split(',')[0]?.trim() ?? 'en';
    const profile = await this.profiles.findAgentPublicProfile(
      agentId,
      locale,
    );
    if (!profile) {
      throw new ProfileDomainException(
        ProfileErrorCode.NOT_FOUND,
        'Agent not found',
      );
    }
    return profile;
  }

  private async requireProfile(userId: string): Promise<FullUserProfile> {
    const profile = await this.profiles.findFullProfile(userId);
    if (!profile) {
      throw new ProfileDomainException(ProfileErrorCode.NOT_FOUND);
    }
    return profile;
  }

  private async buildPatch(
    raw: Record<string, unknown>,
    role: UserRole,
  ): Promise<UpdateProfilePatch> {
    const patch: UpdateProfilePatch = {};

    if (raw.name !== undefined) {
      const name = raw.name;
      if (name !== null && (typeof name !== 'string' || name.length > 120)) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'Invalid name',
        );
      }
      patch.name = name as string | null;
    }

    if (raw.phone !== undefined) {
      if (raw.phone === null || raw.phone === '') {
        patch.phone = null;
      } else {
        const phone = Phone.create(String(raw.phone));
        if (!phone) {
          throw new ProfileDomainException(
            ProfileErrorCode.VALIDATION_ERROR,
            'Invalid phone',
          );
        }
        patch.phone = phone.value;
      }
    }

    if (raw.locale !== undefined) {
      const locale = LocalePreference.create(String(raw.locale));
      if (!locale) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'Invalid locale',
        );
      }
      patch.locale = locale.value;
    }

    if (raw.avatarUrl !== undefined) {
      const url = raw.avatarUrl;
      if (
        url !== null &&
        (typeof url !== 'string' || !url.startsWith('https://'))
      ) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'avatarUrl must be HTTPS',
        );
      }
      patch.avatarUrl = url as string | null;
    }

    if (raw.preferredAgentId !== undefined) {
      const agentId = raw.preferredAgentId;
      if (agentId === null || agentId === '') {
        patch.preferredAgentId = null;
      } else if (typeof agentId !== 'string') {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'Invalid preferredAgentId',
        );
      } else {
        const valid = await this.agentCatalog.isActiveAgentId(agentId);
        if (!valid) {
          throw new ProfileDomainException(
            ProfileErrorCode.INVALID_AGENT_ID,
            'Unknown AI agent',
          );
        }
        patch.preferredAgentId = agentId;
      }
    }

    if (raw.searchPreferences !== undefined) {
      const prefs = SearchPreferences.create(raw.searchPreferences);
      if (!prefs) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'Invalid search preferences',
        );
      }
      patch.searchPreferences = prefs.toJSON();
    }

    if (raw.agentProfile !== undefined) {
      if (role !== UserRole.Agent) {
        throw new ProfileDomainException(
          ProfileErrorCode.FORBIDDEN,
          'Only agents may set agentProfile',
        );
      }
      const ap = AgentProfile.create(raw.agentProfile);
      if (!ap) {
        throw new ProfileDomainException(
          ProfileErrorCode.VALIDATION_ERROR,
          'Invalid agent profile',
        );
      }
      patch.agentProfile = ap.toJSON();
    }

    return patch;
  }
}
