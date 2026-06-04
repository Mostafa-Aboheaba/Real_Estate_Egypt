import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ListingType } from '../../../domain/property/enums/listing-type.enum';
import { PropertyType } from '../../../domain/property/enums/property-type.enum';

export class PatchSearchPreferencesDto {
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPriceEgp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPriceEgp?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyTypes?: PropertyType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];
}
