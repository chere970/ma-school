import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'clx1a2b3c0001...', description: 'Updated campus ID' })
  @IsOptional()
  @IsString()
  campusId?: string;

  @ApiPropertyOptional({ example: 'Room 202', description: 'Updated room name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'R-202', description: 'Updated room code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 60, description: 'Updated room capacity', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: 'Computer Lab', description: 'Updated room type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the room is currently active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}