import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AnalyticsProcessor } from './analytics.processor';
import { ANALYTICS_QUEUE } from '@shared/common/constants/queues.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '../../.env.local', '.env'],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({
      name: ANALYTICS_QUEUE,
    }),
    PrismaModule,
  ],
  providers: [AnalyticsProcessor],
})
export class WorkerModule {}
