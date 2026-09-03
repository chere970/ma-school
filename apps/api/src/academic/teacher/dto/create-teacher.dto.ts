import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'EMP-2024-001', description: 'Unique employee number for the teacher' })
  @IsString()
  employeeNumber: string;

  @ApiProperty({ example: 'Alice', description: 'Teacher first name' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Grace', description: 'Teacher middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Johnson', description: 'Teacher last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'alice.johnson@university.edu', description: 'Teacher email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251933000000', description: 'Teacher phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Artificial Intelligence', description: 'Teacher area of academic specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: '2020-09-01', description: 'Date the teacher was hired (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the department this teacher belongs to' })
  @IsString()
  departmentId: string;
}