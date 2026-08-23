import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateGradeDto {
  /**
   * Upper bound validated against assessment.maxScore
   * in the service layer.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
