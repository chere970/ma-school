import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import {
  computeLetterGrade,
  decimalToNumber,
  safePercent,
  PASS_THRESHOLD,
} from '../common/grading.util';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentResultRow {
  assessmentId: string;
  title: string;
  type: string;
  maxScore: number;
  weight: number;
  assessmentDate: Date | null;
  score: number | null;        // null when no StudentResult exists
  percentage: number | null;
  grade: string | null;
  gradePoint: number | null;
}

export interface CourseBlock {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  semester: number | null;
  yearLevel: number | null;
  enrollmentId: string;
  enrollmentStatus: string;
  assessments: AssessmentResultRow[];
  /** Weighted final score — only set when weights sum to ~100 and all assessments have results */
  finalScore: number | null;
  finalGrade: string | null;
  finalGradePoint: number | null;
  passed: boolean | null;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface StudentReportFilters {
  semester?: number;
  yearLevel?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ResultReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  // ── Endpoint 1: Student academic summary ─────────────────────────────────

  async getStudentReport(
    studentId: string,
    filters: StudentReportFilters = {},
  ) {
    const tenantId = this.getTenantId();

    /*
     * Verify student belongs to this tenant.
     */
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        admissionYear: true,
        yearLevel: true,
        isActive: true,
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            degree: true,
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    /*
     * Load all enrollments for this student, optionally filtered by
     * semester / yearLevel (course-level fields).
     */
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        tenantId,
        studentId,
        ...(filters.semester !== undefined ||
        filters.yearLevel !== undefined
          ? {
              course: {
                ...(filters.semester !== undefined && {
                  semester: filters.semester,
                }),
                ...(filters.yearLevel !== undefined && {
                  yearLevel: filters.yearLevel,
                }),
              },
            }
          : {}),
      },
      select: {
        id: true,
        status: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            creditHours: true,
            semester: true,
            yearLevel: true,
          },
        },
      },
      orderBy: [{ course: { yearLevel: 'asc' } }, { course: { semester: 'asc' } }],
    });

    const courseBlocks = await this.buildCourseBlocks(
      tenantId,
      studentId,
      enrollments,
    );

    const summary = this.computeStudentSummary(courseBlocks, enrollments);

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        admissionYear: student.admissionYear,
        yearLevel: student.yearLevel,
        isActive: student.isActive,
        program: student.program,
        department: student.program?.department ?? null,
      },
      summary,
      courses: courseBlocks,
    };
  }

  // ── Endpoint 2: Transcript ────────────────────────────────────────────────

  async getStudentTranscript(studentId: string) {
    const tenantId = this.getTenantId();

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        admissionYear: true,
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            degree: true,
            durationYears: true,
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { tenantId, studentId },
      select: {
        id: true,
        status: true,
        enrollmentDate: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            creditHours: true,
            semester: true,
            yearLevel: true,
          },
        },
      },
      orderBy: [
        { course: { yearLevel: 'asc' } },
        { course: { semester: 'asc' } },
      ],
    });

    const courseBlocks = await this.buildCourseBlocks(
      tenantId,
      studentId,
      enrollments,
    );

    const summary = this.computeStudentSummary(courseBlocks, enrollments);

    /*
     * Transcript rows — one per enrolled course.
     */
    const courses = courseBlocks.map((cb) => ({
      courseId: cb.id,
      code: cb.code,
      name: cb.name,
      creditHours: cb.creditHours,
      semester: cb.semester,
      yearLevel: cb.yearLevel,
      enrollmentStatus: cb.enrollmentStatus,
      finalScore: cb.finalScore,
      finalGrade: cb.finalGrade,
      finalGradePoint: cb.finalGradePoint,
      passed: cb.passed,
    }));

    return {
      student: {
        studentNumber: student.studentNumber,
        fullName: [student.firstName, student.middleName, student.lastName]
          .filter(Boolean)
          .join(' '),
        program: student.program,
        department: student.program?.department ?? null,
        admissionYear: student.admissionYear,
      },
      summary: {
        totalCredits: summary.totalCredits,
        attemptedCredits: summary.totalCredits,
        earnedCredits: summary.earnedCredits,
        cumulativeGPA: summary.cumulativeGPA,
      },
      courses,
    };
  }

  // ── Endpoint 3: Course report ─────────────────────────────────────────────

  async getCourseReport(courseId: string) {
    const tenantId = this.getTenantId();

    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      select: {
        id: true,
        code: true,
        name: true,
        creditHours: true,
        semester: true,
        yearLevel: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    /*
     * Load all enrollments for this course with student info.
     * One query — no N+1.
     */
    const enrollments = await this.prisma.enrollment.findMany({
      where: { tenantId, courseId },
      select: {
        id: true,
        status: true,
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
      orderBy: { student: { studentNumber: 'asc' } },
    });

    const enrolledStudents = enrollments.length;

    if (enrolledStudents === 0) {
      return {
        course,
        summary: this.emptyCourseStats(enrolledStudents),
        students: [],
      };
    }

    /*
     * Load all assessments for this course's teaching assignments.
     */
    const assessments = await this.prisma.assessment.findMany({
      where: {
        tenantId,
        teachingAssignment: { courseId },
      },
      select: {
        id: true,
        title: true,
        type: true,
        maxScore: true,
        weight: true,
        assessmentDate: true,
        isActive: true,
      },
      orderBy: { assessmentDate: 'asc' },
    });

    /*
     * Load all StudentResults for these assessments in bulk.
     */
    const assessmentIds = assessments.map((a) => a.id);
    const studentIds = enrollments.map((e) => e.student.id);

    const allResults = await this.prisma.studentResult.findMany({
      where: {
        tenantId,
        assessmentId: { in: assessmentIds },
        studentId: { in: studentIds },
      },
      select: {
        studentId: true,
        assessmentId: true,
        score: true,
        grade: true,
        gradePoint: true,
        remark: true,
      },
    });

    /*
     * Index results by studentId → assessmentId for O(1) lookup.
     */
    const resultMap = new Map<string, Map<string, (typeof allResults)[0]>>();
    for (const r of allResults) {
      if (!resultMap.has(r.studentId)) {
        resultMap.set(r.studentId, new Map());
      }
      resultMap.get(r.studentId)!.set(r.assessmentId, r);
    }

    /*
     * Build per-student rows.
     */
    let totalScoreSum = 0;
    let totalScoreCount = 0;
    let highestScore: number | null = null;
    let lowestScore: number | null = null;
    let passCount = 0;
    let failCount = 0;
    let studentsWithResults = 0;

    const students = enrollments.map((enrollment) => {
      const studentMap = resultMap.get(enrollment.student.id) ?? new Map();

      const assessmentRows = assessments.map((a) => {
        const res = studentMap.get(a.id);
        const scoreNum = res ? decimalToNumber(res.score) : null;
        const pct = scoreNum !== null ? safePercent(scoreNum, a.maxScore) : null;

        return {
          assessmentId: a.id,
          title: a.title,
          type: a.type,
          maxScore: a.maxScore,
          weight: a.weight,
          assessmentDate: a.assessmentDate,
          score: scoreNum,
          percentage: pct,
          grade: res?.grade ?? null,
          gradePoint: res ? decimalToNumber(res.gradePoint) : null,
          remark: res?.remark ?? null,
        };
      });

      /*
       * Compute weighted final for this student if possible.
       */
      const { finalScore, finalGrade, finalGradePoint, passed } =
        this.computeWeightedFinal(assessments, studentMap);

      /*
       * Accumulate stats across all students.
       */
      if (finalScore !== null) {
        studentsWithResults++;
        totalScoreSum += finalScore;
        totalScoreCount++;

        if (highestScore === null || finalScore > highestScore)
          highestScore = finalScore;
        if (lowestScore === null || finalScore < lowestScore)
          lowestScore = finalScore;
        if (passed) passCount++;
        else failCount++;
      }

      return {
        id: enrollment.student.id,
        studentNumber: enrollment.student.studentNumber,
        firstName: enrollment.student.firstName,
        middleName: enrollment.student.middleName,
        lastName: enrollment.student.lastName,
        enrollmentStatus: enrollment.status,
        assessments: assessmentRows,
        finalScore,
        finalGrade,
        finalGradePoint,
        passed,
      };
    });

    const averageScore =
      totalScoreCount > 0
        ? Math.round((totalScoreSum / totalScoreCount) * 100) / 100
        : null;

    return {
      course,
      summary: {
        enrolledStudents,
        studentsWithResults,
        averageScore,
        highestScore,
        lowestScore,
        passCount,
        failCount,
      },
      students,
    };
  }

  // ── Endpoint 4: Assessment report ─────────────────────────────────────────

  async getAssessmentReport(assessmentId: string) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
      include: {
        teachingAssignment: {
          include: {
            course: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    /*
     * Load all StudentResults for this assessment.
     * Include student snapshot fields needed for the report.
     */
    const results = await this.prisma.studentResult.findMany({
      where: { tenantId, assessmentId },
      select: {
        studentId: true,
        score: true,
        grade: true,
        gradePoint: true,
        remark: true,
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { student: { studentNumber: 'asc' } },
    });

    const totalStudents = await this.prisma.enrollment.count({
      where: {
        tenantId,
        courseId: assessment.teachingAssignment.courseId,
      },
    });

    const submittedResults = results.length;
    let scoreSum = 0;
    let highest: number | null = null;
    let lowest: number | null = null;
    let passCount = 0;
    let failCount = 0;

    const resultRows = results.map((r) => {
      const scoreNum = decimalToNumber(r.score)!;
      const pct = safePercent(scoreNum, assessment.maxScore);

      scoreSum += scoreNum;
      if (highest === null || scoreNum > highest) highest = scoreNum;
      if (lowest === null || scoreNum < lowest) lowest = scoreNum;

      const isPassed = pct !== null && pct >= PASS_THRESHOLD;
      if (isPassed) passCount++;
      else failCount++;

      return {
        studentId: r.student.id,
        studentNumber: r.student.studentNumber,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        score: scoreNum,
        percentage: pct,
        grade: r.grade,
        gradePoint: decimalToNumber(r.gradePoint),
        remark: r.remark,
      };
    });

    const averageScore =
      submittedResults > 0
        ? Math.round((scoreSum / submittedResults) * 100) / 100
        : null;

    return {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        maxScore: assessment.maxScore,
        weight: assessment.weight,
        assessmentDate: assessment.assessmentDate,
        isActive: assessment.isActive,
      },
      course: assessment.teachingAssignment.course,
      statistics: {
        totalStudents,
        submittedResults,
        averageScore,
        highestScore: highest,
        lowestScore: lowest,
        passCount,
        failCount,
      },
      results: resultRows,
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Builds course blocks from enrollments using a single bulk query for all
   * StudentResults, avoiding N+1.
   */
  private async buildCourseBlocks(
    tenantId: string,
    studentId: string,
    enrollments: Array<{
      id: string;
      status: string;
      course: {
        id: string;
        code: string;
        name: string;
        creditHours: number;
        semester: number | null;
        yearLevel: number | null;
      };
    }>,
  ): Promise<CourseBlock[]> {
    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.course.id);

    /*
     * Load all assessments for the enrolled courses in one query.
     */
    const assessments = await this.prisma.assessment.findMany({
      where: {
        tenantId,
        teachingAssignment: { courseId: { in: courseIds } },
      },
      select: {
        id: true,
        title: true,
        type: true,
        maxScore: true,
        weight: true,
        assessmentDate: true,
        isActive: true,
        teachingAssignment: { select: { courseId: true } },
      },
      orderBy: { assessmentDate: 'asc' },
    });

    const assessmentIds = assessments.map((a) => a.id);

    /*
     * Load all StudentResults for this student in one query.
     */
    const studentResults =
      assessmentIds.length > 0
        ? await this.prisma.studentResult.findMany({
            where: {
              tenantId,
              studentId,
              assessmentId: { in: assessmentIds },
            },
            select: {
              assessmentId: true,
              score: true,
              grade: true,
              gradePoint: true,
            },
          })
        : [];

    /*
     * Index structures for O(1) lookups.
     */
    const resultByAssessment = new Map(
      studentResults.map((r) => [r.assessmentId, r]),
    );

    // Group assessments by courseId
    const assessmentsByCourse = new Map<string, typeof assessments>();
    for (const a of assessments) {
      const cid = a.teachingAssignment.courseId;
      if (!assessmentsByCourse.has(cid)) assessmentsByCourse.set(cid, []);
      assessmentsByCourse.get(cid)!.push(a);
    }

    return enrollments.map((enrollment) => {
      const courseAssessments =
        assessmentsByCourse.get(enrollment.course.id) ?? [];

      const assessmentRows: AssessmentResultRow[] = courseAssessments.map(
        (a) => {
          const res = resultByAssessment.get(a.id);
          const scoreNum = res ? decimalToNumber(res.score) : null;
          const pct =
            scoreNum !== null ? safePercent(scoreNum, a.maxScore) : null;
          return {
            assessmentId: a.id,
            title: a.title,
            type: a.type,
            maxScore: a.maxScore,
            weight: a.weight,
            assessmentDate: a.assessmentDate,
            score: scoreNum,
            percentage: pct,
            grade: res?.grade ?? null,
            gradePoint: res ? decimalToNumber(res.gradePoint) : null,
          };
        },
      );

      const { finalScore, finalGrade, finalGradePoint, passed } =
        this.computeWeightedFinal(courseAssessments, resultByAssessment);

      return {
        id: enrollment.course.id,
        code: enrollment.course.code,
        name: enrollment.course.name,
        creditHours: enrollment.course.creditHours,
        semester: enrollment.course.semester,
        yearLevel: enrollment.course.yearLevel,
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
        assessments: assessmentRows,
        finalScore,
        finalGrade,
        finalGradePoint,
        passed,
      };
    });
  }

  /**
   * Computes a weighted final score from a set of assessments and a result map.
   *
   * Uses the same formula as GradeService.getCourseResult:
   *   percentage_i = (score_i / maxScore_i) * 100
   *   contribution_i = percentage_i * (weight_i / 100)
   *   finalScore = Σ contribution_i
   *
   * Returns null for all fields when:
   *  - no assessments exist, OR
   *  - any active assessment is missing a StudentResult (incomplete)
   */
  private computeWeightedFinal(
    assessments: Array<{
      id: string;
      maxScore: number;
      weight: number;
      isActive?: boolean;
    }>,
    resultMap: Map<string, { score: { toNumber(): number } | null | number }>,
  ): {
    finalScore: number | null;
    finalGrade: string | null;
    finalGradePoint: number | null;
    passed: boolean | null;
  } {
    const active = assessments.filter((a) => a.isActive !== false);

    if (active.length === 0) {
      return {
        finalScore: null,
        finalGrade: null,
        finalGradePoint: null,
        passed: null,
      };
    }

    let exactTotal = 0;
    let totalWeight = 0;

    for (const a of active) {
      const res = resultMap.get(a.id);
      if (!res || res.score == null) {
        /*
         * At least one active assessment has no result.
         * Cannot safely determine a final grade — return null.
         */
        return {
          finalScore: null,
          finalGrade: null,
          finalGradePoint: null,
          passed: null,
        };
      }

      const scoreNum =
        typeof res.score === 'number'
          ? res.score
          : (res.score as { toNumber(): number }).toNumber();

      if (a.maxScore <= 0) continue; // degenerate assessment — skip

      const pct = (scoreNum / a.maxScore) * 100;
      exactTotal += pct * (a.weight / 100);
      totalWeight += a.weight;
    }

    if (totalWeight <= 0) {
      return {
        finalScore: null,
        finalGrade: null,
        finalGradePoint: null,
        passed: null,
      };
    }

    /*
     * If weights don't sum to 100, scale the result proportionally
     * rather than returning null — this matches GradeService behavior
     * which shows a partial result with a note.
     */
    const scaledScore =
      Math.abs(totalWeight - 100) > 0.001
        ? (exactTotal / totalWeight) * 100
        : exactTotal;

    const roundedScore = Math.round(scaledScore * 100) / 100;
    const { letter, point, passed } = computeLetterGrade(roundedScore);

    return {
      finalScore: roundedScore,
      finalGrade: letter,
      finalGradePoint: point,
      passed,
    };
  }

  /**
   * Computes student-level summary statistics from course blocks.
   */
  private computeStudentSummary(
    courseBlocks: CourseBlock[],
    enrollments: Array<{ status: string; course: { creditHours: number } }>,
  ) {
    const totalCourses = courseBlocks.length;
    const totalCredits = courseBlocks.reduce(
      (sum, cb) => sum + cb.creditHours,
      0,
    );
    const totalAssessments = courseBlocks.reduce(
      (sum, cb) => sum + cb.assessments.length,
      0,
    );

    /*
     * Earned credits: courses with a passing final grade.
     */
    const earnedCredits = courseBlocks
      .filter((cb) => cb.passed === true)
      .reduce((sum, cb) => sum + cb.creditHours, 0);

    /*
     * Cumulative GPA: credit-weighted average of gradePoints.
     * Only courses where a final gradePoint is known contribute.
     */
    let gpaWeightedSum = 0;
    let gpaCredits = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    for (const cb of courseBlocks) {
      if (cb.finalGradePoint !== null) {
        gpaWeightedSum += cb.finalGradePoint * cb.creditHours;
        gpaCredits += cb.creditHours;
      }
      if (cb.finalScore !== null) {
        scoreSum += cb.finalScore;
        scoreCount++;
      }
    }

    const cumulativeGPA =
      gpaCredits > 0
        ? Math.round((gpaWeightedSum / gpaCredits) * 100) / 100
        : null;

    const averagePercentage =
      scoreCount > 0
        ? Math.round((scoreSum / scoreCount) * 100) / 100
        : null;

    return {
      totalCourses,
      totalAssessments,
      totalCredits,
      earnedCredits,
      averagePercentage,
      cumulativeGPA,
    };
  }

  private emptyCourseStats(enrolledStudents: number) {
    return {
      enrolledStudents,
      studentsWithResults: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      passCount: 0,
      failCount: 0,
    };
  }
}
