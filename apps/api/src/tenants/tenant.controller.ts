import { Controller,Get, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CurrentTenant } from "./decorators/current-tenant.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
// import { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
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
    @Get('protected')
    async getProtected(@CurrentUser() user: AuthInterfaces.AuthenticatedUser) {
        return {
            message: 'Your are authenticated',
            user
        }
    }
    


}
