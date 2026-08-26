import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateStudentResultDto } from './dto/create-student-result.dto';
import { UpdateStudentResultDto } from './dto/update-student-result.dto';

export interface StudentResultFilters {
  assessmentId?: string;
  studentId?: string;
}

@Injectable()
export class StudentResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  private calculateGrade(percentage: number): {
    grade: string;
    gradePoint: number;
  } {
    if (percentage >= 90) return { grade: 'A+', gradePoint: 4.0 };
    if (percentage >= 85) return { grade: 'A', gradePoint: 4.0 };
    if (percentage >= 80) return { grade: 'A-', gradePoint: 3.75 };
    if (percentage >= 75) return { grade: 'B+', gradePoint: 3.5 };
    if (percentage >= 70) return { grade: 'B', gradePoint: 3.0 };
    if (percentage >= 65) return { grade: 'B-', gradePoint: 2.75 };
    if (percentage >= 60) return { grade: 'C+', gradePoint: 2.5 };
    if (percentage >= 50) return { grade: 'C', gradePoint: 2.0 };
    if (percentage >= 45) return { grade: 'C-', gradePoint: 1.75 };
    if (percentage >= 40) return { grade: 'D', gradePoint: 1.0 };
    return { grade: 'F', gradePoint: 0.0 };
  }

  async create(dto: CreateStudentResultDto) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: {
        id: dto.assessmentId,
        tenantId,
      },
      include: {
        teachingAssignment: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        tenantId,
        studentId: dto.studentId,
        courseId: assessment.teachingAssignment.courseId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled in the assessment course',
      );
    }

    if (dto.score < 0 || dto.score > assessment.maxScore) {
      throw new BadRequestException(
        'Score must be between 0 and the assessment maximum score',
      );
    }

    const existingResult = await this.prisma.studentResult.findFirst({
      where: {
        tenantId,
        assessmentId: dto.assessmentId,
        studentId: dto.studentId,
      },
    });

    if (existingResult) {
      throw new ConflictException(
        'Student result already exists for this assessment',
      );
    }

    const percentage = (dto.score / assessment.maxScore) * 100;
    const { grade, gradePoint } = this.calculateGrade(percentage);

    return this.prisma.studentResult.create({
      data: {
        tenantId,
        assessmentId: dto.assessmentId,
        studentId: dto.studentId,
        score: dto.score,
        grade,
        gradePoint,
        remark: dto.remark,
      },
      include: {
        student: true,
        assessment: {
          include: {
            teachingAssignment: {
              include: { course: true },
            },
          },
        },
      },
    });
  }

  async findAll(filters: StudentResultFilters = {}) {
    const tenantId = this.getTenantId();

    return this.prisma.studentResult.findMany({
      where: {
        tenantId,
        ...(filters.assessmentId && {
          assessmentId: filters.assessmentId,
        }),
        ...(filters.studentId && {
          studentId: filters.studentId,
        }),
      },
      include: {
        student: true,
        assessment: {
          include: {
            teachingAssignment: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const studentResult = await this.prisma.studentResult.findFirst({
      where: { id, tenantId },
      include: {
        student: true,
        assessment: {
          include: {
            teachingAssignment: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!studentResult) {
      throw new NotFoundException('Student result not found');
    }

    return studentResult;
  }

  async update(id: string, dto: UpdateStudentResultDto) {
    const tenantId = this.getTenantId();

    const studentResult = await this.prisma.studentResult.findFirst({
      where: { id, tenantId },
    });

    if (!studentResult) {
      throw new NotFoundException('Student result not found');
    }

    let grade = studentResult.grade;
    let gradePoint = studentResult.gradePoint
      ? Number(studentResult.gradePoint)
      : null;

    if (dto.score !== undefined) {
      const assessment = await this.prisma.assessment.findFirst({
        where: { id: studentResult.assessmentId, tenantId },
      });

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      if (dto.score < 0 || dto.score > assessment.maxScore) {
        throw new BadRequestException(
          'Score must be between 0 and the assessment maximum score',
        );
      }

      const percentage = (dto.score / assessment.maxScore) * 100;
      const calculated = this.calculateGrade(percentage);
      grade = calculated.grade;
      gradePoint = calculated.gradePoint;
    }

    return this.prisma.studentResult.update({
      where: { id: studentResult.id },
      data: {
        ...(dto.score !== undefined && {
          score: dto.score,
          grade,
          gradePoint,
        }),
        ...(dto.remark !== undefined && { remark: dto.remark }),
      },
      include: {
        student: true,
        assessment: {
          include: {
            teachingAssignment: {
              include: { course: true },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const studentResult = await this.prisma.studentResult.findFirst({
      where: { id, tenantId },
    });

    if (!studentResult) {
      throw new NotFoundException('Student result not found');
    }

    await this.prisma.studentResult.delete({
      where: { id: studentResult.id },
    });

    return { message: 'Student result deleted successfully' };
  }
}
