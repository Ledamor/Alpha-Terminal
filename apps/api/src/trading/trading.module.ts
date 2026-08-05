import { Module, OnModuleInit } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MarketService } from './market.service';
import { MarketGateway } from './market.gateway';
import { MarketWorker } from './market.worker';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { YahooFinanceService } from './yahoo-finance.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'market',
    }),
  ],
  controllers: [TradingController],
  providers: [
    TradingService,
    MarketService,
    MarketGateway,
    MarketWorker,
    YahooFinanceService,
  ],
  exports: [MarketService, MarketGateway, YahooFinanceService], // In case other modules need live pricing later
})
export class TradingModule implements OnModuleInit {
  constructor(@InjectQueue('market') private readonly marketQueue: Queue) {}

  async onModuleInit() {
    // Dispatch the repeating tick job every 2 seconds
    await this.marketQueue.add(
      'tick',
      {},
      {
        repeat: {
          every: 2000,
        },
        jobId: 'market-tick-job', // Ensures we don't duplicate the recurring job on restarts
      },
    );
  }
}
