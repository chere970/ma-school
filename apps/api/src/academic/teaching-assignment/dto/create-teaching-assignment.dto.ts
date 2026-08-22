import { IsString } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsString()
  teacherId: string;

  @IsString()
  courseId: string;
}