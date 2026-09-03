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

import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@ApiTags('Programs')
@ApiBearerAuth('access-token')
@Controller('programs')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class ProgramController {
  constructor(
    private readonly programService: ProgramService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new academic program' })
  @ApiResponse({ status: 201, description: 'Program created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(
    @Body() dto: CreateProgramDto,
  ) {
    return this.programService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all programs for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of programs.' })
  async findAll() {
    return this.programService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiResponse({ status: 200, description: 'Returns the program.' })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.programService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a program' })
  @ApiResponse({ status: 200, description: 'Program updated successfully.' })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.programService.remove(id);
  }
}