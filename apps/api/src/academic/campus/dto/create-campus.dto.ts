import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampusDto {
  @ApiProperty({ example: 'Main Campus', description: 'Full name of the campus' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MAIN', description: 'Unique short code for the campus' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '123 University Ave, City', description: 'Physical address of the campus' })
  @IsOptional()
  @IsString()
  address?: string;
}