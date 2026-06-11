import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  propertyId!: string;

  @IsDateString()
  preferredAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
