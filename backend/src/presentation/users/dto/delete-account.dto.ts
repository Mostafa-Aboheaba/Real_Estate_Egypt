import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsBoolean()
  confirm!: boolean;
}
