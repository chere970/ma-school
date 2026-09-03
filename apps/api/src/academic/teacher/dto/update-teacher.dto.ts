import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeacherDto {
  @ApiPropertyOptional({ example: 'EMP-2024-002', description: 'Updated employee number' })
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({ example: 'Bob', description: 'Updated first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lee', description: 'Updated middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ example: 'Williams', description: 'Updated last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'bob.williams@university.edu', description: 'Updated email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251944000000', description: 'Updated phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Machine Learning', description: 'Updated specialization area' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: '2022-01-15', description: 'Updated hire date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 'clx1a2b3c0001...', description: 'Updated department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the teacher is currently active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}