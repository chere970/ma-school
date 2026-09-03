import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the student to enroll' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the course to enroll the student in' })
  @IsString()
  courseId: string;
}