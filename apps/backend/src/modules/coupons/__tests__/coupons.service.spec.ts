import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from '../coupons.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: {
    coupon: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };

  const mockCoupon = {
    id: 'coupon-1',
    code: 'SAVE20',
    type: 'PERCENTAGE',
    value: 20,
    maxUses: 100,
    currentUses: 45,
    expiresAt: new Date('2026-12-31'),
    minAmount: null,
    planIds: [],
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      coupon: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      prisma.coupon.create.mockResolvedValue(mockCoupon);
      const result = await service.create({
        code: 'SAVE20',
        type: 'PERCENTAGE',
        value: 20,
      });
      expect(result).toEqual(mockCoupon);
    });

    it('should throw if code exists', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      await expect(service.create({ code: 'SAVE20', type: 'PERCENTAGE', value: 20 })).rejects.toThrow(ConflictException);
    });
  });

  describe('validate', () => {
    it('should validate a coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      const result = await service.validate('SAVE20');
      expect(result.valid).toBe(true);
      expect(result.discount.value).toBe(20);
    });

    it('should throw if coupon not found', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      await expect(service.validate('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should throw if coupon inactive', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ ...mockCoupon, isActive: false });
      await expect(service.validate('SAVE20')).rejects.toThrow(BadRequestException);
    });

    it('should throw if coupon expired', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        expiresAt: new Date('2020-01-01'),
      });
      await expect(service.validate('SAVE20')).rejects.toThrow(BadRequestException);
    });

    it('should throw if usage limit reached', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        currentUses: 100,
        maxUses: 100,
      });
      await expect(service.validate('SAVE20')).rejects.toThrow(BadRequestException);
    });
  });

  describe('apply', () => {
    it('should increment coupon usage', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.update.mockResolvedValue({ ...mockCoupon, currentUses: 46 });
      const result = await service.apply('SAVE20');
      expect(result.currentUses).toBe(46);
    });
  });

  describe('delete', () => {
    it('should delete a coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.delete.mockResolvedValue(mockCoupon);
      await service.delete('coupon-1');
      expect(prisma.coupon.delete).toHaveBeenCalledWith({ where: { id: 'coupon-1' } });
    });
  });
});
