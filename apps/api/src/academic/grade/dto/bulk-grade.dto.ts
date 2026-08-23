import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkGradeItemDto {
  @IsUUID('4')
  enrollmentId: string;

  /**
   * Raw score — upper bound validated against
   * assessment.maxScore in the service layer.
   */
  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class BulkGradeDto {
  /**
   * All grades in this batch belong to this assessment.
   */
  @IsUUID('4')
  assessmentId: string;

  /**
   * Must contain at least one entry — an empty bulk
   * request is meaningless and would be a silent no-op.
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  grades: BulkGradeItemDto[];
}
