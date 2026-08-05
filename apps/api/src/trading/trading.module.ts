import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MarketService } from './market.service';
import { MarketGateway } from './market.gateway';

@Module({
  controllers: [TradingController],
  providers: [TradingService, MarketService, MarketGateway],
  exports: [MarketService, MarketGateway], // In case other modules need live pricing later
})
export class TradingModule {}
