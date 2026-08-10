import { Module } from "@nestjs/common";
import {AuthService} from "./auth.services"
import { AuthController } from "./auth.controller";
@Module(
    {
    controllers:[AuthController],
    providers: [AuthService],
    // controllers: [],
    exports: [AuthService]
    } 

)
export class AuthModule {}