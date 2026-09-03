import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgramDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0000...', description: 'ID of the department to reassign this program to' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'Master of Science in Computer Science', description: 'Updated program name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MSCS', description: 'Updated program code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Master of Science', description: 'Updated degree type' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ example: 2, description: 'Updated program duration in years', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationYears?: number;

  @ApiPropertyOptional({ example: 'Graduate-level program with specialization in AI.', description: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}