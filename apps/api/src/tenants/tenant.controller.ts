import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { TenantService } from './tenant.service';
import { CurrentTenant } from './decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantContextInterceptor } from '../common/tenant/tenant-context.interceptor';
import * as AuthInterfaces from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantContextInterceptor)
  @ApiBearerAuth('access-token')
  @Get('current')
  @ApiOperation({ summary: 'Get the current tenant details derived from the JWT token' })
  @ApiResponse({ status: 200, description: 'Returns the current tenant.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCurrentTenant() {
    return this.tenantService.getCurrentTenant();
  }

  @Get('id')
  @ApiOperation({ summary: 'Get the tenant ID from the x-tenant-id header' })
  @ApiResponse({ status: 200, description: 'Returns the tenantId.' })
  getTenantId(
    @CurrentTenant() tenantId: string,
  ) {
    return { tenantId };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantContextInterceptor)
  @ApiBearerAuth('access-token')
  @Get('protected')
  @ApiOperation({ summary: 'Validate JWT and return the authenticated user context' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user object.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProtected(@CurrentUser() user: AuthInterfaces.AuthenticatedUser) {
    return {
      message: 'You are authenticated',
      user,
    };
  }
}
