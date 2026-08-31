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

import { AcademicSemesterService } from './academic-semester.service';
import { CreateAcademicSemesterDto } from './dto/create-academic-semester.dto';
import { UpdateAcademicSemesterDto } from './dto/update-academic-semester.dto';

@Controller('academic-semesters')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class AcademicSemesterController {
  constructor(
    private readonly academicSemesterService: AcademicSemesterService,
  ) {}

  @Post()
  create(@Body() dto: CreateAcademicSemesterDto) {
    return this.academicSemesterService.create(dto);
  }

  @Get()
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
  findActive() {
    return this.academicSemesterService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicSemesterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicSemesterDto,
  ) {
    return this.academicSemesterService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicSemesterService.remove(id);
  }
}