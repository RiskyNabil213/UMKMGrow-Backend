import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: number, data: { name?: string; businessName?: string }) {
    const user = await this.prisma.user.update({ where: { id }, data });
    const { password, ...result } = user;
    return result;
  }
}
