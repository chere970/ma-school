import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { AttendanceStatus } from '../../../../../generated/prisma/enums';

export class CreateAttendanceDto {
  @IsString()
  studentId: string;

  @IsString()
  teachingAssignmentId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
