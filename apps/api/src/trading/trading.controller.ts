import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { TradingService } from './trading.service';
import type { ExecuteOrderInput } from '@alpha/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { Get } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly marketService: MarketService,
  ) {}

  @Get('prices')
  async getMarketPrices() {
    const assets = await this.marketService.getAllAssets();
    return {
      status: 'success',
      data: assets,
    };
  }

  @Post('order')
  @UseGuards(JwtAuthGuard)
  executeOrder(
    @Request() req: ExpressRequest,
    @Body() orderDto: ExecuteOrderInput,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found on authenticated request');
    }
    return this.tradingService.executeOrder(userId, orderDto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@Request() req: ExpressRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found on authenticated request');
    }
    return this.tradingService.getOrders(userId);
  }
}
