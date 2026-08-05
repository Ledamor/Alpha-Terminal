import { Controller, Post, Body, Get, UsePipes, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, registerSchema, verifyOtpSchema } from '@alpha/validation';
import type { LoginInput, RegisterInput, VerifyOtpInput } from '@alpha/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() registerDto: RegisterInput) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  verifyOtp(@Body() verifyOtpDto: VerifyOtpInput) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() loginDto: LoginInput) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return {
      status: 'success',
      data: req.user
    };
  }
}
