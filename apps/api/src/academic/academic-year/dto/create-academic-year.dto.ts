import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2024/2025', description: 'Academic year label (max 100 characters)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '2024-09-01', description: 'Academic year start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-06-30', description: 'Academic year end date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: false, description: 'Set to true to mark this as the currently active academic year. Only one year can be active at a time.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
