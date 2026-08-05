import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyPortfolio(@Request() req: any) {
    return this.portfolioService.getMyPortfolio(req.user.userId);
  }
}
