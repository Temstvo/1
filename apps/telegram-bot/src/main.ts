import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './bot/bot.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const botService = app.get(BotService);
  botService.launch();

  console.log('🚀 Telegram Bot is running');

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
