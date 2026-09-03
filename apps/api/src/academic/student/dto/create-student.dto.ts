import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'STU-2024-001', description: 'Unique student ID number' })
  @IsString()
  studentNumber: string;

  @ApiProperty({ example: 'John', description: 'Student first name' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Michael', description: 'Student middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Doe', description: 'Student last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'john.doe@university.edu', description: 'Student email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911000000', description: 'Student phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '2002-05-15', description: 'Date of birth in ISO 8601 format (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Male', description: 'Student gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 2024, description: 'Year the student was admitted', minimum: 2000 })
  @IsInt()
  @Min(2000)
  admissionYear: number;

  @ApiProperty({ example: 1, description: 'Current year level of the student', minimum: 1 })
  @IsInt()
  @Min(1)
  yearLevel: number;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the academic program the student is enrolled in' })
  @IsString()
  programId: string;
}