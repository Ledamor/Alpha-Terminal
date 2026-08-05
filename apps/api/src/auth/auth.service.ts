import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  JSendResponse,
} from '@alpha/types';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterInput,
  ): Promise<JSendResponse<{ email: string }>> {
    const existingUser = (await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })) as User | null;

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const existingUsername = (await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    })) as User | null;

    if (existingUsername) {
      throw new BadRequestException('Username is already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now

    await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        passwordHash,
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    });

    // MOCK EMAIL SENDING
    console.log(`\n\n=========================================`);
    console.log(`✉️ MOCK EMAIL SENT TO: ${registerDto.email}`);
    console.log(`🔑 YOUR OTP CODE IS: ${otpCode}`);
    console.log(`=========================================\n\n`);

    return {
      status: 'success',
      data: {
        email: registerDto.email,
      },
    };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpInput,
  ): Promise<JSendResponse<{ token: string }>> {
    const user = (await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    })) as User | null;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    if (user.otpCode !== verifyOtpDto.code) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired');
    }

    // Mark as verified, clear OTP, and create their Portfolio
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          otpCode: null,
          otpExpiresAt: null,
        },
      });

      // Give them a starting balance of $100,000
      await tx.portfolio.create({
        data: {
          userId: user.id,
          balance: 100000.0,
        },
      });
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      status: 'success',
      data: { token },
    };
  }

  async login(loginDto: LoginInput): Promise<JSendResponse<{ token: string }>> {
    const user = (await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    })) as User | null;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email address first');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      status: 'success',
      data: { token },
    };
  }
}
