import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { GradeService } from './grade.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import {
  AssessmentType,
  GradeStatus,
} from '../../../generated/prisma/enums';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TENANT_ID = 'tenant-aaa';
const COURSE_ID = 'course-111';
const ASSIGNMENT_ID = 'assignment-111';
const ASSESSMENT_ID = 'assessment-111';
const ENROLLMENT_ID = 'enrollment-111';
const GRADE_ID = 'grade-111';

const mockAssessment = {
  id: ASSESSMENT_ID,
  tenantId: TENANT_ID,
  isActive: true,
  maxScore: 100,
  weight: 50,
  teachingAssignmentId: ASSIGNMENT_ID,
  teachingAssignment: {
    id: ASSIGNMENT_ID,
    courseId: COURSE_ID,
    course: { id: COURSE_ID, name: 'Math 101' },
  },
};

const mockEnrollment = {
  id: ENROLLMENT_ID,
  tenantId: TENANT_ID,
  courseId: COURSE_ID,
  studentId: 'student-111',
  status: 'ACTIVE',
  student: { id: 'student-111', firstName: 'Alice', lastName: 'B', studentNumber: 'S001' },
  course: { id: COURSE_ID, code: 'MTH101', name: 'Math 101' },
};

const mockGrade = {
  id: GRADE_ID,
  tenantId: TENANT_ID,
  assessmentId: ASSESSMENT_ID,
  enrollmentId: ENROLLMENT_ID,
  score: 75,
  remarks: null,
  status: GradeStatus.DRAFT,
  assessment: mockAssessment,
};

