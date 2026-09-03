import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkGradeItemDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'UUID of the enrollment (student + course) being graded' })
  @IsUUID('4')
  enrollmentId: string;

  @ApiProperty({
    example: 78.5,
    description: 'Raw score. Upper bound validated against assessment.maxScore at service level.',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ example: 'Good effort.', description: 'Optional remarks for this grade entry', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class BulkGradeDto {
  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'UUID of the assessment — all grades in this batch belong to this assessment' })
  @IsUUID('4')
  assessmentId: string;

  @ApiProperty({
    type: [BulkGradeItemDto],
    description: 'Array of grade entries. Must contain at least one item.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  grades: BulkGradeItemDto[];
}
