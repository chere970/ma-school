import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';

@Injectable()
export class TeachingAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateTeachingAssignmentDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify that the teacher belongs
     * to the authenticated tenant.
     */
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: dto.teacherId,
        tenantId,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
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
     * Prevent duplicate teacher/course assignments.
     */
    const existing =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          tenantId,
          teacherId: dto.teacherId,
          courseId: dto.courseId,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Teacher is already assigned to this course',
      );
    }

    return this.prisma.teachingAssignment.create({
      data: {
        tenantId,
        teacherId: dto.teacherId,
        courseId: dto.courseId,
      },
      include: {
        teacher: {
          include: {
            department: true,
          },
        },
        course: {
          include: {
            department: true,
            program: true,
          },
        },
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.teachingAssignment.findMany({
      where: {
        tenantId,
      },
      include: {
        teacher: {
          include: {
            department: true,
          },
        },
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

    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          teacher: {
            include: {
              department: true,
            },
          },
          course: {
            include: {
              department: true,
              program: true,
            },
          },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    return assignment;
  }

  async update(
    id: string,
    dto: UpdateTeachingAssignmentDto,
  ) {
    const tenantId = this.getTenantId();

    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    return this.prisma.teachingAssignment.update({
      where: {
        id: assignment.id,
      },
      data: {
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        teacher: true,
        course: true,
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    await this.prisma.teachingAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return {
      message:
        'Teaching assignment deleted successfully',
    };
  }
}