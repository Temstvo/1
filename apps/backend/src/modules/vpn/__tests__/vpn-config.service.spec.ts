import { Test, TestingModule } from '@nestjs/testing';
import { VpnConfigService } from '../vpn-config.service';
import { ConfigService } from '@nestjs/config';

describe('VpnConfigService', () => {
  let service: VpnConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VpnConfigService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<VpnConfigService>(VpnConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateKeyPair', () => {
    it('should generate a key pair', () => {
      const keyPair = service.generateKeyPair();
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = service.generateKeyPair();
      const keyPair2 = service.generateKeyPair();
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });
  });

  describe('generateShortId', () => {
    it('should generate a short ID', () => {
      const shortId = service.generateShortId();
      expect(typeof shortId).toBe('string');
      expect(shortId.length).toBeGreaterThan(0);
    });
  });

  describe('generateClientId', () => {
    it('should generate a client ID', () => {
      const clientId = service.generateClientId();
      expect(typeof clientId).toBe('string');
      expect(clientId.length).toBeGreaterThan(0);
    });
  });

  describe('generateWireGuardConfig', () => {
    it('should generate WireGuard config', async () => {
      const config = await service.generateWireGuardConfig({
        serverIp: '185.234.72.1',
        serverPort: 51820,
        serverPublicKey: 'server-public-key',
        clientPrivateKey: 'client-private-key',
        clientAddress: '10.0.0.1',
      });

      expect(config).toHaveProperty('interface');
      expect(config).toHaveProperty('peer');
      expect(config.interface.privateKey).toBe('client-private-key');
      expect(config.interface.address).toBe('10.0.0.1/32');
      expect(config.peer.endpoint).toBe('185.234.72.1:51820');
      expect(config.peer.publicKey).toBe('server-public-key');
    });
  });

  describe('generateOpenVPNConfig', () => {
    it('should generate OpenVPN config', async () => {
      const config = await service.generateOpenVPNConfig({
        serverIp: '185.234.72.1',
        serverPort: 1194,
        serverCert: 'cert',
        serverKey: 'key',
        caCert: 'ca',
        tlsAuthKey: 'tls',
      });

      expect(typeof config).toBe('string');
      expect(config.startsWith('client\n')).toBe(true);
      expect(config).toContain('remote 185.234.72.1 1194');
      expect(config).toContain('proto udp');
    });
  });

  describe('generateXrayRealityConfig', () => {
    it('should generate Xray Reality config', async () => {
      const config = await service.generateXrayRealityConfig({
        serverIp: '185.234.72.1',
        serverPort: 443,
        serverName: 'www.google.com',
        shortId: 'abc123',
        privateKey: 'private-key',
        publicKey: 'public-key',
        spiderX: '',
      });

      expect(config).toHaveProperty('outbounds');
      expect(Array.isArray(config.outbounds)).toBe(true);
    });
  });

  describe('generateXrayVlessConfig', () => {
    it('should generate VLESS URI', async () => {
      const config = await service.generateXrayVlessConfig({
        serverIp: '185.234.72.1',
        serverPort: 443,
        userId: 'user-id',
        flow: 'xtls-rprx-vision',
      });

      expect(typeof config).toBe('string');
      expect(config.startsWith('vless://')).toBe(true);
      expect(config).toContain('@185.234.72.1:443');
      expect(config).toContain('flow=xtls-rprx-vision');
    });
  });
});
