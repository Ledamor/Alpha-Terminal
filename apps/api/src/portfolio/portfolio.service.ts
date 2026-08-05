import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JSendResponse } from '@alpha/types';
import type { Portfolio, Position } from '@prisma/client';

type PortfolioWithPositions = Portfolio & { positions: Position[] };

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getMyPortfolio(
    userId: string,
  ): Promise<JSendResponse<PortfolioWithPositions>> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        positions: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return {
      status: 'success',
      data: portfolio,
    };
  }
}
