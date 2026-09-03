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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType } from '../../../../generated/prisma/enums';

export class UpdateAssessmentDto {
  @ApiPropertyOptional({ example: 'Final Exam', description: 'Updated assessment title', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Covers all course material from chapters 1-10.', description: 'Updated description', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: AssessmentType, example: AssessmentType.QUIZ, description: 'Updated assessment type' })
  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @ApiPropertyOptional({ example: 50, description: 'Updated maximum score', minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxScore?: number;

  @ApiPropertyOptional({ example: 40, description: 'Updated percentage weight (0.01–100)', minimum: 0.01, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weight?: number;

  @ApiPropertyOptional({ example: '2024-11-20', description: 'Updated assessment date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  assessmentDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this assessment is currently active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
