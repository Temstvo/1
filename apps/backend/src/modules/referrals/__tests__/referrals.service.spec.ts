import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsService } from '../referrals.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let prisma: {
    referral: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
    user: { findUnique: jest.Mock; findFirst: jest.Mock };
  };

  const mockReferral = {
    id: 'ref-1',
    ownerId: 'owner-1',
    userId: 'user-1',
    commission: 0,
    paid: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      referral: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return referral stats', async () => {
      prisma.referral.findMany.mockResolvedValue([
        mockReferral,
        { ...mockReferral, commission: 10, paid: true },
      ]);
      const result = await service.getStats('owner-1');
      expect(result.totalReferrals).toBe(2);
      expect(result.paidReferrals).toBe(1);
      expect(result.totalCommission).toBe(10);
    });
  });

  describe('getReferralLink', () => {
    it('should return referral link', async () => {
      prisma.user.findUnique.mockResolvedValue({ referralCode: 'ABC123' });
      const result = await service.getReferralLink('user-1');
      expect(result.referralCode).toBe('ABC123');
      expect(result.referralLink).toContain('ABC123');
    });
  });

  describe('registerReferral', () => {
    it('should register a referral', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'owner-1', referralCode: 'ABC123' });
      prisma.referral.findUnique.mockResolvedValue(null);
      prisma.referral.create.mockResolvedValue(mockReferral);
      const result = await service.registerReferral('ABC123', 'user-1');
      expect(result).toEqual(mockReferral);
    });

    it('should throw if code invalid', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.registerReferral('INVALID', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if self-referral', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1', referralCode: 'ABC123' });
      await expect(service.registerReferral('ABC123', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addCommission', () => {
    it('should add commission', async () => {
      prisma.referral.update.mockResolvedValue({ ...mockReferral, commission: 5 });
      const result = await service.addCommission('ref-1', 5);
      expect(result.commission).toBe(5);
    });
  });

  describe('payoutPending', () => {
    it('should payout pending commissions', async () => {
      prisma.referral.findMany.mockResolvedValue([
        { ...mockReferral, commission: 10 },
        { ...mockReferral, commission: 5 },
      ]);
      prisma.referral.updateMany.mockResolvedValue({ count: 2 });
      const result = await service.payoutPending('owner-1');
      expect(result.amount).toBe(15);
      expect(result.referralsPaid).toBe(2);
    });

    it('should throw if no pending', async () => {
      prisma.referral.findMany.mockResolvedValue([]);
      await expect(service.payoutPending('owner-1')).rejects.toThrow(BadRequestException);
    });
  });
});
