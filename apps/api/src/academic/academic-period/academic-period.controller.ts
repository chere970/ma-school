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

import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicPeriodController {
  constructor(
    private readonly academicPeriodService: AcademicPeriodService,
  ) {}

  @Post()
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicPeriodService.createAcademicYear(dto);
  }

  @Get()
  findAll() {
    return this.academicPeriodService.findAllAcademicYears();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicPeriodService.findAcademicYear(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicPeriodService.updateAcademicYear(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicPeriodService.removeAcademicYear(id);
  }
}