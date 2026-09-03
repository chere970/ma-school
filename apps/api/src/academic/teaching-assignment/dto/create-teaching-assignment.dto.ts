import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeachingAssignmentDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the teacher being assigned' })
  @IsString()
  teacherId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the course the teacher is assigned to' })
  @IsString()
  courseId: string;
}