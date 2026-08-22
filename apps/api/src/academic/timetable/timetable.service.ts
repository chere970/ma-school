import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time
      .split(':')
      .map(Number);

    return hours * 60 + minutes;
  }

  private validateTimeRange(
    startTime: string,
    endTime: string,
  ) {
    if (
      this.timeToMinutes(startTime) >=
      this.timeToMinutes(endTime)
    ) {
      throw new ConflictException(
        'Start time must be before end time',
      );
    }
  }

  private hasOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    const start1 = this.timeToMinutes(startA);
    const end1 = this.timeToMinutes(endA);

    const start2 = this.timeToMinutes(startB);
    const end2 = this.timeToMinutes(endB);

    return start1 < end2 && start2 < end1;
  }

  async create(dto: CreateTimetableDto) {
    const tenantId = this.getTenantId();

    this.validateTimeRange(
      dto.startTime,
      dto.endTime,
    );

    /*
     * Verify TeachingAssignment belongs
     * to the authenticated tenant.
     */
    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id: dto.teachingAssignmentId,
          tenantId,
        },
        include: {
          teacher: true,
          course: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    /*
     * Verify Room belongs to the same tenant.
     */
    const room = await this.prisma.room.findFirst({
      where: {
        id: dto.roomId,
        tenantId,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found',
      );
    }

    /*
     * Find schedules on the same day.
     */
    // const existing =
    //   await this.prisma.timetable.findMany({
    //     where: {
    //       tenantId,
    //       dayOfWeek: dto.dayOfWeek,
    //       isActive: true,
    //     },
    //     include: {
    //       teachingAssignment: {
    //         include: {
    //           teacher: true,
    //           course: true,
    //         },
    //       },
    //     },
    //   });
    const existing =
  await this.prisma.timetable.findMany({
    where: {
      tenantId,
      dayOfWeek:dto.dayOfWeek,
      isActive: true,
      
    },
    include: {
      teachingAssignment: true,
    },
  });

    /*
     * Teacher conflict.
     */
    const teacherConflict = existing.find(
  (entry) =>
    entry.teachingAssignment.teacherId ===
      assignment.teacherId &&
    this.hasOverlap(
      dto.startTime,
      dto.endTime,
      entry.startTime,
      entry.endTime,
    ),
);

if (teacherConflict) {
  throw new ConflictException(
    'Teacher already has a class during this time',
  );
}

const courseConflict = existing.find(
  (entry) =>
    entry.teachingAssignment.courseId ===
      assignment.courseId &&
    this.hasOverlap(
      dto.startTime,
      dto.endTime,
      entry.startTime,
      entry.endTime,
    ),
);

if (courseConflict) {
  throw new ConflictException(
    'Course already has a class during this time',
  );
}

    /*
     * Room conflict.
     */
    const roomConflict = existing.find(
      (entry) =>
        entry.roomId === dto.roomId &&
        this.hasOverlap(
          dto.startTime,
          dto.endTime,
          entry.startTime,
          entry.endTime,
        ),
    );

    if (roomConflict) {
      throw new ConflictException(
        'Room is already occupied during this time',
      );
    }

    return this.prisma.timetable.create({
      data: {
        tenantId,
        teachingAssignmentId:
          dto.teachingAssignmentId,
        roomId: dto.roomId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      include: {
        room: true,
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

    return this.prisma.timetable.findMany({
      where: {
        tenantId,
      },
      include: {
        room: true,
        teachingAssignment: {
          include: {
            teacher: true,
            course: true,
          },
        },
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const timetable =
      await this.prisma.timetable.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          room: true,
          teachingAssignment: {
            include: {
              teacher: true,
              course: true,
            },
          },
        },
      });

    if (!timetable) {
      throw new NotFoundException(
        'Timetable entry not found',
      );
    }

    return timetable;
  }

  async update(
    id: string,
    dto: UpdateTimetableDto,
  ) {
    const tenantId = this.getTenantId();

    const timetable =
      await this.prisma.timetable.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!timetable) {
      throw new NotFoundException(
        'Timetable entry not found',
      );
    }

    const teachingAssignmentId =
      dto.teachingAssignmentId ??
      timetable.teachingAssignmentId;

    const roomId =
      dto.roomId ?? timetable.roomId;

    const dayOfWeek =
      dto.dayOfWeek ?? timetable.dayOfWeek;

    const startTime =
      dto.startTime ?? timetable.startTime;

    const endTime =
      dto.endTime ?? timetable.endTime;

    this.validateTimeRange(
      startTime,
      endTime,
    );

    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id: teachingAssignmentId,
          tenantId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        tenantId,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found',
      );
    }

    const existing =
      await this.prisma.timetable.findMany({
        where: {
          tenantId,
          dayOfWeek,
          isActive: true,
          NOT: {
            id,
          },
        },
      });

    const teacherConflict = existing.find(
      (entry) =>
        entry.teachingAssignmentId ===
          teachingAssignmentId &&
        this.hasOverlap(
          startTime,
          endTime,
          entry.startTime,
          entry.endTime,
        ),
    );

    /*
     * Because TeachingAssignment already
     * represents Teacher + Course, we need
     * the assignment records to compare
     * their actual teacher/course.
     */
    if (teacherConflict) {
      const conflictAssignment =
        await this.prisma.teachingAssignment.findUnique({
          where: {
            id: teacherConflict.teachingAssignmentId,
          },
        });

      if (
        conflictAssignment?.teacherId ===
        assignment.teacherId
      ) {
        throw new ConflictException(
          'Teacher already has a class during this time',
        );
      }

      if (
        conflictAssignment?.courseId ===
        assignment.courseId
      ) {
        throw new ConflictException(
          'Course already has a class during this time',
        );
      }
    }

    const roomConflict = existing.find(
      (entry) =>
        entry.roomId === roomId &&
        this.hasOverlap(
          startTime,
          endTime,
          entry.startTime,
          entry.endTime,
        ),
    );

    if (roomConflict) {
      throw new ConflictException(
        'Room is already occupied during this time',
      );
    }

    return this.prisma.timetable.update({
      where: {
        id: timetable.id,
      },
      data: {
        teachingAssignmentId,
        roomId,
        dayOfWeek,
        startTime,
        endTime,
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        room: true,
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

    const timetable =
      await this.prisma.timetable.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!timetable) {
      throw new NotFoundException(
        'Timetable entry not found',
      );
    }

    await this.prisma.timetable.delete({
      where: {
        id: timetable.id,
      },
    });

    return {
      message:
        'Timetable entry deleted successfully',
    };
  }
}