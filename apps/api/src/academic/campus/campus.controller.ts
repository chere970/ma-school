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

import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@ApiTags('Campuses')
@ApiBearerAuth('access-token')
@Controller('campuses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class CampusController {
  constructor(
    private readonly campusService: CampusService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campus' })
  @ApiResponse({ status: 201, description: 'Campus created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateCampusDto,
  ) {
    return this.campusService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all campuses for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of campuses.' })
  async findAll() {
    return this.campusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campus by ID' })
  @ApiResponse({ status: 200, description: 'Returns the campus.' })
  @ApiResponse({ status: 404, description: 'Campus not found.' })
  async findOne(@Param('id') id: string) {
    return this.campusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campus' })
  @ApiResponse({ status: 200, description: 'Campus updated successfully.' })
  @ApiResponse({ status: 404, description: 'Campus not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateCampusDto) {
    return this.campusService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campus' })
  @ApiResponse({ status: 200, description: 'Campus deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Campus not found.' })
  async remove(@Param('id') id: string) {
    return this.campusService.remove(id);
  }
}