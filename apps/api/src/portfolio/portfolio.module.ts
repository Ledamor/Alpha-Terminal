import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TradingModule } from '../trading/trading.module';

@Module({
  imports: [TradingModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
