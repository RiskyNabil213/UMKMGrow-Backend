import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport'; // Menggunakan guard passport bawaan

@Controller('transactions')
@UseGuards(AuthGuard('jwt')) // Wajib login pake JWT untuk semua rute transaksi
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // 1. Catat Transaksi Baru (POST /transactions)
 @Post()
  async create(@Request() req, @Body() body: { amount: number; description: string }) {
    const userId = req.user.id;
    return {
      message: 'Transaksi berhasil dicatat',
      // BONGKAR body menjadi body.amount dan body.description
      data: await this.transactionsService.create(userId, body.amount, body.description),
    };
  }

  // 2. Ambil Semua Riwayat Transaksi Saya (GET /transactions)
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return {
      message: 'Riwayat transaksi berhasil diambil',
      data: await this.transactionsService.findAll(userId),
    };
  }

  // 3. Ambil Detail Satu Transaksi Berdasarkan ID (GET /transactions/:id)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return {
      message: 'Detail transaksi ditemukan',
      data: await this.transactionsService.findOne(+id, userId),
    };
  }

  // 4. Hapus Transaksi (DELETE /transactions/:id)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.transactionsService.remove(+id, userId);
    return {
      message: 'Transaksi berhasil dihapus',
    };
  }
}