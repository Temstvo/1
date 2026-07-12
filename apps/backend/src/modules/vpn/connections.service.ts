import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Protocol } from '@prisma/client';

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(private prisma: PrismaService) {}

  async connect(userId: string, serverId: string, deviceId: string, protocol: Protocol) {
    const connection = await this.prisma.connection.create({
      data: {
        userId,
        serverId,
        deviceId,
        protocol,
        connectedAt: new Date(),
      },
    });

    await this.prisma.server.update({
      where: { id: serverId },
      data: {
        currentUsers: { increment: 1 },
      },
    });

    this.logger.log(`User ${userId} connected to server ${serverId}`);

    return connection;
  }

  async disconnect(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.userId !== userId) {
      return null;
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        disconnectedAt: new Date(),
      },
    });

    await this.prisma.server.update({
      where: { id: connection.serverId },
      data: {
        currentUsers: { decrement: 1 },
      },
    });

    return updated;
  }

  async disconnectAll(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: { userId, disconnectedAt: null },
    });

    for (const conn of connections) {
      await this.disconnect(userId, conn.id);
    }
  }

  async getActiveConnections(userId: string) {
    return this.prisma.connection.findMany({
      where: { userId, disconnectedAt: null },
      include: { server: true, device: true },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async getConnectionHistory(userId: string, limit = 20) {
    return this.prisma.connection.findMany({
      where: { userId },
      include: { server: true },
      orderBy: { connectedAt: 'desc' },
      take: limit,
    });
  }

  async recordTraffic(connectionId: string, bytesReceived: number, bytesSent: number) {
    return this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        bytesReceived: { increment: bytesReceived },
        bytesSent: { increment: bytesSent },
      },
    });
  }
}
