import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAcademicSemesterDto {
  @ApiPropertyOptional({ example: 'Second Semester', description: 'Updated semester name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 2, description: 'Updated semester number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional({ example: '2025-02-01', description: 'Updated start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-06-30', description: 'Updated end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Set to true to activate this semester' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}