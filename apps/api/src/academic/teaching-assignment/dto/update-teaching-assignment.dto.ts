import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeachingAssignmentDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}