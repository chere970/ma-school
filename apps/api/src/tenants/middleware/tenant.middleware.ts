import {
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';

import {
  NextFunction,
  Response,
  Request
} from 'express';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import { TenantRequest } from '../interfaces/tenant-request.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async use(
    req: TenantRequest,
    res: Response,
    next: NextFunction,
  ) {
    const tenantId = req.headers['x-tenant-id'];

    // Tenant header is optional.
    //
    // If it exists, validate it and establish
    // the tenant context.
    if (tenantId) {
      const tenantIdString = tenantId.toString();

      const tenant =
        await this.prisma.tenant.findUnique({
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
        throw new NotFoundException(
          'Tenant is inactive',
        );
      }

      req.tenantId = tenant.id;

    this.tenantContext.run(
      {tenantId:tenant.id},
      () =>{ 
    (req as Request & { tenantId: string }).tenantId =
      tenant.id;

    next(); 
      }
    );
  }
}}