import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  app.use(helmet());
  const loggerMiddleware = new RequestLoggerMiddleware();
  app.use(loggerMiddleware.use.bind(loggerMiddleware));
  app.setGlobalPrefix(apiPrefix);

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
