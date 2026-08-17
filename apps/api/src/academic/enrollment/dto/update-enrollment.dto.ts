import {
  IsEnum,
} from 'class-validator';

import { EnrollmentStatus } from '../../../../generated/prisma/enums';

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}