import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateAcademicSemesterDto } from './dto/create-academic-semester.dto';
import { UpdateAcademicSemesterDto } from './dto/update-academic-semester.dto';

@Injectable()
export class AcademicSemesterService {
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
    academicYearStart: Date,
    academicYearEnd: Date,
  ): void {
    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be after start date',
      );
    }

    if (
      startDate < academicYearStart ||
      endDate > academicYearEnd
    ) {
      throw new BadRequestException(
        'Semester dates must fall within the academic year dates',
      );
    }
  }

  async create(dto: CreateAcademicSemesterDto) {
    const tenantId = this.getTenantId();

    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: {
          id: dto.academicYearId,
          tenantId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    this.validateDates(
      startDate,
      endDate,
      academicYear.startDate,
      academicYear.endDate,
    );

    const existing =
      await this.prisma.academicSemester.findFirst({
        where: {
          tenantId,
          academicYearId: dto.academicYearId,
          OR: [
            { number: dto.number },
            { name: dto.name },
          ],
        },
      });

    if (existing) {
      throw new ConflictException(
        'Semester number or name already exists in this academic year',
      );
    }

    /*
     * A semester cannot be active if
     * its academic year is inactive.
     */
    if (dto.isActive === true && !academicYear.isActive) {
      throw new BadRequestException(
        'Cannot activate a semester under an inactive academic year',
      );
    }

    /*
     * Only one active semester per academic year.
     */
    if (dto.isActive === true) {
      await this.prisma.academicSemester.updateMany({
        where: {
          tenantId,
          academicYearId: dto.academicYearId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    return this.prisma.academicSemester.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        name: dto.name,
        number: dto.number,
        startDate,
        endDate,
        isActive: dto.isActive ?? false,
      },
      include: {
        academicYear: true,
      },
    });
  }

  async findAll(
    academicYearId?: string,
    isActive?: boolean,
  ) {
    const tenantId = this.getTenantId();

    return this.prisma.academicSemester.findMany({
      where: {
        tenantId,
        ...(academicYearId && {
          academicYearId,
        }),
        ...(isActive !== undefined && {
          isActive,
        }),
      },
      include: {
        academicYear: true,
      },
      orderBy: [
        {
          academicYear: {
            startDate: 'desc',
          },
        },
        {
          number: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const semester =
      await this.prisma.academicSemester.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          academicYear: true,
        },
      });

    if (!semester) {
      throw new NotFoundException(
        'Academic semester not found',
      );
    }

    return semester;
  }

  async findActive() {
    const tenantId = this.getTenantId();

    const semester =
      await this.prisma.academicSemester.findFirst({
        where: {
          tenantId,
          isActive: true,
          academicYear: {
            isActive: true,
          },
        },
        include: {
          academicYear: true,
        },
      });

    if (!semester) {
      throw new NotFoundException(
        'No active academic semester found',
      );
    }

    return semester;
  }

  async update(
    id: string,
    dto: UpdateAcademicSemesterDto,
  ) {
    const tenantId = this.getTenantId();

    const semester =
      await this.prisma.academicSemester.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          academicYear: true,
        },
      });

    if (!semester) {
      throw new NotFoundException(
        'Academic semester not found',
      );
    }

    const name = dto.name ?? semester.name;
    const number = dto.number ?? semester.number;

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : semester.startDate;

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : semester.endDate;

    this.validateDates(
      startDate,
      endDate,
      semester.academicYear.startDate,
      semester.academicYear.endDate,
    );

    if (
      dto.name !== undefined ||
      dto.number !== undefined
    ) {
      const duplicate =
        await this.prisma.academicSemester.findFirst({
          where: {
            tenantId,
            academicYearId: semester.academicYearId,
            OR: [
              { name },
              { number },
            ],
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Semester number or name already exists in this academic year',
        );
      }
    }

    if (
      dto.isActive === true &&
      !semester.academicYear.isActive
    ) {
      throw new BadRequestException(
        'Cannot activate a semester under an inactive academic year',
      );
    }

    if (dto.isActive === true) {
      await this.prisma.academicSemester.updateMany({
        where: {
          tenantId,
          academicYearId: semester.academicYearId,
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

    return this.prisma.academicSemester.update({
      where: {
        id: semester.id,
      },
      data: {
        name,
        number,
        startDate,
        endDate,
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        academicYear: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const semester =
      await this.prisma.academicSemester.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!semester) {
      throw new NotFoundException(
        'Academic semester not found',
      );
    }

    await this.prisma.academicSemester.delete({
      where: {
        id: semester.id,
      },
    });

    return {
      message: 'Academic semester deleted successfully',
    };
  }
}