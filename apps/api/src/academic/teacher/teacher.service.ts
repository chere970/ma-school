import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateTeacherDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify department belongs to
     * the authenticated tenant.
     */
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

    /*
     * Employee number must be unique
     * inside the tenant.
     */
    const existingEmployee =
      await this.prisma.teacher.findFirst({
        where: {
          tenantId,
          employeeNumber: dto.employeeNumber,
        },
      });

    if (existingEmployee) {
      throw new ConflictException(
        'Employee number already exists',
      );
    }

    /*
     * Email is optional, but if supplied
     * it must be unique inside the tenant.
     */
    if (dto.email) {
      const existingEmail =
        await this.prisma.teacher.findFirst({
          where: {
            tenantId,
            email: dto.email,
          },
        });

      if (existingEmail) {
        throw new ConflictException(
          'Teacher email already exists',
        );
      }
    }

    return this.prisma.teacher.create({
      data: {
        tenantId,
        employeeNumber: dto.employeeNumber,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        specialization: dto.specialization,
        hireDate: dto.hireDate
          ? new Date(dto.hireDate)
          : undefined,
        departmentId: dto.departmentId,
      },
      include: {
        department: true,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.teacher.findMany({
      where: {
        tenantId,
      },
      include: {
        department: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const teacher =
      await this.prisma.teacher.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          department: true,
        },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    return teacher;
  }

  async update(
    id: string,
    dto: UpdateTeacherDto,
  ) {
    const tenantId = this.getTenantId();

    const teacher =
      await this.prisma.teacher.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    /*
     * Verify a new department belongs
     * to the same tenant.
     */
    if (dto.departmentId) {
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

    /*
     * Check employee number uniqueness.
     */
    if (dto.employeeNumber) {
      const duplicate =
        await this.prisma.teacher.findFirst({
          where: {
            tenantId,
            employeeNumber: dto.employeeNumber,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Employee number already exists',
        );
      }
    }

    /*
     * Check email uniqueness.
     */
    if (dto.email) {
      const duplicate =
        await this.prisma.teacher.findFirst({
          where: {
            tenantId,
            email: dto.email,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Teacher email already exists',
        );
      }
    }

    return this.prisma.teacher.update({
      where: {
        id: teacher.id,
      },
      data: {
        ...(dto.employeeNumber !== undefined && {
          employeeNumber: dto.employeeNumber,
        }),

        ...(dto.firstName !== undefined && {
          firstName: dto.firstName,
        }),

        ...(dto.middleName !== undefined && {
          middleName: dto.middleName,
        }),

        ...(dto.lastName !== undefined && {
          lastName: dto.lastName,
        }),

        ...(dto.email !== undefined && {
          email: dto.email,
        }),

        ...(dto.phone !== undefined && {
          phone: dto.phone,
        }),

        ...(dto.specialization !== undefined && {
          specialization: dto.specialization,
        }),

        ...(dto.hireDate !== undefined && {
          hireDate: new Date(dto.hireDate),
        }),

        ...(dto.departmentId !== undefined && {
          departmentId: dto.departmentId,
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        department: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const teacher =
      await this.prisma.teacher.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    await this.prisma.teacher.delete({
      where: {
        id: teacher.id,
      },
    });

    return {
      message: 'Teacher deleted successfully',
    };
  }
}