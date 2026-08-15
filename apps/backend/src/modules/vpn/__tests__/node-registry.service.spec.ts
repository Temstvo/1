import { Test, TestingModule } from '@nestjs/testing';
import { NodeRegistryService, NodeCandidate } from '../node-registry.service';
import { PrismaService } from '../../../database/prisma.service';
import { VpnService } from '../vpn.service';
import { NotFoundException } from '@nestjs/common';

describe('NodeRegistryService', () => {
  let service: NodeRegistryService;
  let prisma: {
    vpnConfig: { findMany: jest.Mock; findUnique: jest.Mock };
    server: { findMany: jest.Mock };
    user: { findUnique: jest.Mock };
  };
  let vpnService: { generateConfig: jest.Mock };

  const freeConfig = {
    id: 'free-1',
    protocol: 'vless',
    country: 'Germany',
    countryCode: 'DE',
    server: '185.234.72.1:443',
    latency: 40,
    lastChecked: new Date(),
  };

  const ownServer = {
    id: 'own-1',
    protocols: ['WIREGUARD', 'VLESS'],
    country: 'Netherlands',
    ip: '45.11.5.2',
    load: 20,
    latency: 10,
    packetLoss: 0,
    lastHealthCheck: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      vpnConfig: { findMany: jest.fn(), findUnique: jest.fn() },
      server: { findMany: jest.fn() },
      user: { findUnique: jest.fn() },
    };
    vpnService = { generateConfig: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeRegistryService,
        { provide: PrismaService, useValue: prisma },
        { provide: VpnService, useValue: vpnService },
      ],
    }).compile();

    service = module.get<NodeRegistryService>(NodeRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCandidates', () => {
    it('should merge free configs and own servers, sorted by score desc', async () => {
      prisma.vpnConfig.findMany.mockResolvedValue([freeConfig]);
      prisma.server.findMany.mockResolvedValue([ownServer]);

      const candidates = await service.getCandidates();

      expect(candidates.length).toBe(3);
      expect(candidates[0].score).toBeGreaterThanOrEqual(candidates[1].score);
      expect(candidates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ source: 'FREE', id: 'free-1', protocol: 'vless' }),
          expect.objectContaining({ source: 'OWN', serverId: 'own-1', protocol: 'wireguard' }),
          expect.objectContaining({ source: 'OWN', serverId: 'own-1', protocol: 'vless' }),
        ]),
      );
    });

    it('should filter by protocol and country', async () => {
      prisma.vpnConfig.findMany.mockResolvedValue([
        freeConfig,
        { ...freeConfig, id: 'free-2', protocol: 'trojan', country: 'France' },
      ]);
      prisma.server.findMany.mockResolvedValue([]);

      const byProtocol = await service.getCandidates({ protocol: 'trojan' });
      expect(byProtocol).toHaveLength(1);
      expect(byProtocol[0].id).toBe('free-2');

      const byCountry = await service.getCandidates({ country: 'germany' });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('free-1');
    });
  });

  describe('assignBest', () => {
    it('should throw NotFoundException for missing user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.assignBest('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should serve free configs to users without subscription', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: [],
      });
      prisma.vpnConfig.findMany.mockResolvedValue([freeConfig]);
      prisma.server.findMany.mockResolvedValue([ownServer]);
      prisma.vpnConfig.findUnique.mockResolvedValue({ ...freeConfig, uri: 'vless://test#Appi' });

      const result = await service.assignBest('user-1');

      expect(result.node.source).toBe('FREE');
      expect(result.node.id).toBe('free-1');
      expect(result.uri).toBe('vless://test#Appi');
      expect(vpnService.generateConfig).not.toHaveBeenCalled();
    });

    it('should prioritize own servers for subscribed users and generate config', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: [{ status: 'ACTIVE' }],
      });
      prisma.vpnConfig.findMany.mockResolvedValue([]);
      prisma.server.findMany.mockResolvedValue([ownServer]);
      vpnService.generateConfig.mockResolvedValue({
        id: 'cfg-1',
        protocol: 'WIREGUARD',
        config: { interface: { privateKey: 'x' }, peer: {} },
        uri: 'wireguard-config-json',
        serverId: 'own-1',
      });

      const result = await service.assignBest('user-1');

      expect(result.node.source).toBe('OWN');
      expect(vpnService.generateConfig).toHaveBeenCalledWith('user-1', 'own-1', 'WIREGUARD');
      expect(result.id).toBe('cfg-1');
    });

    it('should fall back to free configs when no own servers online', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: [{ status: 'ACTIVE' }],
      });
      prisma.vpnConfig.findMany.mockResolvedValue([freeConfig]);
      prisma.server.findMany.mockResolvedValue([]);
      prisma.vpnConfig.findUnique.mockResolvedValue({ ...freeConfig, uri: 'vless://test#Appi' });

      const result = await service.assignBest('user-1');

      expect(result.node.source).toBe('FREE');
      expect(result.node.id).toBe('free-1');
    });

    it('should include fallback nodes', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptions: [] });
      prisma.vpnConfig.findMany.mockResolvedValue([
        freeConfig,
        { ...freeConfig, id: 'free-2', server: '45.11.5.2:443', latency: 120 },
        { ...freeConfig, id: 'free-3', server: '89.1.2.3:443', latency: 300 },
      ]);
      prisma.server.findMany.mockResolvedValue([]);
      prisma.vpnConfig.findUnique.mockResolvedValue({ ...freeConfig, uri: 'vless://test#Appi' });

      const result = await service.assignBest('user-1', { fallbackCount: 2 });

      expect(result.fallbacks.length).toBe(2);
      expect(result.fallbacks[0].score).toBeGreaterThanOrEqual(result.fallbacks[1].score);
    });

    it('should throw NotFoundException when no candidates match filters', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptions: [] });
      prisma.vpnConfig.findMany.mockResolvedValue([]);
      prisma.server.findMany.mockResolvedValue([]);

      await expect(service.assignBest('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should exclude a node from assignment', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptions: [] });
      prisma.vpnConfig.findMany.mockResolvedValue([
        freeConfig,
        { ...freeConfig, id: 'free-2', server: '45.11.5.2:443' },
      ]);
      prisma.server.findMany.mockResolvedValue([]);
      prisma.vpnConfig.findUnique.mockResolvedValue({ ...freeConfig, uri: 'vless://test#Appi' });

      const result = await service.assignBest('user-1', { exclude: 'free-1' });

      expect(result.node.id).toBe('free-2');
      expect(result.fallbacks.find((f) => f.id === 'free-1')).toBeUndefined();
    });
  });

  describe('getRegistryStatus', () => {
    it('should aggregate by source and protocol', async () => {
      prisma.vpnConfig.findMany.mockResolvedValue([freeConfig]);
      prisma.server.findMany.mockResolvedValue([ownServer]);

      const status = await service.getRegistryStatus();

      expect(status.total).toBe(3);
      expect(status.bySource).toEqual({ free: 1, own: 2 });
      expect(status.byProtocol.vless).toBe(2);
      expect(status.byProtocol.wireguard).toBe(1);
      expect(status.best.length).toBeGreaterThan(0);
    });
  });
});
