import { Controller,Get, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CurrentTenant } from "./decorators/current-tenant.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
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
    async getProtected() {
        return "Your are authenticated"
    }
    


}
