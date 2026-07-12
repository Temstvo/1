import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsService } from '../connections.service';
import { PrismaService } from '../../../database/prisma.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;
  let prisma: {
    connection: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    server: { update: jest.Mock };
  };

  const mockConnection = {
    id: 'conn-1',
    userId: 'user-1',
    serverId: 'server-1',
    deviceId: 'device-1',
    protocol: 'WIREGUARD',
    connectedAt: new Date(),
    disconnectedAt: null,
    bytesReceived: 0,
    bytesSent: 0,
  };

  beforeEach(async () => {
    prisma = {
      connection: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      server: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ConnectionsService>(ConnectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connect', () => {
    it('should create a connection', async () => {
      prisma.connection.create.mockResolvedValue(mockConnection);
      prisma.server.update.mockResolvedValue({});

      const result = await service.connect('user-1', 'server-1', 'device-1', 'WIREGUARD');

      expect(result).toEqual(mockConnection);
      expect(prisma.connection.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          serverId: 'server-1',
          deviceId: 'device-1',
          protocol: 'WIREGUARD',
          connectedAt: expect.any(Date),
        },
      });
      expect(prisma.server.update).toHaveBeenCalledWith({
        where: { id: 'server-1' },
        data: { currentUsers: { increment: 1 } },
      });
    });
  });

  describe('disconnect', () => {
    it('should disconnect a connection', async () => {
      prisma.connection.findUnique.mockResolvedValue(mockConnection);
      prisma.connection.update.mockResolvedValue({ ...mockConnection, disconnectedAt: new Date() });
      prisma.server.update.mockResolvedValue({});

      const result = await service.disconnect('user-1', 'conn-1');

      expect(result).toBeDefined();
      expect(prisma.server.update).toHaveBeenCalledWith({
        where: { id: 'server-1' },
        data: { currentUsers: { decrement: 1 } },
      });
    });

    it('should return null if connection not found', async () => {
      prisma.connection.findUnique.mockResolvedValue(null);
      const result = await service.disconnect('user-1', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return null if user does not own connection', async () => {
      prisma.connection.findUnique.mockResolvedValue({ ...mockConnection, userId: 'other-user' });
      const result = await service.disconnect('user-1', 'conn-1');
      expect(result).toBeNull();
    });
  });

  describe('getActiveConnections', () => {
    it('should return active connections', async () => {
      prisma.connection.findMany.mockResolvedValue([mockConnection]);
      const result = await service.getActiveConnections('user-1');
      expect(result).toEqual([mockConnection]);
      expect(prisma.connection.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', disconnectedAt: null },
        include: { server: true, device: true },
        orderBy: { connectedAt: 'desc' },
      });
    });
  });

  describe('recordTraffic', () => {
    it('should record traffic', async () => {
      prisma.connection.update.mockResolvedValue({});
      await service.recordTraffic('conn-1', 1024, 512);
      expect(prisma.connection.update).toHaveBeenCalledWith({
        where: { id: 'conn-1' },
        data: {
          bytesReceived: { increment: 1024 },
          bytesSent: { increment: 512 },
        },
      });
    });
  });
});
