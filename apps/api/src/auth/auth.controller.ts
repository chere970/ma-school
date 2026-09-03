import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.services';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email and password to receive access + refresh JWT tokens' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns accessToken and refreshToken.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Generate a new access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Returns a new accessToken.' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid or expired.' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Invalidate the current user refresh token (logout)' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.userId);
  }
}
