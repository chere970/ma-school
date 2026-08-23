import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { BulkGradeDto } from './dto/bulk-grade.dto';
import { GradeStatus } from '../../../generated/prisma/enums';

@Controller('grades')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Post()
  create(@Body() dto: CreateGradeDto) {
    return this.gradeService.create(dto);
  }

  @Get()
  findAll(
    @Query('assessmentId') assessmentId?: string,
    @Query('enrollmentId') enrollmentId?: string,
    @Query('teachingAssignmentId')
    teachingAssignmentId?: string,
    @Query('status') status?: GradeStatus,
  ) {
    return this.gradeService.findAll({
      assessmentId,
      enrollmentId,
      teachingAssignmentId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.gradeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeService.remove(id);
  }

  // ── Bulk entry ────────────────────────────────────────────────────────────

  /**
   * POST /grades/bulk
   *
   * Submit grades for multiple students at once.
   * All items are validated before any DB write.
   * The operation is fully transactional.
   */
  @Post('bulk')
  bulkCreate(@Body() dto: BulkGradeDto) {
    return this.gradeService.bulkCreate(dto);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * POST /grades/publish/:assessmentId
   *
   * Moves all DRAFT grades for the assessment → PUBLISHED.
   * Requires total assessment weights == 100%.
   */
  @Post('publish/:assessmentId')
  publishGrades(
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.gradeService.publishGrades(assessmentId);
  }

  /**
   * POST /grades/finalize/:assessmentId
   *
   * Moves all PUBLISHED grades → FINALIZED (irreversible).
   */
  @Post('finalize/:assessmentId')
  finalizeGrades(
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.gradeService.finalizeGrades(assessmentId);
  }

  // ── Results ───────────────────────────────────────────────────────────────

  /**
   * GET /grades/result/:enrollmentId
   *
   * Returns the weighted course result for a student
   * enrollment including letter grade, grade point,
   * and pass/fail status.
   */
  @Get('result/:enrollmentId')
  getCourseResult(
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.gradeService.getCourseResult(enrollmentId);
  }

  /**
   * GET /grades/student/:enrollmentId
   *
   * Returns all visible (published/finalized) grades
   * for a student's enrollment.
   */
  @Get('student/:enrollmentId')
  getStudentGrades(
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.gradeService.getStudentGrades(enrollmentId);
  }
}
