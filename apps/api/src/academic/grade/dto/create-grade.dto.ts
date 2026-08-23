import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @IsUUID('4')
  assessmentId: string;

  @IsUUID('4')
  enrollmentId: string;

  /**
   * Raw score — must be >= 0.
   * Upper bound validated against assessment.maxScore
   * in the service layer.
   */
  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
