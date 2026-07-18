import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async create(createPlanDto: CreatePlanDto) {
    const existingPlan = await this.prisma.plan.findFirst({
      where: { name: createPlanDto.name },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this name already exists');
    }

    return this.prisma.plan.create({
      data: createPlanDto,
    });
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findById(id);

    if (updatePlanDto.name) {
      const existingPlan = await this.prisma.plan.findFirst({
        where: {
          name: updatePlanDto.name,
          id: { not: id },
        },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException('Cannot delete plan with active subscriptions');
    }

    return this.prisma.plan.delete({
      where: { id },
    });
  }

  async cleanupPlans() {
    const allPlans = await this.prisma.plan.findMany({ orderBy: { createdAt: 'asc' } });
    const toDelete: string[] = [];

    for (const plan of allPlans) {
      if (plan.currency !== 'RUB') {
        toDelete.push(plan.id);
      }
    }

    const rubPlans = allPlans.filter((p) => p.currency === 'RUB');
    const seen = new Map<string, string[]>();
    for (const plan of rubPlans) {
      const key = `${plan.name}-${plan.price}-${plan.duration}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(plan.id);
    }

    for (const [, ids] of seen) {
      if (ids.length > 1) {
        toDelete.push(...ids.slice(1));
      }
    }

    if (toDelete.length > 0) {
      await this.prisma.plan.deleteMany({ where: { id: { in: toDelete } } });
    }

    return { deleted: toDelete.length };
  }
}
