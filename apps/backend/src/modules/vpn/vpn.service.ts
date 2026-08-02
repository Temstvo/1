import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VpnConfigService } from './vpn-config.service';
import { Protocol } from '@prisma/client';

@Injectable()
export class VpnService {
  private readonly logger = new Logger(VpnService.name);

  constructor(
    private prisma: PrismaService,
    private vpnConfigService: VpnConfigService,
  ) {}

  async generateConfig(userId: string, serverId: string, protocol: Protocol) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.status !== 'ONLINE') {
      throw new NotFoundException('Server is not available');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasActiveSubscription = user.subscriptions.some(
      (s) => s.status === 'ACTIVE' || s.status === 'GRACE_PERIOD',
    );

    if (!hasActiveSubscription) {
      throw new NotFoundException('Active subscription required');
    }

    const keyPair = this.vpnConfigService.generateKeyPair();
    const clientId = this.vpnConfigService.generateClientId();
    const clientAddress = this.vpnConfigService.generateClientAddress(clientId);

    let configData: any;

    switch (protocol) {
      case 'WIREGUARD':
        configData = await this.vpnConfigService.generateWireGuardConfig({
          serverIp: server.ip,
          serverPort: 51820,
          serverPublicKey: keyPair.publicKey,
          clientPrivateKey: keyPair.privateKey,
          clientAddress,
        });
        break;

      case 'OPENVPN':
        configData = await this.vpnConfigService.generateOpenVPNConfig({
          serverIp: server.ip,
          serverPort: 1194,
          serverCert: 'server-cert-placeholder',
          serverKey: 'server-key-placeholder',
          caCert: 'ca-cert-placeholder',
          tlsAuthKey: 'tls-auth-placeholder',
        });
        break;

      case 'XRAY_REALITY':
        configData = await this.vpnConfigService.generateXrayRealityConfig({
          serverIp: server.ip,
          serverPort: 443,
          serverName: 'www.google.com',
          shortId: this.vpnConfigService.generateShortId(),
          privateKey: keyPair.privateKey,
          publicKey: keyPair.publicKey,
          spiderX: '',
        });
        break;

      case 'VLESS':
        configData = await this.vpnConfigService.generateXrayVlessConfig({
          serverIp: server.ip,
          serverPort: 443,
          userId: clientId,
          flow: 'xtls-rprx-vision',
        });
        break;

      default:
        throw new NotFoundException('Unsupported protocol');
    }

    const vpnConfig = await this.prisma.vPNConfig.create({
      data: {
        userId,
        serverId,
        protocol,
        config: configData,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        ipAddress: clientAddress,
        port: protocol === 'WIREGUARD' ? 51820 : protocol === 'OPENVPN' ? 1194 : 443,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'CONFIG_GENERATED',
        resource: 'VPN_CONFIG',
        resourceId: vpnConfig.id,
        metadata: { protocol, serverId },
        result: 'success',
      },
    });

    this.logger.log(`VPN config generated: ${protocol} for user ${userId}`);

    return {
      id: vpnConfig.id,
      userId: vpnConfig.userId,
      serverId: vpnConfig.serverId,
      protocol: vpnConfig.protocol,
      config: vpnConfig.config,
      publicKey: vpnConfig.publicKey,
      ipAddress: vpnConfig.ipAddress,
      port: vpnConfig.port,
      isActive: vpnConfig.isActive,
      createdAt: vpnConfig.createdAt,
    };
  }

  async getUserConfigs(userId: string) {
    const configs = await this.prisma.vPNConfig.findMany({
      where: { userId, isActive: true },
      include: { server: true },
      orderBy: { createdAt: 'desc' },
    });

    return configs.map(({ privateKey, ...rest }) => rest);
  }

  async deleteConfig(userId: string, configId: string) {
    const config = await this.prisma.vPNConfig.findUnique({
      where: { id: configId },
    });

    if (!config || config.userId !== userId) {
      throw new NotFoundException('Config not found');
    }

    await this.prisma.vPNConfig.update({
      where: { id: configId },
      data: { isActive: false },
    });
  }

  async getConfigQrCode(userId: string, configId: string) {
    const config = await this.prisma.vPNConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new NotFoundException('Config not found');
    }

    if (config.userId !== userId) {
      throw new NotFoundException('Config not found');
    }

    return {
      configId: config.id,
      protocol: config.protocol,
      config: config.config,
    };
  }

  async getStatus(userId: string) {
    const activeConfigs = await this.prisma.vPNConfig.count({
      where: { userId, isActive: true },
    });

    const activeConnections = await this.prisma.connection.count({
      where: { userId, disconnectedAt: null },
    });

    const todayTraffic = await this.prisma.trafficUsage.aggregate({
      where: {
        userId,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      _sum: {
        download: true,
        upload: true,
      },
    });

    return {
      activeConfigs,
      activeConnections,
      todayTraffic: {
        download: todayTraffic._sum.download || 0,
        upload: todayTraffic._sum.upload || 0,
      },
    };
  }
}
