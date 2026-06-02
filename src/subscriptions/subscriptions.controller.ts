import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Post('upgrade')
  async upgrade(@Request() req) {
    await this.subService.upgrade(req.user.id);
    return { message: 'Selamat! Akun Anda berhasil diupgrade ke Premium' };
  }

  @Get('status')
  async getStatus(@Request() req) {
    return {
      message: 'Status langganan berhasil diambil',
      data: await this.subService.getStatus(req.user.id),
    };
  }
}