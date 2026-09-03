import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTimetableDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0002...', description: 'Updated teaching assignment ID' })
  @IsOptional()
  @IsString()
  teachingAssignmentId?: string;

  @ApiPropertyOptional({ example: 'clx1a2b3c0003...', description: 'Updated room ID' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ example: 3, description: 'Updated day of week (1=Monday, 7=Sunday)', minimum: 1, maximum: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: '09:00', description: 'Updated start time (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must use HH:mm format',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'Updated end time (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must use HH:mm format',
  })
  endTime?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this timetable entry is currently active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}