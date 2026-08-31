import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  private validateDates(
    startDate: Date,
    endDate: Date,
  ): void {
    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be after start date',
      );
    }
  }

  async create(dto: CreateAcademicYearDto) {
    const tenantId = this.getTenantId();

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    this.validateDates(startDate, endDate);

    const existing = await this.prisma.academicYear.findFirst({
      where: {
        tenantId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Academic year with this name already exists',
      );
    }

    /*
     * If the new academic year is active,
     * deactivate other active academic years
     * for this tenant.
     */
    if (dto.isActive === true) {
      await this.prisma.academicYear.updateMany({
        where: {
          tenantId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    return this.prisma.academicYear.create({
      data: {
        tenantId,
        name: dto.name,
        startDate,
        endDate,
        isActive: dto.isActive ?? true,
      },
      include: {
        semesters: {
          orderBy: {
            number: 'asc',
          },
        },
      },
    });
  }

  async findAll(isActive?: boolean) {
    const tenantId = this.getTenantId();

    return this.prisma.academicYear.findMany({
      where: {
        tenantId,
        ...(isActive !== undefined && {
          isActive,
        }),
      },
      include: {
        semesters: {
          orderBy: {
            number: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          semesters: {
            orderBy: {
              number: 'asc',
            },
          },
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    return academicYear;
  }

  async findActive() {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          tenantId,
          isActive: true,
        },
        include: {
          semesters: {
            orderBy: {
              number: 'asc',
            },
          },
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'No active academic year found',
      );
    }

    return academicYear;
  }

  async update(
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
        include: {
          semesters: true,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    const name = dto.name ?? academicYear.name;

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : academicYear.startDate;

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : academicYear.endDate;

    this.validateDates(startDate, endDate);

    if (
      dto.name !== undefined &&
      dto.name !== academicYear.name
    ) {
      const duplicate =
        await this.prisma.academicYear.findFirst({
          where: {
            tenantId,
            name: dto.name,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Academic year with this name already exists',
        );
      }
    }

    /*
     * Make sure existing semesters still
     * fall inside the updated academic year.
     */
    for (const semester of academicYear.semesters) {
      if (
        semester.startDate < startDate ||
        semester.endDate > endDate
      ) {
        throw new BadRequestException(
          `Academic year dates cannot exclude existing semester "${semester.name}"`,
        );
      }
    }

    if (dto.isActive === true) {
      await this.prisma.academicYear.updateMany({
        where: {
          tenantId,
          isActive: true,
          NOT: {
            id,
          },
        },
        data: {
          isActive: false,
        },
      });
    }

    /*
     * If the academic year is being deactivated,
     * deactivate all of its semesters as well.
     */
    if (dto.isActive === false) {
      await this.prisma.academicSemester.updateMany({
        where: {
          tenantId,
          academicYearId: id,
        },
        data: {
          isActive: false,
        },
      });
    }

    return this.prisma.academicYear.update({
      where: {
        id: academicYear.id,
      },
      data: {
        name,
        startDate,
        endDate,
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        semesters: {
          orderBy: {
            number: 'asc',
          },
        },
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          semesters: true,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (academicYear.semesters.length > 0) {
      throw new ConflictException(
        'Cannot delete an academic year that has semesters',
      );
    }

    await this.prisma.academicYear.delete({
      where: {
        id: academicYear.id,
      },
    });

    return {
      message: 'Academic year deleted successfully',
    };
  }
}