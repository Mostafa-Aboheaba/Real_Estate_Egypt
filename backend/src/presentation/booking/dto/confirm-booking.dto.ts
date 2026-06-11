import { IsDateString } from 'class-validator';

export class ConfirmBookingDto {
  @IsDateString()
  scheduledAt!: string;
}
