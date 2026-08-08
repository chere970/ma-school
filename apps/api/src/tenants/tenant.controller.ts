import { Controller,Get } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CurrentTenant } from "./decorators/current-tenant.decorator";
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
}
