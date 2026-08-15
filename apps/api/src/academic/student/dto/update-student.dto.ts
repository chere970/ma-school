import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  studentNumber?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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

  @IsOptional()
  @IsInt()
  @Min(2000)
  admissionYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  yearLevel?: number;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  
  isActive?: boolean;
}