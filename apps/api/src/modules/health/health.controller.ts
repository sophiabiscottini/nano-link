import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus, ReadinessStatus, LivenessStatus } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Full health check',
    description: 'Returns detailed health status of all services including database, cache, and queue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'degraded', 'error'] },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string', example: '0.6.0' },
        uptime: { type: 'number', example: 3600 },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'] },
                latency: { type: 'string', example: '5ms' },
              },
            },
            cache: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'] },
                latency: { type: 'string', example: '2ms' },
              },
            },
            queue: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'] },
                latency: { type: 'string', example: '3ms' },
                jobs: {
                  type: 'object',
                  properties: {
                    waiting: { type: 'number' },
                    active: { type: 'number' },
                    completed: { type: 'number' },
                    failed: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  check(): Promise<HealthStatus> {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Kubernetes readiness probe - checks if all external dependencies are available.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept traffic',
  })
  readiness(): Promise<ReadinessStatus> {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Kubernetes liveness probe - checks if the service is alive.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  liveness(): LivenessStatus {
    return this.healthService.checkLiveness();
  }
}
