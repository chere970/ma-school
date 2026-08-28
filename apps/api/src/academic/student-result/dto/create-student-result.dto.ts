import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStudentResultDto {
  @IsUUID('4')
  assessmentId: string;

  @IsUUID('4')
  studentId: string;

  /**
   * Raw score — must be >= 0.
   * Upper bound validated against assessment.maxScore in the service layer.
   * Stored as Decimal(5,2); more than 2 decimal places are rejected.
   */
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
