import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  agentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
