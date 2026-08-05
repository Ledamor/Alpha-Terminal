import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TradingModule } from './trading/trading.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    TradingModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
