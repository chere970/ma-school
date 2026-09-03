import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCampusDto {
  @ApiPropertyOptional({ example: 'North Campus', description: 'Updated campus name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'NORTH', description: 'Updated campus code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: '456 University Blvd', description: 'Updated campus address' })
  @IsOptional()
  @IsString()
  address?: string;
}