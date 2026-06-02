import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { KontenService } from './konten.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('konten')
export class KontenController {
  constructor(private readonly kontenService: KontenService) {}

  // ─── Lowongan (public read) ───────────────────────────────────────────────

  @Get('lowongan')
  getAllLowongan() {
    return this.kontenService.getAllLowongan();
  }

  @Get('lowongan/active')
  getActiveLowongan() {
    return this.kontenService.getActiveLowongan();
  }

  @Patch('lowongan/:id/view')
  incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.kontenService.incrementView(id);
  }

  // ─── Lowongan (admin only) ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('lowongan')
  createLowongan(
    @Body() dto: { title: string; company: string; location: string; type: string; salary: string },
  ) {
    return this.kontenService.createLowongan(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lowongan/:id')
  updateLowongan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<{ title: string; company: string; location: string; type: string; salary: string; status: string }>,
  ) {
    return this.kontenService.updateLowongan(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('lowongan/:id')
  deleteLowongan(@Param('id', ParseIntPipe) id: number) {
    return this.kontenService.deleteLowongan(id);
  }

  // ─── Supplier (public read) ───────────────────────────────────────────────

  @Get('supplier')
  getAllSupplier() {
    return this.kontenService.getAllSupplier();
  }

  @Get('supplier/active')
  getActiveSupplier() {
    return this.kontenService.getActiveSupplier();
  }

  // ─── Supplier (admin only) ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('supplier')
  createSupplier(
    @Body() dto: { name: string; category: string; location: string; price: string },
  ) {
    return this.kontenService.createSupplier(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('supplier/:id')
  updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<{ name: string; category: string; location: string; price: string; rating: number; status: string }>,
  ) {
    return this.kontenService.updateSupplier(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('supplier/:id')
  deleteSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.kontenService.deleteSupplier(id);
  }
}
