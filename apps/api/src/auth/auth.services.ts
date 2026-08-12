// import { Injectable, UnauthorizedException } from "@nestjs/common";
// import {PrismaService} from "../common/prisma/prisma.service"; 
// import * as bcrypt from 'bcrypt';
// import { TenantContext } from "../common/tenant/tenant-context.service";
// import { JwtService } from "@nestjs/jwt/dist/jwt.service";
// import { ConfigService } from "@nestjs/config";

// @Injectable()
// export class AuthService{
//  constructor(
//     private readonly prisma: PrismaService,
//     private readonly tenantContext: TenantContext,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService
//  ) {}


//  async validateUser(
//  email: string,
//  password: string
//  ){
//     const tenantId= await this.tenantContext.getTenantId();
//     const user= await this.prisma.user.findFirst({
//         where: {
//             tenantId,
//             email: email,
//             isActive: true,
//         },
//         include: {
//             role: true,
//             tenant: true,
//         }
//     });
//     if(!user){
//         throw new UnauthorizedException(
//             'Invalid email or password',
//         );
//     }


//     const passwordValid= await bcrypt.compare(password, user.passwordHash);
//     if(!passwordValid){
//         throw new UnauthorizedException(
//             'Invalid email or password',
//         );
//     }
//     return user;
//  }
// private async generateAccessToken(
//       userId: string,
//     tenantId:string,
//     role:string,
// ){
//     const refreshSeceret= this.configService.get<string>('jwt.refreshSecret');
//     const refreshExpiresIn= this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
//     const payload={
//         sub: userId,
//         tenantId,
//         role,
//     };
//     return this.jwtService.signAsync(payload, {
//         secret: refreshSeceret,
//         expiresIn: refreshExpiresIn as any,
//     });
  


// }

//  async login(
//     email:string,
//     password:string
//  ){
//     const user= await this.validateUser(email, password);
//     const payload={
//         sub: user.id,
//         tenantId: user.tenantId,
//         role: user.role.name,
//     };
//     const accessToken= this.jwtService.sign(payload);
//     const refreshToken= await this.generateAccessToken(user.id, user.tenantId, user.role.name);
//     const refreshTokenHash= await bcrypt.hash(refreshToken, 12);
//     await this.prisma.user.update({
//         where: {
//             id: user.id,
//         },
//         data: {
//             refreshTokenHash,
//         }
//     });
//     return {
//         accessToken,
//         refreshToken,
//         user:{
//             id:user.id,
//             firstName:user.firstName,
//             lastName:user.lastName,
//             email:user.email,
//             tenantId:user.tenantId,
//             role:user.role.name

//         }
//     }
//  }
//  async refreshAccessToken(
//   refreshToken: string,
// ) {
//   const refreshSecret =
//     this.configService.get<string>(
//       'jwt.refreshSecret',
//     );

//   let payload: {
//     sub: string;
//     tenantId: string;
//     role: string;
//   };

//   try {
//     payload =
//       await this.jwtService.verifyAsync(
//         refreshToken,
//         {
//           secret: refreshSecret,
//         },
//       );
//   } catch {
//     throw new UnauthorizedException(
//       'Invalid or expired refresh token',
//     );
//   }

//   const user =
//     await this.prisma.user.findFirst({
//       where: {
//         id: payload.sub,
//         tenantId: payload.tenantId,
//         isActive: true,
//       },
//       include: {
//         role: true,
//       },
//     });

//   if (
//     !user ||
//     !user.refreshTokenHash
//   ) {
//     throw new UnauthorizedException(
//       'Invalid refresh token',
//     );
//   }

//   const tokenMatches =
//     await bcrypt.compare(
//       refreshToken,
//       user.refreshTokenHash,
//     );

//   if (!tokenMatches) {
//     throw new UnauthorizedException(
//       'Invalid refresh token',
//     );
//   }

//   const accessPayload = {
//     sub: user.id,
//     tenantId: user.tenantId,
//     role: user.role.name,
//   };

//   const accessToken =
//     await this.jwtService.signAsync(
//       accessPayload,
//     );

//   return {
//     accessToken,
//   };
// }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../common/prisma/prisma.service';
import { TenantContext } from '../common/tenant/tenant-context.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const tenantId = await this.tenantContext.getTenantId();
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email,
        isActive: true,
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async generateRefreshToken(
    userId: string,
    tenantId: string,
    role: string,
  ): Promise<string> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const payload = {
      sub: userId,
      tenantId,
      role,
    };

    return this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      user.tenantId,
      user.role.name,
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role.name,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    let payload: {
      sub: string;
      tenantId: string;
      role: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload);

    const newRefreshToken =
    await this.generateRefreshToken(
      user.id,
      user.tenantId,
      user.role.name,
    );
    /*
   * Hash the NEW refresh token.
   */
  const newRefreshTokenHash =
    await bcrypt.hash(
      newRefreshToken,
      12,
    );
    /*
   * Replace the old refresh-token hash.
   *
   * The previous refresh token is now invalid.
   */
  await this.prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshTokenHash:
        newRefreshTokenHash,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };

    
    
  }
  async logout(
  userId: string,
) {
  await this.prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      refreshTokenHash: null,
    },
  });

  return {
    message: 'Logged out successfully',
  };
}
}