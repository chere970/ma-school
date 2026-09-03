import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@ApiTags('Enrollments')
@ApiBearerAuth('access-token')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enroll a student into a course' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate enrollment.' })
  async create(
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all enrollments for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of enrollments.' })
  async findAll() {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Returns the enrollment.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update enrollment status (ACTIVE, COMPLETED, DROPPED)' })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.enrollmentService.remove(id);
  }
}