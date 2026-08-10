import { Injectable, UnauthorizedException } from "@nestjs/common";
import {PrismaService} from "../common/prisma/prisma.service"; 
import * as bcrypt from 'bcrypt';
import { TenantContext } from "../common/tenant/tenant-context.service";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";

@Injectable()
export class AuthService{
 constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly jwtService: JwtService
 ) {}


 async validateUser(
 email: string,
 password: string
 ){
    const tenantId= await this.tenantContext.getTenantId();
    const user= await this.prisma.user.findFirst({
        where: {
            tenantId,
            email: email,
            isActive: true,
        },
        include: {
            role: true,
            tenant: true,
        }
    });
    if(!user){
        throw new UnauthorizedException(
            'Invalid email or password',
        );
    }


    const passwordValid= await bcrypt.compare(password, user.passwordHash);
    if(!passwordValid){
        throw new UnauthorizedException(
            'Invalid email or password',
        );
    }
    return user;
 }
 async login(
    email:string,
    password:string
 ){
    const user= await this.validateUser(email, password);
    const payload={
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role.name,
    };
    const accessToken= this.jwtService.sign(payload);
    return {
        accessToken,
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