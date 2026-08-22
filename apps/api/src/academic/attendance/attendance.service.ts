import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceStatus } from '../../../generated/prisma/enums';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateAttendanceDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify the student belongs to the tenant.
     */
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    /*
     * Verify the teaching assignment belongs to the tenant.
     */
    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: { id: dto.teachingAssignmentId, tenantId },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    /*
     * Prevent duplicate attendance for the same
     * student + assignment + date combination.
     */
    const existing = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        studentId: dto.studentId,
        teachingAssignmentId: dto.teachingAssignmentId,
        date: new Date(dto.date),
      },
    });

    if (existing) {
      throw new ConflictException(
        'Attendance record already exists for this student on the given date',
      );
    }

    return this.prisma.attendance.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        teachingAssignmentId: dto.teachingAssignmentId,
        date: new Date(dto.date),
        status: dto.status ?? AttendanceStatus.PRESENT,
        remarks: dto.remarks,
      },
      include: {
        student: true,
        teachingAssignment: {
          include: {
            teacher: true,
            course: true,
          },
        },
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();

    return this.prisma.attendance.findMany({
      where: { tenantId },
      include: {
        student: true,
        teachingAssignment: {
          include: {
            teacher: true,
            course: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const attendance =
      await this.prisma.attendance.findFirst({
        where: { id, tenantId },
        include: {
          student: true,
          teachingAssignment: {
            include: {
              teacher: true,
              course: true,
            },
          },
        },
      });

    if (!attendance) {
      throw new NotFoundException(
        'Attendance record not found',
      );
    }

    return attendance;
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    const tenantId = this.getTenantId();

    const attendance =
      await this.prisma.attendance.findFirst({
        where: { id, tenantId },
      });

    if (!attendance) {
      throw new NotFoundException(
        'Attendance record not found',
      );
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        ...(dto.remarks !== undefined && {
          remarks: dto.remarks,
        }),
      },
      include: {
        student: true,
        teachingAssignment: {
          include: {
            teacher: true,
            course: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const attendance =
      await this.prisma.attendance.findFirst({
        where: { id, tenantId },
      });

    if (!attendance) {
      throw new NotFoundException(
        'Attendance record not found',
      );
    }

    await this.prisma.attendance.delete({
      where: { id: attendance.id },
    });

    return {
      message: 'Attendance record deleted successfully',
    };
  }

  async bulkCreate(dto: BulkAttendanceDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify the teaching assignment belongs to the tenant.
     */
    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: { id: dto.teachingAssignmentId, tenantId },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    const date = new Date(dto.date);
    const studentIds = dto.records.map((r) => r.studentId);

    /*
     * Verify all students belong to the tenant
     * in a single query.
     */
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        tenantId,
      },
      select: { id: true },
    });

    const foundIds = new Set(students.map((s) => s.id));
    const missing = studentIds.filter(
      (id) => !foundIds.has(id),
    );

    if (missing.length > 0) {
      throw new NotFoundException(
        `Students not found: ${missing.join(', ')}`,
      );
    }

    /*
     * Find any pre-existing records for this
     * assignment + date to skip duplicates.
     */
    const existing = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        teachingAssignmentId: dto.teachingAssignmentId,
        date,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const existingIds = new Set(
      existing.map((e) => e.studentId),
    );

    const newRecords = dto.records.filter(
      (r) => !existingIds.has(r.studentId),
    );

    if (newRecords.length === 0) {
      return {
        message:
          'All attendance records already exist for the given date',
        created: 0,
        skipped: dto.records.length,
      };
    }

    await this.prisma.attendance.createMany({
      data: newRecords.map((r) => ({
        tenantId,
        studentId: r.studentId,
        teachingAssignmentId: dto.teachingAssignmentId,
        date,
        status: r.status ?? AttendanceStatus.PRESENT,
        remarks: r.remarks,
      })),
      skipDuplicates: true,
    });

    return {
      message: 'Bulk attendance recorded successfully',
      created: newRecords.length,
      skipped: dto.records.length - newRecords.length,
    };
  }
}
