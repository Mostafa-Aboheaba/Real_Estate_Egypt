import { IsIn, IsUUID } from 'class-validator';

export class RecordFeedbackDto {
  @IsUUID()
  propertyId!: string;

  @IsIn(['like', 'dislike'])
  sentiment!: 'like' | 'dislike';
}
