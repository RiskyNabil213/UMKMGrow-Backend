import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, amount: number, description: string) {
    return (this.prisma as any).transaction.create({
      data: {
        amount,
        description,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return (this.prisma as any).transaction.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  // TAMBAHKAN FUNGSI INI UNTUK MENYELESAIKAN ERROR ERROR ke-2
  async findOne(id: number, userId: number) {
    const transaction = await (this.prisma as any).transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan atau bukan milik Anda');
    }

    return transaction;
  }

  async remove(id: number, userId: number) {
    const transaction = await (this.prisma as any).transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan atau bukan milik Anda');
    }

    return (this.prisma as any).transaction.delete({
      where: { id },
    });
  }
}