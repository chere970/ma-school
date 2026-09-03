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

import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@ApiBearerAuth('access-token')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all departments for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of departments.' })
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: 200, description: 'Returns the department.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.departmentService.remove(id);
  }
}