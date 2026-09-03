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

import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@ApiBearerAuth('access-token')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room/facility' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all rooms for the current tenant' })
  @ApiResponse({ status: 200, description: 'Returns a list of rooms.' })
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Returns the room.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}