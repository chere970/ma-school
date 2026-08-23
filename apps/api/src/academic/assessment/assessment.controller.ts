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

import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AssessmentType } from '../../../generated/prisma/enums';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
  ) {}

  @Post()
  create(@Body() dto: CreateAssessmentDto) {
    return this.assessmentService.create(dto);
  }

  @Get()
  findAll(
    @Query('teachingAssignmentId')
    teachingAssignmentId?: string,
    @Query('type') type?: AssessmentType,
    @Query('isActive') isActive?: string,
  ) {
    return this.assessmentService.findAll({
      teachingAssignmentId,
      type,
      isActive:
        isActive !== undefined
          ? isActive === 'true'
          : undefined,
    });
  }

  /**
   * GET /assessments/weights/:teachingAssignmentId
   *
   * Returns total active weight and whether it
   * sums to 100% — use before publishing grades.
   *
   * IMPORTANT: must be declared before @Get(':id') so NestJS
   * does not treat 'weights' as a dynamic :id segment.
   */
  @Get('weights/:teachingAssignmentId')
  validateWeights(
    @Param('teachingAssignmentId')
    teachingAssignmentId: string,
  ) {
    return this.assessmentService.validateWeights(
      teachingAssignmentId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    return this.assessmentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }
}
