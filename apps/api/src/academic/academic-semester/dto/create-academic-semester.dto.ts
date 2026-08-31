import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAcademicSemesterDto {
  @IsUUID('4')
  academicYearId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(1)
  number: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}