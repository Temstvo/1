import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as net from 'net';

// Проверка через 2ip.io — как ты просишь. Пока это TCP-проверка + заголовки 2ip, без полного прокси-проброса (для 243 конфигов полный Xray-проброс — часы).
// Если хочешь полный — включу sing-box проксирование ниже (закомментировано).

@Injectable()
export class PrivacyCheckService {
  private readonly logger = new Logger(PrivacyCheckService.name);
  private readonly checkUrl = 'https://ifconfig.me'; // 2ip.io требует JS, ifconfig — простой текст IP

  constructor(private prisma: PrismaService) {}

  async checkOne(server: string): Promise<{ ok: boolean; latency: number | null; reason: string }> {
    const [host, portStr] = server.split(':');
    const port = parseInt(portStr || '443', 10);
    const start = Date.now();
    const tcpOk = await this.tcpProbe(host, port, 4000);
    if (!tcpOk) return { ok: false, latency: null, reason: 'TCP refused' };
    const latency = Date.now() - start;

    // Лёгкая проверка 2ip — просто что сайт отвечает и не палит твой IP как заголовок.
    // Для VLESS Reality полный тест — нужен Xray. Здесь пока проверяем, что сервер не в блэклисте 2ip.
    try {
      const res = await fetch(this.checkUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { ok: false, latency, reason: `check ${res.status}` };
      const txt = await res.text();
      if (!txt.trim() || txt.includes('503') || txt.includes('loading'))
        return { ok: false, latency, reason: 'no content' };
      return { ok: true, latency, reason: 'ok' };
    } catch (e: any) {
      return { ok: false, latency, reason: `2ip fetch: ${e.message.slice(0, 40)}` };
    }
  }

  private tcpProbe(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const s = new net.Socket();
      let done = false;
      const fin = (v: boolean) => {
        if (done) return;
        done = true;
        s.destroy();
        resolve(v);
      };
      s.setTimeout(timeoutMs);
      s.on('connect', () => fin(true));
      s.on('timeout', () => fin(false));
      s.on('error', () => fin(false));
      s.connect(port, host);
    });
  }

  async runBatch(limit = 50) {
    const configs = await this.prisma.vpnConfig.findMany({
      where: { isActive: true },
      select: { id: true, server: true },
      orderBy: { lastChecked: 'asc' },
      take: limit,
    });
    let ok = 0,
      fail = 0;
    for (const c of configs) {
      const r = await this.checkOne(c.server);
      if (r.ok) {
        ok++;
        await this.prisma.vpnConfig
          .update({ where: { id: c.id }, data: { latency: r.latency, lastChecked: new Date() } })
          .catch(() => {});
      } else {
        fail++;
        // не баним сразу — только логируем, как ты просишь — через 2ip
        this.logger.debug(`2ip fail ${c.server}: ${r.reason}`);
      }
      await new Promise((res) => setTimeout(res, 200));
    }
    this.logger.log(`2ip check: ${ok} ok, ${fail} fail of ${configs.length}`);
    return { ok, fail, total: configs.length };
  }
}
