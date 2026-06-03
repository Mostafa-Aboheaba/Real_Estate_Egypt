import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['buyer', 'agent'])
  role!: string;

  @IsIn(['ar-EG', 'en'])
  locale!: string;

  @IsBoolean()
  consentAccepted!: boolean;

  @IsString()
  consentVersion!: string;
}
