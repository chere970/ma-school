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

import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@ApiTags('Timetables')
@ApiBearerAuth('access-token')
@Controller('timetables')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a timetable entry (room + day + time slot for a teaching assignment)' })
  @ApiResponse({ status: 201, description: 'Timetable entry created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or scheduling conflict.' })
  create(@Body() dto: CreateTimetableDto) {
    return this.timetableService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all timetable entries for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of timetable entries.' })
  findAll() {
    return this.timetableService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a timetable entry by ID' })
  @ApiResponse({ status: 200, description: 'Returns the timetable entry.' })
  @ApiResponse({ status: 404, description: 'Timetable entry not found.' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a timetable entry' })
  @ApiResponse({ status: 200, description: 'Timetable entry updated successfully.' })
  @ApiResponse({ status: 404, description: 'Timetable entry not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timetable entry' })
  @ApiResponse({ status: 200, description: 'Timetable entry deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Timetable entry not found.' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}