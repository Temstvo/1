import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: {
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.userId !== userId) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `INV-${year}${month}`,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  async create(data: {
    userId: string;
    paymentId: string;
    subtotal: number;
    tax?: number;
    total: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) {
    const number = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        userId: data.userId,
        paymentId: data.paymentId,
        number,
        subtotal: data.subtotal,
        tax: data.tax || 0,
        total: data.total,
        currency: data.currency || 'USD',
        dueDate: new Date(),
        metadata: data.metadata,
      },
    });
  }
}
