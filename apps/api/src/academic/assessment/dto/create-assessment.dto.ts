import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType } from '../../../../generated/prisma/enums';

export class CreateAssessmentDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'UUID of the teaching assignment this assessment belongs to' })
  @IsUUID('4')
  teachingAssignmentId: string;

  @ApiProperty({ example: 'Midterm Exam', description: 'Assessment title (max 200 characters)', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Covers chapters 1-5 of the course material.', description: 'Optional assessment description (max 2000 characters)', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: AssessmentType, example: AssessmentType.EXAM, description: 'Type of assessment' })
  @IsEnum(AssessmentType)
  type: AssessmentType;

  @ApiProperty({ example: 100, description: 'Maximum achievable score — must be > 0', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  maxScore: number;

  @ApiProperty({
    example: 30,
    description: 'Percentage weight of this assessment toward the final course grade (0.01 – 100)',
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({ example: '2024-10-15', description: 'Scheduled date of the assessment (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  assessmentDate?: string;
}
