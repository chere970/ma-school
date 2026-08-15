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

import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentService.create(dto);
  }

  @Get()
  async findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.studentService.remove(id);
  }
}