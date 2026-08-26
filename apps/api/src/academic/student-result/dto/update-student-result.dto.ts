import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateStudentResultDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
