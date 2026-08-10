import { Controller , Post, Body} from "@nestjs/common";
import { AuthService } from "./auth.services";
import {LoginDto} from "./dto/login.dto";

@Controller('auth')
export class AuthController{
    constructor(private readonly authService:AuthService){}

    @Post("login")
    async login(@Body() loginDto: LoginDto){

         const user= await this.authService.validateUser(
            loginDto.email,
            loginDto.password
         );
         return {
            message: 'login successful',
            user:{
                id:user.id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                tenantId:user.tenantId,
                role:user.role.name
            }
         }
    }

}