import {
  Controller, Post, Get, Body, BadRequestException,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

type Role = 'admin' | 'pemilik_usaha' | 'customer';
const VALID_ROLES: Role[] = ['admin', 'pemilik_usaha', 'customer'];

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  /** POST /auth/register */
  @Post('register')
  async register(
    @Body() dto: {
      name: string;
      email: string;
      password: string;
      businessName?: string;
      role?: Role;
    },
  ) {
    if (!dto.email || !dto.password || !dto.name) {
      throw new BadRequestException('Nama, email, dan password wajib diisi');
    }
    if (dto.password.length < 6) {
      throw new BadRequestException('Password minimal 6 karakter');
    }

    // Validasi role — default ke customer jika tidak diisi
    const role: Role = VALID_ROLES.includes(dto.role as Role)
      ? (dto.role as Role)
      : 'customer';

    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email sudah digunakan');

    const user = await this.usersService.create({ ...dto, role });
    const { password: _, ...result } = user;
    return { message: 'Registrasi berhasil', user: result };
  }

  /** POST /auth/login */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }
    return this.authService.login(dto.email, dto.password);
  }

  /** POST /auth/google */
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleAuth(
    @Body() googleDto: { email: string; name: string; googleId: string; role?: string },
  ) {
    return this.authService.googleLogin(googleDto);
  }

  /** GET /auth/me — butuh token */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
