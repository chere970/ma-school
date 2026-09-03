import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0000...', description: 'ID of the department to reassign this course to' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'clx1a2b3c0001...', description: 'ID of the program to reassign this course to' })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({ example: 'CS302', description: 'Updated course code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Advanced Algorithms', description: 'Updated course name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Advanced algorithm design and analysis.', description: 'Updated course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 4, description: 'Updated number of credit hours', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  creditHours?: number;

  @ApiPropertyOptional({ example: 2, description: 'Updated semester number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;

  @ApiPropertyOptional({ example: 3, description: 'Updated year level', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  yearLevel?: number;
}