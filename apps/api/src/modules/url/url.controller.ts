import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UrlService } from './url.service';
import { AnalyticsService } from '@modules/analytics/analytics.service';
import { CreateUrlDto, UrlResponseDto } from './dto';

@ApiTags('URLs')
@Controller()
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * POST /api/v1/shorten
   * Create a new shortened URL
   */
  @Post('api/v1/shorten')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a shortened URL',
    description: 'Creates a new short URL. Optionally accepts a custom alias.',
  })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or custom alias format',
  })
  @ApiResponse({
    status: 409,
    description: 'Custom alias already exists',
  })
  async createShortUrl(@Body() dto: CreateUrlDto): Promise<UrlResponseDto> {
    return this.urlService.createShortUrl(dto);
  }

  /**
   * GET /:code
   * Redirect to the original URL
   * This is the main entry point for shortened URLs
   */
  @Get(':code')
  @ApiOperation({
    summary: 'Redirect to original URL',
    description: 'Redirects to the original URL associated with the short code. Tracks the click for analytics.',
  })
  @ApiParam({
    name: 'code',
    description: 'The short code or custom alias',
    example: 'abc123',
  })
  @ApiResponse({
    status: 301,
    description: 'Permanent redirect to the original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async redirect(
    @Param('code') code: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const originalUrl = await this.urlService.getOriginalUrl(code);

    // Track click asynchronously (fire and forget)
    // This does not block the redirect response
    this.analyticsService.trackClick({
      shortCode: code,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      referer: request.headers['referer'],
    });

    // Use 301 (Permanent Redirect) for SEO benefits
    // Use 302 if you want to track all clicks or change destinations
    reply.status(HttpStatus.MOVED_PERMANENTLY).redirect(originalUrl);
  }

  /**
   * GET /api/v1/urls/:code
   * Get URL information (without redirecting)
   */
  @Get('api/v1/urls/:code')
  @ApiOperation({
    summary: 'Get URL information',
    description: 'Returns information about a shortened URL without redirecting.',
  })
  @ApiParam({
    name: 'code',
    description: 'The short code or custom alias',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'URL information',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async getUrlInfo(@Param('code') code: string): Promise<UrlResponseDto> {
    return this.urlService.getUrlInfo(code);
  }
}
