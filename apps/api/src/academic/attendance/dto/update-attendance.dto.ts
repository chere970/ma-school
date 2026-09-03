import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../../generated/prisma/enums';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    enum: AttendanceStatus,
    example: AttendanceStatus.EXCUSED,
    description: 'Updated attendance status',
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Medical leave approved.', description: 'Updated remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
