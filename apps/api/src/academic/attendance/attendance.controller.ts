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

import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Log a single attendance record' })
  @ApiResponse({ status: 201, description: 'Attendance record created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all attendance records for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of attendance records.' })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Returns the attendance record.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record (status or remarks)' })
  @ApiResponse({ status: 200, description: 'Attendance record updated.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Submit bulk attendance for an entire class session in one request' })
  @ApiResponse({ status: 201, description: 'Bulk attendance records created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  bulkCreate(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(dto);
  }
}
