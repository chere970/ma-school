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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { BulkGradeDto } from './dto/bulk-grade.dto';
import { GradeStatus } from '../../../generated/prisma/enums';

@ApiTags('Grades')
@ApiBearerAuth('access-token')
@Controller('grades')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Enter a grade for a single student on an assessment' })
  @ApiResponse({ status: 201, description: 'Grade created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or score exceeds maxScore.' })
  create(@Body() dto: CreateGradeDto) {
    return this.gradeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List grades with optional filters' })
  @ApiQuery({ name: 'assessmentId', required: false, description: 'Filter by assessment UUID' })
  @ApiQuery({ name: 'enrollmentId', required: false, description: 'Filter by enrollment UUID' })
  @ApiQuery({ name: 'teachingAssignmentId', required: false, description: 'Filter by teaching assignment UUID' })
  @ApiQuery({ name: 'status', required: false, enum: GradeStatus, description: 'Filter by grade lifecycle status' })
  @ApiResponse({ status: 200, description: 'Returns a list of grade records.' })
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

  // ── Results — MUST be declared before @Get(':id') ─────────────────────────

  @Get('result/:enrollmentId')
  @ApiOperation({ summary: 'Get the weighted course result for a student enrollment (letter grade, grade point, pass/fail)' })
  @ApiResponse({ status: 200, description: 'Returns the course result.' })
  getCourseResult(
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.gradeService.getCourseResult(enrollmentId);
  }

  @Get('student/:enrollmentId')
  @ApiOperation({ summary: 'Get all visible (published/finalized) grades for a student enrollment' })
  @ApiResponse({ status: 200, description: 'Returns grade records for the enrollment.' })
  getStudentGrades(
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.gradeService.getStudentGrades(enrollmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single grade record by ID' })
  @ApiResponse({ status: 200, description: 'Returns the grade record.' })
  @ApiResponse({ status: 404, description: 'Grade not found.' })
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade record (score or remarks)' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully.' })
  @ApiResponse({ status: 404, description: 'Grade not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.gradeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grade record' })
  @ApiResponse({ status: 200, description: 'Grade deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Grade not found.' })
  remove(@Param('id') id: string) {
    return this.gradeService.remove(id);
  }

  // ── Bulk entry ────────────────────────────────────────────────────────────

  @Post('bulk')
  @ApiOperation({ summary: 'Submit grades for multiple students on the same assessment in one transactional request' })
  @ApiResponse({ status: 201, description: 'Bulk grades created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  bulkCreate(@Body() dto: BulkGradeDto) {
    return this.gradeService.bulkCreate(dto);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  @Post('publish/:assessmentId')
  @ApiOperation({ summary: 'Publish all DRAFT grades for an assessment (moves to PUBLISHED state)' })
  @ApiResponse({ status: 201, description: 'Grades published successfully.' })
  @ApiResponse({ status: 400, description: 'Assessment weights do not sum to 100%.' })
  publishGrades(
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.gradeService.publishGrades(assessmentId);
  }

  @Post('finalize/:assessmentId')
  @ApiOperation({ summary: 'Finalize all PUBLISHED grades for an assessment (irreversible, moves to FINALIZED)' })
  @ApiResponse({ status: 201, description: 'Grades finalized successfully.' })
  finalizeGrades(
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.gradeService.finalizeGrades(assessmentId);
  }
}
