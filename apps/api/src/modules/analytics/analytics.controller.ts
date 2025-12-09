import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AnalyticsService, AnalyticsStats } from './analytics.service';

@ApiTags('Analytics')
@Controller('api/v1/stats')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/v1/stats/:code
   * Get analytics statistics for a short URL
   */
  @Get(':code')
  @ApiOperation({
    summary: 'Get URL analytics',
    description: 'Returns detailed analytics for a shortened URL including clicks by day, top countries, and top browsers.',
  })
  @ApiParam({
    name: 'code',
    description: 'The short code or custom alias',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics statistics for the URL',
    schema: {
      type: 'object',
      properties: {
        shortCode: { type: 'string', example: 'abc123' },
        originalUrl: { type: 'string', example: 'https://example.com' },
        totalClicks: { type: 'number', example: 1234 },
        analytics: {
          type: 'object',
          properties: {
            clicksByDay: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', example: '2025-12-09' },
                  count: { type: 'number', example: 42 },
                },
              },
            },
            topCountries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  country: { type: 'string', example: 'US' },
                  count: { type: 'number', example: 100 },
                },
              },
            },
            topBrowsers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  browser: { type: 'string', example: 'Chrome' },
                  count: { type: 'number', example: 200 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async getStats(@Param('code') code: string): Promise<AnalyticsStats> {
    return this.analyticsService.getStats(code);
  }
}
