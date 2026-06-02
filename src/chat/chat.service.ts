import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(userId: number, message: string) {
    // Simpan pesan user
    await this.prisma.chat.create({
      data: { role: 'user', message, response: '', userId },
    });

    // Generate AI reply sederhana
    let aiMessage = 'Halo! Saya AI Assistant UMKM. Ada yang bisa saya bantu untuk mengoptimalkan bisnis Anda hari ini?';
    if (message.toLowerCase().includes('penjualan')) {
      aiMessage =
        'Untuk meningkatkan penjualan usaha Anda, cobalah maksimalkan fitur Promosi AI untuk membuat caption menarik, pasang diskon di jam sepi, dan pantau terus laba bersih Anda.';
    } else if (message.toLowerCase().includes('modal')) {
      aiMessage =
        "Dengan modal tersebut, Anda bisa mengecek fitur 'Rekomendasi Usaha'. Opsi terbaik saat ini adalah Usaha Kopi Take Away atau Jualan Snack Online.";
    }

    // Simpan balasan AI
    const reply = await this.prisma.chat.create({
      data: { role: 'assistant', message: aiMessage, response: aiMessage, userId },
    });

    return reply;
  }

  async getHistory(userId: number) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
  }
}
