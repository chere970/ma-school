import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CurrentTenant } from "./decorators/current-tenant.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TenantContextInterceptor } from "../common/tenant/tenant-context.interceptor";
import * as AuthInterfaces from "../auth/interfaces/authenticated-user.interface";
@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService,

    ){}
    @Get('current')
    async getCurrentTenant() {
        return this.tenantService.getCurrentTenant();
    }
    @Get('id')
    getTenantId(
        @CurrentTenant() tenantId: string,)
    {
        return {
            tenantId,
        }
        
    }
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantContextInterceptor)
    @Get('protected')
    async getProtected(@CurrentUser() user: AuthInterfaces.AuthenticatedUser) {
        return {
            message: 'Your are authenticated',
            user
        }
    }
    


}
