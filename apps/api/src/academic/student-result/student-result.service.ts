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

// ─── Grading scale ───────────────────────────────────────────────────────────
//
// This scale is intentionally aligned with GradeService so both modules
// produce consistent letter grades from the same percentage.
//
// | Percentage | Letter | GPA  |
// |-----------|--------|------|
// | >= 90     | A      | 4.0  |
// | >= 85     | B+     | 3.5  |
// | >= 80     | B      | 3.0  |
// | >= 75     | C+     | 2.5  |
// | >= 70     | C      | 2.0  |
// | >= 60     | D      | 1.0  |
// | <  60     | F      | 0.0  |

const GRADE_SCALE: Array<{
  min: number;
  letter: string;
  point: number;
}> = [
  { min: 90, letter: 'A', point: 4.0 },
  { min: 85, letter: 'B+', point: 3.5 },
  { min: 80, letter: 'B', point: 3.0 },
  { min: 75, letter: 'C+', point: 2.5 },
  { min: 70, letter: 'C', point: 2.0 },
  { min: 60, letter: 'D', point: 1.0 },
  { min: 0, letter: 'F', point: 0.0 },
];

function calculateGrade(percentage: number): {
  grade: string;
  gradePoint: number;
} {
  const entry =
    GRADE_SCALE.find((g) => percentage >= g.min) ??
    GRADE_SCALE[GRADE_SCALE.length - 1];
  return { grade: entry.letter, gradePoint: entry.point };
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface StudentResultFilters {
  assessmentId?: string;
  studentId?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class StudentResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(dto: CreateStudentResultDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify the assessment belongs to this tenant.
     * Include teachingAssignment so we know the courseId
     * for enrollment validation without an extra query.
     */
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

    /*
     * Guard against a degenerate maxScore that would cause
     * division by zero.  The Assessment DTO enforces >= 0.01,
     * but a corrupt direct-DB record must not panic here.
     */
    if (assessment.maxScore <= 0) {
      throw new BadRequestException(
        'Assessment maxScore must be greater than zero',
      );
    }

    /*
     * Verify the student belongs to this tenant.
     */
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    /*
     * Verify the student is enrolled in the course
     * that this assessment belongs to.
     */
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

    /*
     * Score must be within [0, maxScore].
     */
    if (dto.score < 0 || dto.score > assessment.maxScore) {
      throw new BadRequestException(
        `Score must be between 0 and the assessment maximum score (${assessment.maxScore})`,
      );
    }

    /*
     * Prevent duplicate result for the same
     * assessment + student pair.
     */
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
    const { grade, gradePoint } = calculateGrade(percentage);

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
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
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

  // ── FindAll ───────────────────────────────────────────────────────────────

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
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
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

  // ── FindOne ───────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const studentResult = await this.prisma.studentResult.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
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

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateStudentResultDto) {
    const tenantId = this.getTenantId();

    /*
     * Reject empty-body updates immediately.
     * A PATCH with no fields would be a silent no-op.
     */
    if (dto.score === undefined && dto.remark === undefined) {
      throw new BadRequestException(
        'At least one field (score or remark) must be provided',
      );
    }

    const studentResult = await this.prisma.studentResult.findFirst({
      where: { id, tenantId },
    });

    if (!studentResult) {
      throw new NotFoundException('Student result not found');
    }

    /*
     * Grade / gradePoint recalculation only when score changes.
     * If only remark changes, existing grade/gradePoint are
     * preserved — they are NOT written to the update payload.
     */
    let updatedGrade: string | undefined;
    let updatedGradePoint: number | undefined;

    if (dto.score !== undefined) {
      const assessment = await this.prisma.assessment.findFirst({
        where: { id: studentResult.assessmentId, tenantId },
      });

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      /*
       * Guard against degenerate maxScore.
       */
      if (assessment.maxScore <= 0) {
        throw new BadRequestException(
          'Assessment maxScore must be greater than zero',
        );
      }

      if (dto.score < 0 || dto.score > assessment.maxScore) {
        throw new BadRequestException(
          `Score must be between 0 and the assessment maximum score (${assessment.maxScore})`,
        );
      }

      const percentage = (dto.score / assessment.maxScore) * 100;
      const calculated = calculateGrade(percentage);
      updatedGrade = calculated.grade;
      updatedGradePoint = calculated.gradePoint;
    }

    return this.prisma.studentResult.update({
      where: { id: studentResult.id },
      data: {
        /*
         * When score changes: write new score, grade, and gradePoint.
         * When only remark changes: the score/grade/gradePoint block
         * is entirely omitted from the update, preserving existing values.
         */
        ...(dto.score !== undefined && {
          score: dto.score,
          grade: updatedGrade,
          gradePoint: updatedGradePoint,
        }),
        ...(dto.remark !== undefined && { remark: dto.remark }),
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
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

  // ── Remove ────────────────────────────────────────────────────────────────

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
