import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getJobs() {
    const data = await this.prisma.lowongan.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return { message: 'Daftar lowongan kerja berhasil diambil', data };
  }

  @Post()
  async addJob(
    @Request() req,
    @Body() body: { title: string; company: string; location: string; type: string; salary: string },
  ) {
    const newJob = await this.prisma.lowongan.create({
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        salary: body.salary ?? '',
        status: 'active',
      },
    });
    return { message: 'Lowongan kerja berhasil ditambahkan', data: newJob };
  }
}
