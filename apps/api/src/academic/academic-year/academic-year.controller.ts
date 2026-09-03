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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@ApiTags('Academic Years')
@ApiBearerAuth('access-token')
@Controller('academic-years')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicYearController {
  constructor(
    private readonly academicYearService: AcademicYearService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiResponse({ status: 201, description: 'Academic year created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all academic years for the current tenant' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter to return only active or inactive years' })
  @ApiResponse({ status: 200, description: 'Returns a list of academic years.' })
  findAll(
    @Query('isActive') isActive?: string,
  ) {
    return this.academicYearService.findAll(
      isActive !== undefined
        ? isActive === 'true'
        : undefined,
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active academic year' })
  @ApiResponse({ status: 200, description: 'Returns the active academic year.' })
  @ApiResponse({ status: 404, description: 'No active academic year found.' })
  findActive() {
    return this.academicYearService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an academic year by ID' })
  @ApiResponse({ status: 200, description: 'Returns the academic year.' })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  findOne(@Param('id') id: string) {
    return this.academicYearService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiResponse({ status: 200, description: 'Academic year updated successfully.' })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic year' })
  @ApiResponse({ status: 200, description: 'Academic year deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  remove(@Param('id') id: string) {
    return this.academicYearService.remove(id);
  }
}