import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../../generated/prisma/enums';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the student whose attendance is being recorded' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the teaching assignment (session) being attended' })
  @IsString()
  teachingAssignmentId: string;

  @ApiProperty({ example: '2024-09-03', description: 'Date of the attendance record (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Attendance status. Defaults to PRESENT if not provided.',
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Student arrived 5 minutes late.', description: 'Optional remarks about the attendance record' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
