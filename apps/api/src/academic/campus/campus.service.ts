import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateCampusDto } from './dto/create-campus.dto';

@Injectable()
export class CampusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(
    dto: CreateCampusDto,
  ) {
    const tenantId =
      this.tenantContext.getTenantId();

    const existing =
      await this.prisma.campus.findFirst({
        where: {
          tenantId,
          OR: [
            {
              name: dto.name,
            },
            {
              code: dto.code,
            },
          ],
        },
      });

    if (existing) {
      throw new ConflictException(
        'Campus name or code already exists',
      );
    }

    return this.prisma.campus.create({
      data: {
        tenantId,

        name: dto.name,
        code: dto.code,
        address: dto.address,
      },
    });
  }

  async findAll() {
    const tenantId =
      this.tenantContext.getTenantId();

    return this.prisma.campus.findMany({
      where: {
        tenantId,
      },

      orderBy: {
        name: 'asc',
      },
    });
  }
}