import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import { GradeStatus } from '../../../generated/prisma/enums';

import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { BulkGradeDto } from './dto/bulk-grade.dto';

// ─── Letter-grade configuration ──────────────────────────────────────────────

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

const PASS_THRESHOLD = 50;

function computeLetterGrade(percentage: number): {
  letter: string;
  point: number;
  passed: boolean;
} {
  const entry =
    GRADE_SCALE.find((g) => percentage >= g.min) ??
    GRADE_SCALE[GRADE_SCALE.length - 1];

  return {
    letter: entry.letter,
    point: entry.point,
    passed: percentage >= PASS_THRESHOLD,
  };
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface GradeFilters {
  assessmentId?: string;
  enrollmentId?: string;
  teachingAssignmentId?: string;
  status?: GradeStatus;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async resolveAssessmentAndEnrollment(
    tenantId: string,
    assessmentId: string,
    enrollmentId: string,
  ) {
    /*
     * Load assessment + its teaching assignment (with course).
     */
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
      include: {
        teachingAssignment: {
          include: { course: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (!assessment.isActive) {
      throw new BadRequestException(
        'Cannot grade an inactive assessment',
      );
    }

    /*
     * Load enrollment + its course.
     */
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { student: true, course: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    /*
     * Critical: the enrollment's course must match the
     * assessment's teaching assignment course.
     * This prevents grading students from the wrong course.
     */
    if (
      enrollment.courseId !==
      assessment.teachingAssignment.courseId
    ) {
      throw new BadRequestException(
        'Enrollment course does not match the assessment course',
      );
    }

    return { assessment, enrollment };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreateGradeDto) {
    const tenantId = this.getTenantId();

    const { assessment, enrollment } =
      await this.resolveAssessmentAndEnrollment(
        tenantId,
        dto.assessmentId,
        dto.enrollmentId,
      );

    /*
     * Score must not exceed maxScore.
     */
    if (dto.score > assessment.maxScore) {
      throw new BadRequestException(
        `Score ${dto.score} exceeds maximum score ${assessment.maxScore}`,
      );
    }

    /*
     * Prevent duplicate grade for the same
     * assessment + enrollment pair.
     */
    const existing = await this.prisma.grade.findFirst({
      where: {
        tenantId,
        assessmentId: dto.assessmentId,
        enrollmentId: dto.enrollmentId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A grade already exists for this student and assessment',
      );
    }

    return this.prisma.grade.create({
      data: {
        tenantId,
        assessmentId: dto.assessmentId,
        enrollmentId: dto.enrollmentId,
        score: dto.score,
        remarks: dto.remarks,
        status: GradeStatus.DRAFT,
      },
      include: {
        assessment: true,
        enrollment: {
          include: { student: true, course: true },
        },
      },
    });
  }

  async findAll(filters: GradeFilters = {}) {
    const tenantId = this.getTenantId();

    return this.prisma.grade.findMany({
      where: {
        tenantId,
        ...(filters.assessmentId && {
          assessmentId: filters.assessmentId,
        }),
        ...(filters.enrollmentId && {
          enrollmentId: filters.enrollmentId,
        }),
        ...(filters.status && { status: filters.status }),
        /*
         * Filter by teaching assignment via assessment relation.
         */
        ...(filters.teachingAssignmentId && {
          assessment: {
            teachingAssignmentId:
              filters.teachingAssignmentId,
          },
        }),
      },
      include: {
        assessment: true,
        enrollment: {
          include: { student: true, course: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const grade = await this.prisma.grade.findFirst({
      where: { id, tenantId },
      include: {
        assessment: true,
        enrollment: {
          include: { student: true, course: true },
        },
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  async update(id: string, dto: UpdateGradeDto) {
    const tenantId = this.getTenantId();

    const grade = await this.prisma.grade.findFirst({
      where: { id, tenantId },
      include: { assessment: true },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    /*
     * Finalized grades cannot be modified.
     */
    if (grade.status === GradeStatus.FINALIZED) {
      throw new ForbiddenException(
        'Finalized grades cannot be modified',
      );
    }

    /*
     * Validate score against maxScore if changing.
     */
    if (
      dto.score !== undefined &&
      dto.score > grade.assessment.maxScore
    ) {
      throw new BadRequestException(
        `Score ${dto.score} exceeds maximum score ${grade.assessment.maxScore}`,
      );
    }

    return this.prisma.grade.update({
      where: { id: grade.id },
      data: {
        ...(dto.score !== undefined && { score: dto.score }),
        ...(dto.remarks !== undefined && {
          remarks: dto.remarks,
        }),
        /*
         * Re-open to DRAFT if a published grade is being
         * corrected so it needs re-publishing.
         */
        ...(dto.score !== undefined &&
          grade.status === GradeStatus.PUBLISHED && {
            status: GradeStatus.DRAFT,
          }),
      },
      include: {
        assessment: true,
        enrollment: {
          include: { student: true, course: true },
        },
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const grade = await this.prisma.grade.findFirst({
      where: { id, tenantId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    if (grade.status !== GradeStatus.DRAFT) {
      throw new ForbiddenException(
        'Only DRAFT grades can be deleted',
      );
    }

    await this.prisma.grade.delete({
      where: { id: grade.id },
    });

    return { message: 'Grade deleted successfully' };
  }

  // ── Bulk grade entry ──────────────────────────────────────────────────────

  async bulkCreate(dto: BulkGradeDto) {
    const tenantId = this.getTenantId();

    /*
     * Load assessment once for the whole batch.
     */
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: dto.assessmentId, tenantId },
      include: {
        teachingAssignment: {
          include: { course: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (!assessment.isActive) {
      throw new BadRequestException(
        'Cannot grade an inactive assessment',
      );
    }

    const enrollmentIds = dto.grades.map((g) => g.enrollmentId);

    /*
     * Load all referenced enrollments in one query.
     */
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        tenantId,
      },
      select: {
        id: true,
        courseId: true,
        studentId: true,
      },
    });

    const enrollmentMap = new Map(
      enrollments.map((e) => [e.id, e]),
    );

    /*
     * Find which enrollments are already graded
     * for this assessment.
     */
    const existingGrades = await this.prisma.grade.findMany({
      where: {
        tenantId,
        assessmentId: dto.assessmentId,
        enrollmentId: { in: enrollmentIds },
      },
      select: { enrollmentId: true },
    });

    const alreadyGraded = new Set(
      existingGrades.map((g) => g.enrollmentId),
    );

    /*
     * Validate every item before touching the DB.
     * Collect errors so we can report them all at once.
     */
    const errors: string[] = [];

    for (const item of dto.grades) {
      const enrollment = enrollmentMap.get(item.enrollmentId);

      if (!enrollment) {
        errors.push(
          `Enrollment ${item.enrollmentId} not found`,
        );
        continue;
      }

      if (
        enrollment.courseId !==
        assessment.teachingAssignment.courseId
      ) {
        errors.push(
          `Enrollment ${item.enrollmentId} does not belong to the assessment's course`,
        );
      }

      if (item.score > assessment.maxScore) {
        errors.push(
          `Score ${item.score} for enrollment ${item.enrollmentId} exceeds maxScore ${assessment.maxScore}`,
        );
      }

      if (alreadyGraded.has(item.enrollmentId)) {
        errors.push(
          `Grade already exists for enrollment ${item.enrollmentId}`,
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    /*
     * All items are valid — create atomically.
     */
    const created = await this.prisma.$transaction(
      dto.grades.map((item) =>
        this.prisma.grade.create({
          data: {
            tenantId,
            assessmentId: dto.assessmentId,
            enrollmentId: item.enrollmentId,
            score: item.score,
            remarks: item.remarks,
            status: GradeStatus.DRAFT,
          },
        }),
      ),
    );

    return {
      message: 'Bulk grades created successfully',
      count: created.length,
    };
  }

  // ── Lifecycle: publish / finalize ─────────────────────────────────────────

  /**
   * Transitions all DRAFT grades for an assessment
   * to PUBLISHED status.
   *
   * Requires:
   * - Total active assessment weights == 100% (validated here).
   */
  async publishGrades(assessmentId: string) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    /*
     * Validate weight structure before publishing.
     */
    const activeAssessments =
      await this.prisma.assessment.findMany({
        where: {
          tenantId,
          teachingAssignmentId:
            assessment.teachingAssignmentId,
          isActive: true,
        },
        select: { weight: true },
      });

    const totalWeight = activeAssessments.reduce(
      (sum, a) => sum + a.weight,
      0,
    );

    if (Math.abs(totalWeight - 100) >= 0.001) {
      throw new BadRequestException(
        `Cannot publish grades: total active assessment weight is ${totalWeight.toFixed(2)}% (must equal 100%)`,
      );
    }

    const result = await this.prisma.grade.updateMany({
      where: {
        tenantId,
        assessmentId,
        status: GradeStatus.DRAFT,
      },
      data: { status: GradeStatus.PUBLISHED },
    });

    return {
      message: `${result.count} grade(s) published`,
      count: result.count,
    };
  }

  /**
   * Transitions all PUBLISHED grades for an assessment
   * to FINALIZED status. This is irreversible.
   */
  async finalizeGrades(assessmentId: string) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    /*
     * Ensure there are no remaining DRAFT grades — they
     * must be published or deleted before finalization.
     */
    const draftCount = await this.prisma.grade.count({
      where: {
        tenantId,
        assessmentId,
        status: GradeStatus.DRAFT,
      },
    });

    if (draftCount > 0) {
      throw new BadRequestException(
        `Cannot finalize: ${draftCount} DRAFT grade(s) still exist for this assessment. Publish them first.`,
      );
    }

    const result = await this.prisma.grade.updateMany({
      where: {
        tenantId,
        assessmentId,
        status: GradeStatus.PUBLISHED,
      },
      data: { status: GradeStatus.FINALIZED },
    });

    return {
      message: `${result.count} grade(s) finalized`,
      count: result.count,
    };
  }

  // ── Weighted course result calculation ────────────────────────────────────

  /**
   * Calculates the weighted course result for a student's
   * enrollment from all published/finalized grades.
   *
   * percentage = (score / maxScore) * 100
   * weightedContribution = percentage * (weight / 100)
   * totalCourseScore = Σ weightedContribution
   */
  async getCourseResult(enrollmentId: string) {
    const tenantId = this.getTenantId();

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: {
        student: true,
        course: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    /*
     * Load all published/finalized grades for this enrollment.
     */
    const grades = await this.prisma.grade.findMany({
      where: {
        tenantId,
        enrollmentId,
        status: {
          in: [GradeStatus.PUBLISHED, GradeStatus.FINALIZED],
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            weight: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    /*
     * Only count grades from active assessments.
     */
    const activeGrades = grades.filter(
      (g) => g.assessment.isActive,
    );

    const gradeBreakdown = activeGrades.map((g) => {
      const percentage = (g.score / g.assessment.maxScore) * 100;
      const weightedContribution =
        percentage * (g.assessment.weight / 100);

      return {
        assessmentId: g.assessment.id,
        assessmentTitle: g.assessment.title,
        assessmentType: g.assessment.type,
        score: g.score,
        maxScore: g.assessment.maxScore,
        weight: g.assessment.weight,
        percentage: Math.round(percentage * 100) / 100,
        weightedContribution:
          Math.round(weightedContribution * 100) / 100,
        status: g.status,
      };
    });

    const totalWeightCovered = activeGrades.reduce(
      (sum, g) => sum + g.assessment.weight,
      0,
    );

    const totalCourseScore = gradeBreakdown.reduce(
      (sum, g) => sum + g.weightedContribution,
      0,
    );

    const roundedScore = Math.round(totalCourseScore * 100) / 100;

    const { letter, point, passed } =
      computeLetterGrade(roundedScore);

    return {
      enrollment: {
        id: enrollment.id,
        student: {
          id: enrollment.student.id,
          studentNumber: enrollment.student.studentNumber,
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
        },
        course: {
          id: enrollment.course.id,
          code: enrollment.course.code,
          name: enrollment.course.name,
        },
        status: enrollment.status,
      },
      gradeBreakdown,
      totalWeightCovered:
        Math.round(totalWeightCovered * 100) / 100,
      totalCourseScore: roundedScore,
      letterGrade: letter,
      gradePoint: point,
      passed,
      note:
        totalWeightCovered < 100
          ? `Result based on ${totalWeightCovered.toFixed(1)}% of total weight. Final result may change.`
          : undefined,
    };
  }

  /**
   * Returns all published/finalized grades for an enrollment.
   * Intended for student self-service viewing.
   */
  async getStudentGrades(enrollmentId: string) {
    const tenantId = this.getTenantId();

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.grade.findMany({
      where: {
        tenantId,
        enrollmentId,
        status: {
          in: [GradeStatus.PUBLISHED, GradeStatus.FINALIZED],
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            weight: true,
            assessmentDate: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
