import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeachingAssignmentDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0002...', description: 'Updated teacher ID' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({ example: 'clx1a2b3c0003...', description: 'Updated course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;
}