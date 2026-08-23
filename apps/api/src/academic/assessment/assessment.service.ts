import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import { AssessmentType } from '../../../generated/prisma/enums';

import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

export interface AssessmentFilters {
  teachingAssignmentId?: string;
  type?: AssessmentType;
  isActive?: boolean;
}

export interface WeightValidationResult {
  teachingAssignmentId: string;
  totalWeight: number;
  isValid: boolean;
  assessmentCount: number;
  assessments: {
    id: string;
    title: string;
    type: AssessmentType;
    weight: number;
  }[];
}

@Injectable()
export class AssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateAssessmentDto) {
    const tenantId = this.getTenantId();

    /*
     * Verify the TeachingAssignment exists
     * and belongs to the authenticated tenant.
     */
    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: {
          id: dto.teachingAssignmentId,
          tenantId,
          isActive: true,
        },
        include: { course: true },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    /*
     * Prevent duplicate title within the same
     * teaching assignment.
     */
    const duplicate = await this.prisma.assessment.findFirst({
      where: {
        tenantId,
        teachingAssignmentId: dto.teachingAssignmentId,
        title: dto.title,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'An assessment with this title already exists for this teaching assignment',
      );
    }

    return this.prisma.assessment.create({
      data: {
        tenantId,
        teachingAssignmentId: dto.teachingAssignmentId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        maxScore: dto.maxScore,
        weight: dto.weight,
        assessmentDate: dto.assessmentDate
          ? new Date(dto.assessmentDate)
          : undefined,
      },
      include: {
        teachingAssignment: {
          include: { teacher: true, course: true },
        },
      },
    });
  }

  async findAll(filters: AssessmentFilters = {}) {
    const tenantId = this.getTenantId();

    return this.prisma.assessment.findMany({
      where: {
        tenantId,
        ...(filters.teachingAssignmentId && {
          teachingAssignmentId: filters.teachingAssignmentId,
        }),
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive !== undefined && {
          isActive: filters.isActive,
        }),
      },
      include: {
        teachingAssignment: {
          include: { teacher: true, course: true },
        },
      },
      orderBy: [
        { assessmentDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId },
      include: {
        teachingAssignment: {
          include: { teacher: true, course: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }

  async update(id: string, dto: UpdateAssessmentDto) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    /*
     * If title is changing, verify uniqueness within
     * the same teaching assignment.
     */
    if (dto.title && dto.title !== assessment.title) {
      const duplicate =
        await this.prisma.assessment.findFirst({
          where: {
            tenantId,
            teachingAssignmentId:
              assessment.teachingAssignmentId,
            title: dto.title,
            NOT: { id },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'An assessment with this title already exists for this teaching assignment',
        );
      }
    }

    /*
     * Changing maxScore when grades already exist
     * can cause score > maxScore violations.
     * Block it if there are existing grades.
     */
    if (dto.maxScore !== undefined && dto.maxScore !== assessment.maxScore) {
      const gradeCount = await this.prisma.grade.count({
        where: { tenantId, assessmentId: id },
      });

      if (gradeCount > 0) {
        throw new BadRequestException(
          'Cannot change maxScore when grades already exist for this assessment',
        );
      }
    }

    return this.prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.maxScore !== undefined && {
          maxScore: dto.maxScore,
        }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.assessmentDate !== undefined && {
          assessmentDate: dto.assessmentDate
            ? new Date(dto.assessmentDate)
            : null,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        teachingAssignment: {
          include: { teacher: true, course: true },
        },
      },
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();

    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    /*
     * Soft-delete when grades already exist to
     * preserve grade history.
     */
    const gradeCount = await this.prisma.grade.count({
      where: { tenantId, assessmentId: id },
    });

    if (gradeCount > 0) {
      await this.prisma.assessment.update({
        where: { id: assessment.id },
        data: { isActive: false },
      });

      return {
        message:
          'Assessment deactivated (grades exist and are preserved)',
        softDeleted: true,
      };
    }

    await this.prisma.assessment.delete({
      where: { id: assessment.id },
    });

    return {
      message: 'Assessment deleted successfully',
      softDeleted: false,
    };
  }

  /**
   * Validates that the total weight of all active
   * assessments for a teaching assignment sums to 100.
   *
   * This is informational — individual creation is not
   * blocked. Use this before publishing final grades.
   */
  async validateWeights(
    teachingAssignmentId: string,
  ): Promise<WeightValidationResult> {
    const tenantId = this.getTenantId();

    /*
     * Ensure the assignment belongs to this tenant.
     */
    const assignment =
      await this.prisma.teachingAssignment.findFirst({
        where: { id: teachingAssignmentId, tenantId },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found',
      );
    }

    const assessments = await this.prisma.assessment.findMany({
      where: {
        tenantId,
        teachingAssignmentId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        type: true,
        weight: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalWeight = assessments.reduce(
      (sum, a) => sum + a.weight,
      0,
    );

    /*
     * Use a small tolerance for floating-point arithmetic.
     */
    const isValid = Math.abs(totalWeight - 100) < 0.001;

    return {
      teachingAssignmentId,
      totalWeight: Math.round(totalWeight * 100) / 100,
      isValid,
      assessmentCount: assessments.length,
      assessments,
    };
  }
}
