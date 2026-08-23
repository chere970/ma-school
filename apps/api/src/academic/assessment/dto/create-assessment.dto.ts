import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { AssessmentType } from '../../../../generated/prisma/enums';

export class CreateAssessmentDto {
  @IsString()
  teachingAssignmentId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  /**
   * Maximum achievable score — must be > 0.
   */
  @IsNumber()
  @Min(0.01)
  maxScore: number;

  /**
   * Percentage weight of this assessment
   * toward the final course grade (0.01 – 100).
   */
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weight: number;

  @IsOptional()
  @IsDateString()
  assessmentDate?: string;
}
