import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { TradingService } from './trading.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { executeOrderSchema } from '@alpha/validation';
import type { ExecuteOrderInput } from '@alpha/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('order')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(executeOrderSchema))
  executeOrder(
    @Request() req: ExpressRequest,
    @Body() orderDto: ExecuteOrderInput,
  ) {
    // req.user is populated by our JwtStrategy (contains userId)
    return this.tradingService.executeOrder(req.user!.userId, orderDto);
  }
}
