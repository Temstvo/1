import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VpnAccess } from '@prisma/client';

export function validateLinks(links: unknown): string[] {
  if (!Array.isArray(links) || links.length === 0 || links.length > 100)
    throw new Error('VPN provider returned no usable configurations');
  return links.map((link) => {
    if (typeof link !== 'string' || link.length > 4096 || /[\r\n]/.test(link))
      throw new Error('Invalid VLESS link');
    const url = new URL(link);
    const p = url.searchParams;
    if (
      url.protocol !== 'vless:' ||
      !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(url.username) ||
      !url.hostname ||
      !url.port ||
      Number(url.port) < 1 ||
      Number(url.port) > 65535 ||
      p.get('security') !== 'reality' ||
      !p.get('sni') ||
      !/^[A-Za-z0-9_-]{43}$/.test(p.get('pbk') || '') ||
      !/^(?:[a-f0-9]{2}){0,8}$/i.test(p.get('sid') || '') ||
      !['tcp', 'raw', 'grpc', 'xhttp'].includes(p.get('type') || '') ||
      p.get('encryption') !== 'none' ||
      p.get('allowInsecure') === '1'
    )
      throw new Error('Invalid VLESS Reality parameters');
    return link;
  });
}

@Injectable()
export class MarzbanService {
  private token?: string;
  constructor(private config: ConfigService) {}
  configured() {
    return !!(
      this.config.get('MARZBAN_URL') &&
      this.config.get('MARZBAN_USERNAME') &&
      this.config.get('MARZBAN_PASSWORD') &&
      this.config.get('MARZBAN_INBOUND_TAG')
    );
  }
  private async login() {
    const res = await fetch(
      this.config.get<string>('MARZBAN_URL')!.replace(/\/$/, '') + '/api/admin/token',
      {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: this.config.get('MARZBAN_USERNAME')!,
          password: this.config.get('MARZBAN_PASSWORD')!,
        }),
      },
    );
    if (!res.ok) throw new Error('VPN provider authentication failed');
    const data = (await res.json()) as any;
    if (!data.access_token) throw new Error('VPN provider returned no token');
    this.token = data.access_token;
  }
  private async request(
    method: string,
    path: string,
    body?: unknown,
    retry = true,
  ): Promise<{ status: number; data: any }> {
    if (!this.configured())
      throw new ServiceUnavailableException('VPN-инфраструктура не настроена');
    if (!this.token) await this.login();
    const res = await fetch(this.config.get<string>('MARZBAN_URL')!.replace(/\/$/, '') + path, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && retry) {
      this.token = undefined;
      return this.request(method, path, body, false);
    }
    if (res.status === 404 || res.status === 409) return { status: res.status, data: null };
    if (!res.ok) throw new Error('VPN provider HTTP ' + res.status);
    return { status: res.status, data: await res.json() };
  }

  async sync(access: VpnAccess, enabled: boolean) {
    const path = '/api/user/' + encodeURIComponent(access.username);
    let existing = await this.request('GET', path);
    if (!enabled) {
      if (existing.status !== 404) {
        const disabled = await this.request('PUT', path, { status: 'disabled' });
        if (disabled.status !== 404 && disabled.data?.status !== 'disabled')
          throw new Error('VPN revocation not acknowledged');
      }
      return null;
    }
    const body = {
      expire: Math.floor(access.expiresAt.getTime() / 1000),
      status: 'active',
      data_limit: Number(access.trafficLimit),
      data_limit_reset_strategy: 'no_reset',
      proxies: { vless: { flow: 'xtls-rprx-vision' } },
      inbounds: { vless: [this.config.get('MARZBAN_INBOUND_TAG')] },
    };
    if (existing.status === 404) {
      existing = await this.request('POST', '/api/user', { username: access.username, ...body });
      // A timed out previous request may have created this deterministic account.
      if (existing.status === 409) existing = await this.request('PUT', path, body);
    } else {
      // Preserve the remote UUID on renewal. Traffic quota is cumulative across renewals.
      existing = await this.request('PUT', path, {
        ...body,
        proxies: { vless: existing.data.proxies.vless },
      });
    }
    const data = existing.data;
    if (
      !data ||
      data.username !== access.username ||
      !['active', 'limited'].includes(data.status) ||
      data.expire !== body.expire ||
      data.data_limit !== body.data_limit
    )
      throw new Error('VPN desired state not acknowledged');
    const links = validateLinks(data.links);
    const subscriptionUrl = new URL(data.subscription_url, this.config.get('MARZBAN_URL'));
    if (
      !['https:', 'http:'].includes(subscriptionUrl.protocol) ||
      subscriptionUrl.username ||
      subscriptionUrl.password ||
      (this.config.get('NODE_ENV') === 'production' && subscriptionUrl.protocol !== 'https:')
    )
      throw new Error('Invalid VPN subscription URL');
    return {
      links,
      subscriptionUrl: subscriptionUrl.toString(),
      limited: data.status === 'limited',
    };
  }
}
