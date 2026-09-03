import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the campus this department belongs to' })
  @IsNotEmpty()
  @IsString()
  campusId: string;

  @ApiProperty({ example: 'Computer Science', description: 'Full name of the department' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'CS', description: 'Unique short code for the department' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Studies computing, algorithms, and software engineering.', description: 'Optional department description' })
  @IsString()
  @IsOptional()
  description?: string;
}