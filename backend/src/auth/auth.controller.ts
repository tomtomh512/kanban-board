import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from '../users/users.types';
import {
  LoginBody,
  LogoutResponse,
  RegisterBody,
  UserResponse,
} from './auth.types';

const ACCESS_TOKEN_COOKIE = 'access_token';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookie(response: Response, token: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  @Post('register')
  async register(
    @Body() body: RegisterBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    const result = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );

    this.setAuthCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    const result = await this.authService.login(body.email, body.password);

    this.setAuthCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): LogoutResponse {
    response.clearCookie(ACCESS_TOKEN_COOKIE);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: Request): AuthenticatedUser {
    return request.user as AuthenticatedUser;
  }
}
