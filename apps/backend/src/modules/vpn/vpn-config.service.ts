import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';

export interface WireGuardConfig {
  interface: {
    privateKey: string;
    address: string;
    dns: string[];
    mtu: number;
  };
  peer: {
    publicKey: string;
    endpoint: string;
    allowedIPs: string[];
    persistentKeepalive: number;
  };
}

export interface OpenVPNConfig {
  client: boolean;
  dev: string;
  proto: string;
  remote: string;
  port: number;
  resolvRetry: boolean;
  nobind: boolean;
  persistKey: boolean;
  persistTun: boolean;
  cipher: string;
  auth: string;
  verb: number;
  keyDirection: number;
  ca: string;
  cert: string;
  key: string;
  tlsAuth: string;
}

export interface XrayConfig {
  log: { loglevel: string };
  routing: { rules: any[] };
  inbounds: any[];
  outbounds: any[];
  stats: {};
  policy: {};
}

@Injectable()
export class VpnConfigService {
  private readonly logger = new Logger(VpnConfigService.name);

  constructor(private configService: ConfigService) {}

  async generateWireGuardConfig(params: {
    serverIp: string;
    serverPort: number;
    serverPublicKey: string;
    clientPrivateKey: string;
    clientAddress: string;
    allowedIPs?: string[];
  }): Promise<WireGuardConfig> {
    return {
      interface: {
        privateKey: params.clientPrivateKey,
        address: `${params.clientAddress}/32`,
        dns: ['1.1.1.1', '8.8.8.8'],
        mtu: 1420,
      },
      peer: {
        publicKey: params.serverPublicKey,
        endpoint: `${params.serverIp}:${params.serverPort}`,
        allowedIPs: params.allowedIPs || ['0.0.0.0/0', '::/0'],
        persistentKeepalive: 25,
      },
    };
  }

  async generateWireGuardConfigString(params: {
    serverIp: string;
    serverPort: number;
    serverPublicKey: string;
    clientPrivateKey: string;
    clientAddress: string;
    allowedIPs?: string[];
  }): Promise<string> {
    const config = await this.generateWireGuardConfig(params);

    return `[Interface]
PrivateKey = ${config.interface.privateKey}
Address = ${config.interface.address}
DNS = ${config.interface.dns.join(', ')}
MTU = ${config.interface.mtu}

[Peer]
PublicKey = ${config.peer.publicKey}
Endpoint = ${config.peer.endpoint}
AllowedIPs = ${config.peer.allowedIPs.join(', ')}
PersistentKeepalive = ${config.peer.persistentKeepalive}`;
  }

  async generateOpenVPNConfig(params: {
    serverIp: string;
    serverPort: number;
    serverCert: string;
    serverKey: string;
    caCert: string;
    tlsAuthKey: string;
  }): Promise<string> {
    return `client
dev tun
proto udp
remote ${params.serverIp} ${params.serverPort}
resolv-retry infinite
nobind
persist-key
persist-tun
cipher AES-256-GCM
auth SHA256
verb 3
key-direction 1

<ca>
${params.caCert}
</ca>

<cert>
${params.serverCert}
</cert>

<key>
${params.serverKey}
</key>

<tls-auth>
${params.tlsAuthKey}
</tls-auth>`;
  }

  async generateXrayRealityConfig(params: {
    serverIp: string;
    serverPort: number;
    serverName: string;
    shortId: string;
    privateKey: string;
    publicKey: string;
    spiderX: string;
  }): Promise<XrayConfig> {
    return {
      log: { loglevel: 'warning' },
      routing: {
        rules: [
          {
            type: 'field',
            ip: ['geoip:private'],
            outboundTag: 'block',
          },
        ],
      },
      inbounds: [
        {
          port: 443,
          protocol: 'vless',
          settings: {
            clients: [
              {
                id: params.shortId,
                flow: 'xtls-rprx-vision',
              },
            ],
            decryption: 'none',
          },
          streamSettings: {
            network: 'tcp',
            security: 'reality',
            realitySettings: {
              show: false,
              dest: params.serverName,
              xver: 0,
              serverNames: [params.serverName],
              privateKey: params.privateKey,
              shortIds: [params.shortId],
              spiderX: params.spiderX,
            },
          },
          sniffing: {
            enabled: true,
            destOverride: ['http', 'tls'],
          },
        },
      ],
      outbounds: [
        {
          protocol: 'freedom',
          tag: 'direct',
        },
        {
          protocol: 'blackhole',
          tag: 'block',
        },
      ],
      stats: {},
      policy: {},
    };
  }

  async generateXrayVlessConfig(params: {
    serverIp: string;
    serverPort: number;
    userId: string;
    flow: string;
  }): Promise<string> {
    const vlessUri = `vless://${params.userId}@${params.serverIp}:${params.serverPort}?encryption=none&flow=${params.flow}&type=tcp&security=reality&sni=www.google.com&fp=chrome&pbk=placeholder&sid=placeholder&allowInsecure=0#APPI-VPN`;
    return vlessUri;
  }

  generateKeyPair(): { publicKey: string; privateKey: string } {
    const privateKey = randomBytes(32);
    const publicKey = createHash('sha256').update(privateKey).digest('hex');
    return {
      publicKey,
      privateKey: privateKey.toString('hex'),
    };
  }

  generateShortId(): string {
    return randomBytes(8).toString('hex');
  }

  generateClientId(): string {
    return randomBytes(16).toString('hex');
  }
}