// ─── Mock factories ───────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    assessment: { findFirst: jest.fn(), findMany: jest.fn() },
    enrollment: { findFirst: jest.fn(), findMany: jest.fn() },
    grade: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GradeService', () => {
  let service: GradeService;
  let prisma: ReturnType<typeof buildMockPrisma>;

  beforeEach(async () => {
    prisma = buildMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradeService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: TenantContext,
          useValue: { getTenantId: jest.fn().mockReturnValue(TENANT_ID) },
        },
      ],
    }).compile();

    service = module.get<GradeService>(GradeService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a valid grade', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      prisma.grade.findFirst.mockResolvedValue(null);
      prisma.grade.create.mockResolvedValue(mockGrade);

      const result = await service.create({
        assessmentId: ASSESSMENT_ID,
        enrollmentId: ENROLLMENT_ID,
        score: 75,
      });

      expect(result).toEqual(mockGrade);
      expect(prisma.grade.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when score exceeds maxScore', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: ENROLLMENT_ID,
          score: 110, // above maxScore 100
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when enrollment course does not match', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findFirst.mockResolvedValue({
        ...mockEnrollment,
        courseId: 'WRONG-course',
      });

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: ENROLLMENT_ID,
          score: 75,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for missing assessment', async () => {
      prisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          assessmentId: 'nonexistent',
          enrollmentId: ENROLLMENT_ID,
          score: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for missing enrollment', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: 'nonexistent',
          score: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for cross-tenant assessment', async () => {
      // findFirst returns null because tenantId filter excludes it
      prisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: ENROLLMENT_ID,
          score: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException for duplicate grade', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      prisma.grade.findFirst.mockResolvedValue(mockGrade); // duplicate

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: ENROLLMENT_ID,
          score: 75,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException for inactive assessment', async () => {
      prisma.assessment.findFirst.mockResolvedValue({
        ...mockAssessment,
        isActive: false,
      });

      await expect(
        service.create({
          assessmentId: ASSESSMENT_ID,
          enrollmentId: ENROLLMENT_ID,
          score: 75,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('throws ForbiddenException when grade is FINALIZED', async () => {
      prisma.grade.findFirst.mockResolvedValue({
        ...mockGrade,
        status: GradeStatus.FINALIZED,
      });

      await expect(
        service.update(GRADE_ID, { score: 80 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when updated score exceeds maxScore', async () => {
      prisma.grade.findFirst.mockResolvedValue({
        ...mockGrade,
        assessment: { ...mockAssessment, maxScore: 100 },
      });

      await expect(
        service.update(GRADE_ID, { score: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('reverts PUBLISHED grade to DRAFT when score changes', async () => {
      prisma.grade.findFirst.mockResolvedValue({
        ...mockGrade,
        status: GradeStatus.PUBLISHED,
        assessment: mockAssessment,
      });
      prisma.grade.update.mockResolvedValue({
        ...mockGrade,
        score: 80,
        status: GradeStatus.DRAFT,
      });

      const result = await service.update(GRADE_ID, { score: 80 });

      expect(prisma.grade.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: GradeStatus.DRAFT,
          }),
        }),
      );
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes a DRAFT grade', async () => {
      prisma.grade.findFirst.mockResolvedValue(mockGrade);
      prisma.grade.delete.mockResolvedValue(mockGrade);

      const result = await service.remove(GRADE_ID);

      expect(prisma.grade.delete).toHaveBeenCalled();
      expect(result.message).toContain('deleted');
    });

    it('throws ForbiddenException when removing non-DRAFT grade', async () => {
      prisma.grade.findFirst.mockResolvedValue({
        ...mockGrade,
        status: GradeStatus.PUBLISHED,
      });

      await expect(service.remove(GRADE_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── getCourseResult / grade calculation ───────────────────────────────

  describe('getCourseResult', () => {
    it('calculates correct weighted score and letter grade', async () => {
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      prisma.grade.findMany.mockResolvedValue([
        {
          score: 8,
          status: GradeStatus.FINALIZED,
          assessment: {
            id: '1',
            title: 'Quiz',
            type: AssessmentType.QUIZ,
            maxScore: 10,
            weight: 10,
            isActive: true,
          },
        },
        {
          score: 24,
          status: GradeStatus.FINALIZED,
          assessment: {
            id: '2',
            title: 'Midterm',
            type: AssessmentType.MIDTERM,
            maxScore: 30,
            weight: 30,
            isActive: true,
          },
        },
        {
          score: 42,
          status: GradeStatus.FINALIZED,
          assessment: {
            id: '3',
            title: 'Final',
            type: AssessmentType.FINAL,
            maxScore: 50,
            weight: 60,
            isActive: true,
          },
        },
      ]);

      const result = await service.getCourseResult(ENROLLMENT_ID);

      /*
       * Quiz: (8/10)*100 = 80%; contribution = 80 * 0.10 = 8.0
       * Midterm: (24/30)*100 = 80%; contribution = 80 * 0.30 = 24.0
       * Final: (42/50)*100 = 84%; contribution = 84 * 0.60 = 50.4
       * Total = 82.4 → letter B
       */
      expect(result.totalCourseScore).toBeCloseTo(82.4, 1);
      expect(result.letterGrade).toBe('B');
      expect(result.passed).toBe(true);
    });

    it('returns F and failed for score below pass threshold', async () => {
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      prisma.grade.findMany.mockResolvedValue([
        {
          score: 10,
          status: GradeStatus.FINALIZED,
          assessment: {
            id: '1',
            title: 'Final',
            type: AssessmentType.FINAL,
            maxScore: 100,
            weight: 100,
            isActive: true,
          },
        },
      ]);

      const result = await service.getCourseResult(ENROLLMENT_ID);

      expect(result.letterGrade).toBe('F');
      expect(result.passed).toBe(false);
    });

    it('throws NotFoundException for missing enrollment', async () => {
      prisma.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.getCourseResult('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── publishGrades ────────────────────────────────────────────────────────

  describe('publishGrades', () => {
    it('throws BadRequestException when weights do not sum to 100', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.assessment.findMany.mockResolvedValue([
        { weight: 40 }, // only 40%, not 100%
      ]);

      await expect(
        service.publishGrades(ASSESSMENT_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for missing assessment', async () => {
      prisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.publishGrades('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── finalizeGrades ───────────────────────────────────────────────────────

  describe('finalizeGrades', () => {
    it('throws BadRequestException when DRAFT grades still exist', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.grade.count.mockResolvedValue(2); // 2 drafts remaining

      await expect(
        service.finalizeGrades(ASSESSMENT_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── bulkCreate ───────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    const enrollment2 = {
      id: 'enrollment-222',
      tenantId: TENANT_ID,
      courseId: COURSE_ID,
      studentId: 'student-222',
    };

    it('creates grades in a transaction for valid input', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findMany.mockResolvedValue([
        { id: ENROLLMENT_ID, courseId: COURSE_ID, studentId: 'student-111' },
        { id: 'enrollment-222', courseId: COURSE_ID, studentId: 'student-222' },
      ]);
      prisma.grade.findMany.mockResolvedValue([]); // no existing grades
      prisma.$transaction.mockResolvedValue([mockGrade, mockGrade]);

      const result = await service.bulkCreate({
        assessmentId: ASSESSMENT_ID,
        grades: [
          { enrollmentId: ENROLLMENT_ID, score: 80 },
          { enrollmentId: 'enrollment-222', score: 85 },
        ],
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.count).toBe(2);
    });

    it('throws BadRequestException when score exceeds maxScore', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findMany.mockResolvedValue([
        { id: ENROLLMENT_ID, courseId: COURSE_ID, studentId: 'student-111' },
      ]);
      prisma.grade.findMany.mockResolvedValue([]);

      await expect(
        service.bulkCreate({
          assessmentId: ASSESSMENT_ID,
          grades: [{ enrollmentId: ENROLLMENT_ID, score: 150 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when enrollment belongs to wrong course', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findMany.mockResolvedValue([
        {
          id: ENROLLMENT_ID,
          courseId: 'WRONG-course', // mismatch
          studentId: 'student-111',
        },
      ]);
      prisma.grade.findMany.mockResolvedValue([]);

      await expect(
        service.bulkCreate({
          assessmentId: ASSESSMENT_ID,
          grades: [{ enrollmentId: ENROLLMENT_ID, score: 80 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for duplicate grades in batch', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.enrollment.findMany.mockResolvedValue([
        { id: ENROLLMENT_ID, courseId: COURSE_ID, studentId: 'student-111' },
      ]);
      prisma.grade.findMany.mockResolvedValue([
        { enrollmentId: ENROLLMENT_ID }, // already graded
      ]);

      await expect(
        service.bulkCreate({
          assessmentId: ASSESSMENT_ID,
          grades: [{ enrollmentId: ENROLLMENT_ID, score: 80 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for missing assessment', async () => {
      prisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkCreate({
          assessmentId: 'nonexistent',
          grades: [{ enrollmentId: ENROLLMENT_ID, score: 80 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
