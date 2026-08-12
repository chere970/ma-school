import { Controller , Post, Body} from "@nestjs/common";
import { AuthService } from "./auth.services";
import {LoginDto} from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthenticatedUser } from "./interfaces/authenticated-user.interface";
@Controller('auth')
export class AuthController{
    constructor(private readonly authService:AuthService){}

    @Post("login")
    async login(@Body() loginDto: LoginDto){

        //  const user= await this.authService.validateUser(
        //     loginDto.email,
        //     loginDto.password
        //  );
         return this.authService.login(
            loginDto.email,
            loginDto.password
         );
    }
        //  {
        //     message: 'login successful',
        //     user:{
        //         id:user.id,
        //         firstName:user.firstName,
        //         lastName:user.lastName,
        //         email:user.email,
        //         tenantId:user.tenantId,
        //         role:user.role.name
        //     }

        //  }
@Post('refresh')
async refreshToken(@Body() refreshTokenDto: RefreshTokenDto){

 return await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
    }
@Post('logout')
async logout(@CurrentUser() user: AuthenticatedUser){
return this.authService.logout(user.userId);
}
}
