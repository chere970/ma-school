import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0000...', description: 'ID of the campus to reassign the department to' })
  @IsOptional()
  @IsString()
  campusId?: string;

  @ApiPropertyOptional({ example: 'Software Engineering', description: 'Updated department name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'SE', description: 'Updated department code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Focuses on software design and development practices.', description: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}