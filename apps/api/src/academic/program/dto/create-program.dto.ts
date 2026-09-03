import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the department offering this program' })
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiProperty({ example: 'Bachelor of Science in Computer Science', description: 'Full program name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'BSCS', description: 'Unique short code for the program' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Bachelor of Science', description: 'Degree type awarded upon completion' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ example: 4, description: 'Total duration of the program in years', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationYears?: number;

  @ApiPropertyOptional({ example: 'A four-year program covering algorithms, systems, and AI.', description: 'Program description' })
  @IsOptional()
  @IsString()
  description?: string;
}