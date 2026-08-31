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

import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicYearController {
  constructor(
    private readonly academicYearService: AcademicYearService,
  ) {}

  @Post()
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearService.create(dto);
  }

  @Get()
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
  findActive() {
    return this.academicYearService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicYearService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicYearService.remove(id);
  }
}