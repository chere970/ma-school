import { Module } from '@nestjs/common';

import { ResultReportController } from './result-report.controller';
import { ResultReportService } from './result-report.service';

@Module({
  controllers: [ResultReportController],
  providers: [ResultReportService],
  exports: [ResultReportService],
})
export class ResultReportModule {}
