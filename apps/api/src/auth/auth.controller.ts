import {
  Controller,
  Post,
  Body,
  Get,
  UsePipes,
  UseGuards,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
} from '@alpha/validation';
import type { LoginInput, RegisterInput, VerifyOtpInput } from '@alpha/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() registerDto: RegisterInput) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyOtp(verifyOtpDto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { status: 'success' };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() loginDto: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { status: 'success' };
  }

  @Post('refresh')
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const tokens = await this.authService.refresh(oldRefreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { status: 'success' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { status: 'success' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: ExpressRequest) {
    return {
      status: 'success',
      data: req.user,
    };
  }
}
