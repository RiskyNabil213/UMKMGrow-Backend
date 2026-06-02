import { Controller, Get, Query } from '@nestjs/common';

@Controller('suppliers')
export class SuppliersController {
  @Get()
  getSuppliers(@Query('category') category: string) {
    const list = [
      { name: 'Sumber Rezeki Supplier', category: 'Makanan', item: 'Bahan makanan lengkap', rating: 4.8 },
      { name: 'Makmur Abadi', category: 'Kemasan', item: 'Kemasan & Plastik', rating: 4.7 },
      { name: 'Dapur Kita', category: 'Makanan', item: 'Bahan baku makanan', rating: 4.9 },
    ];
    return { message: 'Daftar supplier terpercaya berhasil diambil', data: list };
  }
}