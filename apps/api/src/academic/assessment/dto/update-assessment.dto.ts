import {
  IsBoolean,
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

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsDateString()
  assessmentDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
