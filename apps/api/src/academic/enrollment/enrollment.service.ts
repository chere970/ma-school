import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateEnrollmentDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify that the student belongs
     * to the authenticated tenant.
     */
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    /*
     * Verify that the course belongs
     * to the authenticated tenant.
     */
    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        tenantId,
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found',
      );
    }

    /*
     * Prevent the same student from
     * enrolling in the same course twice.
     */
    const existing =
      await this.prisma.enrollment.findFirst({
        where: {
          tenantId,
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Student is already enrolled in this course',
      );
    }

    return this.prisma.enrollment.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.enrollment.findMany({
      where: {
        tenantId,
      },
      include: {
        student: true,
        course: {
          include: {
            department: true,
            program: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const enrollment =
      await this.prisma.enrollment.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          student: true,
          course: {
            include: {
              department: true,
              program: true,
            },
          },
        },
      });

    if (!enrollment) {
      throw new NotFoundException(
        'Enrollment not found',
      );
    }

    return enrollment;
  }

  async update(
    id: string,
    dto: UpdateEnrollmentDto,
  ) {
    const tenantId = this.getTenantId();

    const enrollment =
      await this.prisma.enrollment.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!enrollment) {
      throw new NotFoundException(
        'Enrollment not found',
      );
    }

    return this.prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        status: dto.status,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const enrollment =
      await this.prisma.enrollment.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!enrollment) {
      throw new NotFoundException(
        'Enrollment not found',
      );
    }

    await this.prisma.enrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    return {
      message: 'Enrollment deleted successfully',
    };
  }
}