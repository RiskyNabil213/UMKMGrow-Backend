import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async askAi(@Request() req, @Body() body: { message: string }) {
    return {
      message: 'Pesan berhasil dikirim',
      data: await this.chatService.sendMessage(req.user.id, body.message),
    };
  }

  @Get()
  async getHistory(@Request() req) {
    return {
      message: 'Riwayat konsultasi berhasil diambil',
      data: await this.chatService.getHistory(req.user.id),
    };
  }
}