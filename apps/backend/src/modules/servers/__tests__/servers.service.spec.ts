import { Test, TestingModule } from '@nestjs/testing';
import { ServersService } from '../servers.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ServersService', () => {
  let service: ServersService;
  let prisma: { server: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock; groupBy: jest.Mock } };

  const mockServer = {
    id: 'server-1',
    name: 'Frankfurt',
    country: 'Germany',
    city: 'Frankfurt',
    ip: '185.234.72.1',
    protocols: ['WIREGUARD', 'OPENVPN'],
    status: 'ONLINE',
    cpu: 32,
    ram: 67,
    disk: 45,
    load: 45,
    latency: 12,
    packetLoss: 0,
    bandwidth: 1000,
    maxUsers: 1000,
    currentUsers: 234,
    lastHealthCheck: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      server: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ServersService>(ServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all servers', async () => {
      prisma.server.findMany.mockResolvedValue([mockServer]);
      const result = await service.findAll();
      expect(result).toEqual([mockServer]);
      expect(prisma.server.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { name: 'asc' } });
    });

    it('should filter by country', async () => {
      prisma.server.findMany.mockResolvedValue([mockServer]);
      await service.findAll({ country: 'Germany' });
      expect(prisma.server.findMany).toHaveBeenCalledWith({
        where: { country: 'Germany' },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by status', async () => {
      prisma.server.findMany.mockResolvedValue([mockServer]);
      await service.findAll({ status: 'ONLINE' as any });
      expect(prisma.server.findMany).toHaveBeenCalledWith({
        where: { status: 'ONLINE' },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a server by id', async () => {
      prisma.server.findUnique.mockResolvedValue(mockServer);
      const result = await service.findById('server-1');
      expect(result).toEqual(mockServer);
    });

    it('should throw NotFoundException if server not found', async () => {
      prisma.server.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a server', async () => {
      prisma.server.create.mockResolvedValue(mockServer);
      const result = await service.create({
        name: 'Frankfurt',
        country: 'Germany',
        city: 'Frankfurt',
        ip: '185.234.72.1',
        protocols: ['WIREGUARD', 'OPENVPN'],
      });
      expect(result).toEqual(mockServer);
      expect(prisma.server.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a server', async () => {
      prisma.server.findUnique.mockResolvedValue(mockServer);
      prisma.server.update.mockResolvedValue({ ...mockServer, name: 'Frankfurt EU' });
      const result = await service.update('server-1', { name: 'Frankfurt EU' });
      expect(result.name).toBe('Frankfurt EU');
    });

    it('should throw NotFoundException if server not found', async () => {
      prisma.server.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a server', async () => {
      prisma.server.findUnique.mockResolvedValue(mockServer);
      prisma.server.delete.mockResolvedValue(mockServer);
      await service.delete('server-1');
      expect(prisma.server.delete).toHaveBeenCalledWith({ where: { id: 'server-1' } });
    });
  });

  describe('getCountries', () => {
    it('should return countries with server counts', async () => {
      prisma.server.groupBy.mockResolvedValue([
        { country: 'Germany', _count: { id: 3 } },
        { country: 'USA', _count: { id: 2 } },
      ]);
      const result = await service.getCountries();
      expect(result).toEqual([
        { country: 'Germany', serverCount: 3 },
        { country: 'USA', serverCount: 2 },
      ]);
    });
  });

  describe('findRecommended', () => {
    it('should return lowest load server', async () => {
      prisma.server.findMany.mockResolvedValue([mockServer]);
      const result = await service.findRecommended('user-1');
      expect(result).toEqual(mockServer);
    });

    it('should throw if no servers available', async () => {
      prisma.server.findMany.mockResolvedValue([]);
      await expect(service.findRecommended('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
