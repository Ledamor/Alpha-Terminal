import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { MarketGateway } from './market.gateway';
import { YahooFinanceService } from './yahoo-finance.service';

const SUPPORTED_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'];

const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 175.43,
  TSLA: 214.12,
  NVDA: 890.0,
  MSFT: 415.2,
  AMZN: 178.15,
  META: 485.5,
};

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly gateway: MarketGateway,
    private readonly yahooFinanceService: YahooFinanceService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Initializing Market Engine with Yahoo Finance live prices...',
    );
    // Attempt to seed Redis with real Yahoo Finance market prices
    const liveQuotes =
      await this.yahooFinanceService.getQuotes(SUPPORTED_SYMBOLS);

    for (const symbol of SUPPORTED_SYMBOLS) {
      const realPrice = liveQuotes[symbol] ?? FALLBACK_PRICES[symbol];
      await this.redis.set(`price:${symbol}`, realPrice.toString());
      this.logger.log(`Initialized ${symbol} price in Redis: $${realPrice}`);
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const priceStr = await this.redis.get(`price:${symbol.toUpperCase()}`);
    if (!priceStr) {
      throw new NotFoundException(`Asset ${symbol} not found in the market.`);
    }
    return parseFloat(priceStr);
  }

  /**
   * Called by the background worker every few seconds to simulate market movement.
   */
  async tick() {
    for (const symbol of SUPPORTED_SYMBOLS) {
      const currentPrice = await this.getCurrentPrice(symbol);

      // Hybrid strategy: apply slight volatility tick over real-world price baseline
      const volatility = 0.0015; // 0.15% max movement per tick
      const changePercent = 1 + (Math.random() * volatility * 2 - volatility);
      const newPrice = Number((currentPrice * changePercent).toFixed(2));

      // Save to redis
      await this.redis.set(`price:${symbol}`, newPrice.toString());

      // Broadcast to connected clients
      this.gateway.emitPriceUpdate(symbol, newPrice);
    }
  }
}
