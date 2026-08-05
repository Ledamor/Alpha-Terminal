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
    // req.user is populated by our JwtStrategy, safe because of express.d.ts
    return this.portfolioService.getMyPortfolio(req.user!.userId);
  }
}
