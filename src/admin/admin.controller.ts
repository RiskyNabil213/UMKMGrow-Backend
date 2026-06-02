import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private prisma: PrismaService) {}

  private guard(req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Akses ditolak');
  }

  @Get('users')
  async getUsers(@Request() req) {
    this.guard(req);
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, businessName: true, role: true, plan: true, planExpiresAt: true, createdAt: true },
    });
  }

  @Get('lowongan')
  async getLowongan(@Request() req) {
    this.guard(req);
    return this.prisma.lowongan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Get('supplier')
  async getSupplier(@Request() req) {
    this.guard(req);
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Get('transactions')
  async getTransactions(@Request() req) {
    this.guard(req);
    return this.prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  @Get('payments')
  async getPayments(@Request() req) {
    this.guard(req);
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  @Get('chats')
  async getChats(@Request() req) {
    this.guard(req);
    return this.prisma.chat.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    this.guard(req);
    const [users, lowongan, supplier, transactions, payments, chats] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lowongan.count(),
      this.prisma.supplier.count(),
      this.prisma.transaction.count(),
      this.prisma.payment.count(),
      this.prisma.chat.count(),
    ]);
    const premium = await this.prisma.user.count({ where: { plan: { not: 'free' } } });
    const revenue = await this.prisma.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } });
    return { users, premium, lowongan, supplier, transactions, payments, chats, revenue: revenue._sum.amount ?? 0 };
  }
}
