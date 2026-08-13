import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';

@Controller('campuses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class CampusController {
  constructor(
    private readonly campusService: CampusService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCampusDto,
  ) {
    return this.campusService.create(dto);
  }

  @Get()
  async findAll() {
    return this.campusService.findAll();
  }
}