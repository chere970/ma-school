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

import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@ApiTags('Academic Periods')
@ApiBearerAuth('access-token')
@Controller('academic-years')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicPeriodController {
  constructor(
    private readonly academicPeriodService: AcademicPeriodService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new academic period (year)' })
  @ApiResponse({ status: 201, description: 'Academic period created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicPeriodService.createAcademicYear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all academic periods for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of academic periods.' })
  findAll() {
    return this.academicPeriodService.findAllAcademicYears();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an academic period by ID' })
  @ApiResponse({ status: 200, description: 'Returns the academic period.' })
  @ApiResponse({ status: 404, description: 'Academic period not found.' })
  findOne(@Param('id') id: string) {
    return this.academicPeriodService.findAcademicYear(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an academic period' })
  @ApiResponse({ status: 200, description: 'Academic period updated successfully.' })
  @ApiResponse({ status: 404, description: 'Academic period not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicPeriodService.updateAcademicYear(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic period' })
  @ApiResponse({ status: 200, description: 'Academic period deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Academic period not found.' })
  remove(@Param('id') id: string) {
    return this.academicPeriodService.removeAcademicYear(id);
  }
}