import { Injectable } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';
import { TenantContext } from '../common/tenant/tenant-context.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async getCurrentTenant() {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}