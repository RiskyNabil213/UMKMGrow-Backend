import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Panggil super() tanpa argumen apa pun di dalam constructor
  constructor() {
    super();
  }

  // Menghubungkan ke database saat aplikasi NestJS menyala
  async onModuleInit() {
    await this.$connect();
  }

  // Memutuskan koneksi dengan aman saat aplikasi dimatikan
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
