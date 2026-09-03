import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAcademicYearDto {
  @ApiPropertyOptional({ example: '2025/2026', description: 'Updated academic year name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '2025-09-01', description: 'Updated start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30', description: 'Updated end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Set to true to activate this academic year. Only one year may be active at a time.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}