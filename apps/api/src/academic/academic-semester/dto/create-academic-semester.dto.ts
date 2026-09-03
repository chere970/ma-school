import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicSemesterDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'UUID of the academic year this semester belongs to' })
  @IsUUID('4')
  academicYearId: string;

  @ApiProperty({ example: 'First Semester', description: 'Semester name or label (max 100 characters)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 1, description: 'Semester number within the academic year (e.g., 1 or 2)', minimum: 1 })
  @IsInt()
  @Min(1)
  number: number;

  @ApiProperty({ example: '2024-09-01', description: 'Semester start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-31', description: 'Semester end date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: false, description: 'Set to true to mark this as the currently active semester' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}