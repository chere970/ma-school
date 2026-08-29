import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

@Injectable()
export class AcademicResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async getStudentResults(studentId: string) {
    const tenantId = this.getTenantId();

    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        admissionYear: true,
        yearLevel: true,
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            degree: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        tenantId,
        studentId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            creditHours: true,
          },
        },
        grades: {
          where: {
            tenantId,
          },
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                type: true,
                maxScore: true,
                weight: true,
              },
            },
          },
        },
      },
      orderBy: {
        course: {
          name: 'asc',
        },
      },
    });

    return {
      student,
      courses: enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        course: enrollment.course,
        status: enrollment.status,
        grades: enrollment.grades.map((grade) => ({
          id: grade.id,
          score: grade.score,
          remarks: grade.remarks,
          status: grade.status,
          assessment: grade.assessment,
        })),
      })),
    };
  }

  async calculateStudentGpa(studentId: string) {
    const tenantId = this.getTenantId();

    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        tenantId,
        studentId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            creditHours: true,
          },
        },
        grades: {
          where: {
            tenantId,
            status: 'FINALIZED',
          },
          include: {
            assessment: {
              select: {
                weight: true,
                maxScore: true,
              },
            },
          },
        },
      },
    });

    let totalQualityPoints = 0;
    let totalCreditHours = 0;

    const courses = [];

    for (const enrollment of enrollments) {
      if (enrollment.grades.length === 0) {
        continue;
      }

      let weightedScore = 0;
      let totalWeight = 0;

      for (const grade of enrollment.grades) {
        const maxScore = Number(grade.assessment.maxScore);
        const score = Number(grade.score);
        const weight = Number(grade.assessment.weight);

        if (maxScore <= 0 || weight <= 0) {
          continue;
        }

        const percentage = (score / maxScore) * 100;

        weightedScore += percentage * weight;
        totalWeight += weight;
      }

      if (totalWeight <= 0) {
        continue;
      }

      const finalPercentage =
        weightedScore / totalWeight;

      const gradePoint =
        this.calculateGradePoint(finalPercentage);

      const creditHours =
        enrollment.course.creditHours;

      totalQualityPoints +=
        gradePoint * creditHours;

      totalCreditHours += creditHours;

      courses.push({
        enrollmentId: enrollment.id,
        course: enrollment.course,
        percentage: Number(finalPercentage.toFixed(2)),
        gradePoint,
      });
    }

    const gpa =
      totalCreditHours > 0
        ? totalQualityPoints / totalCreditHours
        : 0;

    return {
      student,
      totalCreditHours,
      totalQualityPoints: Number(
        totalQualityPoints.toFixed(2),
      ),
      gpa: Number(gpa.toFixed(2)),
      courses,
    };
  }

  private calculateGradePoint(
    percentage: number,
  ): number {
    if (percentage >= 90) return 4.0;
    if (percentage >= 85) return 4.0;
    if (percentage >= 80) return 3.75;
    if (percentage >= 75) return 3.5;
    if (percentage >= 70) return 3.0;
    if (percentage >= 65) return 2.75;
    if (percentage >= 60) return 2.5;
    if (percentage >= 50) return 2.0;
    if (percentage >= 45) return 1.75;
    if (percentage >= 40) return 1.0;

    return 0;
  }
}