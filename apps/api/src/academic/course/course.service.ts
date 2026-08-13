import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateCourseDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify the department belongs
     * to the authenticated tenant.
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
     * Verify the program belongs
     * to the same tenant AND department.
     *
     * This is important.
     */
    const program =
      await this.prisma.program.findFirst({
        where: {
          id: dto.programId,
          tenantId,
          departmentId: dto.departmentId,
        },
      });

    if (!program) {
      throw new NotFoundException(
        'Program not found or does not belong to the specified department',
      );
    }

    /*
     * Prevent duplicate course name/code
     * inside the tenant.
     */
    const existing =
      await this.prisma.course.findFirst({
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
        'Course name or code already exists',
      );
    }

    return this.prisma.course.create({
      data: {
        tenantId,
        departmentId: dto.departmentId,
        programId: dto.programId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        creditHours: dto.creditHours,
        semester: dto.semester,
        yearLevel: dto.yearLevel,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.course.findMany({
      where: {
        tenantId,
      },
      include: {
        department: true,
        program: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const course =
      await this.prisma.course.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          department: true,
          program: true,
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Course not found',
      );
    }

    return course;
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
  ) {
    const tenantId = this.getTenantId();

    const course =
      await this.prisma.course.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Course not found',
      );
    }

    const departmentId =
      dto.departmentId ?? course.departmentId;

    const programId =
      dto.programId ?? course.programId?? undefined;

    /*
     * Always verify the resulting
     * department/program relationship.
     */
    const department =
      await this.prisma.department.findFirst({
        where: {
          id: departmentId,
          tenantId,
        },
      });

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    const program =
      await this.prisma.program.findFirst({
        where: {
          id: programId,
          tenantId,
          departmentId,
        },
      });

    if (!program) {
      throw new NotFoundException(
        'Program not found or does not belong to the specified department',
      );
    }

    const duplicate =
      await this.prisma.course.findFirst({
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
        'Course name or code already exists',
      );
    }

    return this.prisma.course.update({
      where: {
        id,
      },
      data: {
        departmentId,
        programId,

        ...(dto.code !== undefined && {
          code: dto.code,
        }),

        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.creditHours !== undefined && {
          creditHours: dto.creditHours,
        }),

        ...(dto.semester !== undefined && {
          semester: dto.semester,
        }),

        ...(dto.yearLevel !== undefined && {
          yearLevel: dto.yearLevel,
        }),
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const course =
      await this.prisma.course.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Course not found',
      );
    }

    await this.prisma.course.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Course deleted successfully',
    };
  }
}