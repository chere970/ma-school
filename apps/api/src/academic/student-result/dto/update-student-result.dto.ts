import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentResultDto {
  @ApiPropertyOptional({
    description:
      'Updated raw score. Grade and grade point are recalculated automatically.',
    example: 90.25,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  @Min(0)
  score?: number;

  @ApiPropertyOptional({
    description: 'Updated remark',
    example: 'Very good performance',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
