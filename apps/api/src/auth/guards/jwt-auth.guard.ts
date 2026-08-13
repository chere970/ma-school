import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const result = super.canActivate(context);
      const authenticated = result instanceof Observable
        ? await lastValueFrom(result)
        : await result;

      if (!authenticated) {
        return false;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user?.tenantId) {
        return false;
      }

      const headerTenantId = request.headers?.['x-tenant-id'];
      const clientTenantId = Array.isArray(headerTenantId)
        ? headerTenantId[0]
        : headerTenantId?.toString();

      if (clientTenantId && clientTenantId !== user.tenantId) {
        throw new ForbiddenException(
          'x-tenant-id does not match the authenticated JWT tenant',
        );
      }

      request.tenantId = user.tenantId;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      return false;
    }
  }
}