import { IsBoolean } from 'class-validator';

export class PatchAdminAgentDto {
  @IsBoolean()
  isActive!: boolean;
}
