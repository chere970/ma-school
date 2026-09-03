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

import { AcademicSemesterService } from './academic-semester.service';
import { CreateAcademicSemesterDto } from './dto/create-academic-semester.dto';
import { UpdateAcademicSemesterDto } from './dto/update-academic-semester.dto';

@ApiTags('Academic Semesters')
@ApiBearerAuth('access-token')
@Controller('academic-semesters')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicSemesterController {
  constructor(
    private readonly academicSemesterService: AcademicSemesterService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new semester within an academic year' })
  @ApiResponse({ status: 201, description: 'Semester created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateAcademicSemesterDto) {
    return this.academicSemesterService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all semesters with optional filters' })
  @ApiQuery({ name: 'academicYearId', required: false, description: 'Filter by academic year UUID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Returns a list of semesters.' })
  findAll(
    @Query('academicYearId') academicYearId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.academicSemesterService.findAll(
      academicYearId,
      isActive !== undefined
        ? isActive === 'true'
        : undefined,
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active semester' })
  @ApiResponse({ status: 200, description: 'Returns the active semester.' })
  @ApiResponse({ status: 404, description: 'No active semester found.' })
  findActive() {
    return this.academicSemesterService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a semester by ID' })
  @ApiResponse({ status: 200, description: 'Returns the semester.' })
  @ApiResponse({ status: 404, description: 'Semester not found.' })
  findOne(@Param('id') id: string) {
    return this.academicSemesterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a semester' })
  @ApiResponse({ status: 200, description: 'Semester updated successfully.' })
  @ApiResponse({ status: 404, description: 'Semester not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicSemesterDto,
  ) {
    return this.academicSemesterService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a semester' })
  @ApiResponse({ status: 200, description: 'Semester deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Semester not found.' })
  remove(@Param('id') id: string) {
    return this.academicSemesterService.remove(id);
  }
}