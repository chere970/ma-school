import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationYears?: number;

  @IsOptional()
  @IsString()
  description?: string;
}