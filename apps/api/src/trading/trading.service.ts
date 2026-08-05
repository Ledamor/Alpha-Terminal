import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from './market.service';
import { MarketGateway } from './market.gateway';
import { ExecuteOrderInput, JSendResponse } from '@alpha/types';

@Injectable()
export class TradingService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
    private marketGateway: MarketGateway,
  ) {}

  async executeOrder(
    userId: string,
    orderDto: ExecuteOrderInput,
  ): Promise<JSendResponse<Record<string, unknown>>> {
    const { symbol, side, quantity } = orderDto;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Fetch User's Portfolio
      let portfolio = await tx.portfolio.findUnique({
        where: { userId },
      });

      // Lazily create it if they registered before we added automatic portfolio creation
      if (!portfolio) {
        portfolio = await tx.portfolio.create({
          data: {
            userId,
            balance: 100000.0,
          },
        });
      }

      // 2. Get secure market price from internal service
      const executionPrice = await this.marketService.getCurrentPrice(symbol);
      const totalCost = Number(executionPrice) * Number(quantity);

      // 3. Process Logic based on side
      if (side === 'BUY') {
        if (Number(portfolio.balance) < totalCost) {
          throw new BadRequestException(
            `Insufficient funds. Cost is $${totalCost.toFixed(2)}, but balance is $${Number(portfolio.balance).toFixed(2)}.`,
          );
        }

        // Deduct balance
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: { decrement: totalCost } },
        });

        // Upsert Position
        const existingPosition = await tx.position.findUnique({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } },
        });

        if (existingPosition) {
          // Calculate new average price
          const oldTotalCost =
            Number(existingPosition.quantity) *
            Number(existingPosition.averagePrice);
          const newTotalCost = oldTotalCost + totalCost;
          const newQuantity =
            Number(existingPosition.quantity) + Number(quantity);
          const newAveragePrice = newTotalCost / newQuantity;

          await tx.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: newQuantity,
              averagePrice: newAveragePrice,
            },
          });
        } else {
          await tx.position.create({
            data: {
              portfolioId: portfolio.id,
              symbol,
              quantity,
              averagePrice: executionPrice,
            },
          });
        }
      } else if (side === 'SELL') {
        // Find existing position
        const existingPosition = await tx.position.findUnique({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } },
        });

        if (
          !existingPosition ||
          Number(existingPosition.quantity) < Number(quantity)
        ) {
          throw new BadRequestException(
            `Insufficient shares. You only own ${existingPosition ? Number(existingPosition.quantity) : 0} shares of ${symbol}.`,
          );
        }

        // Add to balance
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: { increment: totalCost } },
        });

        const newQuantity =
          Number(existingPosition.quantity) - Number(quantity);

        if (newQuantity === 0) {
          // Close position
          await tx.position.delete({
            where: { id: existingPosition.id },
          });
        } else {
          // Reduce position
          await tx.position.update({
            where: { id: existingPosition.id },
            data: { quantity: newQuantity },
          });
        }
      }

      // 4. Create Order Record
      const order = await tx.order.create({
        data: {
          userId,
          portfolioId: portfolio.id,
          symbol,
          side,
          type: 'MARKET',
          status: 'EXECUTED',
          quantity,
          executionPrice,
        },
      });

      return {
        status: 'success' as const,
        data: {
          orderId: order.id,
          symbol,
          side,
          quantity,
          executionPrice,
          totalCost,
          newBalance:
            Number(portfolio.balance) +
            (side === 'SELL' ? totalCost : -totalCost),
        },
      };
    });

    // Broadcast real-time order execution event over WebSocket
    this.marketGateway.emitOrderExecuted(result.data);

    return result;
  }
}
