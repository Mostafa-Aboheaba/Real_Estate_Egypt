import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProposeBookingDto {
  @IsDateString()
  proposedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
