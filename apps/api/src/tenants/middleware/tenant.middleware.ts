import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

import { NextFunction, Response } from 'express';
import { TenantRequest } from '../interfaces/tenant-request.interface';
import { TenantContext } from '../../common/tenant/tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContext,
  ) {}

  use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id']?.toString();

    if (!tenantId) {
      throw new BadRequestException('Tenant not specified');
    }

    this.tenantContext.run({ tenantId }, () => {
      req.tenantId = tenantId;
      next();
    });
  }
}