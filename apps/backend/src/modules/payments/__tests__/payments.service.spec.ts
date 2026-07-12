import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    payment: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; aggregate: jest.Mock; count: jest.Mock };
    subscription: { update: jest.Mock; updateMany: jest.Mock };
    plan: { findUnique: jest.Mock };
    coupon: { findUnique: jest.Mock };
  };

  const mockPayment = {
    id: 'payment-1',
    userId: 'user-1',
    subscriptionId: null,
    provider: 'STRIPE',
    transactionId: 'pi_123',
    amount: 9.99,
    currency: 'USD',
    status: 'COMPLETED',
    description: 'Pro Plan',
    metadata: null,
    webhookVerified: false,
    refundedAt: null,
    refundAmount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      payment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
        count: jest.fn(),
      },
      subscription: {
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      plan: {
        findUnique: jest.fn(),
      },
      coupon: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      prisma.payment.create.mockResolvedValue(mockPayment);
      const result = await service.createPayment({
        userId: 'user-1',
        amount: 9.99,
        provider: 'STRIPE',
        description: 'Pro Plan',
      });
      expect(result).toEqual(mockPayment);
      expect(prisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return user payments', async () => {
      prisma.payment.findMany.mockResolvedValue([mockPayment]);
      const result = await service.findByUserId('user-1');
      expect(result).toEqual([mockPayment]);
    });
  });

  describe('findById', () => {
    it('should return payment by id', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      const result = await service.findById('payment-1');
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      prisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'COMPLETED' });
      const result = await service.updateStatus('payment-1', 'COMPLETED', true);
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('refund', () => {
    it('should refund a payment', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'REFUNDED' });
      const result = await service.refund('payment-1');
      expect(result.status).toBe('REFUNDED');
    });

    it('should throw if payment not completed', async () => {
      prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, status: 'PENDING' });
      await expect(service.refund('payment-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment stats', async () => {
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      prisma.payment.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);
      const result = await service.getPaymentStats();
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('completedPayments');
      expect(result).toHaveProperty('failedPayments');
      expect(result).toHaveProperty('refundedPayments');
    });
  });
});
