import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { ResultReportService } from './result-report.service';

@ApiTags('Result Reports')
@ApiBearerAuth('access-token')
@Controller('result-reports')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class ResultReportController {
  constructor(
    private readonly resultReportService: ResultReportService,
  ) {}

  @Get('students/:studentId/transcript')
  @ApiOperation({ summary: 'Generate a transcript-style report for a student — one row per course with final letter grade' })
  @ApiResponse({ status: 200, description: 'Returns the student transcript.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  getStudentTranscript(@Param('studentId') studentId: string) {
    return this.resultReportService.getStudentTranscript(studentId);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get a full academic report for a student including per-assessment results and weighted final grades' })
  @ApiQuery({ name: 'semester', required: false, type: Number, description: 'Filter results by semester number' })
  @ApiQuery({ name: 'yearLevel', required: false, type: Number, description: 'Filter results by year level' })
  @ApiResponse({ status: 200, description: 'Returns the full student academic report.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
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

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get a course-level report showing all enrolled students and their results' })
  @ApiResponse({ status: 200, description: 'Returns the course report.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  getCourseReport(@Param('courseId') courseId: string) {
    return this.resultReportService.getCourseReport(courseId);
  }

  @Get('assessments/:assessmentId')
  @ApiOperation({ summary: 'Get assessment-level statistics and per-student result breakdown' })
  @ApiResponse({ status: 200, description: 'Returns the assessment report with statistics.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  getAssessmentReport(@Param('assessmentId') assessmentId: string) {
    return this.resultReportService.getAssessmentReport(assessmentId);
  }
}
