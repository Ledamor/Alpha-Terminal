import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TradingModule } from './trading/trading.module';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [PrismaModule, AuthModule, TradingModule, PortfolioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
