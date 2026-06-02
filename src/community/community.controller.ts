import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community')
@UseGuards(AuthGuard('jwt'))
export class CommunityController {
  constructor(private prisma: PrismaService) {}

  @Get('posts')
  async getPosts() {
    const data = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { message: 'Daftar diskusi komunitas berhasil diambil', data };
  }

  @Post('posts')
  async createPost(@Request() req, @Body() body: { content: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    const post = await this.prisma.post.create({
      data: {
        author: user?.name ?? user?.businessName ?? 'Pemilik UMKM',
        content: body.content,
        userId: req.user.id,
      },
    });
    return { message: 'Diskusi berhasil diterbitkan', data: post };
  }
}
