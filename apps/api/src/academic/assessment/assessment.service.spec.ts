import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { AssessmentService } from './assessment.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import { AssessmentType } from '../../../generated/prisma/enums';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TENANT_ID = 'tenant-aaa';
const ASSIGNMENT_ID = 'assignment-111';

const mockAssignment = {
  id: ASSIGNMENT_ID,
  tenantId: TENANT_ID,
  isActive: true,
  courseId: 'course-111',
  course: { id: 'course-111', name: 'Math 101' },
};

const mockAssessment = {
  id: 'assessment-111',
  tenantId: TENANT_ID,
  teachingAssignmentId: ASSIGNMENT_ID,
  title: 'Midterm',
  type: AssessmentType.MIDTERM,
  maxScore: 100,
  weight: 40,
  isActive: true,
  grades: [],
};

// ─── Mock factories ───────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    teachingAssignment: {
      findFirst: jest.fn(),
    },
    assessment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    grade: {
      count: jest.fn(),
    },
  };
}

function buildMockTenantContext(tenantId = TENANT_ID) {
  return {
    getTenantId: jest.fn().mockReturnValue(tenantId),
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('AssessmentService', () => {
  let service: AssessmentService;
  let prisma: ReturnType<typeof buildMockPrisma>;

  beforeEach(async () => {
    prisma = buildMockPrisma();
    const tenantContext = buildMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContext, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      teachingAssignmentId: ASSIGNMENT_ID,
      title: 'Midterm',
      type: AssessmentType.MIDTERM,
      maxScore: 100,
      weight: 40,
    };

    it('creates a valid assessment', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(
        mockAssignment,
      );
      prisma.assessment.findFirst.mockResolvedValue(null); // no duplicate
      prisma.assessment.create.mockResolvedValue(mockAssessment);

      const result = await service.create(dto);

      expect(result).toEqual(mockAssessment);
      expect(prisma.assessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT_ID,
            title: 'Midterm',
            maxScore: 100,
            weight: 40,
          }),
        }),
      );
    });

    it('throws NotFoundException when TeachingAssignment not found', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for cross-tenant TeachingAssignment', async () => {
      // Return null because findFirst includes tenantId filter
      prisma.teachingAssignment.findFirst.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException for duplicate title', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(
        mockAssignment,
      );
      prisma.assessment.findFirst.mockResolvedValue(
        mockAssessment, // duplicate found
      );

      await expect(service.create(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns assessment when found', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);

      const result = await service.findOne('assessment-111');

      expect(result).toEqual(mockAssessment);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('throws BadRequestException when changing maxScore with existing grades', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.grade.count.mockResolvedValue(5);

      await expect(
        service.update('assessment-111', { maxScore: 80 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows maxScore change when no grades exist', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.grade.count.mockResolvedValue(0);
      prisma.assessment.update.mockResolvedValue({
        ...mockAssessment,
        maxScore: 80,
      });

      const result = await service.update('assessment-111', {
        maxScore: 80,
      });

      expect(result.maxScore).toBe(80);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('hard-deletes when no grades exist', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.grade.count.mockResolvedValue(0);
      prisma.assessment.delete.mockResolvedValue(mockAssessment);

      const result = await service.remove('assessment-111');

      expect(prisma.assessment.delete).toHaveBeenCalled();
      expect(result.softDeleted).toBe(false);
    });

    it('soft-deletes (isActive=false) when grades exist', async () => {
      prisma.assessment.findFirst.mockResolvedValue(mockAssessment);
      prisma.grade.count.mockResolvedValue(3);
      prisma.assessment.update.mockResolvedValue({
        ...mockAssessment,
        isActive: false,
      });

      const result = await service.remove('assessment-111');

      expect(prisma.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: false },
        }),
      );
      expect(result.softDeleted).toBe(true);
    });
  });

  // ── validateWeights ──────────────────────────────────────────────────────

  describe('validateWeights', () => {
    it('returns isValid=true when weights sum to 100', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(
        mockAssignment,
      );
      prisma.assessment.findMany.mockResolvedValue([
        { id: '1', title: 'Quiz', type: AssessmentType.QUIZ, weight: 10 },
        { id: '2', title: 'Midterm', type: AssessmentType.MIDTERM, weight: 40 },
        { id: '3', title: 'Final', type: AssessmentType.FINAL, weight: 50 },
      ]);

      const result = await service.validateWeights(ASSIGNMENT_ID);

      expect(result.isValid).toBe(true);
      expect(result.totalWeight).toBe(100);
    });

    it('returns isValid=false when weights do not sum to 100', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(
        mockAssignment,
      );
      prisma.assessment.findMany.mockResolvedValue([
        { id: '1', title: 'Quiz', type: AssessmentType.QUIZ, weight: 30 },
        { id: '2', title: 'Midterm', type: AssessmentType.MIDTERM, weight: 30 },
      ]);

      const result = await service.validateWeights(ASSIGNMENT_ID);

      expect(result.isValid).toBe(false);
      expect(result.totalWeight).toBe(60);
    });

    it('throws NotFoundException for missing assignment', async () => {
      prisma.teachingAssignment.findFirst.mockResolvedValue(null);

      await expect(
        service.validateWeights('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
