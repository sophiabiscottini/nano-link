import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS app with Fastify adapter for better performance ✨
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true, // Required for getting real IP behind proxies
    }),
  );

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configure Swagger/OpenAPI documentation ✨
  const config = new DocumentBuilder()
    .setTitle('ZipLink API')
    .setDescription(
      'A cute but powerful URL shortening service ~ focused on scalability and data analytics! ♡\n\n' +
      '## Features\n' +
      '- 🔗 URL Shortening with custom aliases\n' +
      '- 📊 Analytics with click tracking\n' +
      '- 🌍 GeoIP country resolution\n' +
      '- ⚡ High-performance with Redis caching\n' +
      '- 🛡️ Rate limiting protection'
    )
    .setVersion('0.7.0')
    .setContact('Sophia Biscottini', 'https://github.com/sophiabiscottini', '')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('URLs', 'URL shortening endpoints')
    .addTag('Analytics', 'Analytics and statistics endpoints')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  await SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ZipLink API Docs ✨',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { background-color: #ffb048ff; }
      .swagger-ui .topbar-wrapper img { content: url('https://nestjs.com/img/logo-small.svg'); height: 40px; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ZipLink API is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
  logger.log(`📦 Environment: ${nodeEnv}`);
  logger.log(`✨ Ready to shorten URLs ~`);
}

bootstrap();
