import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiPropertyOptional({ example: 90, description: 'Updated score. Must be >= 0.', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({ example: 'Score corrected after regrade.', description: 'Updated remarks', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
