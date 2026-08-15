import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  studentNumber: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsInt()
  @Min(2000)
  admissionYear: number;

  @IsInt()
  @Min(1)
  yearLevel: number;

  @IsString()
  programId: string;
}