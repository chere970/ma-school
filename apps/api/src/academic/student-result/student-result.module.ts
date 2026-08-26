import { Module } from '@nestjs/common';

import { StudentResultController } from './student-result.controller';
import { StudentResultService } from './student-result.service';

@Module({
  controllers: [StudentResultController],
  providers: [StudentResultService],
  exports: [StudentResultService],
})
export class StudentResultModule {}
