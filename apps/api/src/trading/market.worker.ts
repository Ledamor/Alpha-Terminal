import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MarketService } from './market.service';

@Processor('market')
export class MarketWorker extends WorkerHost {
  private readonly logger = new Logger(MarketWorker.name);

  constructor(private readonly marketService: MarketService) {
    super();
  }

  async process(job: Job<unknown, unknown, string>): Promise<void> {
    if (job.name === 'tick') {
      await this.marketService.tick();
    }
  }
}
