import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Unique name of the academic year within the tenant',
    example: '2024/2025',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Start date of the academic year in ISO 8601 format',
    example: '2024-09-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the academic year in ISO 8601 format',
    example: '2025-06-30',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Whether this academic year is currently active. Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
