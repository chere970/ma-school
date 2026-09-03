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

import { TeachingAssignmentService } from './teaching-assignment.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';

@ApiTags('Teaching Assignments')
@ApiBearerAuth('access-token')
@Controller('teaching-assignments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class TeachingAssignmentController {
  constructor(
    private readonly teachingAssignmentService: TeachingAssignmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign a teacher to a course' })
  @ApiResponse({ status: 201, description: 'Teaching assignment created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teaching assignments for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of teaching assignments.' })
  async findAll() {
    return this.teachingAssignmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a teaching assignment by ID' })
  @ApiResponse({ status: 200, description: 'Returns the teaching assignment.' })
  @ApiResponse({ status: 404, description: 'Teaching assignment not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.teachingAssignmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a teaching assignment' })
  @ApiResponse({ status: 200, description: 'Teaching assignment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Teaching assignment not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a teaching assignment' })
  @ApiResponse({ status: 200, description: 'Teaching assignment deleted.' })
  @ApiResponse({ status: 404, description: 'Teaching assignment not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.teachingAssignmentService.remove(id);
  }
}