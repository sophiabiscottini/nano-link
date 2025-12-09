import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ANALYTICS_QUEUE } from '@shared/common/constants/queues.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ANALYTICS_QUEUE,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
