import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateStudentDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify that the program belongs
     * to the authenticated tenant.
     */
    const program = await this.prisma.program.findFirst({
      where: {
        id: dto.programId,
        tenantId,
      },
    });

    if (!program) {
      throw new NotFoundException(
        'Program not found',
      );
    }

    /*
     * Student number must be unique
     * inside the tenant.
     */
    const existingStudentNumber =
      await this.prisma.student.findFirst({
        where: {
          tenantId,
          studentNumber: dto.studentNumber,
        },
      });

    if (existingStudentNumber) {
      throw new ConflictException(
        'Student number already exists',
      );
    }

    /*
     * Email is optional, but if provided,
     * it must be unique inside the tenant.
     */
    if (dto.email) {
      const existingEmail =
        await this.prisma.student.findFirst({
          where: {
            tenantId,
            email: dto.email,
          },
        });

      if (existingEmail) {
        throw new ConflictException(
          'Student email already exists',
        );
      }
    }

    return this.prisma.student.create({
      data: {
        tenantId,
        studentNumber: dto.studentNumber,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : undefined,
        gender: dto.gender,
        admissionYear: dto.admissionYear,
        yearLevel: dto.yearLevel,
        programId: dto.programId,
      },
      include: {
        program: true,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.student.findMany({
      where: {
        tenantId,
      },
      include: {
        program: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const student =
      await this.prisma.student.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          program: true,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    return student;
  }

  async update(
    id: string,
    dto: UpdateStudentDto,
  ) {
    const tenantId = this.getTenantId();

    const student =
      await this.prisma.student.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    /*
     * If programId is being changed,
     * verify the new program belongs
     * to the same tenant.
     */
    if (dto.programId) {
      const program =
        await this.prisma.program.findFirst({
          where: {
            id: dto.programId,
            tenantId,
          },
        });

      if (!program) {
        throw new NotFoundException(
          'Program not found',
        );
      }
    }

    /*
     * Check student number uniqueness.
     */
    if (dto.studentNumber) {
      const duplicate =
        await this.prisma.student.findFirst({
          where: {
            tenantId,
            studentNumber: dto.studentNumber,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Student number already exists',
        );
      }
    }

    /*
     * Check email uniqueness.
     */
    if (dto.email) {
      const duplicate =
        await this.prisma.student.findFirst({
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
          'Student email already exists',
        );
      }
    }

    return this.prisma.student.update({
      where: {
        id: student.id,
      },
      data: {
        ...(dto.studentNumber !== undefined && {
          studentNumber: dto.studentNumber,
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

        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: new Date(dto.dateOfBirth),
        }),

        ...(dto.gender !== undefined && {
          gender: dto.gender,
        }),

        ...(dto.admissionYear !== undefined && {
          admissionYear: dto.admissionYear,
        }),

        ...(dto.yearLevel !== undefined && {
          yearLevel: dto.yearLevel,
        }),

        ...(dto.programId !== undefined && {
          programId: dto.programId,
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        program: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const student =
      await this.prisma.student.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    await this.prisma.student.delete({
      where: {
        id: student.id,
      },
    });

    return {
      message: 'Student deleted successfully',
    };
  }
}