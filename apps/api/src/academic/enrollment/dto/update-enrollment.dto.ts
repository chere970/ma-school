import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../../../generated/prisma/enums';

export class UpdateEnrollmentDto {
  @ApiProperty({
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ACTIVE,
    description: 'New enrollment status',
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}