import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Sesuaikan path ke PrismaModule Anda

@Module({
  imports: [PrismaModule], // <-- WAJIB TAMBAHKAN INI
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}