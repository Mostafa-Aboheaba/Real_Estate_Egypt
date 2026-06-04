import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ProfileService } from '../../application/profile/profile.service';
import { UserRole } from '../../domain/auth/enums/user-role.enum';
import { AccessTokenPayload } from '../../domain/auth/ports/token.service.port';
import { FullUserProfile } from '../../domain/profile/ports/profile.repository.port';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { FavoritesQueryDto } from './dto/favorites-query.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { PatchSearchPreferencesDto } from './dto/patch-search-preferences.dto';

function toMeResponse(profile: FullUserProfile): Record<string, unknown> {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
    phone: profile.phone,
    locale: profile.locale,
    avatarUrl: profile.avatarUrl,
    preferredAgentId: profile.preferredAgentId,
    searchPreferences: profile.searchPreferences,
    agentProfile:
      profile.role === UserRole.Agent ? profile.agentProfile : null,
    emailVerified: profile.emailVerified,
    createdAt: profile.createdAt.toISOString(),
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
export class UsersController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  @Roles(UserRole.Buyer, UserRole.Agent, UserRole.Admin)
  async me(@CurrentUser() user: AccessTokenPayload) {
    const profile = await this.profile.getMe(user.sub);
    return toMeResponse(profile);
  }

  @Patch('me')
  @Roles(UserRole.Buyer, UserRole.Agent, UserRole.Admin)
  async patchMe(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: PatchProfileDto,
  ) {
    const profile = await this.profile.updateMe(
      user.sub,
      user.role as UserRole,
      dto as unknown as Record<string, unknown>,
    );
    return toMeResponse(profile);
  }

  @Patch('me/preferences')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async patchPreferences(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: PatchSearchPreferencesDto,
  ) {
    return this.profile.updateSearchPreferences(
      user.sub,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Get('me/favorites')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async listFavorites(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: FavoritesQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.profile.listFavorites(user.sub, page, limit);
    return {
      items: result.items.map((f) => ({
        id: f.id,
        propertyId: f.propertyId,
        createdAt: f.createdAt.toISOString(),
        property: f.property,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    };
  }

  @Post('me/favorites/:propertyId')
  @Roles(UserRole.Buyer, UserRole.Agent)
  async addFavorite(
    @CurrentUser() user: AccessTokenPayload,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { record, created } = await this.profile.addFavorite(
      user.sub,
      propertyId,
    );
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return {
      id: record.id,
      propertyId: record.propertyId,
      createdAt: record.createdAt.toISOString(),
      property: record.property,
    };
  }

  @Delete('me/favorites/:propertyId')
  @Roles(UserRole.Buyer, UserRole.Agent)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @CurrentUser() user: AccessTokenPayload,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ) {
    await this.profile.removeFavorite(user.sub, propertyId);
  }

  @Delete('me')
  @Roles(UserRole.Buyer, UserRole.Agent, UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: DeleteAccountDto,
  ) {
    await this.profile.deleteAccount(user.sub, dto);
  }

  @Post('me/export')
  @Roles(UserRole.Buyer, UserRole.Agent, UserRole.Admin)
  @HttpCode(HttpStatus.ACCEPTED)
  exportMe() {
    return this.profile.requestDataExport();
  }
}
