import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateProgramDto) {
    const tenantId = this.getTenantId();

    // Verify that the department belongs
    // to the authenticated tenant.
    const department =
      await this.prisma.department.findFirst({
        where: {
          id: dto.departmentId,
          tenantId,
        },
      });

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    const existing =
      await this.prisma.program.findFirst({
        where: {
          tenantId,
          OR: [
            { name: dto.name },
            { code: dto.code },
          ],
        },
      });

    if (existing) {
      throw new ConflictException(
        'Program name or code already exists',
      );
    }

    return this.prisma.program.create({
      data: {
        tenantId,
        departmentId: dto.departmentId,
        name: dto.name,
        code: dto.code,
        degree: dto.degree,
        durationYears: dto.durationYears,
        description: dto.description,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.program.findMany({
      where: {
        tenantId,
      },
      include: {
        department: {
          include: {
            campus: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const program =
      await this.prisma.program.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          department: {
            include: {
              campus: true,
            },
          },
        },
      });

    if (!program) {
      throw new NotFoundException(
        'Program not found',
      );
    }

    return program;
  }

  async update(
    id: string,
    dto: UpdateProgramDto,
  ) {
    const tenantId = this.getTenantId();

    const program =
      await this.prisma.program.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!program) {
      throw new NotFoundException(
        'Program not found',
      );
    }

    // If moving the program to another department,
    // verify that the new department belongs
    // to the same tenant.
    if (
      dto.departmentId &&
      dto.departmentId !== program.departmentId
    ) {
      const department =
        await this.prisma.department.findFirst({
          where: {
            id: dto.departmentId,
            tenantId,
          },
        });

      if (!department) {
        throw new NotFoundException(
          'Department not found',
        );
      }
    }

    const duplicate =
      await this.prisma.program.findFirst({
        where: {
          tenantId,
          OR: [
            ...(dto.name
              ? [{ name: dto.name }]
              : []),

            ...(dto.code
              ? [{ code: dto.code }]
              : []),
          ],
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new ConflictException(
        'Program name or code already exists',
      );
    }

    return this.prisma.program.update({
      where: {
        id,
      },
      data: {
        ...(dto.departmentId !== undefined && {
          departmentId: dto.departmentId,
        }),

        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.code !== undefined && {
          code: dto.code,
        }),

        ...(dto.degree !== undefined && {
          degree: dto.degree,
        }),

        ...(dto.durationYears !== undefined && {
          durationYears: dto.durationYears,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const program =
      await this.prisma.program.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!program) {
      throw new NotFoundException(
        'Program not found',
      );
    }

    await this.prisma.program.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Program deleted successfully',
    };
  }
}