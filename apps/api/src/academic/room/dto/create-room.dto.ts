import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'clx1a2b3c0000...', description: 'ID of the campus where this room is located' })
  @IsString()
  campusId: string;

  @ApiProperty({ example: 'Room 101', description: 'Room name or label' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'R-101', description: 'Unique room code within the campus' })
  @IsString()
  code: string;

  @ApiProperty({ example: 40, description: 'Maximum seating capacity of the room', minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: 'Lecture Hall', description: 'Room type (e.g., Lecture Hall, Lab, Seminar Room)' })
  @IsOptional()
  @IsString()
  type?: string;
}