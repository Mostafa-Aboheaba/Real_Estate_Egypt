import { IsIn, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsIn(['buyer', 'agent'])
  role?: string;
}

export class AppleAuthDto {
  @IsString()
  identityToken!: string;

  @IsOptional()
  @IsIn(['buyer', 'agent'])
  role?: string;
}
