import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the department owning this course' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the program this course belongs to' })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ example: 'CS301', description: 'Unique course code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Data Structures and Algorithms', description: 'Full course name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'In-depth study of data structures, sorting, and complexity.', description: 'Course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 3, description: 'Number of credit hours for this course', minimum: 1 })
  @IsInt()
  @Min(1)
  creditHours: number;

  @ApiPropertyOptional({ example: 1, description: 'Semester number in which this course is typically offered', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;

  @ApiPropertyOptional({ example: 2, description: 'Year level at which this course is typically taken', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  yearLevel?: number;
}