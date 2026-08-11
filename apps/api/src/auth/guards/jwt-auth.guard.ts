import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, lastValueFrom } from 'rxjs';
import { TenantContext } from '../../common/tenant/tenant-context.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly tenantContext: TenantContext,
  ) {
    super();
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      // Resolve the parent canActivate result regardless of whether
      // it returns a boolean, Promise<boolean>, or Observable<boolean>
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

      request.tenantId = user.tenantId;

      return true;
    } catch {
      return false;
    }
  }
}