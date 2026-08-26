import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStudentResultDto {
  @IsUUID('4')
  assessmentId: string;

  @IsUUID('4')
  studentId: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
