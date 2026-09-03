import { IsArray, IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../../generated/prisma/enums';

export class BulkAttendanceItemDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the student' })
  @IsString()
  studentId: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Attendance status for this student. Defaults to PRESENT.',
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Joined late.', description: 'Optional remarks for this student' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the teaching assignment (session) for this bulk record' })
  @IsString()
  teachingAssignmentId: string;

  @ApiProperty({ example: '2024-09-03', description: 'Date of the session (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({
    type: [BulkAttendanceItemDto],
    description: 'Array of per-student attendance records for this session',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItemDto)
  records: BulkAttendanceItemDto[];
}
