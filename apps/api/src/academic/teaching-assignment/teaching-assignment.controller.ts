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

import { TeachingAssignmentService } from './teaching-assignment.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';

@Controller('teaching-assignments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class TeachingAssignmentController {
  constructor(
    private readonly teachingAssignmentService: TeachingAssignmentService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.create(dto);
  }

  @Get()
  async findAll() {
    return this.teachingAssignmentService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.teachingAssignmentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.teachingAssignmentService.remove(id);
  }
}