import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MarketService {
  // Hardcoded mock prices matching the frontend for consistency during this phase
  private mockPrices: Record<string, number> = {
    'AAPL': 175.43,
    'TSLA': 214.12,
    'NVDA': 890.00,
    'MSFT': 415.20,
    'AMZN': 178.15,
    'META': 485.50
  };

  /**
   * Securely fetch the current price for a symbol on the backend.
   * In a real application, this would call a real external API (like Polygon or Alpaca).
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    const price = this.mockPrices[symbol.toUpperCase()];
    if (!price) {
      throw new NotFoundException(`Asset ${symbol} not found in the mock market.`);
    }
    return price;
  }
}
