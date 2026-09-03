import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'STU-2024-002', description: 'Updated student number' })
  @IsOptional()
  @IsString()
  studentNumber?: string;

  @ApiPropertyOptional({ example: 'Jane', description: 'Updated first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ann', description: 'Updated middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'Updated last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'jane.smith@university.edu', description: 'Updated email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251922000000', description: 'Updated phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '2003-08-20', description: 'Updated date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Female', description: 'Updated gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Updated admission year', minimum: 2000 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  admissionYear?: number;

  @ApiPropertyOptional({ example: 2, description: 'Updated year level', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  yearLevel?: number;

  @ApiPropertyOptional({ example: 'clx1a2b3c0001...', description: 'Updated program ID' })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the student is currently active' })
  @IsOptional()
  isActive?: boolean;
}