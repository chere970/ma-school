import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsUUID,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
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
}on: 'Student email address (must be unique within tenant)',
    example: 'abebe.girma@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Student phone number',
    example: '+251911234567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Date of birth in ISO 8601 format',
    example: '2000-01-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender of the student',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Year the student was admitted',
    example: 2024,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  admissionYear: number;

  @ApiProperty({
    description: 'Current year level of the student',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  yearLevel: number;

  @ApiProperty({
    description: 'ID of the program the student is enrolled in',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  programId: string;
}