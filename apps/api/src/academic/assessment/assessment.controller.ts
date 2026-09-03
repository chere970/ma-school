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

import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AssessmentType } from '../../../generated/prisma/enums';

@ApiTags('Assessments')
@ApiBearerAuth('access-token')
@Controller('assessments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assessment (exam, quiz, assignment, etc.)' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateAssessmentDto) {
    return this.assessmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List assessments with optional filters' })
  @ApiQuery({ name: 'teachingAssignmentId', required: false, description: 'Filter by teaching assignment UUID' })
  @ApiQuery({ name: 'type', required: false, enum: AssessmentType, description: 'Filter by assessment type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Returns a list of assessments.' })
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

  @Get('weights/:teachingAssignmentId')
  @ApiOperation({ summary: 'Validate total weight of active assessments for a teaching assignment (should equal 100%)' })
  @ApiResponse({ status: 200, description: 'Returns weight summary and validity flag.' })
  validateWeights(
    @Param('teachingAssignmentId')
    teachingAssignmentId: string,
  ) {
    return this.assessmentService.validateWeights(teachingAssignmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assessment by ID' })
  @ApiResponse({ status: 200, description: 'Returns the assessment.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    return this.assessmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }
}
