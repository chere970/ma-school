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

import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth('access-token')
@Controller('students')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student record' })
  @ApiResponse({ status: 201, description: 'Student created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all students for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of students.' })
  async findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Returns the student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student record' })
  @ApiResponse({ status: 200, description: 'Student updated successfully.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student record' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.studentService.remove(id);
  }
}