import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateRoomDto) {
    const tenantId = this.getTenantId();

    const campus = await this.prisma.campus.findFirst({
      where: {
        id: dto.campusId,
        tenantId,
      },
    });

    if (!campus) {
      throw new NotFoundException(
        'Campus not found',
      );
    }

    const existing = await this.prisma.room.findFirst({
      where: {
        tenantId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Room code already exists',
      );
    }

    return this.prisma.room.create({
      data: {
        tenantId,
        campusId: dto.campusId,
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity,
        type: dto.type,
      },
      include: {
        campus: true,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.room.findMany({
      where: {
        tenantId,
      },
      include: {
        campus: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const room = await this.prisma.room.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        campus: true,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found',
      );
    }

    return room;
  }

  async update(
    id: string,
    dto: UpdateRoomDto,
  ) {
    const tenantId = this.getTenantId();

    const room = await this.prisma.room.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found',
      );
    }

    if (dto.campusId) {
      const campus =
        await this.prisma.campus.findFirst({
          where: {
            id: dto.campusId,
            tenantId,
          },
        });

      if (!campus) {
        throw new NotFoundException(
          'Campus not found',
        );
      }
    }

    if (dto.code) {
      const duplicate =
        await this.prisma.room.findFirst({
          where: {
            tenantId,
            code: dto.code,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Room code already exists',
        );
      }
    }

    return this.prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        ...(dto.campusId !== undefined && {
          campusId: dto.campusId,
        }),
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.code !== undefined && {
          code: dto.code,
        }),
        ...(dto.capacity !== undefined && {
          capacity: dto.capacity,
        }),
        ...(dto.type !== undefined && {
          type: dto.type,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        campus: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const room = await this.prisma.room.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found',
      );
    }

    await this.prisma.room.delete({
      where: {
        id: room.id,
      },
    });

    return {
      message: 'Room deleted successfully',
    };
  }
}