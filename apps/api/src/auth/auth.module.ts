import { Module } from "@nestjs/common";
import {AuthService} from "./auth.services"
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt/dist/jwt.module";
import{ConfigModule, ConfigService} from '@nestjs/config';
import { JwtModuleOptions } from "@nestjs/jwt";
@Module(
    {
    imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService):JwtModuleOptions => ({
        secret: configService.get<string>('jwt.accessSecret',),

        signOptions: {
          expiresIn: (configService.get<string>(
            'jwt.expiresIn'
          ) || '1h')as any,
        },
      }),
    }),
  ],
    
    controllers:[AuthController],
    providers: [AuthService],
    // controllers: [],
    exports: [AuthService]
    } 

)
export class AuthModule {}