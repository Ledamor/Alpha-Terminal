import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MarketService } from './market.service';

@Module({
  controllers: [TradingController],
  providers: [TradingService, MarketService],
  exports: [MarketService], // In case other modules need live pricing later
})
export class TradingModule {}
