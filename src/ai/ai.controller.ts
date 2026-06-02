import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private prisma: PrismaService) {}

  @Post('generate-content')
  async generatePromo(@Request() req, @Body() body: { topic: string }) {
    // Gunakan casting (any) agar TypeScript tidak protes properti user
    const user: any = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isPremium) {
      throw new ForbiddenException('Fitur Promosi AI tanpa batas hanya tersedia untuk member Premium');
    }

    const topic = body.topic || 'Burger Homemade';
    const contentText = `${topic.toUpperCase()} 🍔 Premium & Lezat! Dibuat dengan bahan pilihan berkualitas tinggi. Harga Terjangkau, Rasa Bintang Lima! Ambil diskon tokomu sekarang sebelum kehabisan! ✨`;

    return {
      message: 'Konten promo otomatis berhasil dibuat oleh AI',
      data: { topic, generatedCaption: contentText }
    };
  }
}