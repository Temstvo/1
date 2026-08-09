import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Промокод не найден');
    }
    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new NotFoundException('Промокод не найден');
    }
    return coupon;
  }

  async create(data: {
    code: string;
    type: CouponType;
    value: number;
    maxUses?: number;
    expiresAt?: Date;
    minAmount?: number;
    planIds?: string[];
    createdBy?: string;
  }) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Такой промокод уже существует');
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        minAmount: data.minAmount,
        planIds: data.planIds || [],
        createdBy: data.createdBy,
      },
    });
  }

  async update(
    id: string,
    data: {
      code?: string;
      type?: CouponType;
      value?: number;
      maxUses?: number;
      expiresAt?: Date;
      minAmount?: number;
      planIds?: string[];
      isActive?: boolean;
    },
  ) {
    await this.findById(id);

    if (data.code) {
      const existing = await this.prisma.coupon.findFirst({
        where: { code: data.code.toUpperCase(), id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Такой промокод уже существует');
      }
      data.code = data.code.toUpperCase();
    }

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.coupon.delete({ where: { id } });
  }

  async validate(code: string, planId?: string, amount?: number) {
    const coupon = await this.findByCode(code);

    if (!coupon.isActive) {
      throw new BadRequestException('Промокод больше не активен');
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Срок действия промокода истёк');
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('Лимит использования промокода исчерпан');
    }

    if (coupon.minAmount && amount && amount < Number(coupon.minAmount)) {
      throw new BadRequestException(
        `Минимальная сумма заказа — ${coupon.minAmount} ₽`,
      );
    }

    if (coupon.planIds && coupon.planIds.length > 0 && planId) {
      if (!coupon.planIds.includes(planId)) {
        throw new BadRequestException('Промокод не применим к этому тарифу');
      }
    }

    return {
      valid: true,
      coupon,
      discount: {
        type: coupon.type,
        value: Number(coupon.value),
      },
    };
  }

  async apply(code: string) {
    const coupon = await this.findByCode(code);

    if (!coupon.isActive) {
      throw new BadRequestException('Промокод неактивен');
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('Лимит использования промокода исчерпан');
    }

    return this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { currentUses: { increment: 1 } },
    });
  }
}
