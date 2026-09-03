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

import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@ApiTags('Teachers')
@ApiBearerAuth('access-token')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class TeacherController {
  constructor(
    private readonly teacherService: TeacherService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new teacher record' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateTeacherDto,
  ) {
    return this.teacherService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teachers for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of teachers.' })
  async findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher by ID' })
  @ApiResponse({ status: 200, description: 'Returns the teacher.' })
  @ApiResponse({ status: 404, description: 'Teacher not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher record' })
  @ApiResponse({ status: 200, description: 'Teacher updated successfully.' })
  @ApiResponse({ status: 404, description: 'Teacher not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a teacher record' })
  @ApiResponse({ status: 200, description: 'Teacher deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Teacher not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.teacherService.remove(id);
  }
}