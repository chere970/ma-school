import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicPeriodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async createAcademicYear(dto: CreateAcademicYearDto) {
    const tenantId = this.getTenantId();

    const existing = await this.prisma.academicYear.findFirst({
      where: {
        tenantId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Academic year already exists',
      );
    }

    return this.prisma.academicYear.create({
      data: {
        tenantId,
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAllAcademicYears() {
    const tenantId = this.getTenantId();

    return this.prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findAcademicYear(id: string) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    return academicYear;
  }

  async updateAcademicYear(
    id: string,
    dto: UpdateAcademicYearDto,
  ) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (dto.name) {
      const duplicate =
        await this.prisma.academicYear.findFirst({
          where: {
            tenantId,
            name: dto.name,
            NOT: { id },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Academic year already exists',
        );
      }
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
    });
  }

  async removeAcademicYear(id: string) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    await this.prisma.academicYear.delete({
      where: { id },
    });

    return {
      message: 'Academic year deleted successfully',
    };
  }
}