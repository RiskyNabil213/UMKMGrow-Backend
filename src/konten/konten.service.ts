import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KontenService {
  constructor(private prisma: PrismaService) {}

  // ─── Lowongan ─────────────────────────────────────────────────────────────

  async getAllLowongan() {
    return this.prisma.lowongan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getActiveLowongan() {
    return this.prisma.lowongan.findMany({
      where:   { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLowongan(data: {
    title: string; company: string; location: string;
    type: string; salary: string;
  }) {
    return this.prisma.lowongan.create({ data });
  }

  async updateLowongan(id: number, data: Partial<{
    title: string; company: string; location: string;
    type: string; salary: string; status: string;
  }>) {
    const exists = await this.prisma.lowongan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Lowongan tidak ditemukan');
    return this.prisma.lowongan.update({ where: { id }, data });
  }

  async deleteLowongan(id: number) {
    const exists = await this.prisma.lowongan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Lowongan tidak ditemukan');
    await this.prisma.lowongan.delete({ where: { id } });
    return { message: 'Lowongan berhasil dihapus' };
  }

  async incrementView(id: number) {
    return this.prisma.lowongan.update({
      where: { id },
      data:  { views: { increment: 1 } },
    });
  }

  // ─── Supplier ─────────────────────────────────────────────────────────────

  async getAllSupplier() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getActiveSupplier() {
    return this.prisma.supplier.findMany({
      where:   { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupplier(data: {
    name: string; category: string; location: string; price: string;
  }) {
    return this.prisma.supplier.create({ data });
  }

  async updateSupplier(id: number, data: Partial<{
    name: string; category: string; location: string;
    price: string; rating: number; status: string;
  }>) {
    const exists = await this.prisma.supplier.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Supplier tidak ditemukan');
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async deleteSupplier(id: number) {
    const exists = await this.prisma.supplier.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Supplier tidak ditemukan');
    await this.prisma.supplier.delete({ where: { id } });
    return { message: 'Supplier berhasil dihapus' };
  }
}
