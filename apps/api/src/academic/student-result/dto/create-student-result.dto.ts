import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentResultDto {
  @ApiProperty({
    description: 'Assessment ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  assessmentId: string;

  @ApiProperty({
    description: 'Student ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  studentId: string;

  @ApiProperty({
    description:
      'Raw score. Must be between 0 and the assessment maximum score.',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  @Min(0)
  score: number;

  @ApiPropertyOptional({
    description: 'Optional remark for the result',
    example: 'Excellent performance',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}