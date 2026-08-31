import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAcademicYearDto {
  @ApiPropertyOptional({
    description: 'Unique name of the academic year within the tenant',
    example: '2024/2025',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Start date of the academic year in ISO 8601 format',
    example: '2024-09-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the academic year in ISO 8601 format',
    example: '2025-06-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether this academic year is currently active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
