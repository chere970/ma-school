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

import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@ApiBearerAuth('access-token')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of courses.' })
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Returns the course.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.courseService.remove(id);
  }
}