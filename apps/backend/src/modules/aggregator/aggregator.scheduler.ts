import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AggregatorService } from './aggregator.service';

@Injectable()
export class AggregatorScheduler {
  private readonly logger = new Logger(AggregatorScheduler.name);
  private running = false;

  constructor(
    private agg: AggregatorService,
    private config: ConfigService,
  ) {}

  // При старте — один прогон через 30 сек (чтобы БД успела подняться)
  @Cron('30 * * * * *')
  async onTick() {
    if (this.running) return;
    // Запускаем только раз в час, а тик каждую минуту — проверяем час
    const now = new Date();
    if (now.getMinutes() !== 5) return; // 5-я минута каждого часа
    await this.runOnce();
  }

  async runOnce() {
    if (this.running) return;
    this.running = true;
    try {
      const key = this.config.get<string>('PUBLICVPNLIST_API_KEY') || '';
      const r = await this.agg.runOnce(key || undefined);
      this.logger.log(`Aggregator tick: ${JSON.stringify(r)}`);
    } catch (e: any) {
      this.logger.warn(`Aggregator: ${e.message}`);
    } finally {
      this.running = false;
    }
  }
}
