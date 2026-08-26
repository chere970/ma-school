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

import { StudentResultService } from './student-result.service';
import { CreateStudentResultDto } from './dto/create-student-result.dto';
import { UpdateStudentResultDto } from './dto/update-student-result.dto';

@Controller('student-results')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class StudentResultController {
  constructor(
    private readonly studentResultService: StudentResultService,
  ) {}

  @Post()
  create(@Body() dto: CreateStudentResultDto) {
    return this.studentResultService.create(dto);
  }

  @Get()
  findAll(
    @Query('assessmentId') assessmentId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.studentResultService.findAll({
      assessmentId,
      studentId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentResultService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentResultDto,
  ) {
    return this.studentResultService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentResultService.remove(id);
  }
}
