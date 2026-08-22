import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { AttendanceStatus } from '../../../../generated/prisma/enums';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
