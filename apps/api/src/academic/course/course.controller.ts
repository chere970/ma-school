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

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.create(dto);
  }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.courseService.remove(id);
  }
}