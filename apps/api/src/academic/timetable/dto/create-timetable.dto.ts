import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimetableDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the teaching assignment (teacher + course)' })
  @IsString()
  teachingAssignmentId: string;

  @ApiProperty({ example: 'clx1a2b3c0001...', description: 'ID of the room where the class takes place' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: 2, description: 'Day of the week (1=Monday, 7=Sunday)', minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @ApiProperty({ example: '08:00', description: 'Class start time in HH:mm format (24-hour)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must use HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'Class end time in HH:mm format (24-hour)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must use HH:mm format',
  })
  endTime: string;
}