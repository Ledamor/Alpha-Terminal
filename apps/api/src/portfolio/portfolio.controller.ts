import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyPortfolio(@Request() req: ExpressRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found on authenticated request');
    }
    return this.portfolioService.getMyPortfolio(userId);
  }
}
