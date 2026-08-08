import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException(
        'x-tenant-id header is required',
      );
    }

    const tenantIdString = tenantId.toString();

    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id: tenantIdString,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        'Tenant not found',
      );
    }

    if (!tenant.isActive) {
      throw new BadRequestException(
        'Tenant is inactive',
      );
    }

    this.tenantContext.run(
      {tenantId:tenant.id},
      () =>{ 
    (req as Request & { tenantId: string }).tenantId =
      tenant.id;

    next(); 
      }
    );
  }
}