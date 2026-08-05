import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@alpha/db';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Seed demo user for development until Auth is implemented
    await this.user.upsert({
      where: { id: 'demo-user-id' },
      update: {},
      create: {
        id: 'demo-user-id',
        email: 'demo@alpha.terminal',
        username: 'demo_user',
        passwordHash: 'dummy_hash',
        portfolio: {
          create: {
            balance: 100000.0,
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
