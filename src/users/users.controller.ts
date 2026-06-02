import { Controller, Get, Patch, Body, UseGuards, Request, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /users — hanya admin, return semua user */
  @Get()
  async getAllUsers(@Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Akses ditolak');
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, businessName: true,
        role: true, plan: true, planExpiresAt: true, createdAt: true,
      },
    });
  }

  @Get('me')
  async getProfile(@Request() req) {
    return {
      message: 'Data profil berhasil diambil',
      user: await this.usersService.findById(req.user.id),
    };
  }

  @Patch('update-profile')
  async updateProfile(
    @Request() req,
    @Body() dto: { name?: string; businessName?: string },
  ) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, dto);
    return { message: 'Profil berhasil diperbarui', user: updatedUser };
  }

  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Password lama dan baru wajib diisi');
    }
    if (dto.newPassword.length < 6) {
      throw new BadRequestException('Password baru minimal 6 karakter');
    }

    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.password) throw new BadRequestException('Akun ini tidak menggunakan password');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Password lama tidak sesuai');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: req.user.id },
      data:  { password: hashed },
    });
    return { message: 'Password berhasil diubah' };
  }
}
