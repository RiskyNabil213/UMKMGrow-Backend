import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async upgrade(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: true } as any, // Bypass dengan any jika cache type masih tersangkut
    });
  }

  async getStatus(userId: number) {
    const user: any = await this.prisma.user.findUnique({ where: { id: userId } });
    return { isPremium: user?.isPremium || false };
  }
}