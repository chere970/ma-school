import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkGradeItemDto {
  @IsString()
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
  @IsString()
  assessmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  grades: BulkGradeItemDto[];
}
