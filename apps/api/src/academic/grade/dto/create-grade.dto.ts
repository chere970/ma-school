import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'UUID of the assessment this grade belongs to' })
  @IsUUID('4')
  assessmentId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'UUID of the enrollment (student + course) being graded' })
  @IsUUID('4')
  enrollmentId: string;

  @ApiProperty({
    example: 85.5,
    description: 'Raw score. Must be >= 0. Upper bound validated against assessment.maxScore at service level.',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ example: 'Excellent work on part 2.', description: 'Optional remarks about the grade', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
