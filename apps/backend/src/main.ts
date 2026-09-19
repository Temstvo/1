import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  app.use(helmet());
  app.enableShutdownHooks();
  // Only trust the explicitly configured proxy hop; do not trust arbitrary X-Forwarded-For.
  if (configService.get('TRUST_PROXY') === '1') app.set('trust proxy', 1);
  const loggerMiddleware = new RequestLoggerMiddleware();
  app.use(loggerMiddleware.use.bind(loggerMiddleware));
  app.setGlobalPrefix(apiPrefix, {
    exclude: [
      { method: RequestMethod.GET, path: 'sub/:token' },
      { method: RequestMethod.GET, path: 'sub/miku/:token' },
    ],
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

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

  app.useGlobalInterceptors(new BigIntInterceptor());

  const config = new DocumentBuilder()
    .setTitle('APPI VPN API')
    .setDescription('APPI VPN platform REST API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('vpn', 'VPN configuration and servers')
    .addTag('subscriptions', 'Subscription management')
    .addTag('payments', 'Payment processing')
    .addTag('admin', 'Administration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('FATAL: failed to start application', err);
  process.exit(1);
});
