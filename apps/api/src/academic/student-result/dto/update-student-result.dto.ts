import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStudentResultDto {
  /**
   * Updated raw score — optional.
   * When provided, grade and gradePoint are recalculated.
   * Stored as Decimal(5,2); more than 2 decimal places are rejected.
   */
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
