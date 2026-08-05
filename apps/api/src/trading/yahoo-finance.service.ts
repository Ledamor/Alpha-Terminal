import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

export interface StockQuote {
  symbol: string;
  price: number;
  currency?: string;
  regularMarketChangePercent?: number;
}

interface YahooQuoteResponse {
  regularMarketPrice?: number;
  postMarketPrice?: number;
  preMarketPrice?: number;
  currency?: string;
  regularMarketChangePercent?: number;
}

@Injectable()
export class YahooFinanceService {
  private readonly logger = new Logger(YahooFinanceService.name);
  private readonly yf = new YahooFinance();

  /**
   * Fetch real-time market quote for a single ticker.
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const quote = (await this.yf.quote(
        symbol,
      )) as unknown as YahooQuoteResponse;
      const price =
        quote?.regularMarketPrice ??
        quote?.postMarketPrice ??
        quote?.preMarketPrice;

      if (price === undefined || price === null) {
        this.logger.warn(
          `No valid price returned from Yahoo Finance for ticker ${symbol}`,
        );
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        price: Number(price.toFixed(2)),
        currency: quote?.currency || 'USD',
        regularMarketChangePercent: quote?.regularMarketChangePercent,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to fetch Yahoo Finance quote for ${symbol}: ${message}`,
      );
      return null;
    }
  }

  /**
   * Fetch quotes for a batch of tickers concurrently.
   */
  async getQuotes(symbols: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await this.getQuote(symbol);
        if (quote) {
          results[quote.symbol] = quote.price;
        }
      }),
    );

    return results;
  }
}
