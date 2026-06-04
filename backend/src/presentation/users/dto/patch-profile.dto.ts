import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class PatchProfileDto {
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  avatarUrl?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  preferredAgentId?: string | null;

  @IsOptional()
  @IsObject()
  searchPreferences?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  agentProfile?: Record<string, unknown>;
}
