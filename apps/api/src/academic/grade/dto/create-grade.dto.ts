import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @IsString()
  assessmentId: string;

  @IsString()
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
