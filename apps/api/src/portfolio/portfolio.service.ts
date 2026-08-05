import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../trading/market.service';
import { JSendResponse } from '@alpha/types';
import type { Portfolio, Position } from '@alpha/db';

export type EnhancedPosition = Position & {
  currentPrice: number;
  currentValue: number;
  pnl: number;
};

export type EnhancedPortfolio = Portfolio & {
  positions: EnhancedPosition[];
  totalValue: number;
  totalPnl: number;
};

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
  ) {}

  async getMyPortfolio(
    userId: string,
  ): Promise<JSendResponse<EnhancedPortfolio>> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        positions: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    let totalPositionsValue = 0;
    let totalPositionsPnl = 0;

    const enhancedPositions: EnhancedPosition[] = await Promise.all(
      portfolio.positions.map(async (pos) => {
        let currentPrice = Number(pos.averagePrice);
        try {
          currentPrice = await this.marketService.getCurrentPrice(pos.symbol);
        } catch {
          // Fallback to average price if market price is unavailable
        }

        const quantity = Number(pos.quantity);
        const averagePrice = Number(pos.averagePrice);
        const currentValue = quantity * currentPrice;
        const pnl = currentValue - quantity * averagePrice;

        totalPositionsValue += currentValue;
        totalPositionsPnl += pnl;

        return {
          ...pos,
          currentPrice,
          currentValue,
          pnl,
        };
      }),
    );

    const balance = Number(portfolio.balance);
    const totalValue = balance + totalPositionsValue;

    const enhancedPortfolio: EnhancedPortfolio = {
      ...portfolio,
      positions: enhancedPositions,
      totalValue,
      totalPnl: totalPositionsPnl,
    };

    return {
      status: 'success',
      data: enhancedPortfolio,
    };
  }
}
