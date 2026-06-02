import { Module } from '@nestjs/common';
import { KontenController } from './konten.controller';
import { KontenService } from './konten.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KontenController],
  providers: [KontenService],
})
export class KontenModule {}
