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

import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto} from './dto/update-campus.dto'
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
  @Get(':id')
  async findOne(@Param('id') id:string,){
      return this.campusService.findOne(id)
    }
  @Patch(':id')
  async update(@Param('id') id: string,@Body() dto:UpdateCampusDto){
    return this.campusService.update(id,dto);
  }
  @Delete(':id')
  async remove(@Param('id')id: string){
    return this.campusService.remove(id);
  }
}