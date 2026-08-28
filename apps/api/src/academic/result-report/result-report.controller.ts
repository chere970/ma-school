import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { ResultReportService } from './result-report.service';

@Controller('result-reports')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class ResultReportController {
  constructor(
    private readonly resultReportService: ResultReportService,
  ) {}

  /**
   * GET /result-reports/students/:studentId/transcript
   *
   * Declared BEFORE the generic :studentId route so NestJS (Express adapter)
   * does not match 'transcript' as the dynamic :studentId segment.
   *
   * Transcript-style summary — one row per course with final grade.
   */
  @Get('students/:studentId/transcript')
  getStudentTranscript(@Param('studentId') studentId: string) {
    return this.resultReportService.getStudentTranscript(studentId);
  }

  /**
   * GET /result-reports/students/:studentId
   *
   * Full academic summary for one student including per-assessment
   * results and computed weighted final grades.
   *
   * Optional filters:
   *   ?semester=1   — only courses in this semester
   *   ?yearLevel=2  — only courses at this year level
   */
  @Get('students/:studentId')
  getStudentReport(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
    @Query('yearLevel') yearLevel?: string,
  ) {
    return this.resultReportService.getStudentReport(studentId, {
      semester: semester !== undefined ? parseInt(semester, 10) : undefined,
      yearLevel: yearLevel !== undefined ? parseInt(yearLevel, 10) : undefined,
    });
  }

  /**
   * GET /result-reports/courses/:courseId
   *
   * Course-level report with all enrolled students and their results.
   */
  @Get('courses/:courseId')
  getCourseReport(@Param('courseId') courseId: string) {
    return this.resultReportService.getCourseReport(courseId);
  }

  /**
   * GET /result-reports/assessments/:assessmentId
   *
   * Assessment-level statistics and per-student result breakdown.
   */
  @Get('assessments/:assessmentId')
  getAssessmentReport(@Param('assessmentId') assessmentId: string) {
    return this.resultReportService.getAssessmentReport(assessmentId);
  }
}
