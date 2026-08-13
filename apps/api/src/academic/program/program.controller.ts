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

import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('programs')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class ProgramController {
  constructor(
    private readonly programService: ProgramService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateProgramDto,
  ) {
    return this.programService.create(dto);
  }

  @Get()
  async findAll() {
    return this.programService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.programService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.programService.remove(id);
  }
}