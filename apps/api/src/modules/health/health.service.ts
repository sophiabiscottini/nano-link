import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';
import { ANALYTICS_QUEUE } from '@shared/common/constants/queues.constant';

export interface ServiceHealth {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

export interface QueueHealth extends ServiceHealth {
  waiting?: number;
  active?: number;
  completed?: number;
  failed?: number;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    queue: QueueHealth;
  };
}

export interface ReadinessStatus extends HealthStatus {
  ready: boolean;
}

export interface LivenessStatus {
  alive: boolean;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue(ANALYTICS_QUEUE) private readonly analyticsQueue: Queue,
  ) {}

  async check(): Promise<HealthStatus> {
    const [dbHealth, cacheHealth, queueHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkQueue(),
    ]);

    // Determine overall status
    const allUp = dbHealth.status === 'up' && cacheHealth.status === 'up' && queueHealth.status === 'up';
    const allDown = dbHealth.status === 'down' && cacheHealth.status === 'down' && queueHealth.status === 'down';
    
    let status: 'ok' | 'degraded' | 'error';
    if (allUp) {
      status = 'ok';
    } else if (allDown) {
      status = 'error';
    } else {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      services: {
        database: dbHealth,
        cache: cacheHealth,
        queue: queueHealth,
      },
    };
  }

  async checkReadiness(): Promise<ReadinessStatus> {
    const health = await this.check();
    return {
      ready: health.status === 'ok',
      ...health,
    };
  }

  checkLiveness(): LivenessStatus {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'down',
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkCache(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const client = this.redis.getClient();
      await client.ping();
      return {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return {
        status: 'down',
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkQueue(): Promise<QueueHealth> {
    const start = Date.now();
    try {
      // Get queue job counts
      const [waiting, active, completed, failed] = await Promise.all([
        this.analyticsQueue.getWaitingCount(),
        this.analyticsQueue.getActiveCount(),
        this.analyticsQueue.getCompletedCount(),
        this.analyticsQueue.getFailedCount(),
      ]);

      return {
        status: 'up',
        latency: Date.now() - start,
        waiting,
        active,
        completed,
        failed,
      };
    } catch (error) {
      this.logger.error('Queue health check failed', error);
      return {
        status: 'down',
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
