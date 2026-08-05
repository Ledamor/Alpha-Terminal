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
  AAPL: 224.50,
  TSLA: 218.80,
  NVDA: 124.70,
  MSFT: 416.30,
  AMZN: 186.20,
  META: 518.40,
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

  async getAllAssets() {
    const liveQuotes = await this.yahooFinanceService.getQuotes(SUPPORTED_SYMBOLS);
    const assetList = [];

    const assetNames: Record<string, string> = {
      AAPL: 'Apple Inc.',
      TSLA: 'Tesla Inc.',
      NVDA: 'NVIDIA Corp.',
      MSFT: 'Microsoft Corp.',
      AMZN: 'Amazon.com Inc.',
      META: 'Meta Platforms Inc.',
    };

    for (const symbol of SUPPORTED_SYMBOLS) {
      const quote = await this.yahooFinanceService.getQuote(symbol);
      const price = quote?.price ?? (await this.getCurrentPrice(symbol));
      const changePercent = quote?.regularMarketChangePercent ?? 0;
      const change = Number(((price * changePercent) / 100).toFixed(2));

      // Ensure price is cached in Redis
      await this.redis.set(`price:${symbol}`, price.toString());

      assetList.push({
        symbol,
        name: assetNames[symbol] || symbol,
        price,
        change,
        changePercent,
        volume: '45.2M',
      });
    }

    return assetList;
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
